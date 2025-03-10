# Theta

# deployment
First deploy the year contract as a template
Use the implementation address to deploy the year contract with the year factory
Update script for the year factory is only needed for testing the Year template

# Errors
could not coalesce error | delete 366.json file and start again

contrtact adress is 0xe242F556a36615684423E76F74D75Ce3364dc951

https://docs.thetatoken.org/docs/turing-complete-smart-contract-support

# Setup project

npx hardhat init
npm install --save-dev typescript
npm install --save-dev ts-node
npm install --save-dev ethers

# openzeppelin
https://wizard.openzeppelin.com/#custom

# Explorer Testnet
https://testnet-explorer.thetatoken.org/account/0x50c97c6e98525d0C9Dc206B0e9Da8777bbe2Ce53

# Theta Local Net

https://docs.thetatoken.org/docs/setup-local-theta-ethereum-rpc-adaptor

wget https://theta-downloader.s3.amazonaws.com/ethrpc/theta_local_privatenet_linux.tar.gz
tar -xvzf theta_local_privatenet_linux.tar.gz
rm ../privatenet/validator/key/encrypted/.\_2E833968E5bB786Ae419c4d13189fB081Cc43bab
cd theta_local_privatenet_linux/bin

./theta start --config=../privatenet/validator --password=qwertyuiop

# unit testing on Theta local net
https://docs.thetatoken.org/docs/demo-3-testing-the-openzeppelin-suite-against-theta-local-privatenet

# verify contract on Theta mainnet
https://docs.thetatoken.org/docs/explorer-tools-for-dapp-development
Test net validation is not ok. Use wallet for it. Set wallet on Test net



# Deploy to the Theta Mainnet

First, edit the `hardhat.config.js` file, replace `"11...1"` with the actual private key of the deployer wallet (should delete the key after use, do NOT commit the private key to GitHub):

```javascript
    ...
    theta_mainnet: {
      url: `https://eth-rpc-api.thetatoken.org/rpc`,
      accounts: ["1111111111111111111111111111111111111111111111111111111111111111"],
      chainId: 361,
      gasPrice: 4000000000000
    },
    ...
```

Next, go to the repository's root folder and run this to deploy your contract:

```sh
npx hardhat run scripts/deploy.js --network theta_mainnet
```
