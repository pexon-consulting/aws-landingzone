import { Construct } from 'constructs'
import * as ssm from 'aws-cdk-lib/aws-ssm'

interface SsmParameterProps {
  identifier: string
  firstCreation?: boolean
}

abstract class SsmParameter extends Construct {
  public value: string
  constructor(scope: Construct, id: string, props: SsmParameterProps) {
    super(scope, id)
  }
}

interface SsmParameterStringProps extends SsmParameterProps {
  isJson?: boolean
}
export class SsmParameterString extends SsmParameter {
  public value: string
  constructor(scope: Construct, id: string, props: SsmParameterStringProps) {
    super(scope, id, props)

    const { identifier, isJson, firstCreation } = props
    // Create an SSM Parameter

    const ssmParameter = new ssm.StringParameter(this, 'MySSMParameter', {
      parameterName: `/cdk/${identifier}`,
      stringValue: 'placeholder', // Placeholder, set in AWS-Console
    })

    if (firstCreation) return

    const retrievedParameter = ssm.StringParameter.valueForStringParameter(this, `/cdk/${identifier}`)

    if (isJson) {
      this.value = JSON.parse(retrievedParameter)
    }
    this.value = retrievedParameter
  }
}

interface SsmParameterStringListProps extends SsmParameterProps {}

export class SsmParameterStringList extends SsmParameter {
  public valueList: string[]
  constructor(scope: Construct, id: string, props: SsmParameterStringListProps) {
    super(scope, id, props)

    const { identifier } = props
    // Create an SSM Parameter

    const ssmParameter = new ssm.StringListParameter(this, 'MySSMParameter', {
      parameterName: `/cdk/${identifier}`,
      stringListValue: [], // Placeholder, set in AWS-Console
    })

    const retrievedParameter = (this.valueList = ssm.StringListParameter.valueForTypedListParameter(
      this,
      `/cdk/${identifier}`,
    ))
  }
}
