import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as organizations from 'aws-cdk-lib/aws-organizations'
import { Account, OrganizationalUnit, OrganizationsScpPolicy } from './constructs'
import { AwsTeamAccountNestedStack } from './aws-team-accounts'

export class AwsLandingzoneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const orga = new organizations.CfnOrganization(this, 'pexon-root-orga', {})
    orga.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)

    const rootId = orga.getAtt('RootId').toString()

    const pexonConsultingOu = new OrganizationalUnit(this, 'pexon-consulting-ou', {
      name: 'PexonConsultingOU',
      parentId: rootId,
    })

    const ouAwsTeams = new OrganizationalUnit(this, 'ou-aws-teams', {
      name: 'OU - AWS Teams',
      parentId: rootId,
    })

    new AwsTeamAccountNestedStack(this, 'ou-team-west-vader', {
      ouAwsTeams,
      teamName: 'west-vader',
      accountName: 'west-vader',
      eMail: 'west-aws-vader@pexon-consulting.de',
    })
    new AwsTeamAccountNestedStack(this, 'ou-team-nord-neo', {
      ouAwsTeams,
      teamName: 'nord-neo',
      accountName: 'nord-neo',
      eMail: 'nord-aws-neo@pexon-consulting.de',
    })
    new AwsTeamAccountNestedStack(this, 'ou-team-sued-sora', {
      ouAwsTeams,
      teamName: 'sued-sora',
      accountName: 'ou-team-sued-sora',
      eMail: 'sued-aws-sora@pexon-consulting.de',
    })

    new Account(this, 'account-pexonconsulting', {
      accountName: 'pexonconsulting',
      email: 'EMEA.CTA.payer507@aws.tdsynnex.com',
      organizationalUnit: pexonConsultingOu,
    })

    new Account(this, 'account-databricks-poc', {
      accountName: 'databricks-poc',
      email: 'databricks-poc@pexon-consulting.de',
      organizationalUnit: pexonConsultingOu,
    })

    const policy = new OrganizationsScpPolicy(this, 'policy', {
      name: 'AllowOnly-eu-central-1',
      content: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'Statement1',
            Effect: 'Deny',
            NotAction: [
              'a4b:*',
              'acm:*',
              'aws-marketplace-management:*',
              'aws-marketplace:*',
              'aws-portal:*',
              'budgets:*',
              'ce:*',
              'chime:*',
              'cloudfront:*',
              'config:*',
              'cur:*',
              'directconnect:*',
              'ec2:DescribeRegions',
              'ec2:DescribeTransitGateways',
              'ec2:DescribeVpnGateways',
              'fms:*',
              'globalaccelerator:*',
              'health:*',
              'iam:*',
              'importexport:*',
              'kms:*',
              'mobileanalytics:*',
              'networkmanager:*',
              'organizations:*',
              'pricing:*',
              'route53:*',
              'route53domains:*',
              's3:GetAccountPublic*',
              's3:ListAllMyBuckets',
              's3:PutAccountPublic*',
              'shield:*',
              'sts:*',
              'support:*',
              'trustedadvisor:*',
              'waf-regional:*',
              'waf:*',
              'wafv2:*',
              'wellarchitected:*',
              'cloudformation:GetTemplateSummary',
              'access-analyzer:*',
            ],
            Resource: '*',
            Condition: {
              StringNotEquals: {
                'aws:RequestedRegion': ['eu-central-1'],
              },
              StringLike: {
                'aws:PrincipalArn': ['*AWSReservedSSO_SandboxAccess*'],
              },
            },
          },
        ],
      },
    })
  }
}
