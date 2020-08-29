import { assert, spy, stub } from 'sinon';
import { expect } from 'chai';
import Plugin from '../src';

describe('plugin', () => {
  const functionName = 'health';
  const logicalId = 'HealthLambdaFunction';
  let serverless;

  beforeEach(() => {
    const provider = {
      naming: { getLambdaLogicalId: stub().returns(logicalId) }
    };

    serverless = {
      cli: { log: spy() },
      service: { getAllFunctions: stub().returns([functionName]) },
      getProvider: stub().returns(provider)
    };
  });

  [
    { type: 'arn', expected: { 'Fn::GetAtt': [logicalId, 'Arn'] } },
    { type: 'name', expected: { Ref: logicalId } }
  ].forEach(testData => {
    it(`will generate function ${testData.type} snippet`, async () => {
      const resolverKey = `fn.${testData.type}`;
      const value = `${resolverKey}:${functionName}`;
      const variableResolvers = new Plugin(serverless).variableResolvers;
      const result = await variableResolvers[resolverKey].resolver(value);

      expect(result).to.deep.equal(testData.expected);
      assert.notCalled(serverless.cli.log);
    });
  });

  it('will fail if function not found', async () => {
    try {
      const variableResolvers = new Plugin(serverless).variableResolvers;

      await variableResolvers['fn.arn'].resolver('fn.arn:test');
    } catch (err) {
      expect(err.message).to.be.equal('Cannot resolve "test", does not exist');
      assert.notCalled(serverless.cli.log);

      return;
    }

    throw new Error('fail');
  });

  it('will debug log', async () => {
    process.env.SLS_DEBUG = 1;

    const value = `fn.arn:${functionName}`;
    const variableResolvers = new Plugin(serverless).variableResolvers;

    for (let i = 0; i < 2; i++) {
      await variableResolvers['fn.arn'].resolver(value);

      assert.calledOnce(serverless.cli.log);
    }
  });
});
