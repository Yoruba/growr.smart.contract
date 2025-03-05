"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImplementationAddress = exports.ProxyAddress = void 0;
exports.upgrade = upgrade;
exports.runUpgrade = runUpgrade;
exports.setProxyAddress = setProxyAddress;
exports.setImplementationAddress = setImplementationAddress;
const hardhat_1 = require("hardhat");
const init_1 = require("./init");
const deploy_1 = require("./deploy");
// see .openzeppelin/<network>.json for the proxy address
async function upgrade(proxyAddress, contractFactory) {
    try {
        console.log(`03 [UPGRADE] contract with: ${proxyAddress}`);
        // upgrade the contract with the owner wallet address
        const contract = await hardhat_1.upgrades.upgradeProxy(proxyAddress, contractFactory);
        // Wait for the deployment transaction to be mined
        await contract.waitForDeployment();
        // target is the proxy address and also proxy address which is used for the next upgrade
        setProxyAddress(contract.target.toString());
        console.log('04 [PROXY] [TARGET] address:', exports.ProxyAddress);
        // console.log('05 [FACTORY] [PROXY] contract address factory :', proxyAddress)
        if (!contract) {
            throw new Error('-------------- Contract is undefined --------------');
        }
        return contract;
    }
    catch (err) {
        console.error('[FACTORY] upgrade failed:', err.message);
        // if error message contains proxy create new proxy
        if (err.message.includes('proxy')) {
            console.log('[FACTORY] creating new contract...');
            await (0, deploy_1.runDeployment)();
        }
    }
}
// run the init function first and then upgrade
async function runUpgrade() {
    try {
        const { contractFactory } = await (0, init_1.init)();
        const proxyAddress = exports.ProxyAddress;
        const response = await upgrade(proxyAddress, contractFactory);
        console.log(JSON.stringify(response, null, 2));
        return response;
    }
    catch (err) {
        console.error('Error:', err.message);
    }
}
const proxy = 'PROXY_ADDRESS';
exports.ProxyAddress = process.env[proxy] || '';
function setProxyAddress(proxyAddress) {
    process.env[proxy] = proxyAddress;
}
// for implementation address
const implementation = 'IMPLEMENTATION_ADDRESS';
exports.ImplementationAddress = process.env[implementation] || '';
function setImplementationAddress(implementationAddress) {
    process.env[implementation] = implementationAddress;
}
