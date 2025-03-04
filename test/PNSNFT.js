const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PNSNFT", function () {
  let PNSNFT, pnSNFT, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    PNSNFT = await ethers.getContractFactory("PNSNFT");
    pnSNFT = await PNSNFT.deploy();
    await pnSNFT.waitForDeployment();
  });

  it("Should mint a new token", async function () {
    await pnSNFT.connect(addr1).mint("testname", { value: ethers.parseEther("1") });
    expect(await pnSNFT.ownerOf(1)).to.equal(addr1.address);
    expect(await pnSNFT.lookupName(addr1.address)).to.equal("testname");
  });

  it("Should allow listing and buying", async function () {
    await pnSNFT.connect(addr1).mint("testname", { value: ethers.parseEther("1") });
    await pnSNFT.connect(addr1).list(1, ethers.parseEther("2"));
    await pnSNFT.connect(addr2).buy(1, { value: ethers.parseEther("2") });
    expect(await pnSNFT.ownerOf(1)).to.equal(addr2.address);
  });
});