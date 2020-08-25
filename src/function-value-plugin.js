export class FunctionValuePlugin {
  constructor(serverless) {
    this.naming = serverless.getProvider('aws').naming;
    this.functions = serverless.service.getAllFunctions();
    this.variableResolvers = {
      'fn.arn': (value) => this.getFunctionArnStatement(value),
      'fn.name': (value) => this.getFunctionNameStatement(value)
    };
  }

  getFunctionLogicalId(value) {
    const functionName = value.replace(/^.*:/, '');

    if (!this.functions.includes(functionName)) {
      throw new Error(
        `Function "${functionName}" doesn't exist in this Service`
      );
    }

    return this.naming.getLambdaLogicalId(functionName);
  }

  getFunctionArnStatement(value) {
    return Promise.resolve(`!GetAtt ${this.getFunctionLogicalId(value)}.Arn`);
  }

  getFunctionNameStatement(value) {
    return Promise.resolve(`!Ref ${this.getFunctionLogicalId(value)}`);
  }
}
