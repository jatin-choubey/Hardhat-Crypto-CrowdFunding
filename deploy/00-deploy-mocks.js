const { network, deployments } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITAL_ANSWER
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    // const { getNamedAccounts, deloyments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local Network Detected, Deploying Mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITAL_ANSWER]
        })
        log("Mocks Deployed")
        log("---------------------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
