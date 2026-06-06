import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();

// Set body limit higher for Base64 image payload uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database state configuration
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_PRODUCTS = [
  {
    id: 'neo-quantum-node-v1',
    name: 'NEO-GENX QUANTUM NODE V.1',
    description: 'Flagship DePIN edge supercomputer node engineered for localized zero-knowledge proof calculations and deep learning model training. Equipped with simulated quantum cores and a secure hardware enclave to isolate cryptographic assets.',
    price: 1249.00,
    category: 'Hardware Nodes',
    status: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      'Compute Engine': '64-Core GENX Tensor SoC',
      'Crypto Co-processor': 'Double-Ring HSM Enclave',
      'Network Link': 'Dual 10Gbps SFP+ Fibers',
      'Power Profile': '65W Max, Smart Dimming',
      'Preloaded SDK': 'ZK-Proof Runtime Suite'
    },
    features: [
      'Zero-knowledge proof validation accelerator',
      'Onboard cold wallet ledger with multi-signature triggers',
      'Dynamic telemetry panel outputting network metrics',
      'High-grade solid aluminum unibody design with silent liquid cooling loop'
    ],
    creator: {
      name: 'AETHERIS LABS',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      verified: true,
      followers: 4802,
      itemsCount: 16,
      volume: '1,420,500 USDC'
    },
    likes: 342,
    hasLiked: false,
    hasBid: true,
    currentBid: 1180.00
  },
  {
    id: 'neo-drive-x1',
    name: 'NEO-DRIVE STORAGE ARRAY X1',
    description: 'Autonomous high-density storage module connecting directly to the GENX decentralized storage ring. Contributes raw storage space to the network ecosystem and earns live validation rewards in real-time.',
    price: 420.00,
    category: 'Hardware Nodes',
    status: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      'Storage Volume': '32TB NVMe SSD Crypt-Array',
      'Host Interface': 'PCIe Gen 5 x4 Over IP',
      'Read Speed': 'Up to 14,000 MB/s Cached',
      'Encryption': 'AES-256 Hardware Level'
    },
    features: [
      'Auto-healing replication broker',
      'Passive aluminum extrusion cooling block',
      'OLED live storage usage status terminal'
    ],
    creator: {
      name: 'AETHERIS LABS',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      verified: true,
      followers: 4802,
      itemsCount: 16,
      volume: '1,420,500 USDC'
    },
    likes: 189,
    hasLiked: false,
    hasBid: false
  },
  {
    id: 'pulse-core-09',
    name: 'PULSE CORE-09 ROUTER NODE',
    description: 'A mesh networking node designed to provide high-throughput encrypted local networks while verifying node geolocation proofs. Helps build the physical wireless layer of the GEO-GENX protocol.',
    price: 349.00,
    category: 'Hardware Nodes',
    status: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      'Bandwidth': 'WiFi 7 / 3-Band 16.5Gbps',
      'Antenna Array': '6x High-Gain Helical Array',
      'Security Shield': 'Hardware Firewall / Wireguard ASIC',
      'Mesh Support': 'GEO-GENX Local Routing Protocol v4'
    },
    features: [
      'Geolocation latency beacon proof generator',
      'Toughened steel outer shell with magnetic modular mount',
      'Zero-config automated peer routing'
    ],
    creator: {
      name: 'GENX CORE TEAM',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      verified: true,
      followers: 12490,
      itemsCount: 4,
      volume: '3,892,100 USDC'
    },
    likes: 512,
    hasLiked: false,
    hasBid: true,
    currentBid: 320.00
  },
  {
    id: 'virtual-atelier',
    name: 'VIRTUAL ATELIER RENDERING UNIT',
    description: 'High-power virtual graphic accelerator module specializing in synthetic dataset generation, digital fashion modeling and spatial graphics. Harnesses decentralized global renderer pipelines on-demand.',
    price: 899.00,
    category: 'Compute Units',
    status: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      'Render Pipeline': 'GENX-Ray Spatial Compute',
      'VRAM Buffer': '16GB High Bandwidth Smart L3',
      'Supported Frameworks': 'Blended Cycle Engine, WebGPU Mesh 3'
    },
    features: [
      'Automated synthetic generation job dispatcher',
      'Real-time render stats overlay',
      'Up to 120 GigaRays per second capacity'
    ],
    creator: {
      name: 'AETHERIS LABS',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      verified: true,
      followers: 4802,
      itemsCount: 16,
      volume: '1,420,500 USDC'
    },
    likes: 271,
    hasLiked: false,
    hasBid: false
  },
  {
    id: 'genesis-key-42',
    name: 'GENX GENESIS SIGNING KEY #042',
    description: 'Extremely rare cryptographic signature token giving access to early beta nodes, validation priority pools, and increased protocol multiplier coefficient.',
    price: 3200.00,
    category: 'Genesis Keys',
    status: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      'Signature Standard': 'Multi-Curve Cryptographic ASIC-hardened',
      'Protocol Layer': 'GENX Consensus Master Controller',
      'Ecosystem Multiplier': '1.75x Baseline Mining boost'
    },
    features: [
      'Hardened atomic-signing micro-controller',
      'Hand-polished titanium composite physical shell',
      'OLED alphanumeric hash character monitor'
    ],
    creator: {
      name: 'GENX CORE TEAM',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      verified: true,
      followers: 12490,
      itemsCount: 4,
      volume: '3,892,100 USDC'
    },
    likes: 831,
    hasLiked: false,
    hasBid: true,
    currentBid: 3050.00
  },
  {
    id: 'cyber-link-module',
    name: 'CYBER-LINK SATELLITE MODULE',
    description: 'An advanced orbital-link physical modular attachment designed to daisy-chain with the Quantum Node V.1. Facilitates secure micro-satellite mesh network relays.',
    price: 249.00,
    category: 'Special Modules',
    status: 'Launching Soon',
    images: [
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      'Frequency Band': 'Ka-Band Uplink Core / Helium LoRa Relay',
      'Power Source': 'Module Pass-Through',
      'Active Range': 'Up to 240km line of sight'
    },
    features: [
      'Thermal insulating graphene frame',
      'High speed mechanical beam steering controller API',
      'Weather-sealed tactical ports'
    ],
    creator: {
      name: 'AETHERIS LABS',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      verified: true,
      followers: 4802,
      itemsCount: 16,
      volume: '1,420,500 USDC'
    },
    likes: 145,
    hasLiked: false,
    hasBid: false
  },
  {
    id: 'arc-0-compute',
    name: 'AETHERIS ARC-0 NEURAL BLOCK',
    description: 'A modular neural computation tile optimized for decentralized vision models and high-throughput real-time classification.',
    price: 499.00,
    category: 'Compute Units',
    status: 'Sold Out',
    images: [
      'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      'Array Tiles': '4x Core-Blocks Linkable',
      'Memory Mode': 'Unified Ultra-Wide Bus',
      'Raw Speed': '48 TFLOPS TF32 precision'
    },
    features: [
      'Direct link-out port for instant scaling',
      'Interactive visual loading indicator lights'
    ],
    creator: {
      name: 'AETHERIS LABS',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      verified: true,
      followers: 4802,
      itemsCount: 16,
      volume: '1,420,500 USDC'
    },
    likes: 64,
    hasLiked: false,
    hasBid: false
  }
];

const INITIAL_USER_PROFILE = {
  username: 'Traveler_042',
  email: 'traveler@neo-genx.network',
  connectedWallet: '0x71C765...67A8',
  walletBalanceUSDC: 2840.50,
  walletBalanceETH: 1.45,
  lifetimeSpent: 3496.00,
  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
  points: 120, // Initial network points balance
  linkedBank: {
    bankName: 'Quantum Aetheris Cooperative',
    accountHolder: 'Traveler_042',
    routingNumber: '021000021',
    accountNumber: '•••• •••• 9840',
    balance: 14500.00, // Safe backing balance
    verified: true
  },
  preferences: {
    glassmorphism: true,
    reduceMotion: false,
    highContrast: false
  }
};

const INITIAL_CHATS = [
  {
    id: 'chat-quantum-node',
    productId: 'neo-quantum-node-v1',
    productName: 'NEO-GENX QUANTUM NODE V.1',
    counterpartyName: 'AETHERIS LABS SECURE TERMINAL',
    counterpartyAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    role: 'seller',
    messages: [
      { id: 'm1', sender: 'counterparty', text: 'Secure Link Initiated. Welcome, Traveler. We received your localized telemetry packet.', timestamp: '2026-05-23 11:30' },
      { id: 'm2', sender: 'user', text: 'Understood. Is the hardware enclave fully verified for immediate zero-knowledge computations?', timestamp: '2026-05-23 11:32' },
      { id: 'm3', sender: 'counterparty', text: 'Affirmative. The cryptographic co-processor core is primed. We need you to approve the dispatch payload block to complete physical shipping.', timestamp: '2026-05-23 11:35' }
    ],
    status: 'negotiating'
  },
  {
    id: 'chat-pulse-core',
    productId: 'pulse-core-09',
    productName: 'PULSE CORE-09 ROUTER NODE',
    counterpartyName: 'GENX CORE GATEKEEPER',
    counterpartyAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    role: 'buyer',
    messages: [
      { id: 'm4', sender: 'counterparty', text: 'Broadcasting geolocation beacons. Please verify node alignment with local wireless coordinates.', timestamp: '2026-05-23 11:45' }
    ],
    status: 'negotiating'
  }
];


const INITIAL_ORDERS = [
  {
    id: 'OR-94021',
    date: '2026-05-12 14:32',
    status: 'Completed',
    recipientName: 'Traveler_042',
    items: [
      {
        id: 'oitem-1',
        product: INITIAL_PRODUCTS[1],
        quantity: 1
      }
    ],
    total: 420.00,
    trackingCode: 'GX-382901-US',
    deliveryService: 'DePIN Secure Freight',
    address: {
      line1: '9880 Quantum Boulevard, Suite 40',
      city: 'Aetheris Springs',
      state: 'CA',
      zip: '94030',
      country: 'USA'
    }
  },
  {
    id: 'OR-81977',
    date: '2026-05-20 09:12',
    status: 'Shipped',
    recipientName: 'Traveler_042',
    items: [
      {
        id: 'oitem-2',
        product: INITIAL_PRODUCTS[2],
        quantity: 1
      }
    ],
    total: 349.00,
    trackingCode: 'GX-901248-US',
    deliveryService: 'NeoMesh AeroCourier',
    address: {
      line1: '9880 Quantum Boulevard, Suite 40',
      city: 'Aetheris Springs',
      state: 'CA',
      zip: '94030',
      country: 'USA'
    }
  }
];

// Initialize and Load DB file
function readDB() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const dbDefault = {
        products: INITIAL_PRODUCTS,
        userProfile: INITIAL_USER_PROFILE,
        orders: INITIAL_ORDERS,
        cart: [] as any[],
        chats: INITIAL_CHATS,
        isLoggedIn: true,
        users: {} as any,
        currentUserEmail: null as string | null
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(dbDefault, null, 2), 'utf-8');
      return dbDefault;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Assure key fields exist
    if (!parsed.chats) {
      parsed.chats = INITIAL_CHATS;
    }
    if (!parsed.users) {
      parsed.users = {};
    }
    if (parsed.userProfile && parsed.userProfile.points === undefined) {
      parsed.userProfile.points = 120;
    }
    // Deep sync profile of the currently active logged-in user if available
    if (parsed.isLoggedIn && parsed.currentUserEmail && parsed.users[parsed.currentUserEmail]) {
      parsed.userProfile = parsed.users[parsed.currentUserEmail].profile;
    }
    return parsed;
  } catch (error) {
    console.error('Database read error, falling back to clean memory variables: ', error);
    return {
      products: INITIAL_PRODUCTS,
      userProfile: INITIAL_USER_PROFILE,
      orders: INITIAL_ORDERS,
      cart: [] as any[],
      chats: INITIAL_CHATS,
      isLoggedIn: true,
      users: {} as any,
      currentUserEmail: null as string | null
    };
  }
}

function writeDB(data: any) {
  try {
    // If user is currently authenticated under an account key/email, auto-commit profile changes back to users entry
    if (data.isLoggedIn && data.currentUserEmail && data.users && data.users[data.currentUserEmail]) {
      data.users[data.currentUserEmail].profile = data.userProfile;
    }
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Database write error: ', error);
  }
}

// REST Backend APIs

// 1. Health Connection Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', time: new Date().toISOString() });
});

// 2. Fetch/Write Products list
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  
  // Enforce GP Point restriction for listing
  const LISTING_COST_GP = 30;
  const currentPoints = db.userProfile.points || 0;
  if (currentPoints < LISTING_COST_GP) {
    return res.status(400).json({ error: `Insufficient network GP points. Listing a hardware node requires ${LISTING_COST_GP} GP. Current balance: ${currentPoints} GP. Please validate node arrays to earn points.` });
  }

  const newProduct = req.body;
  if (!newProduct.id) {
    newProduct.id = `custom-asset-${Date.now()}`;
  }

  // Deduct GP points
  db.userProfile.points = currentPoints - LISTING_COST_GP;
  db.products = [newProduct, ...db.products];

  // Spawn prospective buyer chat automatically so user can "talk before they sell/send it"
  const newChat = {
    id: `chat-${newProduct.id}`,
    productId: newProduct.id,
    productName: newProduct.name,
    counterpartyName: 'PROSPECTIVE DEPIN RECIPIENT #409',
    counterpartyAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'seller', // User is the seller
    messages: [
      { id: `m-init-${Date.now()}`, sender: 'counterparty', text: `Greetings, Operator. I spotted your listed device: "${newProduct.name}". I am ready to purchase it for the requested ${newProduct.price} USDC inside this node array. Can you verify telemetry is active?`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) }
    ],
    status: 'negotiating'
  };
  db.chats = [newChat, ...(db.chats || [])];

  writeDB(db);
  res.status(201).json({ product: newProduct, profile: db.userProfile });
});

// 3. Like product
app.post('/api/products/:id/like', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.products = db.products.map((p: any) => {
    if (p.id === id) {
      const isCurrentlyLiked = !!p.hasLiked;
      return {
        ...p,
        hasLiked: !isCurrentlyLiked,
        likes: isCurrentlyLiked ? Math.max(0, (p.likes || 0) - 1) : (p.likes || 0) + 1
      };
    }
    return p;
  });
  writeDB(db);
  const updated = db.products.find((p: any) => p.id === id);
  res.json(updated);
});

// 4. Bid product
app.post('/api/products/:id/bid', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { amount } = req.body;
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 1) {
    return res.status(400).json({ error: 'Valid bid amount is necessary' });
  }

  // Enforce GP Point restriction for bidding
  const BID_COST_GP = 10;
  const currentPoints = db.userProfile.points || 0;
  if (currentPoints < BID_COST_GP) {
    return res.status(400).json({ error: `Insufficient network GP points. Submitting a bid requires ${BID_COST_GP} GP. Current balance: ${currentPoints} GP. Please validate node arrays to earn points.` });
  }

  // Deduct GP points
  db.userProfile.points = currentPoints - BID_COST_GP;

  db.products = db.products.map((p: any) => {
    if (p.id === id) {
      return {
        ...p,
        hasBid: true,
        currentBid: numAmount
      };
    }
    return p;
  });

  // Ensure active chat thread exists so the user can discuss shipping & verification details
  const threads = db.chats || [];
  const existingChat = threads.find((c: any) => c.productId === id);
  if (!existingChat) {
    const product = db.products.find((p: any) => p.id === id);
    const newChat = {
      id: `chat-${id}`,
      productId: id,
      productName: product ? product.name : 'DEPIN HARDWARE DEVICE',
      counterpartyName: product ? product.creator.name : 'SECURE NODE SELLER',
      counterpartyAvatar: product ? product.creator.avatar : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
      role: 'buyer', // User is the buyer
      messages: [
        { id: `m-init-${Date.now()}`, sender: 'counterparty', text: `Consensus validated entry. Thank you for placing a bid of ${numAmount} USDC on "${product ? product.name : 'Device'}". Let's negotiate delivery telemetry in this terminal room.`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) }
      ],
      status: 'negotiating'
    };
    db.chats = [newChat, ...threads];
  }

  writeDB(db);
  const updated = db.products.find((p: any) => p.id === id);
  res.json({ product: updated, profile: db.userProfile });
});

// 5. Fetch/Update Profile
app.get('/api/profile', (req, res) => {
  const db = readDB();
  res.json(db.userProfile);
});

app.post('/api/profile', (req, res) => {
  const db = readDB();
  db.userProfile = { ...db.userProfile, ...req.body };
  writeDB(db);
  res.json(db.userProfile);
});

// 6. Fetch/Create Orders
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  
  // Enforce GP Point restriction for orders
  const ORDER_COST_GP = 20;
  const currentPoints = db.userProfile.points || 0;
  if (currentPoints < ORDER_COST_GP) {
    return res.status(400).json({ error: `Insufficient network GP points. Authorized purchases require ${ORDER_COST_GP} GP. Current balance: ${currentPoints} GP. Please validate node arrays to earn points.` });
  }

  const newOrder = req.body;
  if (!newOrder.id) {
    newOrder.id = `OR-${Math.floor(10000 + Math.random() * 90000)}`;
  }

  // Deduct GP points
  db.userProfile.points = currentPoints - ORDER_COST_GP;
  db.orders = [newOrder, ...db.orders];
  
  // Clean cart state upon checkout
  db.cart = [];

  // Deduct profile wallet balances gracefully
  const orderTotal = parseFloat(newOrder.total) || 0;
  const currentProfile = db.userProfile;
  currentProfile.lifetimeSpent = (currentProfile.lifetimeSpent || 0) + orderTotal;
  currentProfile.walletBalanceUSDC = Math.max(0, (currentProfile.walletBalanceUSDC || 0) - orderTotal);
  db.userProfile = currentProfile;

  // Auto-spawn interactive negotiation chat thread for items bought
  if (newOrder.items && newOrder.items.length > 0) {
    newOrder.items.forEach((it: any) => {
      if (it.product) {
        const prodId = it.product.id;
        const exists = (db.chats || []).find((c: any) => c.productId === prodId);
        if (!exists) {
          const newChat = {
            id: `chat-${prodId}-${Date.now()}`,
            productId: prodId,
            productName: it.product.name,
            counterpartyName: it.product.creator?.name || 'AETHERIS LABS',
            counterpartyAvatar: it.product.creator?.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
            role: 'buyer', // User is buyer
            messages: [
              { id: `m-init-${Date.now()}`, sender: 'counterparty', text: `Consensus verified purchase block of ${it.product.name}. Let's discuss shipping coordinates and configure node telemetry in this channel before dispatching the payload.`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) }
            ],
            status: 'negotiating'
          };
          db.chats = [newChat, ...(db.chats || [])];
        }
      }
    });
  }

  writeDB(db);
  res.status(201).json({ order: newOrder, profile: db.userProfile });
});

// 7. Cart State Management
app.get('/api/cart', (req, res) => {
  const db = readDB();
  res.json(db.cart);
});

app.post('/api/cart', (req, res) => {
  const db = readDB();
  db.cart = req.body || [];
  writeDB(db);
  res.json(db.cart);
});

// 8. Authentication simulated logic
app.get('/api/auth/status', (req, res) => {
  const db = readDB();
  res.json({ isLoggedIn: !!db.isLoggedIn, profile: db.isLoggedIn ? db.userProfile : null });
});

app.post('/api/auth/signup', (req, res) => {
  const db = readDB();
  const { email, password, username } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Mail address and passcode credentials are required.' });
  }

  const emailKey = email.trim().toLowerCase();
  
  // Enforce existence check
  if (db.users && db.users[emailKey]) {
    return res.status(400).json({ error: 'This ecosystem mail is already registered. Handshake aborted.' });
  }

  // Create a brand new user profile
  const mockWallet = `0x${Math.floor(100000 + Math.random() * 900000).toString(16)}...${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;
  const newUserProfile = {
    username: username || email.split('@')[0],
    email: email,
    connectedWallet: mockWallet,
    walletBalanceUSDC: 2840.50,
    walletBalanceETH: 1.45,
    lifetimeSpent: 0.00,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    points: 120, // Initial network points
    linkedBank: {
      bankName: 'Global Transit Federal',
      accountHolder: username || email.split('@')[0],
      routingNumber: '021000021',
      accountNumber: '•••• •••• ' + Math.floor(1000 + Math.random() * 9000),
      balance: 10000.00,
      verified: true
    },
    preferences: {
      glassmorphism: true,
      reduceMotion: false,
      highContrast: false
    }
  };

  db.users = db.users || {};
  db.users[emailKey] = {
    email: emailKey,
    password: password,
    profile: newUserProfile
  };

  db.userProfile = newUserProfile;
  db.isLoggedIn = true;
  db.currentUserEmail = emailKey;

  writeDB(db);
  res.status(201).json({ success: true, profile: newUserProfile });
});

app.post('/api/auth/login', (req, res) => {
  const db = readDB();
  const { email, password } = req.body;

  // Support backward compatible login if no body credentials are sent to keep existing app actions alive
  if (!email || !password) {
    db.isLoggedIn = true;
    writeDB(db);
    return res.json({ success: true, isLoggedIn: true, profile: db.userProfile });
  }

  const emailKey = email.trim().toLowerCase();
  db.users = db.users || {};
  const user = db.users[emailKey];

  if (!user) {
    return res.status(400).json({ error: 'Ecosystem mail not registered. Handshake rejected.' });
  }

  if (user.password !== password) {
    return res.status(400).json({ error: 'Invalid cryptographic passcode credentials.' });
  }

  db.isLoggedIn = true;
  db.currentUserEmail = emailKey;
  db.userProfile = user.profile;

  writeDB(db);
  res.json({ success: true, isLoggedIn: true, profile: db.userProfile });
});

app.post('/api/auth/logout', (req, res) => {
  const db = readDB();
  db.isLoggedIn = false;
  db.currentUserEmail = null;
  writeDB(db);
  res.json({ success: true, isLoggedIn: false });
});

// 9. Mine Network Points (GP)
app.post('/api/profile/mine', (req, res) => {
  const db = readDB();
  const currentPoints = db.userProfile.points || 0;
  db.userProfile.points = currentPoints + 30; // Mine +30 GP
  writeDB(db);
  res.json({ success: true, points: db.userProfile.points, profile: db.userProfile });
});

// 10. Fetch Chat Threads
app.get('/api/chats', (req, res) => {
  const db = readDB();
  res.json(db.chats || []);
});

app.get('/api/chats/:id', (req, res) => {
  const db = readDB();
  const thread = (db.chats || []).find((c: any) => c.id === req.params.id);
  if (!thread) return res.status(404).json({ error: 'Chat thread not found' });
  res.json(thread);
});

// 11. Post chat message + Simulated smart responsive reply
app.post('/api/chats/:id/message', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { text, sender } = req.body;
  if (!text) return res.status(400).json({ error: 'Message text is required' });

  const threads = db.chats || [];
  const threadIndex = threads.findIndex((c: any) => c.id === id);
  if (threadIndex === -1) return res.status(404).json({ error: 'Chat thread not found' });

  const thread = threads[threadIndex];
  const newMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    sender: sender || 'user',
    text,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  thread.messages.push(newMessage);

  // Auto response logic
  const responsePool = [
    "Perfect, packet telemetry verified on our terminal endpoint. Let's arrange dispatch details.",
    "Decentralized secure ledger updated. The node looks solid in our signal arrays.",
    "Hardware signatures verified successfully. Once you authorize payload release, shipping protocols will trigger automatically.",
    "That makes total sense. I've logged the telemetry hash. Please update state status when ready to send.",
    "Message received over the peer-to-peer ring. Uptime nodes are verifying configuration parameters as we speak."
  ];
  
  if (sender !== 'counterparty') {
    // Inject automated companion response after 300ms so it appears highly interactive
    const automatedReply = {
      id: `msg-auto-${Date.now()}`,
      sender: 'counterparty',
      text: responsePool[Math.floor(Math.random() * responsePool.length)],
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    thread.messages.push(automatedReply);
  }

  threads[threadIndex] = thread;
  db.chats = threads;
  writeDB(db);

  res.status(201).json(thread);
});

// 12. Approve / Dispatch Listing Order
app.post('/api/chats/:id/status', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'dispatched'

  const threads = db.chats || [];
  const threadIndex = threads.findIndex((c: any) => c.id === id);
  if (threadIndex === -1) return res.status(404).json({ error: 'Chat thread not found' });

  threads[threadIndex].status = status || 'approved';
  
  // Create system log message
  const sysMessage = {
    id: `msg-sys-${Date.now()}`,
    sender: 'counterparty' as const,
    text: `[SYSTEM NOTICE] Transaction status updated to: ${status === 'dispatched' ? 'DISPATCHED & SENT' : 'APPROVED & SIGNED'}. Escrow tokens and hardware delivery initialized!`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  threads[threadIndex].messages.push(sysMessage);

  db.chats = threads;
  writeDB(db);
  res.json(threads[threadIndex]);
});


// 13. Bank Account Integration API Endpoints
app.post('/api/bank/edit', (req, res) => {
  const db = readDB();
  const { bankName, accountHolder, routingNumber, accountNumber, balance } = req.body;

  if (!db.userProfile) {
    return res.status(401).json({ error: 'Authorize access first' });
  }

  db.userProfile.linkedBank = {
    bankName: bankName || 'Quantum Aetheris Cooperative',
    accountHolder: accountHolder || db.userProfile.username,
    routingNumber: routingNumber || '021000021',
    accountNumber: accountNumber || '•••• •••• ' + Math.floor(1000 + Math.random() * 9000),
    balance: parseFloat(balance) !== undefined && !isNaN(parseFloat(balance)) ? parseFloat(balance) : 10000.00,
    verified: true
  };

  writeDB(db);
  res.json({ success: true, profile: db.userProfile });
});

app.post('/api/bank/transfer', (req, res) => {
  const db = readDB();
  const { type, amount } = req.body; // type: 'deposit' (bank -> wallet) or 'withdraw' (wallet -> bank)
  const transferAmount = parseFloat(amount);

  if (!db.userProfile) {
    return res.status(401).json({ error: 'Authorize access first' });
  }

  if (isNaN(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer amount' });
  }

  const bank = db.userProfile.linkedBank;
  if (!bank) {
    return res.status(400).json({ error: 'No synced bank account found' });
  }

  if (type === 'deposit') {
    if (bank.balance < transferAmount) {
      return res.status(400).json({ error: 'Insufficient bank account funds' });
    }
    bank.balance -= transferAmount;
    db.userProfile.walletBalanceUSDC = (db.userProfile.walletBalanceUSDC || 0) + transferAmount;
  } else if (type === 'withdraw') {
    if ((db.userProfile.walletBalanceUSDC || 0) < transferAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }
    bank.balance += transferAmount;
    db.userProfile.walletBalanceUSDC = Math.max(0, (db.userProfile.walletBalanceUSDC || 0) - transferAmount);
  } else {
    return res.status(400).json({ error: 'Invalid transfer direction' });
  }

  db.userProfile.linkedBank = bank;
  writeDB(db);
  res.json({ success: true, profile: db.userProfile });
});


// Start server function and tie in Vite Dev Middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DePIN full-stack server active at http://localhost:${PORT}`);
  });
}

startServer();
