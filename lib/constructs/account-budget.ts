import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as budgets from 'aws-cdk-lib/aws-budgets'

import { Account } from '../constructs'

interface AccountBudgetProps {
  teamName: string
  account: Account
  budgetLimit: number
  eMails: string[]
}

export class AccountBudget extends Construct {
  constructor(scope: Construct, id: string, props: AccountBudgetProps) {
    super(scope, id)

    const { teamName, account, budgetLimit, eMails } = props

    const budget = new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetName: `monthly budget ${account.accountName}`,
        budgetLimit: {
          amount: budgetLimit,
          unit: 'USD',
        },
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
          subscribers: eMails.map(address => ({
            subscriptionType: 'EMAIL',
            address,
          })),
        },
      ],
    })
    cdk.Tags.of(budget).add('teamName', teamName)
  }
}
