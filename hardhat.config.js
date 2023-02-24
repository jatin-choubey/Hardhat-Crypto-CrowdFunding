require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("@nomicfoundation/hardhat-chai-matchers")
require("dotenv").config()
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6
        },
        localhost: {
            url: "http://localhost:8545",
            //  accounts : Hardhat Runtime Environment already gave the fake accounts
            chainId: 31337
        }
    },
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true,
        currency: "USD", // To get the cost of each fucntion in USD for a Block chain
        outputFile: "gas-report.txt",
        noColors: true, // The text file gets messed up if we enable colours
        coinmarketcap: COINMARKETCAP_API_KEY,
        token:
            "ETH" /*If we want to deploy our contract to Polygon, we use the token MATIC
                        which is the Crypto running on Polygon Network.

                        Similary if we want to deploy our Contract to
                        Binance network, we use the token "BNB" ans so on
                        
                        If we dont use token, it is set to Ethereum Network*/
    },
    namedAccounts: {
        deployer: {
            default: 0
            // 5: 1 // On Goerli, the deployer accounts is going to be the first postiton (5 represents the Goerli Test Network)
        },
        user: {
            deafault: 1
        }
    }
}

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})
