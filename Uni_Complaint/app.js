/**
 * UniResolve – University Complaint Management System
 * app.js – Frontend Logic, Smart Contract Interaction, UI State Management
 *
 * Author  : Muhammad Jawad Raza (Reg: 235119)
 * Network : Sepolia Testnet
 * Stack   : Ethers.js v6, MetaMask, Chart.js, Supabase Storage
 */

// ─────────────────────────────────────────────
//  CONTRACT CONFIG  (update after deployment)
// ─────────────────────────────────────────────
const CONTRACT_ADDRESS = "0xC7Fd2837542B0aDb970E1FF9005d0dcbAd4d221c"; // TODO: update after Remix deploy

const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "note",
        "type": "string"
      }
    ],
    "name": "addAdminNote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "officer",
        "type": "address"
      }
    ],
    "name": "assignComplaint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "enum UniResolve.Role",
        "name": "role",
        "type": "uint8"
      }
    ],
    "name": "assignRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "complaintId",
        "type": "uint256"
      }
    ],
    "name": "ComplaintNotFound",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "complaintId",
        "type": "uint256"
      }
    ],
    "name": "ComplaintNotResolved",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "complaintId",
        "type": "uint256"
      }
    ],
    "name": "DuplicateVote",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "complaintId",
        "type": "uint256"
      }
    ],
    "name": "FeedbackAlreadySubmitted",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "provided",
        "type": "uint8"
      }
    ],
    "name": "InvalidRating",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "enum UniResolve.Status",
        "name": "current",
        "type": "uint8"
      },
      {
        "internalType": "enum UniResolve.Status",
        "name": "requested",
        "type": "uint8"
      }
    ],
    "name": "InvalidStatusTransition",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "UnauthorizedAccess",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "note",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AdminNoteAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "assignedTo",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ComplaintAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "closedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ComplaintClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum UniResolve.Category",
        "name": "category",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "enum UniResolve.Priority",
        "name": "priority",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isAnonymous",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ComplaintCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "escalatedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ComplaintEscalated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "reopenedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ComplaintReopened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newVoteCount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ComplaintVoted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "enum UniResolve.Category",
        "name": "category",
        "type": "uint8"
      },
      {
        "internalType": "enum UniResolve.Priority",
        "name": "priority",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "isAnonymous",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "fileHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fileUrl",
        "type": "string"
      }
    ],
    "name": "createComplaint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "escalateComplaint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "student",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "rating",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "FeedbackAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "reopenComplaint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum UniResolve.Role",
        "name": "role",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "assignedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "RoleAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum UniResolve.Status",
        "name": "oldStatus",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "enum UniResolve.Status",
        "name": "newStatus",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "actor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "StatusChanged",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "rating",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "comment",
        "type": "string"
      }
    ],
    "name": "submitFeedback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "enum UniResolve.Status",
        "name": "newStatus",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "note",
        "type": "string"
      }
    ],
    "name": "updateStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "voteComplaint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_DEADLINE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ESCALATION_THRESHOLD",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllComplaints",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getComplaint",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "isAnonymous",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "enum UniResolve.Category",
            "name": "category",
            "type": "uint8"
          },
          {
            "internalType": "enum UniResolve.Priority",
            "name": "priority",
            "type": "uint8"
          },
          {
            "internalType": "enum UniResolve.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "assignedTo",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "updatedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadlineAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "escalatedAt",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "fileHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fileUrl",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "adminNotes",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "feedbackSubmitted",
            "type": "bool"
          }
        ],
        "internalType": "struct UniResolve.Complaint",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getComplaintsByUser",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getFeedback",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "student",
            "type": "address"
          },
          {
            "internalType": "uint8",
            "name": "rating",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "comment",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct UniResolve.Feedback",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getRole",
    "outputs": [
      {
        "internalType": "enum UniResolve.Role",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getTimeline",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "enum UniResolve.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "actor",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "note",
            "type": "string"
          }
        ],
        "internalType": "struct UniResolve.TimelineEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalComplaints",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ─────────────────────────────────────────────
//  SUPABASE CONFIG  (update with your keys)
// ─────────────────────────────────────────────
const SUPABASE_URL    = "https://pwqjsaqrcpqftgwndduz.supabase.co";
const SUPABASE_ANON   = "sb_publishable_tSYZK0vgqp6pBIWkvnvvXQ_MKoOKF2U";
const SUPABASE_BUCKET = "uniresolve-evidence";

// ─────────────────────────────────────────────
//  ENUMS (mirrors Solidity)
// ─────────────────────────────────────────────
const Status = {
  0: "Pending", 1: "Assigned", 2: "In Progress",
  3: "Resolved", 4: "Closed", 5: "Reopened", 6: "Escalated"
};
const Priority = { 0: "Low", 1: "Medium", 2: "High", 3: "Emergency" };
const Category = {
  0: "Academic Affairs", 1: "Examination", 2: "Hostel",
  3: "Transport", 4: "Laboratory", 5: "Campus Facilities",
  6: "Cafeteria", 7: "Administration", 8: "Security",
  9: "Internet/WiFi", 10: "Library"
};
const Role = {
  0: "None", 1: "Student", 2: "Admin", 3: "Department Officer",
  4: "Hostel Manager", 5: "Transport Officer", 6: "Lab Incharge",
  7: "Examination Officer", 8: "Faculty Representative"
};

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let provider, signer, contract;
let walletAddress = null;
let userRole = 0;
let darkMode = false;
let charts = {};
let notifications = [];
let localComplaints = [];  // cache for UI

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initNavigation();
  initComplaintForm();
  initAdminPanel();
  initSearch();
  renderSampleCharts();
  renderDashboardCards();
  loadAnnouncements();

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", handleAccountChange);
    window.ethereum.on("chainChanged", () => window.location.reload());
  }

  // Auto-reconnect if previously connected
  const saved = localStorage.getItem("ur_wallet");
  if (saved && window.ethereum) {
    try { await connectWallet(true); } catch(_) {}
  }
});

// ─────────────────────────────────────────────
//  THEME
// ─────────────────────────────────────────────
function initTheme() {
  darkMode = localStorage.getItem("ur_theme") === "dark";
  applyTheme();
  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
}

function toggleTheme() {
  darkMode = !darkMode;
  localStorage.setItem("ur_theme", darkMode ? "dark" : "light");
  applyTheme();
}

function applyTheme() {
  document.body.classList.toggle("dark", darkMode);
  const icon = document.getElementById("themeIcon");
  if (icon) icon.textContent = darkMode ? "☀️" : "🌙";
}

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────
function initNavigation() {
  const links = document.querySelectorAll("[data-section]");
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.section;
      showSection(target);
      // mobile: close sidebar
      document.getElementById("sidebar")?.classList.remove("open");
    });
  });

  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
  });

  showSection("dashboard");
}

function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(`sec-${id}`);
  if (target) target.classList.add("active");

  document.querySelectorAll("[data-section]").forEach(l => {
    l.classList.toggle("active", l.dataset.section === id);
  });

  if (id === "analytics") renderAnalyticsSection();
  if (id === "my-complaints") loadMyComplaints();
  if (id === "track") { /* reset track form */ }
}

// ─────────────────────────────────────────────
//  WALLET
// ─────────────────────────────────────────────
async function connectWallet(silent = false) {
  if (!window.ethereum) {
    if (!silent) toast("MetaMask not found. Please install it.", "error");
    return;
  }
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    walletAddress = accounts[0];
    signer = await provider.getSigner();

    // Check network (Sepolia = 11155111)
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== 11155111 && !silent) {
      toast("Please switch to Sepolia Testnet.", "warning");
    }

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Fetch role
    try {
      const roleNum = await contract.getRole(walletAddress);
      userRole = Number(roleNum);
    } catch(_) { userRole = 1; /* default student */ }

    localStorage.setItem("ur_wallet", walletAddress);
    updateWalletUI();
    listenToEvents();
    if (!silent) toast("Wallet connected successfully!", "success");
    await loadMyComplaints();
  } catch (err) {
    if (!silent) toast("Wallet connection failed: " + err.message, "error");
  }
}

function disconnectWallet() {
  walletAddress = null; signer = null; contract = null; provider = null;
  localStorage.removeItem("ur_wallet");
  updateWalletUI();
  toast("Wallet disconnected.", "info");
}

function handleAccountChange(accounts) {
  if (!accounts.length) { disconnectWallet(); return; }
  walletAddress = accounts[0];
  updateWalletUI();
  toast("Account changed to " + shortAddr(walletAddress), "info");
}

function updateWalletUI() {
  const addrEl  = document.getElementById("walletAddress");
  const roleEl  = document.getElementById("roleBadge");
  const btnCon  = document.getElementById("btnConnect");
  const btnDis  = document.getElementById("btnDisconnect");
  const dotEl   = document.getElementById("walletDot");

  // Handle Role-Based Navigation Visibility
  const adminLinks = document.querySelectorAll('[data-role="admin-only"]');
  
  if (walletAddress) {
    if (addrEl) addrEl.textContent = shortAddr(walletAddress);
    if (roleEl) { roleEl.textContent = Role[userRole] || "Student"; roleEl.style.display = "inline-flex"; }
    if (btnCon) btnCon.style.display = "none";
    if (btnDis) btnDis.style.display = "inline-flex";
    if (dotEl)  dotEl.className = "wallet-dot connected";
    
    // Show admin links only if userRole is 2 (Admin)
    adminLinks.forEach(link => link.style.display = (userRole === 2) ? "flex" : "none");
  } else {
    if (addrEl) addrEl.textContent = "Not Connected";
    if (roleEl) roleEl.style.display = "none";
    if (btnCon) btnCon.style.display = "inline-flex";
    if (btnDis) btnDis.style.display = "none";
    if (dotEl)  dotEl.className = "wallet-dot disconnected";
    
    // Hide restricted links when disconnected
    adminLinks.forEach(link => link.style.display = "none");
  }
}

function shortAddr(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// ─────────────────────────────────────────────
//  COMPLAINT FORM
// ─────────────────────────────────────────────
function initComplaintForm() {
  const form = document.getElementById("complaintForm");
  if (!form) return;
  form.addEventListener("submit", handleComplaintSubmit);

  document.getElementById("evidenceFile")?.addEventListener("change", handleFilePreview);
}

async function handleComplaintSubmit(e) {
  e.preventDefault();
  if (!walletAddress) { toast("Please connect your wallet first.", "warning"); return; }

  const title       = document.getElementById("cTitle").value.trim();
  const description = document.getElementById("cDesc").value.trim();
  const category    = parseInt(document.getElementById("cCategory").value);
  const priority    = parseInt(document.getElementById("cPriority").value);
  const isAnon      = document.getElementById("cAnonymous").checked;
  const fileInput   = document.getElementById("evidenceFile");

  if (!title || !description) { toast("Please fill all required fields.", "warning"); return; }

  setBtnLoading("btnSubmitComplaint", true, "Submitting…");

  try {
    let fileHash = "", fileUrl = "";
    if (fileInput.files.length > 0) {
      const result = await uploadEvidence(fileInput.files[0]);
      fileHash = result.hash;
      fileUrl  = result.url;
    }

    const tx = await contract.createComplaint(
      title, description, category, priority, isAnon, fileHash, fileUrl
    );
    toast("Transaction submitted. Waiting for confirmation…", "info");
    const receipt = await tx.wait();

    // Parse event for complaint ID
    let newId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed.name === "ComplaintCreated") newId = Number(parsed.args[0]);
      } catch(_) {}
    }

    toast(`Complaint #${String(newId || "?").padStart(3,"0")} submitted successfully!`, "success");
    document.getElementById("complaintForm").reset();
    addNotification("Your complaint was submitted on-chain.", "success");
    await loadMyComplaints();
    showSection("my-complaints");
  } catch (err) {
    toast("Submission failed: " + (err.reason || err.message), "error");
  } finally {
    setBtnLoading("btnSubmitComplaint", false, "Submit Complaint");
  }
}

async function handleFilePreview(e) {
  const file = e.target.files[0];
  if (!file) return;
  const preview = document.getElementById("filePreview");
  if (!preview) return;
  const hash = await sha256File(file);
  preview.innerHTML = `
    <div class="file-preview-card">
      <span class="file-icon">${file.type.includes("pdf") ? "📄" : "🖼️"}</span>
      <div>
        <div class="file-name">${file.name}</div>
        <div class="file-hash">SHA-256: ${hash.slice(0,16)}…</div>
        <div class="file-size">${(file.size/1024).toFixed(1)} KB</div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
//  SUPABASE UPLOAD
// ─────────────────────────────────────────────
async function uploadEvidence(file) {
  const hash = await sha256File(file);
  const ext  = file.name.split(".").pop();
  const path = `evidence/${hash}.${ext}`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON}`,
      "apikey": SUPABASE_ANON,
      "Content-Type": file.type,
      "x-upsert": "true"
    },
    body: file
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Supabase upload failed (${res.status}): ${errorData.message || errorData.error || res.statusText}`);
  }

  const url = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
  return { hash, url };
}

async function sha256File(file) {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

// ─────────────────────────────────────────────
//  TRACK COMPLAINT
// ─────────────────────────────────────────────
async function trackComplaint() {
  const idRaw = document.getElementById("trackId")?.value?.trim();
  if (!idRaw) { toast("Enter a complaint ID.", "warning"); return; }
  const id = parseInt(idRaw.replace("#",""));
  if (!contract) { renderSampleComplaintDetail(id); return; }
  try {
    setBtnLoading("btnTrack", true, "Searching…");
    const c = await contract.getComplaint(id);
    const timeline = await contract.getTimeline(id);
    renderComplaintDetail(c, timeline, id);
  } catch(err) {
    toast("Complaint not found or error: " + err.message, "error");
  } finally {
    setBtnLoading("btnTrack", false, "Track");
  }
}

function renderComplaintDetail(c, timeline, id) {
  const el = document.getElementById("trackResult");
  if (!el) return;
  const fmtId = `#${String(id).padStart(3,"0")}`;
  const statusBadge = `<span class="badge status-${c[7]}">${Status[c[7]]}</span>`;
  const priBadge    = `<span class="badge priority-${c[6]}">${Priority[c[6]]}</span>`;

  el.innerHTML = `
    <div class="complaint-card detail-card">
      <div class="card-header-row">
        <h3>${fmtId} — ${escHtml(c[3])}</h3>
        <div>${statusBadge} ${priBadge}</div>
      </div>
      <p class="desc">${escHtml(c[4])}</p>
      <div class="meta-grid">
        <div><label>Category</label><span>${Category[c[5]]}</span></div>
        <div><label>Filed</label><span>${fmtDate(Number(c[9]))}</span></div>
        <div><label>Deadline</label><span>${fmtDate(Number(c[11]))}</span></div>
        <div><label>Votes</label><span>👍 ${Number(c[16])}</span></div>
        ${c[13] ? `<div><label>Evidence</label><a href="${escHtml(c[14])}" target="_blank" class="link-btn">View File</a></div>` : ""}
      </div>
      ${c[15] ? `<div class="admin-note"><strong>Admin Note:</strong> ${escHtml(c[15])}</div>` : ""}
      <div class="timeline-section">
        <h4>📋 Complaint Timeline</h4>
        <div class="timeline">${renderTimeline(timeline)}</div>
      </div>
      <div class="action-row">
        <button class="btn btn-outline" onclick="voteOnComplaint(${id})">👍 Support</button>
        ${(c[7] == 3 || c[7] == 4) ? `<button class="btn btn-secondary" onclick="showFeedbackModal(${id})">⭐ Rate Resolution</button>` : ""}
        ${(c[7] == 3 || c[7] == 4) ? `<button class="btn btn-outline" onclick="initiateReopen(${id})">🔄 Reopen</button>` : ""}
        <button class="btn btn-outline" onclick="exportPDF(${id})">📥 Export PDF</button>
      </div>
    </div>`;
}

function renderTimeline(entries) {
  if (!entries || !entries.length) return "<p class='muted'>No timeline entries.</p>";
  return entries.map((e, i) => `
    <div class="tl-entry ${i === entries.length-1 ? "last" : ""}">
      <div class="tl-dot"></div>
      <div class="tl-content">
        <span class="tl-status badge status-${e[1]}">${Status[e[1]]}</span>
        <span class="tl-time">${fmtDate(Number(e[0]))}</span>
        <p class="tl-note">${escHtml(e[3])}</p>
        <p class="tl-actor muted">${shortAddr(e[2])}</p>
      </div>
    </div>`).join("");
}

// ─────────────────────────────────────────────
//  MY COMPLAINTS
// ─────────────────────────────────────────────
async function loadMyComplaints() {
  const container = document.getElementById("myComplaintsList");
  if (!container) return;

  if (!contract || !walletAddress) {
    container.innerHTML = renderSampleComplaints();
    return;
  }

  try {
    const ids = await contract.getComplaintsByUser();
    if (!ids.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No complaints filed yet.</p>
        <button class="btn btn-primary" onclick="showSection('submit')">Submit First Complaint</button>
      </div>`;
      return;
    }
    const items = await Promise.all(ids.map(id => contract.getComplaint(Number(id))));
    localComplaints = items.map((c, i) => ({ raw: c, id: Number(ids[i]) }));
    container.innerHTML = items.map((c, i) => renderComplaintCard(c, Number(ids[i]))).join("");
  } catch(err) {
    container.innerHTML = renderSampleComplaints();
  }
}

function renderComplaintCard(c, id) {
  const fmtId = `#${String(id).padStart(3,"0")}`;
  return `
    <div class="complaint-card" onclick="quickView(${id})">
      <div class="card-header-row">
        <span class="cid">${fmtId}</span>
        <span class="badge status-${c[7]}">${Status[c[7]]}</span>
      </div>
      <h4 class="ctitle">${escHtml(c[3])}</h4>
      <p class="cdesc">${escHtml(c[4]).slice(0,100)}…</p>
      <div class="card-footer-row">
        <span class="badge priority-${c[6]}">${Priority[c[6]]}</span>
        <span class="cat-tag">${Category[c[5]]}</span>
        <span class="muted">${fmtDate(Number(c[9]))}</span>
        <span class="vote-count">👍 ${Number(c[16])}</span>
      </div>
    </div>`;
}

async function quickView(id) {
  if (!contract) { toast("Connect wallet to view details.", "warning"); return; }
  try {
    const [c, timeline] = await Promise.all([
      contract.getComplaint(id),
      contract.getTimeline(id)
    ]);
    renderComplaintDetail(c, timeline, id);
    showSection("track");
  } catch(err) {
    toast("Error loading complaint: " + err.message, "error");
  }
}

// ─────────────────────────────────────────────
//  VOTING
// ─────────────────────────────────────────────
async function voteOnComplaint(id) {
  if (!contract) { toast("Connect wallet to vote.", "warning"); return; }
  try {
    const alreadyVoted = await contract.hasVoted(id, walletAddress);
    if (alreadyVoted) { toast("You have already voted on this complaint.", "warning"); return; }
    const tx = await contract.voteComplaint(id);
    toast("Vote submitted, waiting for confirmation…", "info");
    await tx.wait();
    toast("Vote recorded on-chain! ✅", "success");
  } catch(err) {
    toast("Vote failed: " + (err.reason || err.message), "error");
  }
}

// ─────────────────────────────────────────────
//  FEEDBACK MODAL
// ─────────────────────────────────────────────
function showFeedbackModal(id) {
  const modal = document.getElementById("feedbackModal");
  if (!modal) return;
  document.getElementById("feedbackComplaintId").value = id;
  modal.style.display = "flex";
  initStarRating();
}

function closeFeedbackModal() {
  document.getElementById("feedbackModal").style.display = "none";
}

function initStarRating() {
  const stars = document.querySelectorAll(".star-btn");
  stars.forEach(s => {
    s.addEventListener("click", () => {
      const val = parseInt(s.dataset.val);
      document.getElementById("feedbackRating").value = val;
      stars.forEach((st, i) => st.classList.toggle("active", i < val));
    });
  });
}

async function submitFeedbackForm() {
  const id      = parseInt(document.getElementById("feedbackComplaintId").value);
  const rating  = parseInt(document.getElementById("feedbackRating").value || "0");
  const comment = document.getElementById("feedbackComment").value.trim();

  if (!rating) { toast("Please select a star rating.", "warning"); return; }
  if (!contract) { toast("Connect wallet first.", "warning"); return; }

  try {
    setBtnLoading("btnFeedbackSubmit", true, "Submitting…");
    const tx = await contract.submitFeedback(id, rating, comment);
    await tx.wait();
    toast("Feedback submitted on-chain! ⭐", "success");
    closeFeedbackModal();
  } catch(err) {
    toast("Feedback failed: " + (err.reason || err.message), "error");
  } finally {
    setBtnLoading("btnFeedbackSubmit", false, "Submit Feedback");
  }
}

// ─────────────────────────────────────────────
//  REOPEN
// ─────────────────────────────────────────────
async function initiateReopen(id) {
  const reason = prompt("Please provide a reason for reopening this complaint:");
  if (!reason) return;
  if (!contract) { toast("Connect wallet first.", "warning"); return; }
  try {
    const tx = await contract.reopenComplaint(id, reason);
    toast("Reopen transaction submitted…", "info");
    await tx.wait();
    toast("Complaint reopened successfully!", "success");
    addNotification(`Complaint #${String(id).padStart(3,"0")} has been reopened.`, "warning");
  } catch(err) {
    toast("Reopen failed: " + (err.reason || err.message), "error");
  }
}

// ─────────────────────────────────────────────
//  ADMIN PANEL
// ─────────────────────────────────────────────
function initAdminPanel() {
  document.getElementById("btnLoadAllComplaints")?.addEventListener("click", loadAllComplaints);
  document.getElementById("adminStatusForm")?.addEventListener("submit", handleAdminStatusUpdate);
}

async function loadAllComplaints() {
  const container = document.getElementById("adminComplaintsList");
  if (!container) return;

  if (!contract || userRole !== 2) {
    container.innerHTML = `<div class="notice">Connect as Admin to view all complaints.</div>`;
    return;
  }

  try {
    const ids = await contract.getAllComplaints();
    const items = await Promise.all(ids.map(id => contract.getComplaint(Number(id))));
    container.innerHTML = items.map((c, i) => renderAdminComplaintRow(c, Number(ids[i]))).join("");
  } catch(err) {
    toast("Error loading complaints: " + err.message, "error");
  }
}

function renderAdminComplaintRow(c, id) {
  const fmtId = `#${String(id).padStart(3,"0")}`;
  return `
    <div class="admin-row">
      <span class="cid">${fmtId}</span>
      <span class="ctitle">${escHtml(c[3]).slice(0,40)}</span>
      <span class="badge status-${c[7]}">${Status[c[7]]}</span>
      <span class="badge priority-${c[6]}">${Priority[c[6]]}</span>
      <span>${Category[c[5]]}</span>
      <div class="admin-actions">
        <select id="newStatus-${id}" class="select-sm">
          ${Object.entries(Status).map(([k,v]) => `<option value="${k}" ${c[7]==k?"selected":""}>${v}</option>`).join("")}
        </select>
        <input type="text" id="note-${id}" class="input-sm" placeholder="Add note…">
        <button class="btn btn-sm btn-primary" onclick="adminUpdateStatus(${id})">Update</button>
        <button class="btn btn-sm btn-outline" onclick="adminEscalate(${id})">Escalate</button>
      </div>
    </div>`;
}

async function adminUpdateStatus(id) {
  const newStatus = parseInt(document.getElementById(`newStatus-${id}`).value);
  const note = document.getElementById(`note-${id}`).value;
  if (!contract) return;
  try {
    const tx = await contract.updateStatus(id, newStatus, note);
    await tx.wait();
    toast(`Complaint #${String(id).padStart(3,"0")} status updated.`, "success");
    addNotification(`Status updated to ${Status[newStatus]} for complaint #${String(id).padStart(3,"0")}.`, "info");
    loadAllComplaints();
  } catch(err) {
    toast("Update failed: " + (err.reason || err.message), "error");
  }
}

async function adminEscalate(id) {
  if (!contract) return;
  try {
    const tx = await contract.escalateComplaint(id);
    await tx.wait();
    toast(`Complaint #${String(id).padStart(3,"0")} escalated!`, "warning");
    addNotification(`Complaint #${String(id).padStart(3,"0")} has been escalated.`, "warning");
    loadAllComplaints();
  } catch(err) {
    toast("Escalation failed: " + (err.reason || err.message), "error");
  }
}

async function handleAdminStatusUpdate(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById("adminCid").value);
  const status = parseInt(document.getElementById("adminStatus").value);
  const note = document.getElementById("adminNote").value;
  await adminUpdateStatus(id);
}

async function assignRole() {
  const wallet = document.getElementById("roleWallet")?.value?.trim();
  const role = parseInt(document.getElementById("roleSelect")?.value || "1");
  if (!wallet || !wallet.startsWith("0x")) { toast("Enter a valid wallet address.", "warning"); return; }
  if (!contract) { toast("Connect as Admin first.", "warning"); return; }
  try {
    const tx = await contract.assignRole(wallet, role);
    toast("Role assignment submitted…", "info");
    await tx.wait();
    toast(`Role assigned: ${Role[role]} → ${wallet.slice(0, 8)}…`, "success");
  } catch (e) {
    toast("Role assignment failed: " + (e.reason || e.message), "error");
  }
}

// ─────────────────────────────────────────────
//  SEARCH & FILTERS
// ─────────────────────────────────────────────
function initSearch() {
  document.getElementById("searchInput")?.addEventListener("input", performSearch);
  document.querySelectorAll(".filter-select").forEach(sel => {
    sel.addEventListener("change", performSearch);
  });
}

function performSearch() {
  const query    = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const catFilter = document.getElementById("filterCategory")?.value || "";
  const staFilter = document.getElementById("filterStatus")?.value || "";
  const priFilter = document.getElementById("filterPriority")?.value || "";

  const filtered = localComplaints.filter(({ raw, id }) => {
    const fmtId = `#${String(id).padStart(3,"0")}`;
    const matchQ = !query || fmtId.includes(query) || raw[3].toLowerCase().includes(query);
    const matchC = !catFilter || raw[5] == catFilter;
    const matchS = !staFilter || raw[7] == staFilter;
    const matchP = !priFilter || raw[6] == priFilter;
    return matchQ && matchC && matchS && matchP;
  });

  const container = document.getElementById("myComplaintsList");
  if (container) {
    container.innerHTML = filtered.length
      ? filtered.map(({ raw, id }) => renderComplaintCard(raw, id)).join("")
      : `<div class="empty-state"><p>No complaints match your filters.</p></div>`;
  }
}

// ─────────────────────────────────────────────
//  CHARTS
// ─────────────────────────────────────────────
function renderSampleCharts() {
  renderCategoryChart();
  renderStatusChart();
  renderPriorityChart();
}

function renderCategoryChart() {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;
  if (charts.category) charts.category.destroy();
  charts.category = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.values(Category),
      datasets: [{
        data: [12, 8, 15, 6, 9, 5, 4, 11, 7, 10, 3],
        backgroundColor: [
          "#1E3A8A","#2563EB","#60A5FA","#3B82F6","#1D4ED8",
          "#93C5FD","#BFDBFE","#EFF6FF","#1e40af","#3b82f6","#6366f1"
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "right", labels: { font: { size: 11 } } } }
    }
  });
}

function renderStatusChart() {
  const ctx = document.getElementById("statusChart");
  if (!ctx) return;
  if (charts.status) charts.status.destroy();
  charts.status = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.values(Status),
      datasets: [{
        label: "Complaints",
        data: [18, 12, 9, 22, 15, 3, 2],
        backgroundColor: [
          "#F59E0B","#3B82F6","#8B5CF6","#10B981","#6B7280","#EF4444","#F97316"
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function renderPriorityChart() {
  const ctx = document.getElementById("priorityChart");
  if (!ctx) return;
  if (charts.priority) charts.priority.destroy();
  charts.priority = new Chart(ctx, {
    type: "polarArea",
    data: {
      labels: Object.values(Priority),
      datasets: [{
        data: [25, 32, 18, 6],
        backgroundColor: ["#3B82F6","#F59E0B","#EF4444","#7C3AED"]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function renderAnalyticsSection() {
  renderSampleCharts();
}

// ─────────────────────────────────────────────
//  DASHBOARD CARDS
// ─────────────────────────────────────────────
function renderDashboardCards() {
  const data = {
    total: 81, pending: 18, resolved: 22, closed: 15,
    escalated: 2, rate: "54%", avgRating: "4.2"
  };
  const setCard = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setCard("statTotal",     data.total);
  setCard("statPending",   data.pending);
  setCard("statResolved",  data.resolved);
  setCard("statClosed",    data.closed);
  setCard("statEscalated", data.escalated);
  setCard("statRate",      data.rate);
  setCard("statAvgRating", data.avgRating);
}

// ─────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────
function addNotification(message, type = "info") {
  notifications.unshift({ message, type, time: new Date() });
  renderNotifications();
  updateNotifBadge();
}

function renderNotifications() {
  const container = document.getElementById("notificationList");
  if (!container) return;
  if (!notifications.length) {
    container.innerHTML = `<div class="empty-state"><p>No notifications yet.</p></div>`;
    return;
  }
  container.innerHTML = notifications.slice(0,20).map(n => `
    <div class="notif-item notif-${n.type}">
      <span class="notif-icon">${n.type==="success"?"✅":n.type==="warning"?"⚠️":n.type==="error"?"❌":"ℹ️"}</span>
      <div>
        <p>${escHtml(n.message)}</p>
        <span class="muted">${fmtDate(n.time)}</span>
      </div>
    </div>`).join("");
}

function updateNotifBadge() {
  const badge = document.getElementById("notifBadge");
  if (badge) {
    badge.textContent = notifications.length;
    badge.style.display = notifications.length ? "inline-flex" : "none";
  }
}

// ─────────────────────────────────────────────
//  ANNOUNCEMENTS
// ─────────────────────────────────────────────
function loadAnnouncements() {
  const list = [
    { title: "System Maintenance Scheduled", body: "UniResolve will be offline on Sunday 2:00–4:00 AM for upgrades.", date: "2025-02-10", type: "warning" },
    { title: "New Department Officers Added", body: "Lab Incharge and Transport Officer roles have been assigned.", date: "2025-02-08", type: "info" },
    { title: "Complaint Resolution Rate Improved", body: "Our resolution rate increased to 78% this month. Thank you!", date: "2025-02-05", type: "success" }
  ];
  const container = document.getElementById("announcementList");
  if (!container) return;
  container.innerHTML = list.map(a => `
    <div class="announcement-card announce-${a.type}">
      <div class="announce-header">
        <h4>${escHtml(a.title)}</h4>
        <span class="muted">${a.date}</span>
      </div>
      <p>${escHtml(a.body)}</p>
    </div>`).join("");
}

// ─────────────────────────────────────────────
//  LIVE EVENTS (ethers.js)
// ─────────────────────────────────────────────
function listenToEvents() {
  if (!contract) return;
  contract.on("ComplaintCreated", (id, owner, cat, pri, isAnon, timestamp) => {
    addNotification(`New complaint #${String(Number(id)).padStart(3,"0")} created.`, "info");
  });
  contract.on("StatusChanged", (id, oldS, newS) => {
    addNotification(`Complaint #${String(Number(id)).padStart(3,"0")} status → ${Status[Number(newS)]}.`, "info");
  });
  contract.on("ComplaintEscalated", (id) => {
    addNotification(`⚠️ Complaint #${String(Number(id)).padStart(3,"0")} ESCALATED!`, "warning");
  });
}

// ─────────────────────────────────────────────
//  PDF EXPORT
// ─────────────────────────────────────────────
async function exportPDF(id) {
  if (!contract) { toast("Connect wallet to export.", "warning"); return; }
  try {
    const c = await contract.getComplaint(id);
    const timeline = await contract.getTimeline(id);
    const fmtId = `#${String(id).padStart(3,"0")}`;

    const content = `
UniResolve – Complaint Report
==============================
Complaint ID   : ${fmtId}
Title          : ${c[3]}
Category       : ${Category[c[5]]}
Priority       : ${Priority[c[6]]}
Status         : ${Status[c[7]]}
Filed          : ${fmtDate(Number(c[9]))}
Deadline       : ${fmtDate(Number(c[11]))}
Description    :
${c[4]}

Timeline
--------
${timeline.map(t => `[${fmtDate(Number(t[0]))}] ${Status[t[1]]} — ${t[3]}`).join("\n")}

${c[15] ? `Admin Notes: ${c[15]}` : ""}

Evidence File Hash: ${c[13] || "None"}
Evidence URL      : ${c[14] || "None"}

--- Generated by UniResolve | Muhammad Jawad Raza (235119) ---
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `UniResolve_Complaint_${fmtId.replace("#","")}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast("Report exported!", "success");
  } catch(err) {
    toast("Export failed: " + err.message, "error");
  }
}

// ─────────────────────────────────────────────
//  SAMPLE DATA (when not connected)
// ─────────────────────────────────────────────
function renderSampleComplaints() {
  const samples = [
    { id: 1, title: "WiFi Down in Block C", cat: 9, pri: 2, status: 2, date: 1707350400, votes: 14 },
    { id: 2, title: "Lab Projector Not Working", cat: 4, pri: 1, status: 0, date: 1707436800, votes: 7 },
    { id: 3, title: "Cafeteria Food Quality", cat: 6, pri: 0, status: 3, date: 1707523200, votes: 23 },
  ];
  return samples.map(s => `
    <div class="complaint-card sample">
      <div class="card-header-row">
        <span class="cid">#${String(s.id).padStart(3,"0")}</span>
        <span class="badge status-${s.status}">${Status[s.status]}</span>
      </div>
      <h4 class="ctitle">${s.title}</h4>
      <div class="card-footer-row">
        <span class="badge priority-${s.pri}">${Priority[s.pri]}</span>
        <span class="cat-tag">${Category[s.cat]}</span>
        <span class="muted">${fmtDate(new Date(s.date*1000))}</span>
        <span class="vote-count">👍 ${s.votes}</span>
      </div>
    </div>`).join("") + `<div class="sample-notice">⚠️ Sample data — connect wallet to see your complaints.</div>`;
}

function renderSampleComplaintDetail(id) {
  const el = document.getElementById("trackResult");
  if (el) el.innerHTML = `<div class="notice">Connect wallet to view complaint #${String(id).padStart(3,"0")} on-chain.</div>`;
}

// ─────────────────────────────────────────────
//  TOAST NOTIFICATIONS
// ─────────────────────────────────────────────
function toast(msg, type = "info", duration = 4000) {
  const container = document.getElementById("toastContainer") || createToastContainer();
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  const icons = { success:"✅", error:"❌", warning:"⚠️", info:"ℹ️" };
  el.innerHTML = `<span>${icons[type]||"ℹ️"}</span><span>${escHtml(msg)}</span>`;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 350);
  }, duration);
}

function createToastContainer() {
  const el = document.createElement("div");
  el.id = "toastContainer";
  el.className = "toast-container";
  document.body.appendChild(el);
  return el;
}

// ─────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────
function fmtDate(ts) {
  const d = ts instanceof Date ? ts : new Date(ts * 1000);
  return d.toLocaleDateString("en-PK", { year:"numeric", month:"short", day:"numeric" });
}

function escHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function setBtnLoading(btnId, loading, text) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = text;
}

// ─────────────────────────────────────────────
//  GLOBAL EXPOSURE (called from HTML onclick)
// ─────────────────────────────────────────────
window.connectWallet     = connectWallet;
window.disconnectWallet  = disconnectWallet;
window.trackComplaint    = trackComplaint;
window.voteOnComplaint   = voteOnComplaint;
window.showFeedbackModal = showFeedbackModal;
window.closeFeedbackModal= closeFeedbackModal;
window.submitFeedbackForm= submitFeedbackForm;
window.initiateReopen    = initiateReopen;
window.adminUpdateStatus = adminUpdateStatus;
window.assignRole        = assignRole;
window.adminEscalate     = adminEscalate;
window.quickView         = quickView;
window.showSection       = showSection;
window.exportPDF         = exportPDF;
window.toggleTheme       = toggleTheme;
window.loadAllComplaints = loadAllComplaints;
