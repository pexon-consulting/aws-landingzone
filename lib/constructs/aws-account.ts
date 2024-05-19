import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as organizations from 'aws-cdk-lib/aws-organizations'

import { OrganizationalUnit } from './organizational-unit'

export interface AccountProps {
  accountName: string
  email: string
  parentId?: string
  organizationalUnit?: OrganizationalUnit
  removal?: boolean
}
export class Account extends Construct {
  public id: string
  constructor(
    scope: Construct,
    id: string,
    { accountName, email, parentId, organizationalUnit, removal }: AccountProps,
  ) {
    super(scope, id)

    const _id = this.getId(parentId, organizationalUnit)
    const node = new organizations.CfnAccount(this, 'Account', {
      accountName,
      email,
      parentIds: [_id],
    })
    this.id = node.attrAccountId
    if (removal) {
      node.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)
    }
  }
  private getId(parentId?: string, organizationalUnit?: OrganizationalUnit) {
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
    return _id
  }
}
