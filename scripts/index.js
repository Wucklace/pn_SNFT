// Description: This script connects to a smart contract on the Ethereum blockchain using Web3.js.
// It allows users to mint NFTs, view their owned NFTs, and interact with a marketplace for buying and selling NFTs.

// Initialize Web3
let web3;
let contract;
let account;
let mintFee;

// Replace with your contract's network ID (e.g., Sepolia is 393, Mainnet is 1)
const EXPECTED_NETWORK_ID = "393"; // Adjust based on your contract's deployment network

const contractAddress = "0x41cedE54cbC999Cdec9e93686029df3A5e74A737"; // Replace with your contract address
const contractABI =  [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721IncorrectOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721InsufficientApproval","type":"error"},
  {"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC721InvalidApprover","type":"error"},
  {"inputs":[{"internalType":"address","name":"operator","type":"address"}],"name":"ERC721InvalidOperator","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721InvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC721InvalidReceiver","type":"error"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC721InvalidSender","type":"error"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721NonexistentToken","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"ERC721OutOfBoundsIndex","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
  {"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"BidAccepted","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"bidder","type":"address"}],"name":"BidExpired","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"bidder","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bidAmount","type":"uint256"}],"name":"BidPlaced","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"bidder","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"BidRejected","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsWithdrawn","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"Listed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"NameRegistered","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"Sold","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Unlisted","type":"event"},
  {"inputs":[],"name":"BID_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"LISTING_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"MINT_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"TRADE_FEE_PERCENTAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"acceptBid","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"bid","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"bids","outputs":[{"internalType":"address","name":"bidder","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"buy","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"expireBids","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"list","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"listings","outputs":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"lookupName","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"lookupWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"rejectBid","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"unlist","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"withdrawFunds","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

async function checkNetwork() {
  const networkId = await web3.eth.net.getId();
  if (networkId != EXPECTED_NETWORK_ID) {
    throw new Error(`Please switch to the correct network (ID: ${EXPECTED_NETWORK_ID}). Current network ID: ${networkId}`);
  }
}

async function initWeb3() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      // Check network
      await checkNetwork();

      // Check if account is stored in localStorage
      const storedAccount = localStorage.getItem('connectedAccount');
      let storedSignature = localStorage.getItem('walletSignature');
      if (storedAccount && storedSignature) {
        account = storedAccount;
        const originalMessage = localStorage.getItem('signatureMessage') || `PNSNFT Ownership Proof for ${storedAccount} at ${Date.now()}`;
        const recoveredAddress = web3.eth.accounts.recover(originalMessage, storedSignature);
        if (recoveredAddress.toLowerCase() === storedAccount.toLowerCase()) {
          console.log("Signature verified, restoring connection.");
        } else {
          await requestNewSignature();
        }
      } else {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        account = accounts[0];
        await requestNewSignature();
      }
      contract = new web3.eth.Contract(contractABI, contractAddress);
      mintFee = await contract.methods.MINT_FEE().call();
      if (!mintFee || mintFee <= 0) {
        throw new Error("Failed to fetch MINT_FEE from contract");
      }
      console.log("MINT_FEE:", web3.utils.fromWei(mintFee, "ether"), "NEX");
      const mintFeeDisplay = document.getElementById("mint-fee-display");
      mintFeeDisplay.textContent = `Mint Fee: ${web3.utils.fromWei(mintFee, "ether")} NEX`;
      updateWalletUI();
      displayOwnedNFT();
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet: " + error.message);
      account = null;
      localStorage.removeItem('connectedAccount');
      localStorage.removeItem('walletSignature');
      localStorage.removeItem('signatureMessage');
      updateWalletUI();
    }
  } else {
    alert("Please install MetaMask!");
  }
}

async function requestNewSignature() {
  const message = `PNSNFT Ownership Proof for ${account} at ${Date.now()}`;
  const signature = await web3.eth.personal.sign(message, account, "");
  localStorage.setItem('connectedAccount', account);
  localStorage.setItem('walletSignature', signature);
  localStorage.setItem('signatureMessage', message);
  console.log("New signature created:", signature);
}

// Update wallet button
async function updateWalletUI() {
  const connectButton = document.getElementById("connect-wallet");
  if (account) {
    try {
      const balance = await contract.methods.balanceOf(account).call();
      if (balance > 0) {
        const pnsName = await contract.methods.lookupName(account).call();
        console.log("Wallet PNS Name:", pnsName);
        connectButton.innerHTML = `<i class="fas fa-wallet"></i> ${pnsName || account.slice(0, 6)}...${account.slice(-4)} (Signed)`;
      } else {
        connectButton.innerHTML = `<i class="fas fa-wallet"></i> ${account.slice(0, 6)}...${account.slice(-4)} (Signed)`;
      }
    } catch (error) {
      console.error("Error fetching wallet name:", error);
      connectButton.innerHTML = `<i class="fas fa-wallet"></i> ${account.slice(0, 6)}...${account.slice(-4)} (Signed)`;
    }
  } else {
    connectButton.innerHTML = `<i class="fas fa-wallet"></i> Connect Wallet`;
  }
}

// Display owned NFT
async function displayOwnedNFT() {
  const ownPnsnft = document.getElementById("own-pnsnft");
  const noNftMessage = document.getElementById("no-nft-message");
  if (!account) {
    noNftMessage.style.display = "block";
    ownPnsnft.innerHTML = `<p id="no-nft-message">Connect wallet to view owned NFT.</p>`;
    return;
  }
  try {
    const balance = await contract.methods.balanceOf(account).call();
    if (balance > 0) {
      const tokenId = await contract.methods.tokenOfOwnerByIndex(account, 0).call();
      const tokenURI = await contract.methods.tokenURI(tokenId).call();
      const response = await fetch(tokenURI);
      const metadata = await response.json();
      const listing = await contract.methods.listings(tokenId).call();
      const pnsName = await contract.methods.lookupName(account).call();
      console.log("PNS Name:", pnsName);
      noNftMessage.style.display = "none";
      ownPnsnft.innerHTML = `
        <img src="${metadata.image}" alt="PNS NFT" style="max-width: 100%; border: 1px solid #000;">
        <p>Name: ${pnsName}</p>
        ${listing.price > 0 ? `<p>Listed for: ${web3.utils.fromWei(listing.price, "ether")} NEX</p><button class="unlist-button" data-tokenid="${tokenId}">Unlist</button>` : `<button class="list-button" data-tokenid="${tokenId}">List for Sale</button>`}
      `;
      if (listing.price > 0) {
        document.querySelector(".unlist-button").addEventListener("click", async (e) => {
          const tokenId = e.target.dataset.tokenid;
          try {
            await contract.methods.unlist(tokenId).send({ from: account });
            alert("NFT unlisted!");
            displayOwnedNFT();
            displayMarketplace();
          } catch (error) {
            console.error("Unlisting failed:", error);
            alert("Unlisting failed: " + error.message);
          }
        });
      } else {
        document.querySelector(".list-button").addEventListener("click", async (e) => {
          const tokenId = e.target.dataset.tokenid;
          const price = prompt("Enter sale price in NEX (e.g., 0.1):");
          if (price) {
            const priceWei = web3.utils.toWei(price, "ether");
            try {
              await contract.methods.list(tokenId, priceWei).send({ from: account });
              alert("NFT listed for sale!");
              displayOwnedNFT();
              displayMarketplace();
            } catch (error) {
              console.error("Listing failed:", error);
              alert("Listing failed: " + error.message);
            }
          }
        });
      }
    } else {
      noNftMessage.style.display = "block";
      ownPnsnft.innerHTML = `<p id="no-nft-message">No PNS NFT owned. Mint one below!</p>`;
    }
  } catch (error) {
    console.error("Error fetching NFT:", error);
    alert("Error fetching NFT: " + error.message);
  }
}

// Mint NFT with improved error handling
document.getElementById("mint-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!account) {
    alert("Please connect wallet first!");
    return;
  }

  const username = document.getElementById("mint-username").value.trim();
  if (!username || username.length < 3) {
    alert("Please enter a valid username (minimum 3 characters).");
    return;
  }

  try {
    // Check network
    await checkNetwork();

    const balance = await contract.methods.balanceOf(account).call();
    if (balance > 0) {
      alert("This wallet already owns an NFT. Only one NFT per wallet is allowed.");
      return;
    }

    if (!mintFee || mintFee <= 0) {
      alert("Error: MINT_FEE not set. Please reconnect wallet.");
      return;
    }

    const balanceWei = await web3.eth.getBalance(account);
    const balanceEth = web3.utils.fromWei(balanceWei, "ether");
    const mintFeeEth = web3.utils.fromWei(mintFee, "ether");
    if (Number(balanceWei) < Number(mintFee)) {
      alert(`Insufficient funds! You need at least ${mintFeeEth} NEX plus gas fees. Current balance: ${balanceEth} NEX.`);
      return;
    }

    // Estimate gas with a fallback
    let gasEstimate;
    try {
      gasEstimate = await contract.methods.mint(username).estimateGas({ from: account, value: mintFee });
      console.log("Estimated gas:", gasEstimate);
    } catch (error) {
      console.error("Gas estimation failed:", error);
      throw new Error("Gas estimation failed. The transaction might revert due to: username already taken, invalid username, or contract restriction.");
    }

    // Increase gas limit by 20% to avoid out-of-gas errors
    const gasLimit = Math.floor(gasEstimate * 1.2);

    console.log(`Minting NFT with username: ${username}, MINT_FEE: ${mintFeeEth} NEX`);
    const tx = await contract.methods.mint(username).send({
      from: account,
      value: mintFee,
      gas: gasLimit
    });
    console.log("Mint transaction successful:", tx);
    alert(`NFT minted successfully! Transaction hash: ${tx.transactionHash}`);
    displayOwnedNFT();
  } catch (error) {
    console.error("Minting failed:", error);
    let errorMessage = "Minting failed: ";
    if (error.message.includes("insufficient funds")) {
      errorMessage += "Insufficient funds for MINT_FEE and gas.";
    } else if (error.message.includes("revert") || error.message.includes("Gas estimation failed")) {
      errorMessage += "Transaction reverted. Possible reasons: username already taken, invalid username, or contract restriction.";
    } else if (error.message.includes("network")) {
      errorMessage += error.message;
    } else {
      errorMessage += error.message;
    }
    alert(errorMessage);
  }
});

// Toggle between NFT/Mint and Marketplace
document.querySelector(".trade-section").addEventListener("click", () => {
  const nftMintSection = document.getElementById("nft-mint-section");
  const marketplace = document.getElementById("marketplace");
  if (marketplace.style.display === "none") {
    nftMintSection.style.display = "none";
    marketplace.style.display = "block";
    displayMarketplace();
  } else {
    marketplace.style.display = "none";
    nftMintSection.style.display = "block";
    displayOwnedNFT();
  }
});

// Display marketplace listings
async function displayMarketplace() {
  const listingsDiv = document.getElementById("marketplace-listings");
  if (!account) {
    listingsDiv.innerHTML = "<p>Connect wallet to view marketplace.</p>";
    return;
  }
  try {
    const totalSupply = await contract.methods.totalSupply().call();
    const listingDuration = await contract.methods.LISTING_DURATION().call();
    const currentBlock = await web3.eth.getBlock("latest");
    const currentTime = currentBlock.timestamp;
    let activeListings = [];
    for (let i = 1; i <= totalSupply; i++) {
      const listing = await contract.methods.listings(i).call();
      if (listing.seller !== "0x0000000000000000000000000000000000000000" && Number(listing.timestamp) + Number(listingDuration) > currentTime) {
        const tokenURI = await contract.methods.tokenURI(i).call();
        const response = await fetch(tokenURI);
        const metadata = await response.json();
        activeListings.push({
          tokenId: i,
          seller: listing.seller,
          price: listing.price,
          name: metadata.name,
          image: metadata.image
        });
      }
    }
    listingsDiv.innerHTML = "";
    if (activeListings.length === 0) {
      listingsDiv.innerHTML = "<p>No NFTs listed for sale.</p>";
      return;
    }
    activeListings.forEach((listing) => {
      const priceNEX = web3.utils.fromWei(listing.price, "ether");
      listingsDiv.innerHTML += `
        <div class="listing">
          <img src="${listing.image}" alt="PNS NFT" style="max-width: 100%; border: 1px solid #000;">
          <p>Name: ${listing.name}</p>
          <p>Price: ${priceNEX} NEX</p>
          <p>Seller: ${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}</p>
          <button class="buy-button" data-tokenid="${listing.tokenId}" data-price="${listing.price}">Buy</button>
        </div>
      `;
    });
    document.querySelectorAll(".buy-button").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const tokenId = e.target.dataset.tokenid;
        const price = e.target.dataset.price;
        try {
          // Check network
          await checkNetwork();

          const balanceWei = await web3.eth.getBalance(account);
          const balanceEth = web3.utils.fromWei(balanceWei, "ether");
          const priceEth = web3.utils.fromWei(price, "ether");
          if (Number(balanceWei) < Number(price)) {
            alert(`Insufficient funds! You need at least ${priceEth} NEX plus gas fees. Current balance: ${balanceEth} NEX.`);
            return;
          }

          // Estimate gas with a fallback
          let gasEstimate;
          try {
            gasEstimate = await contract.methods.buy(tokenId).estimateGas({ from: account, value: price });
            console.log("Estimated gas for buy:", gasEstimate);
          } catch (error) {
            console.error("Gas estimation for buy failed:", error);
            throw new Error("Gas estimation failed. The transaction might revert due to: NFT not listed, insufficient approval, or contract restriction.");
          }

          // Increase gas limit by 20% to avoid out-of-gas errors
          const gasLimit = Math.floor(gasEstimate * 1.2);

          await contract.methods.buy(tokenId).send({ from: account, value: price, gas: gasLimit });
          alert("NFT purchased successfully!");
          displayOwnedNFT();
          displayMarketplace();
        } catch (error) {
          console.error("Buying failed:", error);
          let errorMessage = "Buying failed: ";
          if (error.message.includes("insufficient funds")) {
            errorMessage += "Insufficient funds for the NFT price and gas.";
          } else if (error.message.includes("revert") || error.message.includes("Gas estimation failed")) {
            errorMessage += "Transaction reverted. Possible reasons: NFT not listed, insufficient approval, or contract restriction.";
          } else if (error.message.includes("network")) {
            errorMessage += error.message;
          } else {
            errorMessage += error.message;
          }
          alert(errorMessage);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    listingsDiv.innerHTML = "<p>Error loading marketplace.</p>";
  }
}

// Connect/disconnect wallet
document.getElementById("connect-wallet").addEventListener("click", async () => {
  if (!account) {
    await initWeb3();
  } else {
    if (confirm("Are you sure you want to disconnect your wallet?")) {
      account = null;
      localStorage.removeItem('connectedAccount');
      localStorage.removeItem('walletSignature');
      localStorage.removeItem('signatureMessage');
      updateWalletUI();
      document.getElementById("own-pnsnft").innerHTML = `<p id="no-nft-message">Connect wallet to view owned NFT.</p>`;
      document.getElementById("mint-fee-display").textContent = "Connect wallet to see mint fee.";
    }
  }
});

// Initialize on page load
window.addEventListener("load", () => {
  updateWalletUI();
  if (localStorage.getItem('connectedAccount')) {
    initWeb3().catch(() => {
      localStorage.removeItem('connectedAccount');
      localStorage.removeItem('walletSignature');
      localStorage.removeItem('signatureMessage');
      updateWalletUI();
    });
  }
});