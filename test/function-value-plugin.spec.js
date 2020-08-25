import Plugin from '../src/index';
import sinon from 'sinon';
import { expect } from 'chai';

describe('plugin', () => {
  const functionName = 'health';
  const logicalId = 'HealthLambdaFunction';
  let variableResolvers;

  before(() => {
    const service = { getAllFunctions: sinon.stub().returns([functionName]) };
    const provider = {
      naming: { getLambdaLogicalId: sinon.stub().returns(logicalId) }
    };
    const serverless = {
      service,
      getProvider: sinon.stub().returns(provider)
    };

    variableResolvers = new Plugin(serverless).variableResolvers;
  });

  [
    { type: 'arn', expected: `!GetAtt ${logicalId}.ARN` },
    { type: 'name', expected: `!Ref ${logicalId}` }
  ].forEach(test => {
    it(`will generate function ${test.type} snippet`, async () => {
      const resolver = `fn.${test.type}`;
      const value = `${resolver}:${functionName}`;
      const result = await variableResolvers[resolver](value);

      expect(result).to.equal(test.expected);
    });
  });

  it('will fail if function not found', async () => {
    try {
      await variableResolvers['fn.arn']('fn.arn:test');
      throw new Error('should not get here');
    } catch {
      // success!
    }
  });
});
