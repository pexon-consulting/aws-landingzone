import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as identitystore from 'aws-cdk-lib/aws-identitystore'
import * as sso from 'aws-cdk-lib/aws-sso'

import { Account, OrganizationalUnit } from './constructs'

interface DataAiTeamProps extends cdk.NestedStackProps {
  rootId: string
  identityStoreId: string
  ssoId: string
  permissionSet: sso.CfnPermissionSet
}

export class DataAiTeam extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: DataAiTeamProps) {
    super(scope, id, props)
    const { rootId, identityStoreId, permissionSet, ssoId } = props

    const ouDataAiTeam = new OrganizationalUnit(this, 'ou-data-ai-team', {
      name: 'OU - Data and AI',
      parentId: rootId,
    })

    const devDataAiGroup = new identitystore.CfnGroup(this, 'data-ai-group-dev', {
      displayName: `team-data-and-ai-dev`,
      identityStoreId,
      description: `Developer group for team Data and Ai`,
    })

    const devAccount = new Account(this, 'team-data-ai-dev', {
      accountName: 'team-data-ai-dev',
      email: 'team-data-ai-dev@pexon-consulting.de',
      organizationalUnit: ouDataAiTeam,
      removal: true,
    })

    new sso.CfnAssignment(this, 'dev-grp-to-dev-account', {
      instanceArn: `arn:aws:sso:::instance/${ssoId}`,
      permissionSetArn: permissionSet.attrPermissionSetArn,
      principalId: devDataAiGroup.attrGroupId,
      principalType: 'GROUP',
      targetId: devAccount.id,
      targetType: 'AWS_ACCOUNT',
    })

    const prodDataAiGroup = new identitystore.CfnGroup(this, 'data-ai-group-prod', {
      displayName: `team-data-and-ai-prod`,
      identityStoreId,
      description: `Prod group for team Data and Ai`,
    })

    const prodAccount = new Account(this, 'account-smart-cv-search', {
      accountName: 'smart-cv-search',
      email: 'smart-cv-search@pexon-consulting.de',
      organizationalUnit: ouDataAiTeam,
      removal: true,
    })

    new sso.CfnAssignment(this, 'prod-grp-to-prod-account', {
      instanceArn: `arn:aws:sso:::instance/${ssoId}`,
      permissionSetArn: permissionSet.attrPermissionSetArn,
      principalId: prodDataAiGroup.attrGroupId,
      principalType: 'GROUP',
      targetId: prodAccount.id,
      targetType: 'AWS_ACCOUNT',
    })

    const prodUser: string[] = [
      '99672b9ab3-387263ab-5ef7-43af-87f9-fdc0d365a282',
      '99672b9ab3-59c6547b-3876-4f85-8402-5ac57a9d4398',
    ]

    prodUser.forEach(userId => {
      new identitystore.CfnGroupMembership(this, `prod-group-membership-${userId}`, {
        groupId: prodDataAiGroup.attrGroupId,
        identityStoreId,
        memberId: { userId },
      })
    })

    const devUser: string[] = [...prodUser]

    devUser.forEach(userId => {
      new identitystore.CfnGroupMembership(this, `dev-group-membership-${userId}`, {
        groupId: devDataAiGroup.attrGroupId,
        identityStoreId,
        memberId: { userId },
      })
    })
  }
}
