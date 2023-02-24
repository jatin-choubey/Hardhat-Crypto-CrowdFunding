// function deployfunc(hre) {
//     hre.getNamedAccounts()
//     hre.deployments()
//     console.log("Hi!")
// }
// module.exports.default = deployfunc

// module.exports = async ({ getNamedAccounts, deployments }) => {
//     console.log("HI!")
// }
// const { developmentChains } = require("../helper-hardhat-config")

// const helperConfig = require("../helper-hardhat-config")
// const networkConfig = helperConfig.networkConfig
const { networkConfig, developmentChains } = require("../helper-hardhat-config") // This line is same as above two lines (Means we are extracting networkConfig from hekper-hardhat-config.js)
const { verify } = require("../utils/verify")
const { network } = require("hardhat")

module.exports = async hre => {
    const { getNamedAccounts, deployments } = hre

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress = networkConfig[chainID]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeedAddress]
    const FundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true, // This will automatically spit out the neccessary log messages without us typing the Console.log
        waitConfirmations: network.config.blockConfirmations || 1
    })
    // if Not on the Local Network, then we need to verify the contract
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(FundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
