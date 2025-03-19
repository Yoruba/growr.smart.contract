
# smart contract address
0x9b113e9e8c22658b80cef602b61a918c1d1e1f90

# Explorer Testnet
https://testnet-explorer.thetatoken.org/account/0x9b113e9e8c22658b80cef602b61a918c1d1e1f90


# RPC for development  https://eth-rpc-api-testnet.thetatoken.org/rpc


# Smart Contract code

```solidity
pragma solidity ^0.8.28;

contract Simple {
	// This function is triggered when a contract receives plain tfuel (without data). msg.data must be empty
	receive() external payable {}

	// This function is called when no other function matches the call
	// or when msg.data is not empty
	fallback() external payable {}

	function withdraw() public {	
		uint256 amount = address(this).balance;	
		payable(msg.sender).transfer(amount);
	}
}

```


# Response from wallet RPC https://theta-bridge-rpc-testnet.thetatoken.org/rpc

``` json
{
    "jsonrpc": "2.0",
    "id": 20,
    "error": {
        "code": -32000,
        "message": "Sending Theta/TFuel to a smart contract (0x9b113e9e8c22658b80cef602b61a918c1d1e1f90) through a SendTx transaction is not allowed"
    }
}
```



``` bash

#!/bin/bash

sudo apt update
sudo apt install -y jq apt-transport-https ca-certificates curl gnupg

mkdir -p $HOME/.config/

## Download your repository authentication credentials
curl -s "https://controller.thetaedgecloud.com/community/key?projectId=$TEC_PROJECT_ID" \
  -H "x-api-key: $TEC_API_KEY" | jq -r '.body' > $HOME/.config/community_key.json

## Download the keys and repository source to install the apt-transport-artifact-registry package
curl -fsSL https://us-apt.pkg.dev/doc/repo-signing-key.gpg | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/us-apt-registry.gpg
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/gcp-packages.gpg
echo 'deb [signed-by=/etc/apt/trusted.gpg.d/gcp-packages.gpg] http://packages.cloud.google.com/apt apt-transport-artifact-registry-stable main' | sudo tee -a /etc/apt/sources.list.d/artifact-registry.list
sudo apt update
sudo apt install -y apt-transport-artifact-registry

## Configure the apt-transport-artifact-registry to use the keys we downloaded
sudo sed -i 's|#Service-Account-JSON "/path/to/creds.json";|Service-Account-JSON "'"$HOME"'/.config/community_key.json";|' /etc/apt/apt.conf.d/90artifact-registry

## Add the theta-edge-cloud-releases/network repository to your sources list
echo "deb [signed-by=/etc/apt/trusted.gpg.d/us-apt-registry.gpg] ar+https://us-apt.pkg.dev/projects/theta-edge-cloud-releases network main" | sudo tee -a /etc/apt/sources.list.d/artifact-registry.list

sudo apt update

sudo mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg # allow unprivileged APT programs to read this keyring

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo chmod 644 /etc/apt/sources.list.d/kubernetes.list   # helps tools such as command-not-found to work correctly

curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update

sudo apt-get install -y kubelet kubeadm kubectl containerd nvidia-container-toolkit
sudo apt-mark hold kubelet kubeadm kubectl

sudo apt-get install -y edgecloud


if ! command -v nvidia-smi &> /dev/null; then
    echo "NVIDIA drivers are not detected. Installing nvidia-driver-535. This may take some time"
    echo "Installing nvidia-driver-535..."
    sudo apt update
    sudo apt install -y nvidia-driver-535
    echo "NVIDIA driver installation complete."
    sudo edgecloud start
    echo "Please reboot your system for the changes to take effect."
    #This should prompt and reboot for the user.
    read -p "Reboot now? [y/N]: " reboot_now
    if [[ "$reboot_now" == "y" || "$reboot_now" == "Y" ]]; then
        sudo reboot
        exit 0
    fi
  else
    echo "NVIDIA drivers are already installed."
  fi

sudo edgecloud start

```