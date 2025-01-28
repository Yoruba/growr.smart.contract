const { init, deploy } = require("./init.js");

async function runDeployment() {
  console.log("runDeployment");
  const { contractFactory, wallet } = await init();
  await deploy(contractFactory, wallet);
}
module.exports = { runDeployment };
