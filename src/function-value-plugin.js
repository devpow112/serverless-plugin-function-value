const serviceName = 'serverless-plugin-function-value';
const defaultVariableResolverOptions = {
  serviceName,
  isDisabledAtPrepopulation: true
};
const logged = {};

const format = (value, result) =>
  `[${serviceName}] \${${value}} => ${JSON.stringify(result)}`;

export class FunctionValuePlugin {
  constructor(serverless) {
    if (!process.env.SLS_DEBUG) {
      this._log = () => { };
    } else {
      this._log = (value, result) => {
        if (!logged[value]) {
          logged[value] = true;

          serverless.cli.log(format(value, result));
        }
      };
    }

    this._naming = serverless.getProvider('aws').naming;
    this._functions = serverless.service.getAllFunctions();
    this.variableResolvers = {
      'fn.arn': {
        resolver: value => this._resolve(value, this._getLambdaArnObject),
        ...defaultVariableResolverOptions
      },
      'fn.name': {
        resolver: value => this._resolve(value, this._getLambdaNameObject),
        ...defaultVariableResolverOptions
      }
    };
  }

  _resolve(value, resolver) {
    resolver = resolver.bind(this);

    const functionName = value.replace(/^.*:/, '');
    const result = resolver(functionName);

    this._log(value, result);

    return Promise.resolve(result);
  }

  _getLambdaLogicalId(functionName) {
    if (!this._functions.includes(functionName)) {
      throw new Error(`Cannot resolve "${functionName}", does not exist`);
    }

    return this._naming.getLambdaLogicalId(functionName);
  }

  _getLambdaArnObject(functionName) {
    return { 'Fn::GetAtt': [this._getLambdaLogicalId(functionName), 'Arn'] };
  }

  _getLambdaNameObject(functionName) {
    return { Ref: this._getLambdaLogicalId(functionName) };
  }
}
