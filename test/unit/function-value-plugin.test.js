import { assert, spy, stub } from 'sinon';
import { expect } from 'chai';
import Plugin from '../../src';

const functionName = 'test';
const logicalId = 'TestLambdaFunction';
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
    const resolverSnippets = [{
      type: resolverTypes[0],
      expected: { 'Fn::GetAtt': [logicalId, 'Arn'] }
    }, {
      type: resolverTypes[1],
      expected: { Ref: logicalId }
    }, {
      type: resolverTypes[2],
      expected: logicalId
    }];

    for (const resolverSnippet of resolverSnippets) {
      it(resolverSnippet.type, async () => {
        const resolverKey = `fn.${resolverSnippet.type}`;
        const value = `${resolverKey}:${functionName}`;
        const variableResolvers = new Plugin(serverless).variableResolvers;

        for (let i = 0; i < 2; i++) {
          const result = await variableResolvers[resolverKey].resolver(value);

          expect(result).to.deep.equal(resolverSnippet.expected);
        }

        assert.notCalled(serverless.cli.log);
      });
    }
  });

  describe('will debug log', () => {
    beforeEach(() => {
      process.env.SLS_DEBUG = '*';
    });

    afterEach(() => {
      process.env.SLS_DEBUG = undefined;
    });

    for (const resolverType of resolverTypes) {
      it(resolverType, async () => {
        const resolverKey = `fn.${resolverType}`;
        const value = `${resolverKey}:${functionName}`;
        const variableResolvers = new Plugin(serverless).variableResolvers;

        for (let i = 0; i < 2; i++) {
          await variableResolvers[resolverKey].resolver(value);
        }

        assert.calledOnce(serverless.cli.log);
      });
    }
  });

  describe('will fail if not found', () => {
    for (const resolverType of resolverTypes) {
      it(resolverType, async () => {
        try {
          const resolverKey = `fn.${resolverType}`;
          const value = `${resolverKey}:invalid`;
          const variableResolvers = new Plugin(serverless).variableResolvers;

          await variableResolvers[resolverKey].resolver(value);
        } catch (err) {
          const message = err.message;
          const expectedMessage = 'Cannot resolve "invalid", does not exist';

          expect(message).to.be.equal(expectedMessage);
          assert.notCalled(serverless.cli.log);

          return;
        }

        throw new Error('fail');
      });
    }
  });
});
