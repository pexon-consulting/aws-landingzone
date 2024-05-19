import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as organizations from 'aws-cdk-lib/aws-organizations'

export interface OrganizationalUnitProps {
  name: string
  parentId?: string
  organizationalUnit?: OrganizationalUnit
}
export class OrganizationalUnit extends Construct {
  public ouid: string
  constructor(scope: Construct, id: string, { name, parentId, organizationalUnit }: OrganizationalUnitProps) {
    super(scope, id)

    if (parentId === undefined && organizationalUnit === undefined) {
      throw new Error('one of both need to be set: parentId or organizationalUnit')
    }

    let _id: string = ''

    if (parentId) {
      _id = parentId
    }
    if (organizationalUnit) {
      _id = organizationalUnit.ouid
    }

    const node = new organizations.CfnOrganizationalUnit(this, 'ou', {
      name,
      parentId: _id,
    })

    node.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)

    this.ouid = node.getAtt('Id').toString()
  }
}
