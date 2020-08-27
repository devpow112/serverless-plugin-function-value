const defaultVariableResolverOptions = {
  serviceName: 'serverless-plugin-function-value',
  isDisabledAtPrepopulation: true
};

export class FunctionValuePlugin {
  constructor(serverless) {
    this._naming = serverless.getProvider('aws').naming;
    this._functions = serverless.service.getAllFunctions();
    this.variableResolvers = {
      'fn.arn': {
        resolver: (value) => this._getLambdaArnObject(value),
        ...defaultVariableResolverOptions
      },
      'fn.name': {
        resolver: (value) => this._getLambdaNameObject(value),
        ...defaultVariableResolverOptions
      }
    };
  }

  _getLambdaLogicalId(value) {
    const functionName = value.replace(/^.*:/, '');

    if (!this._functions.includes(functionName)) {
      throw new Error(`Cannot resolve "${functionName}", does not exist`);
    }

    return this._naming.getLambdaLogicalId(functionName);
  }

  _getLambdaArnObject(value) {
    return Promise.resolve({
      'Fn::GetAtt': [this._getLambdaLogicalId(value), 'Arn']
    });
  }

  _getLambdaNameObject(value) {
    return Promise.resolve({ Ref: this._getLambdaLogicalId(value) });
  }
}
