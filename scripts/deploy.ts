import { deploy } from './init';
import { init } from './init';

async function runDeployment(): Promise<void> {
 console.log('runDeployment');
 const { contractFactory, wallet } = await init();
 await deploy(contractFactory, wallet);
}

runDeployment();

export { runDeployment };
