const formatLog = (resolver, address, result) =>
  `\${${resolver}:${address}} => ${JSON.stringify(result)}`;

export default class FunctionValuePlugin {
  constructor(serverless, _, { log }) {
    const naming = serverless.getProvider('aws').naming;
    const functions = serverless.service.getAllFunctions();
    const classes = serverless.classes;

    const getLambdaLogicalId = address => {
      if (functions.includes(address)) {
        return naming.getLambdaLogicalId(address);
      }

      throw new classes.Error(`Function "${address}" not defined`);
    };

    this.configurationVariablesSources = {
      'fn.arn': {
        resolve: ({ address }) => {
          const result = { 'Fn::GetAtt': [getLambdaLogicalId(address), 'Arn'] };

          log.debug(formatLog('fn.arn', address, result));

          return { value: result };
        }
      },
      'fn.name': {
        resolve: ({ address }) => {
          const result = { Ref: getLambdaLogicalId(address) };

          log.debug(formatLog('fn.name', address, result));

          return { value: result };
        }
      },
      'fn.logicalid': {
        resolve: ({ address }) => {
          const result = getLambdaLogicalId(address);

          log.debug(formatLog('fn.logicalid', address, result));

          return { value: result };
        }
      }
    };
  }
}
