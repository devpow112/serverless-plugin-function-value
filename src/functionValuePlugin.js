export class FunctionValuePlugin {
  constructor(serverless) {
    const provider = serverless.getProvider('aws');

    this.naming = provider.naming;
    this.functions = serverless.service.getAllFunctions();
    this.variableResolvers = {
      'fn.arn': this.getFunctionARNStatement.bind(this),
      'fn.name': this.getFunctionNameStatement.bind(this)
    }
  }

  getFunctionLogicalId(functionName) {
    if (!this.functions.includes(functionName)) {
      throw new Error(
        `Function "${functionName}" doesn't exist in this Service`
      );
    }

    return this.naming.getLambdaLogicalId(functionName);
  }

  getFunctionARNStatement(variable) {
    const functionName = variable.slice(7);
    const logicalId = this.getFunctionLogicalId(functionName);

    return Promise.resolve(`!GetAtt ${logicalId}.ARN`);
  }

  getFunctionNameStatement(variable) {
    const functionName = variable.slice(8);
    const logicalId = this.getFunctionLogicalId(functionName);

    return Promise.resolve(`!Ref ${logicalId}`);
  }
}
