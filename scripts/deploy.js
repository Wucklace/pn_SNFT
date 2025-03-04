async function main() {
    const PNSNFT = await ethers.getContractFactory("PNSNFT");
    const pnSNFT = await PNSNFT.deploy();
    await pnSNFT.waitForDeployment();
    console.log("PNSNFT deployed to:", pnSNFT.target);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });