const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const chai = require("chai");
const { BN } = require("@openzeppelin/test-helpers");
const chaiBN = require("chai-bn");
chai.use(chaiBN(BN));
const {
  amount, trxStates
} = require("../helper/arguments");
const { ethers } = require("hardhat");

describe.only("Escrow Smart Contract Test-Cases", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployEscrowFixture() {
    // Contracts are deployed using the first signer/account by default
    const [
      buyer,
      seller,
      arbitor,
      user
    ] = await ethers.getSigners();
    const amountToSend = ethers.utils.parseEther(amount); 
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(
      seller.address,
      arbitor.address,
      { value: amountToSend }
    );

    return {
      buyer,
      seller,
      arbitor,
      user,
      amountToSend,
      escrow
    };
  }

  describe("Contract Deployment", function () {
    it("Should return buyer correctly", async function () {
      const { escrow,buyer } = await loadFixture(deployEscrowFixture);
      expect(await escrow.buyer()).to.equal(buyer.address);
    });

    it("Should return seller correctly", async function () {
      const { escrow,seller } = await loadFixture(deployEscrowFixture);
      expect(await escrow.seller()).to.equal(seller.address);
    });

    it("Should return arbitor correctly", async function () {
      const { escrow,arbitor } = await loadFixture(deployEscrowFixture);
      expect(await escrow.arbiter()).to.equal(arbitor.address);
    });

    it("Should return amount correctly", async function () {
      const { escrow,amountToSend } = await loadFixture(deployEscrowFixture);
      expect(await escrow.amount()).to.equal(amountToSend);
    });

    it("Should return the current state correctly", async function () {
      const { escrow } = await loadFixture(deployEscrowFixture);
      expect(await escrow.state()).to.equal(trxStates.PROPOSAL);
    });
  });
  
  describe("Parties Approval", function () {
    it("Should revert if the approver is not a involved party", async function () {
      const { escrow,user } = await loadFixture(deployEscrowFixture);
      await expect(
        escrow
          .connect(user)
          .approve()
      ).to.be.revertedWith("Unauthorized. Only Buyer or Seller are allowed");
    });

    it("Should approve by buyer", async function () {
      const { escrow,buyer } = await loadFixture(deployEscrowFixture);
      const approved = await escrow.approve()
      expect(approved).to.have.property("hash")
      expect(await escrow.approved(buyer.address)).to.equal(true);
    });

    it("Should approve by seller", async function () {
      const { escrow,seller } = await loadFixture(deployEscrowFixture);
      const approved = await escrow.connect(seller).approve()
      expect(approved).to.have.property("hash")
      expect(await escrow.approved(seller.address)).to.equal(true);
    });

    it("Should change the state if both parties approved", async function () {
      const { escrow,seller } = await loadFixture(deployEscrowFixture);
      await escrow.connect(seller).approve()
      await escrow.approve()
      expect(await escrow.state()).to.equal(trxStates.APPROVED);
    });

    it("Should revert if the approver is already approved", async function () {
      const { escrow } = await loadFixture(deployEscrowFixture);
      await escrow.approve()
      await expect(
        escrow.approve()
      ).to.be.revertedWith("The sender has already approved the transaction.");
    });

    it("Should revert if the transaction state is not proposal", async function () {
      const { escrow } = await loadFixture(deployEscrowFixture);
      await escrow.dispute();
      await expect(
        escrow.approve()
      ).to.be.revertedWith("Transaction Should be in proposal state.");
    });
  });

  describe("Sign and release", function () {
    it("Should revert if the signer is not a involved participant", async function () {
      const { escrow,user } = await loadFixture(deployEscrowFixture);
      await expect(
        escrow.connect(user).signAndReleaseFund()
      ).to.be.revertedWith("Unauthorized. Only Participants are allowed");
    });

    it("Should revert if the transaction state is not approved state", async function () {
      const { escrow } = await loadFixture(deployEscrowFixture);
      await expect(
        escrow.signAndReleaseFund()
      ).to.be.revertedWith("Transaction Should be in approved state.");
    });

    it("Should sign by buyer", async function () {
      const { escrow,seller,buyer } = await loadFixture(deployEscrowFixture);
      await escrow.approve()
      await escrow.connect(seller).approve()
      const signed = await escrow.signAndReleaseFund()
      expect(signed).to.have.property("hash")
      expect(await escrow.signed(buyer.address)).to.equal(true);
    });

    it("Should sign by seller", async function () {
      const { escrow,seller } = await loadFixture(deployEscrowFixture);
      await escrow.approve()
      await escrow.connect(seller).approve()
      const signed = await escrow.connect(seller).signAndReleaseFund()
      expect(signed).to.have.property("hash")
      expect(await escrow.signed(seller.address)).to.equal(true);
    });

    it("Should revert if the signer is already signed", async function () {
      const { escrow,seller } = await loadFixture(deployEscrowFixture);
      await escrow.approve()
      await escrow.connect(seller).approve()
      await escrow.signAndReleaseFund()
      await expect(
        escrow.signAndReleaseFund()
      ).to.be.revertedWith("The signer has already signed the transaction.");
    });

    it("Should revert when arbitor signs without parties signature", async function () {
      const { escrow,seller,arbitor } = await loadFixture(deployEscrowFixture);
      await escrow.approve()
      await escrow.connect(seller).approve()
      await expect(
        escrow.connect(arbitor).signAndReleaseFund()
      ).to.be.revertedWith("The buyer and the seller needs to be signed");
    });

    it("Should successfully sign by arbitor and release funds to seller", async function () {
      const { escrow,seller,arbitor,amountToSend } = await loadFixture(deployEscrowFixture);
      await escrow.approve()
      await escrow.connect(seller).approve()
      await escrow.signAndReleaseFund()
      await escrow.connect(seller).signAndReleaseFund()
      const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
      const signed = await escrow.connect(arbitor).signAndReleaseFund()
      expect(signed).to.have.property("hash")
      expect(await escrow.signed(arbitor.address)).to.equal(true);
      expect(await escrow.state()).to.equal(trxStates.RELEASE);
      const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
      expect(sellerFinalBalance).to.equal(sellerInitialBalance.add(amountToSend))
    });
  });

  describe("Parties Dispute", function () {
    it("Should revert if the caller is not a involved party", async function () {
      const { escrow,user } = await loadFixture(deployEscrowFixture);
      await expect(
        escrow.connect(user).dispute()
      ).to.be.revertedWith("Unauthorized. Only Buyer or Seller are allowed");
    });

    it("Should revert if the transaction state is not proposal state", async function () {
      const { escrow,seller } = await loadFixture(deployEscrowFixture);
      await escrow.approve()
      await escrow.connect(seller).approve()
      await expect(
        escrow.dispute()
      ).to.be.revertedWith("The transaction state should be in proposal.");
    });

    it("Should successfully call dispute by buyer", async function () {
      const { escrow,buyer} = await loadFixture(deployEscrowFixture);
      expect(await escrow.state()).to.equal(trxStates.PROPOSAL);
      const trx = await escrow.dispute()
      expect(trx).to.have.property("hash")
      expect(await escrow.signed(buyer.address)).to.equal(false);
      expect(await escrow.state()).to.equal(trxStates.DISPUTE);
    });

    it("Should successfully call dispute by seller", async function () {
      const { escrow,seller } = await loadFixture(deployEscrowFixture);
      expect(await escrow.state()).to.equal(trxStates.PROPOSAL);
      const trx = await escrow.connect(seller).dispute()
      expect(trx).to.have.property("hash")
      expect(await escrow.signed(seller.address)).to.equal(false);
      expect(await escrow.state()).to.equal(trxStates.DISPUTE);
    });

  });

  describe("Dispute Resolve", function () {
    it("Should revert if the caller is not arbitor", async function () {
      const { escrow } = await loadFixture(deployEscrowFixture);
      await expect(
        escrow.resolve()
      ).to.be.revertedWith("Unauthorized. Only Arbitor are allowed");
    });

    it("Should revert if the transaction state is not dispute", async function () {
      const { escrow,arbitor} = await loadFixture(deployEscrowFixture);
      await expect(
        escrow.connect(arbitor).resolve()
      ).to.be.revertedWith("The transaction state should be in dispute.");
    });

    it("Should successfully resolve dispute send funds to buyer", async function () {
      const { escrow,buyer,arbitor,amountToSend } = await loadFixture(deployEscrowFixture);
      await escrow.dispute();
      expect(await escrow.state()).to.equal(trxStates.DISPUTE);
      const buyerInitialBalance = await ethers.provider.getBalance(buyer.address);
      const resolved = await escrow.connect(arbitor).resolve()
      expect(resolved).to.have.property("hash")
      expect(await escrow.state()).to.equal(trxStates.RESOLVE);
      const buyerFinalBalance = await ethers.provider.getBalance(buyer.address);
      expect(buyerFinalBalance).to.equal(buyerInitialBalance.add(amountToSend))
    });

  });
});
