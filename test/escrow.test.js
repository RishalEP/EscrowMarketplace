const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const chai = require("chai");
const { BN } = require("@openzeppelin/test-helpers");
const chaiBN = require("chai-bn");
chai.use(chaiBN(BN));
const {
  amount
} = require("../helper/arguments");
const { ethers } = require("hardhat");

const nativePriceFeed = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
const busdPriceFeed = "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0";
const tempPercentage = [1000, 2000, 5000, 1000];

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
  });
  

});
