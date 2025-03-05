"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_year_1 = require("../scripts/year/deploy.year");
describe('Deployments', function () {
    it('proxy deployments', async function () {
        await (0, deploy_year_1.runDeploymentYearOnly)();
    });
});
