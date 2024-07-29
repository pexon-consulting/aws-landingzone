import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as sso from 'aws-cdk-lib/aws-sso'
import * as identitystore from 'aws-cdk-lib/aws-identitystore'

import { Account, AccountBudget, OrganizationalUnit } from './constructs'

interface DataAiTeamProps extends cdk.NestedStackProps {
  rootId: string
  identityStoreId: string
  ssoId: string
  permissionSet: sso.CfnPermissionSet
}

const budgetMails = [
  'phillip.pham@pexon-consulting.de',
  'fabian.mirz@pexon-consulting.de',
  'maximilian.haensel@pexon-consulting.de',
  'constantin.budin@pexon-consulting.de',
  'bijay.regmi@pexon-consulting.de',
]

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
      '8354a812-30f1-70ef-0f37-e33f3b0a6e82',
      '99672b9ab3-387263ab-5ef7-43af-87f9-fdc0d365a282',
      '99672b9ab3-59c6547b-3876-4f85-8402-5ac57a9d4398',
      'c3646802-3041-702a-c891-71358f9ce16c',
      'f35428f2-c0d1-7012-b959-252b35191e84',
    ]

    prodUser.forEach(userId => {
      new identitystore.CfnGroupMembership(this, `prod-group-membership-${userId}`, {
        groupId: prodDataAiGroup.attrGroupId,
        identityStoreId,
        memberId: { userId },
      })
    })

    const devUser: string[] = [
      ...prodUser,
      '33d4f882-50a1-703b-155d-96de29012f7c',
      '99672b9ab3-324c3529-ea23-4a76-8471-b04e433ed41a',
      '99672b9ab3-6b4f2b20-a3ef-44b6-bc4d-082bc4e853e8',
    ]

    devUser.forEach(userId => {
      new identitystore.CfnGroupMembership(this, `dev-group-membership-${userId}`, {
        groupId: devDataAiGroup.attrGroupId,
        identityStoreId,
        memberId: { userId },
      })
    })

    new AccountBudget(this, 'dev-account-budget', {
      teamName: 'team-data-and-ai',
      account: devAccount,
      budgetLimit: 600,
      eMails: budgetMails,
    })
    new AccountBudget(this, 'prod-account-budget', {
      teamName: 'team-data-and-ai',
      account: prodAccount,
      budgetLimit: 300,
      eMails: budgetMails,
    })
  }
}
