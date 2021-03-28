import cildProcess from 'child_process';
import { expect } from 'chai';
import { open } from 'fs/promises';
import { promisify } from 'util';
import { resolve } from 'path';

const exec = promisify(cildProcess.exec);
const assetPath = resolve(__dirname, 'assets');
const options = { cwd: assetPath, stdio: 'inherit' };
const logicalId = 'TestLambdaFunction';

describe('serverless cloud formation template', () => {
  let lambdaFunctionExecutor;

  before(async () => {
    await exec('npx serverless package', options);

    const templateFileName = 'cloudformation-template-update-stack.json';
    const templatePath = resolve(assetPath, '.serverless', templateFileName);
    const templateFile = await open(templatePath);
    const templateFileData = await templateFile.readFile();
    const template = JSON.parse(templateFileData);

    expect(template).to.be.not.null;

    const resources = template.Resources;

    expect(resources).to.be.not.null;

    lambdaFunctionExecutor = resources.LambdaFunctionExecutor;

    expect(lambdaFunctionExecutor).to.be.not.null;
  });

  it('has correct depends on', () => {
    const dependsOn = lambdaFunctionExecutor.DependsOn;

    expect(dependsOn).to.deep.equal([logicalId]);
  });

  it('has correct service token property', () => {
    const properties = lambdaFunctionExecutor.Properties;

    expect(properties).to.be.not.null;

    const serviceToken = properties.ServiceToken;

    expect(serviceToken).to.be.not.null;

    const fnGetAtt = serviceToken['Fn::GetAtt'];

    expect(fnGetAtt).to.deep.equal([logicalId, 'Arn']);
  });

  it('has correct name property', () => {
    const properties = lambdaFunctionExecutor.Properties;

    expect(properties).to.be.not.null;

    const name = properties.Name;

    expect(name).to.be.not.null;

    const ref = name.Ref;

    expect(ref).to.equal(logicalId);
  });
});
