import Plugin from '../src';
import sinon from 'sinon';
import { expect } from 'chai';

describe('plugin', () => {
  const functionName = 'health';
  const logicalId = 'HealthLambdaFunction';
  let variableResolvers;

  before(() => {
    const provider = {
      naming: { getLambdaLogicalId: sinon.stub().returns(logicalId) }
    };
    const serverless = {
      service: { getAllFunctions: sinon.stub().returns([functionName]) },
      getProvider: sinon.stub().returns(provider)
    };

    variableResolvers = new Plugin(serverless).variableResolvers;
  });

  [
    { type: 'arn', expected: { 'Fn::GetAtt': [logicalId, 'Arn'] } },
    { type: 'name', expected: { Ref: logicalId } }
  ].forEach(test => {
    it(`will generate function ${test.type} snippet`, async () => {
      const resolver = `fn.${test.type}`;
      const value = `${resolver}:${functionName}`;
      const result = await variableResolvers[resolver](value);

      expect(result).to.deep.equal(test.expected);
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
