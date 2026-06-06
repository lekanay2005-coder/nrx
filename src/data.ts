import { Product, UserProfile, Order } from './types';

export const INITIAL_PRODUCTS: Product[] = [
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
    hasBid: false
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  username: 'Traveler_042',
  email: 'traveler@neo-genx.network',
  connectedWallet: '0x71C765...67A8',
  walletBalanceUSDC: 2840.50,
  walletBalanceETH: 1.45,
  lifetimeSpent: 3496.00,
  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
  points: 120, // Initial network points
  preferences: {
    glassmorphism: true,
    reduceMotion: false,
    highContrast: false
  }
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'OR-94021',
    date: '2026-05-12 14:32',
    status: 'Completed',
    recipientName: 'Traveler_042',
    items: [
      {
        id: 'oitem-1',
        product: INITIAL_PRODUCTS[1], // storage array
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
        product: INITIAL_PRODUCTS[2], // router node
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
