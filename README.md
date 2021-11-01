# Serverless Function Value Plugin

[![License][License Badge]](LICENSE)
[![Version][Version Badge]][Version Package]
[![CI][CI Badge]][CI Workflow]
[![Release][Release Badge]][Release Workflow]
[![Coverage][Coverage Badge]][Coverage Report]
[![Vulnerabilities][Vulnerabilities Badge]][Vulnerabilities Report]
[![Node Version][Node Version Badge]](package.json#L42)
![Serverless Version][Serverless Version]

Serverless framework plugin that will automatically generate AWS CloudFormation
snippets to reference a functions **name**, **ARN** or **logical ID** value
based on the internally generated Lambda logical ID.

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
        DependsOn:
          - ${fn.logicalid:test}
        Type: Custom::LambdaFunctionExecutor
        Properties:
            ServiceToken: ${fn.arn:test}
            Name: ${fn.name:test}

functions:
  test:
    ...
```

During processing the `${fn.*}` related items will be resolved to either the
`Fn::GetAtt` for `${fn.arn:*}`, `Ref` for `${fn.name:*}` or simply the logical
ID for `${fn.logicalid:*}`. The custom resource above would look like the below
in the generated CloudFormation template.

```json
"LambdaFunctionExecutor": {
    "DependsOn": [
      "TestLambdaFunction"
    ],
    "Type": "Custom::LambdaFunctionExecutor",
    "Properties": {
        "ServiceToken": {
            "Fn::GetAtt": [
                "TestLambdaFunction",
                "Arn"
            ]
        },
        "Name": {
            "Ref": "TestLambdaFunction"
        }
    }
}
```

## Development

Development can be done on any machine that can install Node.js. Only the latest
LTS version is tested against.

### Install Dependencies

Install dependencies via `npm`.

```bash
npm i
```

### Linting

Execute linters via `npm`.

```bash
# git, javascript and markdown
npm run lint

# git only
npm run lint:git

# javascript only
npm run lint:js

# markdown only
npm run lint:md
```

### Testing

Execute tests via `npm`.

```bash
# lint, unit tests and integration tests
npm test

# unit tests only
npm run test:unit

# integration tests only
npm run test:integration
```

### Formatting

Execute formatters via `npm`.

```bash
# javascript and markdown
npm run format

# javascript only
npm run format:js

# markdown only
npm run format:md
```

### Building

Run a build via `npm`.

```bash
npm run build
```

<!-- links -->
[License Badge]: https://img.shields.io/github/license/devpow112/serverless-plugin-function-value?label=License
[Version Badge]: https://img.shields.io/npm/v/serverless-plugin-function-value?label=Version
[Version Package]: https://www.npmjs.com/serverless-plugin-function-value
[Node Version Badge]: https://img.shields.io/node/v/serverless-plugin-function-value
[CI Badge]: https://github.com/devpow112/serverless-plugin-function-value/actions/workflows/ci.yml/badge.svg?branch=main
[CI Workflow]: https://github.com/devpow112/serverless-plugin-function-value/actions/workflows/ci.yml?query=branch%3Amain
[Release Badge]: https://github.com/devpow112/serverless-plugin-function-value/actions/workflows/release.yml/badge.svg?branch=main
[Release Workflow]: https://github.com/devpow112/serverless-plugin-function-value/actions/workflows/release.yml?query=branch%3Amain
[Coverage Badge]: https://img.shields.io/coveralls/github/devpow112/serverless-plugin-function-value/main?label=Coverage
[Coverage Report]: https://coveralls.io/github/devpow112/serverless-plugin-function-value?branch=main
[Vulnerabilities Badge]: https://img.shields.io/snyk/vulnerabilities/github/devpow112/serverless-plugin-function-value?label=Vulnerabilities
[Vulnerabilities Report]: https://snyk.io/test/github/devpow112/serverless-plugin-function-value
[Serverless Version]: https://img.shields.io/github/package-json/dependency-version/devpow112/serverless-plugin-function-value/dev/serverless/main
