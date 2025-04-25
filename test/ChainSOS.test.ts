import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainSOS } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ChainSOS", function () {
  let chainSOS: ChainSOS;
  let owner: HardhatEthersSigner;
  let responder: HardhatEthersSigner;
  let user: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, responder, user] = await ethers.getSigners();

    const ChainSOS = await ethers.getContractFactory("ChainSOS");
    chainSOS = await ChainSOS.deploy();
  });

  describe("Responder Registration", function () {
    it("Should allow registration with sufficient stake", async function () {
      const stake = ethers.parseEther("0.1");
      await expect(chainSOS.connect(responder).registerAsResponder({ value: stake }))
        .to.emit(chainSOS, "ResponderVerified")
        .withArgs(responder.address);

      const responderDetails = await chainSOS.getResponderDetails(responder.address);
      expect(responderDetails[0]).to.be.true; // isVerified
    });

    it("Should reject registration with insufficient stake", async function () {
      const lowStake = ethers.parseEther("0.05");
      await expect(
        chainSOS.connect(responder).registerAsResponder({ value: lowStake })
      ).to.be.revertedWith("Insufficient stake");
    });
  });

  describe("SOS Alerts", function () {
    it("Should create an SOS alert with minimum fee", async function () {
      const fee = ethers.parseEther("0.01");
      const longitude = 1234567890n; // Multiplied by 1e18
      const latitude = 9876543210n; // Multiplied by 1e18

      await expect(chainSOS.connect(user).sendSOS(longitude, latitude, { value: fee }))
        .to.emit(chainSOS, "AlertCreated")
        .withArgs(0, user.address, longitude, latitude);
    });

    it("Should allow verified responders to respond to alerts", async function () {
      // Register responder
      await chainSOS.connect(responder).registerAsResponder({ 
        value: ethers.parseEther("0.1") 
      });

      // Create alert
      await chainSOS.connect(user).sendSOS(1234567890n, 9876543210n, { 
        value: ethers.parseEther("0.01") 
      });

      await expect(chainSOS.connect(responder).respondToAlert(0))
        .to.emit(chainSOS, "AlertResolved")
        .withArgs(0, responder.address, await ethers.provider.getBlock("latest")
          .then(b => b!.timestamp - (await chainSOS.alerts(0)).timestamp));
    });
  });
}); 