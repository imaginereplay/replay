const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:18888')
const web3 = new Web3(provider)
const BN = web3.utils.BN
const dec18 = new BN('1000000000000000000')
const ReplayToken = artifacts.require("ReplayToken");

contract("Replay Token", (accounts) => {
  const owner = accounts[0];
  const minterAddress = accounts[1];
  const walletOne = accounts[2];
  const walletTwo = accounts[3];
  const walletThree = accounts[5];
  const pendingAdmin = accounts[4];
  const validator = accounts[6];
  const staker = accounts[7];

  let tokenName = "Replay Token";
  let tokenSymbol = "RPLAY";
  let tokenDecimal = 18;
  let maxSupply = dec18.mul(new BN(1000000000));
  let minter = minterAddress;
  let stakerRewardPerBlock = dec18.mul(new BN(2));;
  let initDistrWallet = owner;
  let initMintAmount = dec18.mul(new BN(700000000));
  let admin = owner;
  let replayToken;

  describe("deployed values should match expected values", () => {

    it("should have correct name, symbol and decimals", async () => {
      tokenInstance = await ReplayToken.new(
          tokenName,
          tokenSymbol,
          tokenDecimal,
          maxSupply,
          minter,
          stakerRewardPerBlock,
          initDistrWallet,
          initMintAmount,
          admin
      );

      const name = await tokenInstance.name();
      assert.equal(name, "Replay Token", "Incorrect token name");

      const symbol = await tokenInstance.symbol();
      assert.equal(symbol, "RPLAY", "Incorrect token symbol");

      const decimals = await tokenInstance.decimals();
      assert.equal(decimals, 18, "Incorrect decimals");

    });

    it("should not have invalid decimals and max supply", async () => {
      try {
        await ReplayToken.new(
            tokenName,
            tokenSymbol,
            0,
            maxSupply,
            minter,
            stakerRewardPerBlock,
            initDistrWallet,
            initMintAmount,
            admin
        );
        assert.fail("Invalid decimal value");
      } catch (error) {
        assert.include(
            error.message,
            "invalid decimals",
            "Invalid decimal value"
        );
      }

      try {
        await ReplayToken.new(
            tokenName,
            tokenSymbol,
            tokenDecimal,
            0,
            minter,
            stakerRewardPerBlock,
            initDistrWallet,
            initMintAmount,
            admin
        );
        assert.fail("Invalid maxSupply value");
      } catch (error) {
        assert.include(
            error.message,
            "invalid maxSupply",
            "Invalid maxSupply value"
        );
      }
    });

    it("should not have max supply too large", async () => {
      const tooMuchSupply = dec18.mul(new BN(1000000001));
      try {
        await ReplayToken.new(
            tokenName,
            tokenSymbol,
            tokenDecimal,
            tooMuchSupply,
            minter,
            stakerRewardPerBlock,
            initDistrWallet,
            initMintAmount,
            admin
        );
        assert.fail("MaxSupply too large. Cannot be more than billion");
      } catch (error) {
        assert.include(
            error.message,
            "maxSupply too large",
            "MaxSupply too large. Cannot be more than billion"
        );
      }
    });

    it("should have initial supply less than max supply", async () => {
      const initialSupply = dec18.mul(new BN(1000000000));
      try {
        await ReplayToken.new(
            tokenName,
            tokenSymbol,
            tokenDecimal,
            maxSupply,
            minter,
            stakerRewardPerBlock,
            initDistrWallet,
            initialSupply,
            admin
        );
        assert.fail("Initial Supply too large. Should be less than max supply");
      } catch (error) {
        assert.include(
            error.message,
            "Initial supply too large",
            "Initial Supply too large. Should be less than max supply"
        );
      }
    });
    it("should not have invalid admin, minter, initDistrWallet_ address", async () => {
      try {
        await ReplayToken.new(
            tokenName,
            tokenSymbol,
            tokenDecimal,
            maxSupply,
            minter,
            stakerRewardPerBlock,
            initDistrWallet,
            initMintAmount,
            "0x00000000000000000"
        );
        assert.fail("Invalid admin address");
      } catch (error) {
        assert.include(
            error.message,
            "invalid address",
            "Invalid admin address"
        );
      }

      try {
        await ReplayToken.new(
            tokenName,
            tokenSymbol,
            tokenDecimal,
            maxSupply,
            "0x00000000000000000",
            stakerRewardPerBlock,
            initDistrWallet,
            initMintAmount,
            admin
        );
        assert.fail("Invalid minter address");
      } catch (error) {
        assert.include(
            error.message,
            "invalid address",
            "Invalid minter address"
        );
      }

      try {
        await ReplayToken.new(
            tokenName,
            tokenSymbol,
            tokenDecimal,
            maxSupply,
            minter,
            stakerRewardPerBlock,
            "0x0000000000000000000",
            initMintAmount,
            admin
        );
        assert.fail("Invalid initial distribution address");
      } catch (error) {

        assert.include(
            error.message,
            "invalid address",
            "Invalid initial distribution wallet address"
        );
      }
   });


  });

  describe("should perform all privileged tasks for admin, minter and pending admin", () => {
    before(async () => {
      tokenInstance = await ReplayToken.new(
          tokenName,
          tokenSymbol,
          tokenDecimal,
          maxSupply,
          minter,
          stakerRewardPerBlock,
          initDistrWallet,
          initMintAmount,
          admin
      );
    });
    it("should mint new tokens and increase total supply", async () => {
      const totalSupplyBefore = await tokenInstance.totalSupply();
      const amountToMint = dec18.mul(new BN(100000000));
      await tokenInstance.mint(amountToMint, { from: admin });
      const totalSupplyAfter = await tokenInstance.totalSupply();
      assert.equal(
          totalSupplyAfter.sub(totalSupplyBefore).toString(),
          amountToMint.toString(),
          "Incorrect total supply after minting"
      );
    });

    it("should not allow minting more than the max supply", async () => {
      const currentSupply = await tokenInstance.totalSupply();
      const amountToMint = dec18.mul(new BN(800000000));
      try {
        await tokenInstance.mint(amountToMint, { from: admin });
        assert.fail("Minting should fail when exceeding max supply");
      } catch (error) {
        assert.include(
            error.message,
            "exceeded max supply of tokens",
            "Unexpected error message for exceeding max supply"
        );
      }
    });

    it("should update the staker reward per block", async () => {
      const newStakerRewardPerBlock = dec18.mul(new BN(2000));;
      await tokenInstance.updateStakerRewardPerBlock(newStakerRewardPerBlock, {
        from: admin,
      });
      const updatedRewardPerBlock = await tokenInstance.stakerRewardPerBlock();
      assert.equal(
          updatedRewardPerBlock.toString(),
          newStakerRewardPerBlock.toString(),
          "Failed to update the staker reward per block"
      );
    });

    it("should update the minter address", async () => {
      await tokenInstance.updateMinter(walletOne, { from: admin });
      const updatedMinter = await tokenInstance.minter();
      assert.equal(
          updatedMinter,
          walletOne,
          "Failed to update the minter address"
      );
    });

    it("should allow pending admin to update the admin address", async () => {
      await tokenInstance.setPendingAdmin(pendingAdmin, { from: admin });
      await tokenInstance.updateAdmin({ from: pendingAdmin });
      const updatedAdmin = await tokenInstance.admin();
      assert.equal(
          updatedAdmin,
          pendingAdmin,
          "Failed to update the admin address"
      );
      // reset the admin for next test cases
      await tokenInstance.setPendingAdmin(admin, { from: pendingAdmin });
      await tokenInstance.updateAdmin({ from: admin });
    });

    it("should allow the admin to mint additional tokens", async () => {
      const amountToMint = dec18.mul(new BN(100000));
      const currentSupply = await tokenInstance.totalSupply();
      await tokenInstance.mint(amountToMint, { from: admin });
      const newSupply = await tokenInstance.totalSupply();
      assert.equal(
          newSupply.sub(currentSupply).toString(),
          amountToMint.toString(),
          "Admin failed to mint tokens"
      );
    });

    it("should not allow non admin address to mint", async () => {
      const amountToMint = dec18.mul(new BN(800));
      const newStakerRewardPerBlock = dec18.mul(new BN(2000));;
      try {
        await tokenInstance.mint(amountToMint, { from: minter });
        assert.fail("Non-admin should not be able to mint tokens");
      } catch (error) {
        assert.include(
            error.message,
            "Only admin can make this call",
            "Unexpected error message for exceeding max supply"
        );
      }
    });

    it("should not allow non-admin to update staker reward per block", async () => {
      const newStakerRewardPerBlock = dec18.mul(new BN(100));
      try {
        await tokenInstance.updateStakerRewardPerBlock(newStakerRewardPerBlock, {
          from: walletTwo,
        });
        assert.fail(
            "Non-admin should not be able to update staker reward per block"
        );
      } catch (error) {
        assert.include(
            error.message,
            "Only admin can make this call",
            "Unexpected error message for updating staker reward"
        );
      }
    });

    it("should not allow non-admin to update the minter address", async () => {
      try {
        await tokenInstance.updateMinter(walletTwo, { from: walletOne });
        assert.fail("Non-admin should not be able to update the minter address");
      } catch (error) {
        assert.include(
            error.message,
            "Only admin can make this call",
            "Unexpected error message for updating minter address"
        );
      }
    });

    it("should not allow non-pending admin to update the admin address", async () => {
      try {
        await tokenInstance.updateAdmin({ from: walletTwo});
        assert.fail("Non-pending admin should not be able to update the admin");
      } catch (error) {
        assert.include(
            error.message,
            "Only pending admin can make this call",
            "Unexpected error message for updating admin"
        );
      }
    });
  });

  describe("Allow transfers functions", () => {
    before(async () => {
      tokenInstance = await ReplayToken.new(
          tokenName,
          tokenSymbol,
          tokenDecimal,
          maxSupply,
          minter,
          stakerRewardPerBlock,
          initDistrWallet,
          initMintAmount,
          admin
      );
    });

    it("should allow transfers between accounts", async () => {
      const amount = dec18.mul(new BN(100));

      await tokenInstance.transfer(walletOne, amount, { from: owner });

      const walletOneBalance = await tokenInstance.balanceOf(walletOne);
      const ownerBalance = await tokenInstance.balanceOf(owner);
      assert.equal(walletOneBalance.toString(), amount.toString(), "Transfer to walletOne failed");
      assert.equal(ownerBalance.toString(), initMintAmount.sub(amount).toString(), "Transfer from owner failed");

      const newTransferAmount = dec18.mul(new BN(50));
      await tokenInstance.transfer(walletTwo, newTransferAmount, { from: walletOne });
      const walletTwoBalance = await tokenInstance.balanceOf(walletTwo);
      const newWalletOneBalance = await tokenInstance.balanceOf(walletOne);

      assert.equal(walletTwoBalance.toString(), newTransferAmount.toString(), "Transfer to walletTwo failed");
      assert.equal(newWalletOneBalance.toString(), walletOneBalance.sub(newTransferAmount).toString(), "Transfer to walletOne failed");
    });

    it("should allow transfers only upto allowance limit", async () => {
      // current balances of walletOne - 50, walletTwo - 50 (from previous test)
      const amount = dec18.mul(new BN(10));
      const walletTwoBalanceBeforeTransfer = await tokenInstance.balanceOf(walletTwo);
      await tokenInstance.approve(walletOne, amount, { from: walletTwo });

      const allowance = await tokenInstance.allowance(walletTwo, walletOne);
      assert.equal(allowance.toString(), amount.toString(), "Approval failed");

      await tokenInstance.transferFrom(walletTwo, walletThree, amount, { from: walletOne });

      //const walletOneBalance = await tokenInstance.balanceOf(walletOne);
      const walletTwoBalance = await tokenInstance.balanceOf(walletTwo);
      const walletThreeBalance = await tokenInstance.balanceOf(walletThree);
      assert.equal(walletTwoBalance.toString(), walletTwoBalanceBeforeTransfer.sub(amount).toString(), "Transfer from walletOne failed");
      assert.equal(walletThreeBalance.toString(), amount.toString(), "Transfer to walletTwo failed");
    });

    it("should not allow transfers beyond allowance limit", async () => {
      // current balances of walletOne - 50, walletTwo - 40, walletThree - 10 (from previous test)
      const amount = dec18.mul(new BN(10));

      await tokenInstance.approve(walletOne, amount, { from: walletTwo });

      const allowance = await tokenInstance.allowance(walletTwo, walletOne);
      assert.equal(allowance.toString(), amount.toString(), "Approval failed");

      const notAllowedAmount = dec18.mul(new BN(20));
      try {
        await tokenInstance.transferFrom(walletTwo, walletThree, notAllowedAmount, { from: walletOne });
        assert.fail("Transfers beyond allowance limit is not allowed");
      } catch (error) {
        assert.include(
            error.message,
            "insufficient allowance",
            "Unexpected error message for exceeding max supply"
        );
      }
    });

    it("should not allow transfers when the balance is insufficient", async () => {
      const amount = dec18.mul(new BN(100000000000000));
      try {
        await tokenInstance.transfer(walletTwo, amount, { from: walletOne });
        assert.fail("Transfer should fail when the balance is insufficient");
      } catch (error) {
        assert.include(
            error.message,
            "transfer amount exceeds balance",
            "Unexpected error message for insufficient balance"
        );
      }
    });

    it("should not allow unapproved users for transfer", async () => {
      // current balances of walletOne - 50, walletTwo - 40, walletThree - 10 (from previous test)
      const amount = dec18.mul(new BN(10));
      await tokenInstance.approve(walletOne, amount, { from: walletTwo });
      try {
        await tokenInstance.transferFrom(validator, walletThree, amount, { from: walletOne });
        assert.fail("Only approved users can transfer");
      } catch(error) {
        assert.include(
            error.message,
            "insufficient allowance",
            "Only approved users can make this call"
        );
      }
    });

    it("should not allow transfers with negative amount", async () => {
      const amount = dec18.mul(new BN(10));
      const invalidAmount = dec18.mul(new BN(-10));
      await tokenInstance.approve(walletOne, amount, { from: walletTwo });

      const allowance = await tokenInstance.allowance(walletTwo, walletOne);
      assert.equal(allowance.toString(), amount.toString(), "Approval failed");
      try{
        await tokenInstance.transferFrom(walletTwo, walletThree, invalidAmount, { from: walletOne });
      } catch(error) {
        assert.include(
            error.message,
            "value out-of-bounds",
            "value out-of-bounds"
        );
      }
    });
  });

  describe("Allow Staker to mint rewards", () => {
    before(async () => {
      tokenInstance = await ReplayToken.new(
          tokenName,
          tokenSymbol,
          tokenDecimal,
          maxSupply,
          minter,
          stakerRewardPerBlock,
          initDistrWallet,
          initMintAmount,
          admin
      );
    });

    it("should only allow staker to mint rewards", async() => {
      const amount = dec18.mul(new BN(10));
      try {
        await tokenInstance.mintStakerReward(staker, amount, { from: validator })
        assert.fail("Only minter can mint rewards for staker");
      } catch(error) {
        assert.include(
            error.message,
            "Only minter can make this call",
            "Only minter can make this call"
        );
      }
    });

    it("should mint rewards to only valid addresses", async() => {
      const amount = dec18.mul(new BN(10));
      try {
        await tokenInstance.mintStakerReward("0x00000000000000000", amount, { from: minter })
      } catch(error) {
        assert.include(
            error.message,
            "invalid address",
            "invalid address"
        );
      }
      try {
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        await tokenInstance.mintStakerReward(zeroAddress, amount, { from: minter })
      } catch(error) {
        assert.include(
            error.message,
            "invalid address",
            "invalid address"
        );
      }

    });

    it("should allow staker to mint rewards", async () => {
      const amount = dec18.mul(new BN(10));
      const totalSupplyBefore = await tokenInstance.totalSupply();
      const response = await tokenInstance.mintStakerReward(staker, amount, { from: minter })
      const stakerBalanceAfter = await tokenInstance.balanceOf(staker);
      const totalSupplyAfter = await tokenInstance.totalSupply();
      // Check the emitted Transfer event
      assert.equal(response.logs.length, 1, "Event not emitted");
      assert.equal(response.logs[0].event, "Transfer", "Transfer event not emitted");
      assert.equal(response.logs[0].args.from, "0x0000000000000000000000000000000000000000", "Transfer from incorrect address");
      assert.equal(response.logs[0].args.to, staker, "Transfer to incorrect address");
      assert.equal(response.logs[0].args.value.toString(), amount.toString(), "Incorrect transfer amount");
      assert.equal(stakerBalanceAfter.toString(), amount.toString(), "Mint Staker Rewards to Staker failed");
      assert.equal(totalSupplyBefore.toString(), totalSupplyAfter.sub(amount).toString(), "Mint Staker Rewards to Staker failed");
    });

    it("should mint remaining tokens if maxSupply is reached", async() => {
      const stakerBalanceBefore = await tokenInstance.balanceOf(staker);
      const amount = dec18.mul(new BN(1000));
      const totalSupplyBefore = await tokenInstance.totalSupply();
      const adminMintAmount = maxSupply.sub(totalSupplyBefore).sub(dec18.mul(new BN(1)))
      // the remaining allowed tokens of 1 token ^ will be minted even if the amount = 1000 tokens
      await tokenInstance.mint(adminMintAmount, {from: admin})
      const totalSupplyAfter = await tokenInstance.totalSupply();

      assert.equal(totalSupplyBefore, totalSupplyAfter.sub(adminMintAmount).toString(), "admin mint failed");

      await tokenInstance.mintStakerReward(staker, amount, { from: minter })
      const totalSupplyAfterMintingStakerRewards = await tokenInstance.totalSupply();
      const stakerBalanceAfter = await tokenInstance.balanceOf(staker);

      assert.equal(stakerBalanceAfter.toString(), stakerBalanceBefore.add(totalSupplyAfterMintingStakerRewards.sub(totalSupplyAfter)).toString(), "Mint Staker Rewards to Staker failed");
    });

    it("should not mint anymore rewards if maxSupply is reached", async() => {
      const stakerBalanceBefore = await tokenInstance.balanceOf(staker);
      const amount = dec18.mul(new BN(10));
      const totalSupplyBefore = await tokenInstance.totalSupply();

      await tokenInstance.mintStakerReward(staker, amount, { from: minter })
      const totalSupplyAfter = await tokenInstance.totalSupply();
      const stakerBalanceAfter = await tokenInstance.balanceOf(staker);

      // no tokens should have been minted and no errors
      assert.equal(stakerBalanceAfter.toString(), stakerBalanceBefore.toString(), "Mint Staker Rewards to Staker failed");
      assert.equal(totalSupplyBefore.toString(), totalSupplyAfter.toString(), "Mint Staker Rewards to Staker failed");
    });

  });

  describe("concurrent transactions test", () => {
    before(async () => {
      tokenInstance = await ReplayToken.new(
          tokenName,
          tokenSymbol,
          tokenDecimal,
          maxSupply,
          minter,
          stakerRewardPerBlock,
          initDistrWallet,
          initMintAmount,
          admin
      );
    });

    it("should not transfer more than balance if same user initiates too many transfers", async() => {
      const amount = dec18.mul(new BN(10));
      await tokenInstance.transfer(walletOne, amount, { from: owner });
      const walletOneBalance = await tokenInstance.balanceOf(walletOne);
      assert.equal(walletOneBalance.toString(), amount.toString(), "Transfer failed");

      // lets transfer more than user limit concurrently to different accounts
      const txnAmount = dec18.mul(new BN(4));
      const txn1 =  tokenInstance.transfer(walletTwo, txnAmount, { from: walletOne });
      const txn2 =  tokenInstance.transfer(walletThree, txnAmount, { from: walletOne });
      const txn3 =  tokenInstance.transfer(validator, txnAmount, { from: walletOne });
      const txn4 =  tokenInstance.transfer(walletTwo, txnAmount, { from: walletOne });

      try {
        await Promise.all([txn1, txn2, txn3, txn4])
        assert.fail("transfer amount exceeds balance");
      } catch (error) {
        assert.include(
            error.message,
            "transfer amount exceeds balance",
            "transfer amount exceeds balance"
        );
        const walletOneBalanceAfter = await tokenInstance.balanceOf(walletOne);
        assert.equal(walletOneBalanceAfter.toString(), amount.sub((txnAmount.add(txnAmount))).toString(), "Transfer failed");
      }
    });

    it("should not mint rewards more than allowed if staker is unstaking/staking at same time", async() => {
      // first lets mint most of the tokens
      const stakerBalanceBefore = await tokenInstance.balanceOf(staker);

      const amount = dec18.mul(new BN(5));
      const totalSupplyBefore = await tokenInstance.totalSupply();
      const adminMintAmount = maxSupply.sub(totalSupplyBefore).sub(dec18.mul(new BN(20))) // only 20 tokens left to be minted
      // the remaining allowed tokens of 1 token ^ will be minted even if the amount = 1000 tokens
      await tokenInstance.mint(adminMintAmount, {from: admin})
      const totalSupplyAfter = await tokenInstance.totalSupply();

      assert.equal(totalSupplyBefore, totalSupplyAfter.sub(adminMintAmount).toString(), "admin mint failed");
      // total of 25 tokens - only 20 should be minted
      txn1 = tokenInstance.mintStakerReward(staker, amount, { from: minter })
      txn2 = tokenInstance.mintStakerReward(staker, amount, { from: minter })
      txn3 = tokenInstance.mintStakerReward(staker, amount, { from: minter })
      txn4 = tokenInstance.mintStakerReward(staker, amount, { from: minter })
      txn5 = tokenInstance.mintStakerReward(staker, amount, { from: minter })
      txn6 = tokenInstance.mintStakerReward(staker, amount, { from: minter })
      try {
        await Promise.all([txn1, txn2, txn3, txn4, txn5, txn6])
        assert.fail("transfer amount exceeds balance");
      } catch (error) {
        const stakerBalanceAfter = await tokenInstance.balanceOf(staker);
        assert.include(
            error.message,
            "transfer amount exceeds balance",
            "transfer amount exceeds balance"
        );

        assert.equal(stakerBalanceAfter.toString(), maxSupply.sub(totalSupplyAfter).toString(), "Transfer failed");
      }
    });

  });
});