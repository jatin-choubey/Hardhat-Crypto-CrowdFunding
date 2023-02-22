const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xd4a33860578de61dbabdc8bfdb98fd742fa7028e"
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xf9680d99d6c9589e2a93a78a04a279e509205945"
    }
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITAL_ANSWER = 200000000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITAL_ANSWER
}
