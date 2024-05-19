import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as organizations from 'aws-cdk-lib/aws-organizations'
import { OrganizationalUnit } from './organizational-unit'

export interface OrganizationsPolicyProps {
  content: { [key: string]: unknown }
  name: string
  description?: string
}
export class OrganizationsScpPolicy extends Construct {
  private targetIds: string[] = []
  private policy: organizations.CfnPolicy
  public id: string
  constructor(scope: Construct, id: string, { content, name, description }: OrganizationsPolicyProps) {
    super(scope, id)

    this.policy = new organizations.CfnPolicy(this, 'policy', {
      content,
      name,
      description,
      type: 'SERVICE_CONTROL_POLICY',
    })
  }
  public addToTarget(input: string | OrganizationalUnit) {
    if (typeof input === 'string') {
      this.targetIds.push(input)
    }
    if (input instanceof OrganizationalUnit) {
      this.targetIds.push(input.ouid)
    }
    this.policy.addPropertyOverride('TargetIds', this.targetIds)
  }
}
