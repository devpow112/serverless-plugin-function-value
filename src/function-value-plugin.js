const defaultVariableResolverOptions = {
  serviceName: 'serverless-plugin-function-value',
  isDisabledAtPrepopulation: true
};

export class FunctionValuePlugin {
  constructor(serverless) {
    this.naming = serverless.getProvider('aws').naming;
    this.functions = serverless.service.getAllFunctions();
    this.variableResolvers = {
      'fn.arn': {
        resolver: (value) => this.getFunctionArnStatement(value),
        ...defaultVariableResolverOptions
      },
      'fn.name': {
        resolver: (value) => this.getFunctionNameStatement(value),
        ...defaultVariableResolverOptions
      }
    };
  }

  getFunctionLogicalId(value) {
    const functionName = value.replace(/^.*:/, '');

    if (!this.functions.includes(functionName)) {
      throw new Error(`Cannot resolve "${functionName}", does not exist`);
    }

    return this.naming.getLambdaLogicalId(functionName);
  }

  getFunctionArnStatement(value) {
    return Promise.resolve({
      'Fn::GetAtt': [this.getFunctionLogicalId(value), 'Arn']
    });
  }

  getFunctionNameStatement(value) {
    return Promise.resolve({ Ref: this.getFunctionLogicalId(value) });
  }
}
