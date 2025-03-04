// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PNSNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    uint256 public constant MINT_FEE = 1 ether;
    uint256 public constant TRADE_FEE_PERCENTAGE = 10;
    uint256 public constant LISTING_DURATION = 1 days;
    uint256 public constant BID_DURATION = 1 days;

    struct Listing {
        address seller;
        uint256 price;
        uint256 timestamp;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => string) private _walletToName;
    mapping(string => address) private _nameToWallet;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Bid) public bids;
    mapping(uint256 => string) private _tokenNames;

    event NameRegistered(address indexed owner, string name, uint256 tokenId);
    event Listed(address indexed seller, uint256 tokenId, uint256 price);
    event Unlisted(address indexed seller, uint256 tokenId);
    event Sold(address indexed buyer, uint256 tokenId, uint256 price);
    event BidPlaced(address indexed bidder, uint256 tokenId, uint256 bidAmount);
    event BidAccepted(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
    event BidRejected(address indexed seller, address indexed bidder, uint256 tokenId);
    event BidExpired(uint256 indexed tokenId, address indexed bidder);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor() ERC721("ProofOfNameServiceNFT", "PNSNFT") Ownable(msg.sender) {}

    modifier onlyPNSNFTOwner() {
        require(balanceOf(msg.sender) == 0, "You already own a PN-SNFT");
        _;
    }

    function mint(string memory name) external payable onlyPNSNFTOwner {
        require(msg.value == MINT_FEE, "Incorrect minting fee");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(_nameToWallet[name] == address(0), "Name already taken");

        uint256 tokenId = totalSupply() + 1;
        _safeMint(msg.sender, tokenId);
        _walletToName[msg.sender] = name;
        _nameToWallet[name] = msg.sender;
        _tokenNames[tokenId] = name;

        emit NameRegistered(msg.sender, name, tokenId);
    }

    function lookupName(address user) external view returns (string memory) {
        return _walletToName[user];
    }

    function lookupWallet(string memory name) external view returns (address) {
        return _nameToWallet[name];
    }

    function list(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(price > 0, "Price must be greater than 0");

        listings[tokenId] = Listing(msg.sender, price, block.timestamp);

        emit Listed(msg.sender, tokenId, price);
    }

    function unlist(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not listing owner");
        require(block.timestamp >= listings[tokenId].timestamp + LISTING_DURATION, "Listing period not expired");

        delete listings[tokenId];

        emit Unlisted(msg.sender, tokenId);
    }

    function buy(uint256 tokenId) external payable onlyPNSNFTOwner nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.seller != address(0), "Token not listed");
        require(block.timestamp < listing.timestamp + LISTING_DURATION, "Listing expired");
        require(msg.value == listing.price, "Incorrect price");

        uint256 tradeFee = (msg.value * TRADE_FEE_PERCENTAGE) / 10000;
        uint256 sellerAmount = msg.value - tradeFee;

        _transfer(listing.seller, msg.sender, tokenId);
        payable(listing.seller).transfer(sellerAmount);
        payable(owner()).transfer(tradeFee);

        _walletToName[msg.sender] = _tokenNames[tokenId];
        _walletToName[listing.seller] = "";

        delete listings[tokenId];

        emit Sold(msg.sender, tokenId, msg.value);
    }

    function bid(uint256 tokenId) external payable onlyPNSNFTOwner {
        require(ownerOf(tokenId) != msg.sender, "Cannot bid on your own token");
        require(msg.value > 0, "Bid amount must be greater than zero");
        require(bids[tokenId].bidder == address(0), "A bid already exists");

        bids[tokenId] = Bid(msg.sender, msg.value, block.timestamp);

        emit BidPlaced(msg.sender, tokenId, msg.value);
    }

    function acceptBid(uint256 tokenId) external nonReentrant {
        Bid memory currentBid = bids[tokenId];
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(currentBid.bidder != address(0), "No active bid");

        uint256 tradeFee = (currentBid.amount * TRADE_FEE_PERCENTAGE) / 10000;
        uint256 sellerAmount = currentBid.amount - tradeFee;

        _transfer(msg.sender, currentBid.bidder, tokenId);
        payable(msg.sender).transfer(sellerAmount);
        payable(owner()).transfer(tradeFee);

        _walletToName[currentBid.bidder] = _tokenNames[tokenId];
        _walletToName[msg.sender] = "";

        delete bids[tokenId];

        emit BidAccepted(msg.sender, currentBid.bidder, tokenId, currentBid.amount);
    }

    function rejectBid(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(bids[tokenId].bidder != address(0), "No active bid");

        address bidder = bids[tokenId].bidder;
        uint256 amount = bids[tokenId].amount;

        delete bids[tokenId];
        payable(bidder).transfer(amount);

        emit BidRejected(msg.sender, bidder, tokenId);
    }

    function expireBids(uint256 tokenId) external nonReentrant {
        Bid memory currentBid = bids[tokenId];
        require(currentBid.bidder != address(0), "No active bid");
        require(block.timestamp >= currentBid.timestamp + BID_DURATION, "Bid still valid");

        address bidder = currentBid.bidder;
        uint256 amount = currentBid.amount;

        delete bids[tokenId];
        payable(bidder).transfer(amount);

        emit BidExpired(tokenId, bidder);
    }

    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");

        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        string memory name = _tokenNames[tokenId];
        return generateMetadata(name);
    }

    function generateMetadata(string memory name) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    abi.encodePacked(
                        '{"name":"', name, '","description":"PN-SNFT Lookup Name","image":"data:image/svg+xml;base64,',
                        generateSVG(name),
                        '"}'
                    )
                )
            )
        );
    }

    function generateSVG(string memory name) internal pure returns (string memory) {
        return Base64.encode(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">',
                '<rect width="300" height="300" fill="grey"/>',
                '<g stroke="black" stroke-width="5">',
                '<rect x="50" y="50" width="50" height="50" fill="black"/>',
                '<rect x="200" y="50" width="50" height="50" fill="black"/>',
                '<rect x="50" y="200" width="50" height="50" fill="black"/>',
                '<rect x="200" y="200" width="50" height="50" fill="black"/>',
                '</g>',
                '<text x="50%" y="90%" font-size="24" text-anchor="middle" fill="white">',
                name,
                '</text></svg>'
            )
        );
    }
}