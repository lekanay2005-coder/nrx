document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('authForm');
  const submitBtn = document.getElementById('submitBtn');
  const toggleAuthLink = document.getElementById('toggleAuthLink');
  const displayNameGroup = document.getElementById('displayNameGroup');
  const authTitle = document.getElementById('authTitle');
  const toggleText = document.getElementById('toggleText');
  const errorMessage = document.getElementById('errorMessage');
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  let isLogin = true;

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const googleProvider = new firebase.auth.GoogleAuthProvider();

  // Redirect if user is already logged in
  auth.onAuthStateChanged(user => {
    if (user) {
      window.location.href = '/';
    }
  });

  function toggleAuthMode() {
    isLogin = !isLogin;
    authTitle.textContent = isLogin ? 'Login' : 'Register';
    submitBtn.textContent = isLogin ? 'Login' : 'Create Account';
    toggleText.textContent = isLogin ? 'Need an account?' : 'Already have an account?';
    toggleAuthLink.textContent = isLogin ? 'Register here' : 'Login here';
    displayNameGroup.style.display = isLogin ? 'none' : 'block';
    errorMessage.textContent = '';
    authForm.reset();
  }

  toggleAuthLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = '';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const displayName = document.getElementById('displayName').value;

    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName });
        // After registration, you might want to sign them in automatically
        // or redirect to a profile setup page. For now, we'll just log them in.
      }
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });

  googleSignInBtn.addEventListener('click', async () => {
    try {
      await auth.signInWithPopup(googleProvider);
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });
});
