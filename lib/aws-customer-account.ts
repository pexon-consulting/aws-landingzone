import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as budgets from 'aws-cdk-lib/aws-budgets'
import * as identitystore from 'aws-cdk-lib/aws-identitystore'
import * as sso from 'aws-cdk-lib/aws-sso'

import { Account, OrganizationalUnit, SsmParameterString } from './constructs'

interface AwsCustomerAccountNestedStackProps extends cdk.NestedStackProps {
  organizationalUnit: OrganizationalUnit
  customerName: string
  accountName?: string
  eMail: string
  permissionSet: sso.CfnPermissionSet
  userIds: string[]
  identityStoreId: string
  ssoId: string
}

export class AwsCustomerAccountNestedStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: AwsCustomerAccountNestedStackProps) {
    super(scope, id, props)

    const { organizationalUnit, customerName, accountName, eMail, permissionSet, userIds, identityStoreId, ssoId } =
      props

    const account = new Account(this, 'customer-account', {
      accountName: accountName ? accountName : customerName,
      email: eMail,
      organizationalUnit: organizationalUnit,
      removal: true,
    })

    const cfnGroup = new identitystore.CfnGroup(this, 'MyCfnGroup', {
      displayName: `customer-${customerName}`,
      identityStoreId,

      // the properties below are optional
      description: `group for customer ${customerName}`,
    })

    new sso.CfnAssignment(this, 'Assignment', {
      instanceArn: `arn:aws:sso:::instance/${ssoId}`,
      permissionSetArn: permissionSet.attrPermissionSetArn,
      principalId: cfnGroup.attrGroupId,
      principalType: 'GROUP',
      targetId: account.id,
      targetType: 'AWS_ACCOUNT',
    })

    userIds.forEach(userId => {
      new identitystore.CfnGroupMembership(this, `group-membership-${userId}`, {
        groupId: cfnGroup.attrGroupId,
        identityStoreId,
        memberId: { userId },
      })
    })

    const budget = new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: {
          amount: 100,
          unit: 'USD',
        },
        // budgetName: `budget-${teamName}`,
        costFilters: {
          LinkedAccount: [account.id],
        },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: 80,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            {
              subscriptionType: 'EMAIL',
              address: 'maximilian.haensel@pexon-consulting.de',
            },
            {
              subscriptionType: 'EMAIL',
              address: eMail,
            },
          ],
        },
      ],
    })
    cdk.Tags.of(budget).add('customer', customerName)
  }
}
