import { ethers } from "./ethers-6.7.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
      connectButton.innerHTML = "Connected"
      const accounts = await ethereum.request({ method: "eth_accounts" })
      console.log(accounts)
    } catch (error) {
      console.log(error)
    }
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      console.log("Processing transaction...")
      const transactionResponse = await contract.withdraw()
      await transactionResponse.wait(1)
      console.log("Done!")
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    
    // CHECK NETWORK FIRST
    const network = await provider.getNetwork()
    console.log("Connected to network chainId:", network.chainId.toString())
    
    if (network.chainId !== 11155111n) {
      alert("Wrong Network! Please switch MetaMask to Sepolia Testnet")
      console.log("Expected: 11155111, Got:", network.chainId.toString())
      return
    }
    
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    
    try {
      console.log("Sending transaction...")
      const transactionResponse = await contract.fund({
        value: ethers.parseEther(ethAmount),
      })
      console.log("Transaction hash:", transactionResponse.hash)
      console.log("Waiting for confirmation...")
      await transactionResponse.wait(1)
      console.log("Done! Funded successfully!")
      alert(`Successfully funded with ${ethAmount} ETH!`)
    } catch (error) {
      console.error("Error details:", error)
      if (error.reason) {
        alert(`Transaction failed: ${error.reason}`)
      } else {
        alert(`Error: ${error.message}`)
      }
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      console.log(ethers.formatEther(balance))
    } catch (error) {
      console.log(error)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}