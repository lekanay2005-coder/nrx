document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const webLoading = document.getElementById('web-loading');
  const mainContent = document.getElementById('main-content');
  const userDisplayName = document.getElementById('userDisplayName');
  const logoutBtn = document.getElementById('logoutBtn');
  const roomsList = document.getElementById('rooms');
  const usersList = document.getElementById('users');
  const messages = document.getElementById('messages');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const newRoomNameInput = document.getElementById('new-room-name');
  const createRoomBtn = document.getElementById('create-room-btn');
  const typingIndicator = document.getElementById('typing-indicator');
  const chatTitle = document.getElementById('chat-title');
  const themeToggle = document.getElementById('theme-toggle');
  const workModeBtn = document.getElementById('work-mode-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const dmModal = document.getElementById('dm-modal');
  const dmRecipient = document.getElementById('dm-recipient');
  const dmInput = document.getElementById('dm-input');
  const dmForm = document.getElementById('dm-form');
  const dmCloseBtn = dmModal.querySelector('.close-btn');
  const dmMessages = document.getElementById('dm-messages');

  // State
  let currentRoom = 'general';
  let currentUser = null;
  let currentDmRecipient = null;
  let unsubscribe;

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const functions = firebase.functions();

  auth.onAuthStateChanged(async user => {
    if (user) {
      // User is signed in.
      currentUser = user;
      userDisplayName.textContent = currentUser.displayName;
      webLoading.style.display = 'none';
      document.getElementById('web').style.display = 'flex';
      
      fetchAllUsers();
      applyTheme();
      joinRoom('general');
      listenForRooms();

    } else {
      // User is signed out.
      window.location.href = '/login.html';
    }
  });

  logoutBtn.addEventListener('click', () => {
    auth.signOut();
  });

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = messageInput.value.trim();
    if (msg && currentRoom) {
      db.collection('rooms').doc(currentRoom).collection('messages').add({
        text: msg,
        from: currentUser.displayName,
        uid: currentUser.uid,
        ts: firebase.firestore.FieldValue.serverTimestamp()
      });
      messageInput.value = '';
    }
  });

  createRoomBtn.addEventListener('click', () => {
    const newRoomName = newRoomNameInput.value.trim();
    if (newRoomName) {
      joinRoom(newRoomName);
      newRoomNameInput.value = '';
    }
  });

  dmCloseBtn.addEventListener('click', () => {
      dmModal.style.display = 'none';
      currentDmRecipient = null;
  });

  dmForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = dmInput.value.trim();
      if (msg && currentDmRecipient?.id) {
          const dmRoomId = [currentUser.uid, currentDmRecipient.id].sort().join('_');
          db.collection('dms').doc(dmRoomId).collection('messages').add({
            text: msg,
            from: currentUser.displayName,
            uid: currentUser.uid,
            ts: firebase.firestore.FieldValue.serverTimestamp()
          });
          dmInput.value = '';
      }
  });
  
  themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem('fun-chat-theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
  });

  workModeBtn.addEventListener('click', () => {
      document.body.classList.toggle('work-mode');
  });

  clearHistoryBtn.addEventListener('click', () => {
      if (currentRoom) {
          if (confirm('Are you sure you want to clear the history for this room?')) {
              const deleteRoomHistory = functions.httpsCallable('deleteRoomHistory');
              deleteRoomHistory({ roomName: currentRoom })
                  .then(result => {
                      showSystemMessage(result.data.message);
                  })
                  .catch(error => {
                      console.error('Error deleting room history:', error);
                      showSystemMessage('Error: Could not delete room history.');
                  });
          }
      }
  });

  messages.addEventListener('click', (e) => {
      if (e.target.classList.contains('like-btn')) {
          const messageEl = e.target.closest('.message');
          const messageId = messageEl.dataset.messageId;
          const messageRef = db.collection('rooms').doc(currentRoom).collection('messages').doc(messageId);
          db.runTransaction(transaction => {
            return transaction.get(messageRef).then(doc => {
              if (!doc.exists) {
                throw "Document does not exist!";
              }
      
              let newLikes = (doc.data().likes || 0) + 1;
              transaction.update(messageRef, { likes: newLikes });
            });
          });
      }
  });

  dmMessages.addEventListener('click', (e) => {
      if (e.target.classList.contains('like-btn')) {
        const messageEl = e.target.closest('.message');
        const messageId = messageEl.dataset.messageId;
        const dmRoomId = [currentUser.uid, currentDmRecipient.id].sort().join('_');
        const messageRef = db.collection('dms').doc(dmRoomId).collection('messages').doc(messageId);

        db.runTransaction(transaction => {
            return transaction.get(messageRef).then(doc => {
              if (!doc.exists) {
                throw "Document does not exist!";
              }
      
              let newLikes = (doc.data().likes || 0) + 1;
              transaction.update(messageRef, { likes: newLikes });
            });
          });
      }
  });

  // ============ HELPER FUNCTIONS ==============/ 

  function applyTheme() {
      const savedTheme = localStorage.getItem('fun-chat-theme');
      if (savedTheme === 'dark') {
          document.body.classList.add('dark-theme');
      }
  }

  async function fetchAllUsers() {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
    });
    renderUsers(users);
  }

  function renderUsers(users) {
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.dataset.userId = user.id;
        li.dataset.username = user.displayName;
        li.innerHTML = `
            <span class="status-circle status-online"></span>
            ${user.displayName} <span class="user-id">#${user.id}</span>
        `;
        if(user.id !== currentUser.uid) { // Use Firebase UID for comparison
            li.addEventListener('click', () => openDm(user.id, user.displayName));
        }
        usersList.appendChild(li);
    });
  }

  async function openDm(userId, displayName) {
      currentDmRecipient = { id: userId, displayName };
      dmRecipient.textContent = `Chat with ${displayName}`;
      dmModal.style.display = 'flex';
      dmMessages.innerHTML = ''; 
      const dmRoomId = [currentUser.uid, userId].sort().join('_');

      if (unsubscribe) unsubscribe();

      unsubscribe = db.collection('dms').doc(dmRoomId).collection('messages').orderBy('ts')
        .onSnapshot(snapshot => {
            dmMessages.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                addDmMessage(data.from, data.text, data.uid === currentUser.uid, data.ts?.toDate(), doc.id, data.likes);
            });
        });
  }

  function listenForRooms() {
    db.collection('rooms').onSnapshot(snapshot => {
        roomsList.innerHTML = '';
        snapshot.forEach(doc => {
            const roomName = doc.id;
            let roomEl = roomsList.querySelector(`[data-room="${roomName}"]`);
            if (!roomEl) {
                roomEl = document.createElement('li');
                roomEl.dataset.room = roomName;
                roomEl.textContent = `# ${roomName}`;
                roomEl.addEventListener('click', () => joinRoom(roomName));
                roomsList.appendChild(roomEl);
            }
        });
    });
  }

  function joinRoom(roomName) {
    if (currentRoom) {
      const oldRoomEl = roomsList.querySelector(`[data-room="${currentRoom}"]`);
      if(oldRoomEl) oldRoomEl.classList.remove('active');
    }

    currentRoom = roomName;
    messages.innerHTML = '';
    chatTitle.textContent = `# ${roomName}`;
    showSystemMessage(`Joined room: ${roomName}`);
    
    let roomEl = roomsList.querySelector(`[data-room="${roomName}"]`);
    if (!roomEl) {
        roomEl = document.createElement('li');
        roomEl.dataset.room = roomName;
        roomEl.textContent = `# ${roomName}`;
        roomEl.addEventListener('click', () => joinRoom(roomName));
        roomsList.appendChild(roomEl);
    }
    roomEl.classList.add('active');

    if (unsubscribe) unsubscribe();
    
    unsubscribe = db.collection('rooms').doc(roomName).collection('messages').orderBy('ts')
        .onSnapshot(snapshot => {
            messages.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                addMessage(data.from, data.text, data.uid === currentUser.uid, data.ts?.toDate(), doc.id, data.likes);
            });
        });
  }

  function addMessage(from, text, isOwn, timestamp, messageId, likes = 0) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', isOwn ? 'own' : 'other');
    messageEl.dataset.messageId = messageId;
    const ts = timestamp ? new Date(timestamp).toLocaleTimeString() : '';
    messageEl.innerHTML = `
      <div class="meta"><span class="author">${from}</span><span class="timestamp">${ts}</span></div>
      <div class="text">${text}</div>
      <div class="actions">
          <span class="like-btn">❤️</span>
          <span class="likes-count">${likes}</span>
      </div>
    `;
    messages.appendChild(messageEl);
    messages.scrollTop = messages.scrollHeight;
  }

  function addDmMessage(from, text, isOwn, timestamp, messageId, likes = 0) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', isOwn ? 'own' : 'other');
    messageEl.dataset.messageId = messageId;
    const ts = timestamp ? new Date(timestamp).toLocaleTimeString() : '';
    messageEl.innerHTML = `
      <div class="meta"><span class="author">${from}</span><span class="timestamp">${ts}</span></div>
      <div class="text">${text}</div>
       <div class="actions">
          <span class="like-btn">❤️</span>
          <span class="likes-count">${likes}</span>
      </div>
    `;
    dmMessages.appendChild(messageEl);
    dmMessages.scrollTop = dmMessages.scrollHeight;
  }

  function showSystemMessage(msg) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('system-message');
    messageEl.textContent = msg;
    messages.appendChild(messageEl);
    messages.scrollTop = messages.scrollHeight;
  }

  // Initial setup
  applyTheme();
  
});