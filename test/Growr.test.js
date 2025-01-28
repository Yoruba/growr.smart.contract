const { expect } = require("chai");
// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { runUpgrade } = require("../scripts/upgrade.js");

describe("Growr", function () {
  let contract;

  beforeEach(async function () {
    console.log("beforeEach");
    try {
      contract = await runUpgrade();
    } catch (err) {
      console.error(err.message);
    }
  });

  // it("should revert if the value is less than ONE_YEAR_COST", async function () {
  //   await expect(contract.validateValue(999)).to.be.revertedWith(
  //     "You need to send at least 1000 wei to track for a year",
  //   );
  // });

  // it("should revert if the value is not a multiple of ONE_YEAR_COST", async function () {
  //   await expect(contract.validateValue(1500)).to.be.revertedWith(
  //     "You need to send a multiple of 1 ether to track for a year",
  //   );
  // });

  it("should not revert if the value is a multiple of ONE_YEAR_COST", async function () {
    // console.log(contract);

    console.log(await contract.validateValue(2000));

    await expectRevert(contract.validateValue(2000), "adri");
  });
});
