import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as budgets from 'aws-cdk-lib/aws-budgets'
import { OrganizationalUnit } from './constructs'

interface AwsTeamAccountNestedStackProps extends cdk.NestedStackProps {
  ouAwsTeams: OrganizationalUnit
  teamName: string
  accountName: string
  eMail: string
}

export class AwsTeamAccountNestedStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: AwsTeamAccountNestedStackProps) {
    super(scope, id, props)

    const { ouAwsTeams, teamName, accountName, eMail } = props

    const teamOu = new OrganizationalUnit(this, `ou-team-${teamName}`, {
      name: `ou-team-${teamName}`,
      organizationalUnit: ouAwsTeams,
    })

    const account = new Account(this, 'team-account', {
      accountName: `team-${accountName}`,
      email: eMail,
      organizationalUnit: teamOu,
      removal: true,
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
    cdk.Tags.of(budget).add('teamName', teamName)
  }
}
