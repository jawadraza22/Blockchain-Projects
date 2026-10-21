let provider, signer, contract;
const contractAddress = "0x6728D50A16dcc0f00ce5562842C334047866F602";

const abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "approveCandidate",
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
        "internalType": "string",
        "name": "fullName",
        "type": "string"
      }
    ],
    "name": "CandidateApproved",
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
        "internalType": "string",
        "name": "fullName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "region",
        "type": "string"
      }
    ],
    "name": "CandidateRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_voterCnic",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_durationSeconds",
        "type": "uint256"
      }
    ],
    "name": "createElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "deleteCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_cnic",
        "type": "string"
      }
    ],
    "name": "deleteVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      }
    ],
    "name": "ElectionEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "name": "ElectionStarted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "endElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_cnic",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_age",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "_region",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_party",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_manifesto",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_metadata",
        "type": "string"
      }
    ],
    "name": "registerCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_cnic",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_age",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "_region",
        "type": "string"
      }
    ],
    "name": "registerVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "voterHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      }
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "cnicHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "region",
        "type": "string"
      }
    ],
    "name": "VoterRegistered",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "admin",
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
    "name": "currentElection",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getCandidateById",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "fullName",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "age",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "region",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "party",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "manifesto",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isApproved",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidateCount",
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
    "name": "getElectionInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_cnic",
        "type": "string"
      }
    ],
    "name": "getVoterById",
    "outputs": [
      {
        "internalType": "string",
        "name": "fullName",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "age",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "region",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "hasVoted",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "votedFor",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVoterCount",
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

let selectedCandidateId = null;

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            
            // Initialize contract
            contract = new ethers.Contract(contractAddress, abi, signer);
            
            // UI Updates
            document.getElementById('statusText').innerText = address.substring(0, 6) + '...' + address.substring(38);
            document.getElementById('statusDot').classList.add('connected');
            document.getElementById('connectBtn').innerHTML = '<i data-lucide="check-circle" style="width:18px;height:18px;"></i><span>Connected</span>';
            
            if (window.lucide) lucide.createIcons();
            
            showToast("Wallet Linked: Jamhuriat Active");
            updateStats();
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                window.location.reload();
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });

        } catch (error) {
            console.error("Connection Error:", error);
            showToast("Secure Link Failed: " + (error.message || "Unknown error"), true);
        }
    } else {
        showToast("MetaMask not found. Please install it to use this DApp.", true);
    }
}

// Check for existing connection on load
window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            connectWallet();
        }
    }
});

async function updateStats() {
    if (!contract) return;
    try {
        const vCount = await contract.getVoterCount();
        const cCount = await contract.getCandidateCount();
        const election = await contract.getElectionInfo();

        document.getElementById('statVoters').innerText = vCount.toString();
        document.getElementById('statCandidates').innerText = cCount.toString();
        document.getElementById('statVotes').innerText = election.totalVotes.toString();

        if (document.getElementById('panel-results').classList.contains('active')) {
            loadResults();
        }
    } catch (e) {
        console.error("Data Sync Failed:", e);
    }
}

function showPanel(panelId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const targetPanel = document.getElementById(`panel-${panelId}`);
    if (targetPanel) targetPanel.classList.add('active');
    
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(panelId)) {
            btn.classList.add('active');
        }
    });

    if (panelId === 'results') loadResults();
    if (panelId === 'vote') loadBallot();
}

async function registerVoter() {
    if (!contract) return showToast("Please connect wallet first", true);
    const id = document.getElementById('v-id').value;
    const name = document.getElementById('v-name').value;
    const age = document.getElementById('v-age').value;
    const region = document.getElementById('v-region').value;

    if (!id || !name || !age || !region) return showToast("All CNIC details required", true);
    if (id.length !== 13) return showToast("CNIC must be 13 digits", true);

    try {
        toggleLoading(true, "Registering CNIC on Blockchain...");
        const tx = await contract.registerVoter(id, name, parseInt(age), region);
        await tx.wait();
        showToast("Voter Registration Secured!");
        updateStats();
    } catch (e) {
        handleError(e);
    } finally {
        toggleLoading(false);
    }
}

async function registerCandidate() {
    if (!contract) return showToast("Please connect wallet first", true);
    const id = document.getElementById('c-id').value;
    const name = document.getElementById('c-name').value;
    const age = document.getElementById('c-age').value;
    const region = document.getElementById('c-region').value;
    const party = document.getElementById('c-party').value;
    const meta = document.getElementById('c-meta').value;
    const manifesto = document.getElementById('c-manifesto').value;

    if (!id || !name || !age || !region || !party || !manifesto) return showToast("Incomplete nomination form", true);

    try {
        toggleLoading(true, "Uploading Nomination to Blockchain...");
        const tx = await contract.registerCandidate(id, name, parseInt(age), region, party, manifesto, meta);
        await tx.wait();
        showToast("Nomination Successfully Registered");
        updateStats();
    } catch (e) {
        handleError(e);
    } finally {
        toggleLoading(false);
    }
}

async function loadBallot() {
    if (!contract) return;
    const container = document.getElementById('ballot-container');
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Retrieving Approved Candidates...</p>';
    
    try {
        const count = await contract.getCandidateCount();
        container.innerHTML = '';
        let found = 0;
        
        for (let i = 1; i <= count; i++) {
            try {
                const c = await contract.getCandidateById(i);
                if (c.isApproved) {
                    const card = document.createElement('div');
                    card.className = 'candidate-card';
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                            <span class="party-badge">${c.party}</span>
                            <span style="font-size: 0.8rem; opacity: 0.6; font-weight: 800;">ID: ${c.id}</span>
                        </div>
                        <div style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; margin-bottom: 5px;">${c.fullName}</div>
                        <div style="font-size: 0.9rem; color: var(--accent-color); font-weight: 700; margin-bottom: 15px; display:flex; align-items:center; gap:5px;">
                            <i data-lucide="map-pin" style="width:14px;height:14px;"></i> ${c.region}
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-dim); height: 50px; overflow: hidden; margin-bottom: 20px; line-height: 1.4;">${c.manifesto}</p>
                        <button class="btn-primary" style="width: 100%; padding: 12px; font-size: 0.9rem;" onclick="selectCandidate(${c.id}, '${c.fullName}')">
                            <i data-lucide="check-circle" style="width:16px;height:16px;"></i> Select Candidate
                        </button>
                    `;
                    container.appendChild(card);
                    found++;
                }
            } catch (e) {
                // Skip deleted or non-existent candidates
                continue;
            }
        }
        if (window.lucide) lucide.createIcons();
        if (found === 0) container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No certified candidates found for this region.</p>';
    } catch (e) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--error);">Blockchain Access Error.</p>';
    }
}

function selectCandidate(id, name) {
    selectedCandidateId = id;
    document.getElementById('selected-confirm').style.display = 'block';
    document.getElementById('selected-name').innerText = `Choice: ${name}`;
    
    document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));
    // Fixed: using currentTarget to find the card
    const card = event.target.closest('.candidate-card');
    if (card) card.classList.add('selected');
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

async function castVote() {
    if (!contract) return showToast("Please connect wallet first", true);
    const voterCnic = document.getElementById('vote-id').value;
    if (!voterCnic) return showToast("Voter CNIC required for validation", true);
    if (!selectedCandidateId) return showToast("Please select your choice", true);

    try {
        toggleLoading(true, "Submitting Final Ballot to Blockchain...");
        const tx = await contract.castVote(voterCnic, selectedCandidateId);
        await tx.wait();
        showToast("Ballot Cast & Secured Successfully!");
        showPanel('results');
        updateStats();
    } catch (e) {
        handleError(e);
    } finally {
        toggleLoading(false);
    }
}

async function loadResults() {
    if (!contract) return;
    const container = document.getElementById('results-list');
    container.innerHTML = '<p>Synchronizing Live Records...</p>';
    
    try {
        const count = await contract.getCandidateCount();
        const election = await contract.getElectionInfo();
        const total = election.totalVotes.toNumber();
        
        container.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            try {
                const c = await contract.getCandidateById(i);
                const votes = c.voteCount.toNumber();
                const percent = total > 0 ? (votes / total * 100).toFixed(1) : 0;
                
                const row = document.createElement('div');
                row.style.marginBottom = '30px';
                row.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 700;">
                        <div>
                            <span style="font-size: 1.1rem; color: #fff;">${c.fullName}</span>
                            <span style="color: var(--accent-color); margin-left: 15px; font-size: 0.9rem;">${c.party}</span>
                        </div>
                        <div style="text-align: right;">
                            <span style="color: #fff;">${votes} Votes</span>
                            <span style="color: var(--text-dim); font-size: 0.8rem; margin-left: 8px;">(${percent}%)</span>
                        </div>
                    </div>
                    <div style="height: 14px; background: rgba(255,255,255,0.05); border-radius: 100px; overflow: hidden;">
                        <div style="height: 100%; background: linear-gradient(to right, var(--accent-color), #059669); width: ${percent}%; border-radius: 100px; transition: width 1s ease;"></div>
                    </div>
                `;
                container.appendChild(row);
            } catch (e) {
                // Skip deleted candidates
                continue;
            }
        }
    } catch (e) {
        container.innerHTML = '<p style="color: var(--error);">Results Synchronization Failed.</p>';
    }
}

async function createElection() {
    if (!contract) return showToast("Please connect wallet first", true);
    const name = document.getElementById('a-name').value;
    const dur = document.getElementById('a-duration').value;
    try {
        toggleLoading(true, "Initializing Election Session...");
        const tx = await contract.createElection(name, parseInt(dur));
        await tx.wait();
        showToast("Election Session Initiated");
    } catch (e) { handleError(e); } finally { toggleLoading(false); }
}

async function approveCandidate() {
    if (!contract) return showToast("Please connect wallet first", true);
    const id = document.getElementById('a-cid').value;
    try {
        toggleLoading(true, "Validating Nomination...");
        const tx = await contract.approveCandidate(parseInt(id));
        await tx.wait();
        showToast("Nomination Certified for Ballot");
    } catch (e) { handleError(e); } finally { toggleLoading(false); }
}

async function endElection() {
    if (!contract) return showToast("Please connect wallet first", true);
    try {
        toggleLoading(true, "Terminating Session...");
        const tx = await contract.endElection();
        await tx.wait();
        showToast("Election Concluded & Finalized");
    } catch (e) { handleError(e); } finally { toggleLoading(false); }
}

async function deleteCandidate() {
    if (!contract) return showToast("Please connect wallet first", true);
    const id = document.getElementById('del-cid').value;
    if (!id) return showToast("Candidate ID required", true);
    
    try {
        toggleLoading(true, "Removing Candidate from Blockchain...");
        const tx = await contract.deleteCandidate(parseInt(id));
        await tx.wait();
        showToast("Candidate Record Purged");
        updateStats();
    } catch (e) { handleError(e); } finally { toggleLoading(false); }
}

async function deleteVoter() {
    if (!contract) return showToast("Please connect wallet first", true);
    const cnic = document.getElementById('del-v-cnic').value;
    if (!cnic) return showToast("Voter CNIC required", true);
    
    try {
        toggleLoading(true, "Removing Voter from Blockchain...");
        const tx = await contract.deleteVoter(cnic);
        await tx.wait();
        showToast("Voter Record Purged");
        updateStats();
    } catch (e) { handleError(e); } finally { toggleLoading(false); }
}

function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.innerText = msg;
    t.style.background = isError ? '#f43f5e' : '#fff';
    t.style.color = isError ? '#fff' : '#064e3b';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
}

function toggleLoading(show, text = "") {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    const textEl = document.getElementById('loaderText');
    if (textEl) textEl.innerText = text;
    overlay.style.display = show ? 'flex' : 'none';
}

function handleError(e) {
    console.error("Contract Error:", e);
    let msg = "Secure Transaction Failed";
    if (e.data && e.data.message) msg = e.data.message;
    else if (e.message) msg = e.message;
    
    if (msg.includes("user rejected")) return;
    if (msg.includes("Jamhuriat:")) {
        msg = msg.split("Jamhuriat:")[1].split('"')[0].trim();
    } else if (msg.includes("execution reverted")) {
        // Try to find the inner message if it's a raw revert
        if (msg.includes("Admin access required")) msg = "Admin Authorization Failed";
        else if (msg.includes("Invalid candidate ID")) msg = "Candidate ID not found";
        else msg = "On-chain Error: Transaction Reverted";
    }
    showToast(msg, true);
}

// Background Animation
const canvas = document.getElementById('bgCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let dots = [];
    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        dots = [];
        for (let i = 0; i < 60; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2.5
            });
        }
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        dots.forEach(d => {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fill();
            d.x += d.vx;
            d.y += d.vy;
            if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
            if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        });
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', initCanvas);
    initCanvas();
    draw();
}
