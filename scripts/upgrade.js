const { upgrades } = require("hardhat");
const { init } = require("./init.js");
const fs = require("fs");

// see .openzeppelin/<network>.json for the proxy address
async function upgrade(proxyAddress, contractFactory) {
  console.log("upgrade");
  try {
    // upgrade the contract with the owner wallet address
    const contract = await upgrades.upgradeProxy(proxyAddress, contractFactory);

    // Wait for the deployment transaction to be mined
    await contract.waitForDeployment();
    return contract;
  } catch (err) {
    console.log("upgrade failed:", err.message);
  }

  console.log("proxy address   :", proxyAddress);
  console.log("contract address:", contract.target);
}

// get proxy address from the network json file
async function getProxyAddress(network) {
  try {
    const jsonFile = `.openzeppelin/${network}.json`;
    console.log(`reading proxy address from ${jsonFile}`);
    const metadata = JSON.parse(fs.readFileSync(jsonFile).toString());
    return metadata.proxies[0].address;
  } catch (err) {
    console.log("getProxyAddress failed:", err.message);
  }
}

// run the init function first and then upgrade
async function runUpgrade() {
  const { contractFactory } = await init();
  try {
    const proxyAddress = await getProxyAddress("unknown-366");
    return await upgrade(proxyAddress, contractFactory);
  } catch (err) {
    console.log("Error:", err.message);
  }
}

runUpgrade();

// export the upgrade function for testing
module.exports = { runUpgrade };
