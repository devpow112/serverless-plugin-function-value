import { spy, stub } from 'sinon';
import { expect } from 'chai';
import Plugin from '../../src/function-value-plugin.js';

const functionName = 'test';
const logicalId = 'TestLambdaFunction';
const resolverTypes = ['arn', 'name', 'logicalid'];
const errorMessage = 'Function "invalid" not defined';

describe('plugin', () => {
  let log;
  let serverless;
  let variableSources;

  beforeEach(() => {
    log = { debug: spy() };
    serverless = {
      classes: { Error },
      service: { getAllFunctions: stub().returns([functionName]) },
      getProvider: stub().returns({
        naming: { getLambdaLogicalId: stub().returns(logicalId) }
      })
    };

    const plugin = new Plugin(serverless, null, { log });

    variableSources = plugin.configurationVariablesSources;
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
        const variableSource = variableSources[`fn.${resolverSnippet.type}`];
        const result = await variableSource.resolve({ address: functionName });

        expect(result.value).to.deep.equal(resolverSnippet.expected);
        expect(log.debug.calledOnce).to.be.true;
      });
    }
  });

  describe('will fail if not found', () => {
    for (const resolverType of resolverTypes) {
      it(resolverType, async () => {
        try {
          const variableSource = variableSources[`fn.${resolverType}`];

          await variableSource.resolve({ address: 'invalid' });
        } catch (err) {
          const message = err.message;

          expect(message).to.be.equal(errorMessage);
          expect(log.debug.called).to.be.false;

          return;
        }

        throw new Error('fail');
      });
    }
  });
});
