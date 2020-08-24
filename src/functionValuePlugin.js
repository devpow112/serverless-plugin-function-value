export class FunctionValuePlugin {
  constructor(serverless) {
    this.naming = serverless.getProvider('aws').naming;
    this.functions = serverless.service.getAllFunctions();
    this.variableResolvers = {
      'fn.arn': this.getFunctionARNStatement.bind(this),
      'fn.name': this.getFunctionNameStatement.bind(this)
    }
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

  getFunctionARNStatement(value) {
    return Promise.resolve(`!GetAtt ${this.getFunctionLogicalId(value)}.ARN`);
  }

  getFunctionNameStatement(value) {
    return Promise.resolve(`!Ref ${this.getFunctionLogicalId(value)}`);
  }
}
