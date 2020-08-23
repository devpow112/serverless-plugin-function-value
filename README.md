# Serverless Function Value Plugin

Serverless framework plugin that will automatically generate CloudFormation
snippets to reference a functions name or ARN value based on the generated
logical ID used during creation of the CloudFormation templates.

## Installation

```
npm i -D devpow112/serverless-plugin-function-value
```

## Usage

```
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
    handler: src/handlers/api/health.handler
    description: Health check
    events:
      - http:
          path: /health
          method: get
```

During pre-processing the `${fn.*}` related items will be resolved resulting in
the below CloudFormation snippet.

```
ServiceToken: !GetAtt HealthLambdaFunction.ARN
Name: !Ref HealthLambdaFunction
```
