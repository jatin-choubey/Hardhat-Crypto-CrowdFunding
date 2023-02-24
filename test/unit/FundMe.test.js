const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function() {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function() {
              // Deploy our FundMe Contract
              // Using Hardhat Deploy
              // const accounts = await ethers.getSigners()
              /*
            getSigners will return whatever is in the accounts section of the network in our hardhat.config.js file 
            If we are on Goerli network we get signed with the PRIVATE_KEY from the Goerli network.
         */

              // If we are on the default network hardhat, it will give us the 10 fake accounts to work with.
              // const accountZero = accounts[0]

              deployer = (await getNamedAccounts()).deployer

              await deployments.fixture(["all"]) // Will deploy all the Files (Containing "all")

              fundMe = await ethers.getContract("FundMe", deployer)

              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function() {
              it("Sets the aggregator address correctly", async function() {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function() {
              it("Fails if enough ETH is not Sent", async function() {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!" // We are writing exactly this line because we have written this same Revert error message in our fund function from FundMe.sol
                  )
              })

              it("Updates the amount funded data structure", async function() {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAdressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Adds getFunders to the array of the Fudners", async function() {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunders(0)
                  assert.equal(funder, deployer)
              })
          })
          describe("withdraw", async function() {
              beforeEach(async function() {
                  await fundMe.fund({ value: sendValue })
              })
              it("Withdraw ETH from the Single Founder", async function() {
                  // ********************  ARRANGE  *************************
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  //we could have also done ethers.provider.getBalance
                  const startingDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  // ********************  ACT  ********************
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  // const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasUsed = transactionReceipt.gasUsed
                  const effectiveGasPrice = transactionReceipt.effectiveGasPrice
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // ************************  ASSERT  ************************
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Cheaper Withdraw ETH from the Single Founder", async function() {
                  // ********************  ARRANGE  *************************
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  //we could have also done ethers.provider.getBalance
                  const startingDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  // ********************  ACT  ********************
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  // const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasUsed = transactionReceipt.gasUsed
                  const effectiveGasPrice = transactionReceipt.effectiveGasPrice
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // ************************  ASSERT  ************************
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw with multiple getFunders", async function() {
                  // ********************  ARRANGE  *************************
                  const accounts = await ethers.getSigners()
                  for (let i = 0; i < 6; i++) {
                      const fundMeconnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeconnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // ********************  ACT  *************************
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  // ********************  ASSERT  *************************
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getFunders(0)).to.be.reverted

                  for (i = 0; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAdressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Only allows the Owner to Withdraw", async function() {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })

              it("Cheaper withdraw with multiple getFunders", async function() {
                  // ********************  ARRANGE  *************************
                  const accounts = await ethers.getSigners()
                  for (let i = 0; i < 6; i++) {
                      const fundMeconnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeconnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // ********************  ACT  *************************
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  // ********************  ASSERT  *************************
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getFunders(0)).to.be.reverted

                  for (i = 0; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAdressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
