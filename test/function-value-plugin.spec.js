import { assert, spy, stub } from 'sinon';
import { expect } from 'chai';
import Plugin from '../src';

const functionName = 'health';
const logicalId = 'HealthLambdaFunction';
const resolverTypes = ['arn', 'name', 'logicalid'];

describe('plugin', () => {
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
      {
        type: resolverTypes[0],
        expected: { 'Fn::GetAtt': [logicalId, 'Arn'] }
      },
      {
        type: resolverTypes[1],
        expected: { Ref: logicalId }
      },
      {
        type: resolverTypes[2],
        expected: logicalId
      }
    ].forEach(resolverData => {
      it(resolverData.type, async () => {
        const resolverKey = `fn.${resolverData.type}`;
        const value = `${resolverKey}:${functionName}`;
        const variableResolvers = new Plugin(serverless).variableResolvers;

        for (let i = 0; i < 2; i++) {
          const result = await variableResolvers[resolverKey].resolver(value);

          expect(result).to.deep.equal(resolverData.expected);
        }

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

    resolverTypes.forEach(resolverType => {
      it(resolverType, async () => {
        const resolverKey = `fn.${resolverType}`;
        const value = `${resolverKey}:${functionName}`;
        const variableResolvers = new Plugin(serverless).variableResolvers;

        for (let i = 0; i < 2; i++) {
          await variableResolvers[resolverKey].resolver(value);
        }

        assert.calledOnce(serverless.cli.log);
      });
    });
  });

  describe('will fail if not found', () => {
    resolverTypes.forEach(resolverType => {
      it(resolverType, async () => {
        try {
          const resolverKey = `fn.${resolverType}`;
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
