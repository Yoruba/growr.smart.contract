import { ethers } from "ethers";
import { expect } from "chai";
import { MyContract } from "../artifacts/contracts/MyContract.sol/MyContract"; // Replace with your contract path

describe("MyContract", function () {
  let MyContract: MyContract;
  let owner: ethers.Signer;
  let otherAccount: ethers.Signer;

  beforeEach(async function () {
    const [ownerSigner, otherAccountSigner] = await ethers.getSigners();
    owner = ownerSigner;
    otherAccount = otherAccountSigner;

    const MyContractFactory = new ethers.ContractFactory(
      MyContract.abi,
      MyContract.bytecode,
      owner
    );

    MyContract = await MyContractFactory.deploy();
    await MyContract.deployed();
  });

  it("should receive Ether and update balance", async function () {
    const initialBalance = await ethers.provider.getBalance(MyContract.address);

    const amountToReceive = ethers.utils.parseEther("1"); // 1 ETH

    await otherAccount.sendTransaction({
      to: MyContract.address,
      value: amountToReceive,
    });

    const newBalance = await ethers.provider.getBalance(MyContract.address);

    expect(newBalance).to.be.equal(
      initialBalance.add(amountToReceive)
    );
  });
});