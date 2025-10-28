// Global variables
let contract;
let provider;
let signer;
let userAddress;
let contractAddress;

// Initialize Web3
async function init() {
    // Wait briefly for provider injection (MetaMask injects after page load)
    await waitForEthereumProvider(1200);
    // Load contract ABI from Truffle build (try multiple common paths)
    await loadContractAbi();

    // Setup event listeners
    setupEventListeners();
}
async function loadContractAbi() {
    const candidatePaths = [
        '../build/contracts/UserProfile.json', // when serving from src/
        './build/contracts/UserProfile.json',  // when serving from project root
        '/build/contracts/UserProfile.json'    // absolute at root
    ];
    for (const path of candidatePaths) {
        try {
            const res = await fetch(path, { cache: 'no-store' });
            if (!res.ok) continue;
            const json = await res.json();
            if (json && Array.isArray(json.abi)) {
                window.UserProfileABI = json.abi;
                console.log('Contract ABI loaded from', path);
                return true;
            }
        } catch (_) {
            // try next path
        }
    }
    console.error('Failed to load ABI from known paths');
    showNotification('Could not load ABI. Run truffle compile and serve from project root or from src/', 'error');
    return false;
}

// Wait for window.ethereum to be injected
function waitForEthereumProvider(timeoutMs = 1200) {
    return new Promise((resolve) => {
        if (window.ethereum) return resolve();
        const handle = setInterval(() => {
            if (window.ethereum) {
                clearInterval(handle);
                clearTimeout(timer);
                resolve();
            }
        }, 50);
        const timer = setTimeout(() => {
            clearInterval(handle);
            resolve();
        }, timeoutMs);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Wallet connection
    document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);
    
    // Contract loading
    document.getElementById('load-contract-btn').addEventListener('click', loadContract);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Profile functions
    document.getElementById('set-profile-btn').addEventListener('click', setProfile);
    document.getElementById('get-profile-btn').addEventListener('click', getProfile);
    
    // Balance functions
    document.getElementById('deposit-btn').addEventListener('click', depositBalance);
    document.getElementById('check-balance-btn').addEventListener('click', checkBalance);
    document.getElementById('withdraw-btn').addEventListener('click', withdrawBalance);
    
    // Transfer functions
    document.getElementById('get-my-balance-btn').addEventListener('click', getMyBalance);
    document.getElementById('get-contract-balance-btn').addEventListener('click', getContractBalance);
    document.getElementById('withdraw-contract-btn').addEventListener('click', withdrawContractBalance);
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Connect wallet
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            document.getElementById('wallet-address').textContent = userAddress;
            
            // Get network
            const network = await provider.getNetwork();
            document.getElementById('network').textContent = network.name;
            
            showNotification('Wallet connected successfully!', 'success');
            
            // Check if contract is loaded
            if (contract) {
                loadContract();
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            showNotification('Error connecting wallet: ' + error.message, 'error');
        }
    } else {
        showNotification('Please install MetaMask or another Web3 wallet', 'error');
        // Open MetaMask install page in a new tab
        try {
            window.open('https://metamask.io/download/', '_blank');
        } catch (_) {}
    }
}

// Load contract
async function loadContract() {
    contractAddress = document.getElementById('contract-address').value.trim();
    
    if (!contractAddress) {
        showNotification('Please enter a contract address', 'error');
        return;
    }
    
    if (!signer) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    if (!window.UserProfileABI) {
        showNotification('Please wait for contract ABI to load', 'error');
        return;
    }
    
    try {
        contract = new ethers.Contract(contractAddress, window.UserProfileABI, signer);
        showNotification('Contract loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading contract:', error);
        showNotification('Error loading contract: ' + error.message, 'error');
    }
}

// Set user profile
async function setProfile() {
    if (!contract) {
        showNotification('Please load the contract first', 'error');
        return;
    }
    
    const name = document.getElementById('user-name').value.trim();
    const age = document.getElementById('user-age').value;
    
    if (!name || !age) {
        showNotification('Please enter both name and age', 'error');
        return;
    }
    
    try {
        showNotification('Transaction pending...', 'info');
        const tx = await contract.setUserProfile(name, age);
        await tx.wait();
        showNotification('Profile updated successfully!', 'success');
        document.getElementById('user-name').value = '';
        document.getElementById('user-age').value = '';
    } catch (error) {
        console.error('Error setting profile:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Get user profile
async function getProfile() {
    if (!contract) {
        showNotification('Please load the contract first', 'error');
        return;
    }
    
    const address = document.getElementById('lookup-address').value.trim() || userAddress;
    
    if (!address) {
        showNotification('Please enter an address', 'error');
        return;
    }
    
    try {
        const [name, age] = await contract.getUserProfile(address);
        const result = `
            <strong>Name:</strong> ${name || 'Not set'}<br>
            <strong>Age:</strong> ${age ? age.toString() : 'Not set'}<br>
            <strong>Address:</strong> ${address}
        `;
        document.getElementById('profile-result').innerHTML = result;
        showNotification('Profile retrieved successfully!', 'success');
    } catch (error) {
        console.error('Error getting profile:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Deposit balance
async function depositBalance() {
    if (!contract) {
        showNotification('Please load the contract first', 'error');
        return;
    }
    
    const amount = document.getElementById('deposit-amount').value;
    
    if (!amount || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    try {
        showNotification('Transaction pending...', 'info');
        const tx = await contract.depositBalance({
            value: ethers.utils.parseEther(amount)
        });
        await tx.wait();
        showNotification('Balance deposited successfully!', 'success');
        document.getElementById('deposit-amount').value = '';
    } catch (error) {
        console.error('Error depositing balance:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Check balance
async function checkBalance() {
    if (!contract) {
        showNotification('Please load the contract first', 'error');
        return;
    }
    
    const address = document.getElementById('balance-address').value.trim() || userAddress;
    
    if (!address) {
        showNotification('Please enter an address', 'error');
        return;
    }
    
    try {
        const balance = await contract.getBalance(address);
        const balanceInEth = ethers.utils.formatEther(balance);
        const result = `
            <strong>Address:</strong> ${address}<br>
            <strong>Balance:</strong> ${balanceInEth} ETH<br>
            <strong>Balance (Wei):</strong> ${balance.toString()}
        `;
        document.getElementById('balance-result').innerHTML = result;
        showNotification('Balance retrieved successfully!', 'success');
    } catch (error) {
        console.error('Error checking balance:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Withdraw balance
async function withdrawBalance() {
    if (!contract) {
        showNotification('Please load the contract first', 'error');
        return;
    }
    
    const amount = document.getElementById('withdraw-amount').value;
    
    if (!amount || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    try {
        showNotification('Transaction pending...', 'info');
        const tx = await contract.withdrawBalance(ethers.utils.parseEther(amount));
        await tx.wait();
        showNotification('Balance withdrawn successfully!', 'success');
        document.getElementById('withdraw-amount').value = '';
    } catch (error) {
        console.error('Error withdrawing balance:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Get my balance
async function getMyBalance() {
    if (!userAddress) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    await checkBalance();
    document.getElementById('balance-address').value = '';
}

// Get contract balance
async function getContractBalance() {
    if (!signer) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    try {
        const balance = await provider.getBalance(contractAddress);
        const balanceInEth = ethers.utils.formatEther(balance);
        const result = `
            <strong>Contract Address:</strong> ${contractAddress}<br>
            <strong>Balance:</strong> ${balanceInEth} ETH<br>
            <strong>Balance (Wei):</strong> ${balance.toString()}
        `;
        document.getElementById('contract-balance-result').innerHTML = result;
        showNotification('Contract balance retrieved successfully!', 'success');
    } catch (error) {
        console.error('Error getting contract balance:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Withdraw contract balance (owner only)
async function withdrawContractBalance() {
    if (!contract) {
        showNotification('Please load the contract first', 'error');
        return;
    }
    
    try {
        showNotification('Transaction pending...', 'info');
        const tx = await contract.withdrawContractBalance();
        await tx.wait();
        showNotification('Contract balance withdrawn successfully!', 'success');
    } catch (error) {
        console.error('Error withdrawing contract balance:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

