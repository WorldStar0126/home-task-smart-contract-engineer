import { ethers, run, network } from "hardhat";

async function main() {
  console.log("Deploying WorldCupBetting and ReputationSystem...");

  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.waitForDeployment();
  const reputationAddress = await reputationSystem.getAddress();
  console.log("ReputationSystem deployed at:", reputationAddress);

  const WorldCupBetting = await ethers.getContractFactory("WorldCupBetting");
  const worldCupBetting = await WorldCupBetting.deploy(reputationAddress);
  await worldCupBetting.waitForDeployment();
  const marketAddress = await worldCupBetting.getAddress();
  console.log("WorldCupBetting deployed at:", marketAddress);

  await reputationSystem.setPredictionMarket(marketAddress);
  console.log("ReputationSystem linked to WorldCupBetting");

  if (
    process.env.ETHERSCAN_API_KEY &&
    network.name !== "hardhat" &&
    network.name !== "localhost"
  ) {
    console.log("Verifying contracts on Etherscan...");
    try {
      await run("verify:verify", {
        address: reputationAddress,
        constructorArguments: [],
      });
      console.log("ReputationSystem verified");
    } catch (error: any) {
      console.warn("ReputationSystem verification failed:", error.message || error);
    }

    try {
      await run("verify:verify", {
        address: marketAddress,
        constructorArguments: [reputationAddress],
      });
      console.log("WorldCupBetting verified");
    } catch (error: any) {
      console.warn("WorldCupBetting verification failed:", error.message || error);
    }
  }

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("REPUTATION_SYSTEM_ADDRESS=", reputationAddress);
  console.log("WORLD_CUP_BETTING_ADDRESS=", marketAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
