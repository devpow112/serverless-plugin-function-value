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

  describe('will generate snippet', () => {
    [
      { type: 'arn', expected: { 'Fn::GetAtt': [logicalId, 'Arn'] } },
      { type: 'name', expected: { Ref: logicalId } },
      { type: 'logicalid', expected: logicalId }
    ].forEach(testData => {
      it(testData.type, async () => {
        const resolverKey = `fn.${testData.type}`;
        const value = `${resolverKey}:${functionName}`;
        const variableResolvers = new Plugin(serverless).variableResolvers;
        const result = await variableResolvers[resolverKey].resolver(value);

        expect(result).to.deep.equal(testData.expected);
        assert.notCalled(serverless.cli.log);
      });
    });
  });

  describe('will debug log', () => {
    beforeEach(() => {
      process.env.SLS_DEBUG = '*';
    });

    afterEach(() => {
      process.env.SLS_DEBUG = undefined;
    });

    [
      { type: 'arn' },
      { type: 'name' },
      { type: 'logicalid' }
    ].forEach(testData => {
      it(testData.type, async () => {
        const resolverKey = `fn.${testData.type}`;
        const value = `${resolverKey}:${functionName}`;
        const variableResolvers = new Plugin(serverless).variableResolvers;

        for (let i = 0; i < 2; i++) {
          await variableResolvers[resolverKey].resolver(value);

          assert.calledOnce(serverless.cli.log);
        }
      });
    });
  });

  describe('will fail if not found', () => {
    [
      { type: 'arn' },
      { type: 'name' },
      { type: 'logicalid' }
    ].forEach(testData => {
      it(testData.type, async () => {
        try {
          const resolverKey = `fn.${testData.type}`;
          const value = `${resolverKey}:test`;
          const variableResolvers = new Plugin(serverless).variableResolvers;

          await variableResolvers[resolverKey].resolver(value);
        } catch (err) {
          const message = err.message;

          expect(message).to.be.equal('Cannot resolve "test", does not exist');
          assert.notCalled(serverless.cli.log);

          return;
        }

        throw new Error('fail');
      });
    });
  });
});
