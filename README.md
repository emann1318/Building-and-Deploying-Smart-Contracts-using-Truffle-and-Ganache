# User Profile Smart Contract DApp

A decentralized application (DApp) built with Truffle, Solidity, and a web frontend for managing user profiles on the blockchain. This project demonstrates interaction with a smart contract that allows users to set their profiles (name and age) and manage balances.

## Project Structure

```
├── contracts/
│   └── UserProfile.sol          # Main smart contract
├── migrations/
│   └── 1_deploy_contract.js     # Deployment migration script
├── src/                          # Frontend files
│   ├── index.html               # Main HTML file
│   ├── script.js                # Frontend JavaScript for contract interaction
│   └── style.css                # Styling for the frontend
├── truffle-config.js            # Truffle configuration
├── README.md                    # This file
└── package.json                 # Node dependencies (create if needed)
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Truffle** - Smart contract development framework
- **Ganache** - Local blockchain for testing
- **MetaMask** - Browser extension wallet (for testing)
- **Git** - Version control system

## Installation Steps

### 1. Install Node.js Dependencies

If you haven't installed Truffle globally, install it:

```bash
npm install -g truffle
```

### 2. Install Project Dependencies

Navigate to the project directory and install dependencies:

```bash
cd 23i-5572_Eman_Faris_Assignment_03
npm install
```

If there's no `package.json` file, create one with:

```bash
npm init -y
```

Then install the required packages:

```bash
npm install truffle
```

### 3. Start Ganache

1. Download and install Ganache from [Truffle Suite](https://trufflesuite.com/ganache/)
2. Start Ganache and create a new workspace
3. Note the RPC Server URL (usually `http://127.0.0.1:7545`)
4. Keep Ganache running in the background

## Compilation and Deployment

### 1. Compile the Contract

Run the following command to compile your Solidity contract:

```bash
truffle compile
```

This will create a `build/contracts/` directory with the compiled contract artifacts.

### 2. Deploy the Contract

Deploy the contract to your local Ganache blockchain:

```bash
truffle migrate
```

**Important:** After deployment, note the deployed contract address from the terminal output. It will look something like:
```
Contract address: 0x1234567890abcdef...
```

Save this address as you'll need it for the frontend.

### 3. Verify Deployment

You can interact with your deployed contract using Truffle console:

```bash
truffle console
```

In the console, you can run commands like:
```javascript
let instance = await UserProfile.deployed()
let owner = await instance.owner()
console.log(owner)
```

Type `.exit` to leave the console.

## Running the Frontend

### Option 1: Using a Local Server

Since the frontend needs to load the contract ABI from the `build/contracts/` directory, you need to serve the files through a local server:

1. Install a simple HTTP server:
```bash
npm install -g http-server
```

2. Navigate to the `src/` directory:
```bash
cd src
```

3. Start the server:
```bash
http-server
```

The server will start on `http://localhost:8080`

### Option 2: Using Python

If you have Python installed, you can use:

```bash
cd src
python -m http.server 8080
```

## Using the DApp

### 1. Connect MetaMask

1. Open the frontend in your browser (e.g., `http://localhost:8080`)
2. Click "Connect Wallet" button
3. If using MetaMask, approve the connection request
4. Select the Ganache account you want to use

### 2. Load the Contract

1. Enter the deployed contract address in the "Contract Address" field
2. Click "Load Contract" button
3. You should see a success message

### 3. Interact with the Contract

The DApp has three main tabs:

#### Profile Tab
- **Set User Profile**: Enter your name and age, then click "Set Profile"
- **Get User Profile**: Enter an address to lookup and retrieve profile information

#### Balance Tab
- **Deposit Balance**: Send ETH to your account in the contract
- **Check Balance**: View the balance of any address
- **Withdraw Balance**: Withdraw your deposited ETH

#### Transfer Tab
- **Get My Balance**: Quick access to check your own balance
- **Get Contract Balance**: View the total balance held by the contract
- **Withdraw Contract Balance**: Owner-only function to withdraw all contract balance

## Testing the Contract

### Manual Testing via Frontend

1. **Set Profile**:
   - Enter your name (e.g., "Eman Faris")
   - Enter your age (e.g., 25)
   - Click "Set Profile"
   - Confirm transaction in MetaMask

2. **Get Profile**:
   - Click "Get Profile" with your address
   - Verify your name and age are displayed

3. **Deposit Balance**:
   - Switch to "Balance" tab
   - Enter an amount (e.g., 0.1 ETH)
   - Click "Deposit"
   - Confirm transaction in MetaMask

4. **Check Balance**:
   - Enter your address (or leave empty to use connected address)
   - Click "Check Balance"
   - Verify your balance is displayed

5. **Withdraw Balance**:
   - Enter an amount to withdraw
   - Click "Withdraw"
   - Confirm transaction in MetaMask

### Testing with Truffle Console

```bash
truffle console
```

```javascript
// Get deployed contract instance
let instance = await UserProfile.deployed()

// Get owner
let owner = await instance.getOwner()
console.log("Owner:", owner)

// Set profile
await instance.setUserProfile("John Doe", 30, {from: owner})

// Get profile
let profile = await instance.getUserProfile(owner)
console.log("Profile:", profile)

// Deposit (requires ETH sent with transaction)
await instance.depositBalance({from: owner, value: web3.utils.toWei("1", "ether")})

// Check balance
let balance = await instance.getBalance(owner)
console.log("Balance:", web3.utils.fromWei(balance.toString(), "ether"), "ETH")

// Withdraw
await instance.withdrawBalance(web3.utils.toWei("0.5", "ether"), {from: owner})
```

## Commands Summary

| Command | Description |
|---------|-------------|
| `truffle compile` | Compile smart contracts |
| `truffle migrate` | Deploy contracts to blockchain |
| `truffle migrate --reset` | Redeploy contracts (reset previous migrations) |
| `truffle console` | Open interactive console with deployed contracts |
| `truffle test` | Run test files |
| `npm install` | Install dependencies |
| `http-server` | Start local web server for frontend |

## Troubleshooting

### Contract Won't Load
- Ensure the contract address is correct (copy from migration output)
- Make sure you're connected to MetaMask with the correct network (Ganache)
- Check that the contract has been deployed successfully

### Transactions Fail
- Ensure you have sufficient ETH in your Ganache account
- Check that MetaMask is connected to the correct network
- Verify the contract address is correct

### Frontend Not Loading Contract ABI
- Make sure you've run `truffle compile` first
- Ensure the `build/contracts/UserProfile.json` file exists
- Check that you're running the frontend through a local server

### MetaMask Connection Issues
- Verify Ganache is running
- Add the Ganache network to MetaMask:
  - Network Name: Ganache
  - RPC URL: http://127.0.0.1:7545
  - Chain ID: 1337
  - Currency Symbol: ETH

## Features

- ✅ User profile management (name and age)
- ✅ Balance deposit and withdrawal
- ✅ View any user's profile and balance
- ✅ Owner-only functions for contract management
- ✅ Event emissions for transaction tracking
- ✅ Modern, responsive UI
- ✅ Real-time transaction notifications

## Security Notes

- This is a development contract for educational purposes
- Never deploy to mainnet without proper security audit
- Always validate user inputs in production environments
- Use established libraries for numeric operations in production

## License

MIT License - See LICENSE file for details

## Author

Eman Faris 

---

For questions or issues, please refer to the [Truffle Documentation](https://trufflesuite.com/docs) or [Solidity Documentation](https://docs.soliditylang.org/).


