# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

## Personio Connector

The Connector for creating and deleting AWS Users via SCIM is part of this CDK setup

### Setup
![workflow.png](images%2Fworkflow.png)

This Lambda function performs the following actions based on the event it receives:

Create a user: Adds a new user to the SCIM API.
Delete a user: Removes a user from the SCIM API.

### Secrets

The CDK Setup will create a Lambda function and required Secrets in the AWS SecretsManager. The Key & Value still have
to be filled manually afterwards.

{  
"token": "scim-bearer-token",  
"tenant_id": "tenant-id"  
}

The tenant id can be obtained from the SCIM url

### Build

````
go mod init personio-connector-lambda  
go mod tidy  
cd personio-connector-lambda  
go build -o main  
Compress-Archive -Path main -DestinationPath personio-connector-lambda.zip  
````