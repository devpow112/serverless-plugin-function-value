# Serverless Function Value Plugin

[![License][License Badge]](LICENSE)
[![Version][Version Badge]](package.json#L3)
[![Node Version][Node Version Badge]](package.json#L35)
[![Build][CI Badge]][CI Workflow]
[![Coverage][Coverage Badge]][Coverage Report]

Serverless framework plugin that will automatically generate CloudFormation
snippets to reference a functions name or ARN value based on the generated
logical ID used during creation of the CloudFormation templates.

## Installation

```bash
npm i -D serverless-plugin-function-value
```

## Usage

```yaml
service: test

plugins:
  - serverless-plugin-function-value

provider:
  name: aws
  ...

resources:
  Resources:
    LambdaFunctionExecutor:
        Type: Custom::LambdaFunctionExecutor
        Properties:
            ServiceToken: ${fn.arn:health}
            Name: ${fn.name:health}

functions:
  health:
    ...
```

During pre-processing the `${fn.*}` related items will be resolved resulting in
the below CloudFormation snippet.

```yaml
service: test

plugins:
  - serverless-plugin-function-value

provider:
  name: aws
  ...

resources:
  Resources:
    LambdaFunctionExecutor:
        Type: Custom::LambdaFunctionExecutor
        Properties:
          ServiceToken: !GetAtt HealthLambdaFunction.ARN # resolved
          Name: !Ref HealthLambdaFunction # resolved

functions:
  health:
    ...
```

## Development

Development can be done on any machine that can install **Node.js**.

### Building

Install dependencies via `npm`.

```bash
npm i
```

Run a build via `npm`:

```bash
npm run build
```

### Testing

Execute tests via `npm`.

```bash
npm test
```

This will run lint and unit tests. You will also be presented a basic coverage
report after test execution.

### Formatting

Execute formatter via `npm`.

```bash
npm run format
```

This will format based on [.eslintrc](.eslintrc) settings.

<!-- links -->
[License Badge]: https://img.shields.io/github/license/devpow112/serverless-plugin-function-value
[Version Badge]: https://img.shields.io/github/package-json/v/devpow112/serverless-plugin-function-value
[Node Version Badge]: https://img.shields.io/node/v/serverless-plugin-function-value
[CI Badge]: https://github.com/devpow112/serverless-plugin-function-value/workflows/build/badge.svg?branch=master
[CI Workflow]: https://github.com/devpow112/serverless-plugin-function-value/actions?query=workflow%3Abuild+branch%3Amaster
[Coverage Badge]: https://coveralls.io/repos/github/devpow112/serverless-plugin-function-value/badge.svg?branch=master
[Coverage Report]: https://coveralls.io/github/devpow112/serverless-plugin-function-value?branch=master
