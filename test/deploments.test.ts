import { runDeploymentYearOnly } from '../scripts/year/deploy.year'

describe('Deployments', function () {
	it('proxy deployments', async function () {
		await runDeploymentYearOnly()
	})
})
