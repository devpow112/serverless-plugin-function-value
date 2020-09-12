import memoize from 'lodash.memoize';
import { name } from '../package.json';

const defaultVariableResolverOptions = {
  serviceName: name,
  isDisabledAtPrepopulation: true
};

export class FunctionValuePlugin {
  constructor(serverless) {
    if (!process.env.SLS_DEBUG) {
      this._log = () => { };
    } else {
      this._log = memoize((value, result) => serverless.cli.log(
        `[${name}] \${${value}} => ${JSON.stringify(result)}`
      ));
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
