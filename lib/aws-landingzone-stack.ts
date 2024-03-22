import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as organizations from 'aws-cdk-lib/aws-organizations';

interface OrganizationalUnitProps {
  name: string,
  parentId?: string,
  organizationalUnit?: OrganizationalUnit,
}
class OrganizationalUnit extends Construct {
  public ouid: string
  constructor(scope: Construct, id: string, { name, parentId, organizationalUnit }: OrganizationalUnitProps) {
    super(scope, id)

    if (parentId === undefined && organizationalUnit === undefined) {
      throw new Error("one of both need to be set: parentId or organizationalUnit");
    }

    let _id: string = ""

    if (parentId) {
      _id = parentId
    }
    if (organizationalUnit) {
      _id = organizationalUnit.ouid
    }


    const node = new organizations.CfnOrganizationalUnit(this, 'ou', {
      name,
      parentId: _id
    });

    this.ouid = node.getAtt("Id").toString()
  }
}

interface AccountProps {
  accountName: string,
  email: string,
  parentId?: string,
  organizationalUnit?: OrganizationalUnit,
  removal?: boolean
}
class Account extends Construct {
  public id: string
  constructor(scope: Construct, id: string, { accountName,
    email,
    parentId,
    organizationalUnit, removal
  }: AccountProps) {
    super(scope, id)

    const _id = this.getId(parentId, organizationalUnit)

    const node = new organizations.CfnAccount(this, 'Account', {
      accountName,
      email,
      parentIds: [_id]
    })

    if (removal) {
      node.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)

    }

  }
  private getId(parentId?: string,
    organizationalUnit?: OrganizationalUnit) {
    if (parentId === undefined && organizationalUnit === undefined) {
      throw new Error("one of both need to be set: parentId or organizationalUnit");
    }

    let _id: string = ""

    if (parentId) {
      _id = parentId
    }
    if (organizationalUnit) {
      _id = organizationalUnit.ouid
    }
    return _id
  }
}

interface OrganizationsPolicyProps {
  content: { [key: string]: unknown }
  name: string
  description?: string
}
class OrganizationsScpPolicy extends Construct {
  private targetIds: string[] = []
  private policy: organizations.CfnPolicy
  public id: string
  constructor(scope: Construct, id: string, { content, name, description }: OrganizationsPolicyProps) {
    super(scope, id)

    this.policy = new organizations.CfnPolicy(this, "policy", {
      content,
      name,
      description,
      type: "SERVICE_CONTROL_POLICY",
    })

  }
  public addToTarget(input: string | OrganizationalUnit) {
    if (typeof input === "string") {
      this.targetIds.push(input)
    }
    if (input instanceof OrganizationalUnit) {
      this.targetIds.push(input.ouid)
    }
    this.policy.addPropertyOverride("TargetIds", this.targetIds)
  }
}

export class AwsLandingzoneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const orga = new organizations.CfnOrganization(this, "pexon-root-orga", {})
    orga.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)

    const rootId = orga.getAtt("RootId").toString()

    const pexonConsultingOu = new OrganizationalUnit(this, 'pexon-consulting-ou', {
      name: 'PexonConsultingOU',
      parentId: rootId,
    })

    const ouAwsTeams = new OrganizationalUnit(this, 'ou-aws-teams', {
      name: 'OU - AWS Teams',
      parentId: rootId,
    })

    new OrganizationalUnit(this, 'ou-team-west-vader', {
      name: 'OU - Team West Vader',
      organizationalUnit: ouAwsTeams,
    })
    new OrganizationalUnit(this, 'ou-team-nord-neo', {
      name: 'OU - Team Nord Neo',
      organizationalUnit: ouAwsTeams,
    })
    new OrganizationalUnit(this, 'ou-team-sued-sora', {
      name: 'OU - Team Sued Sora',
      organizationalUnit: ouAwsTeams,
    })


    new Account(this, "account-pexonconsulting", {
      accountName: "pexonconsulting",
      email: "paul.niebler@pexon-consulting.de",
      organizationalUnit: pexonConsultingOu
    })
    new Account(this, "account-databricks-poc", {
      accountName: "databricks-poc",
      email: "databricks-poc@pexon-consulting.de",
      organizationalUnit: pexonConsultingOu
    })
    const policy = new OrganizationsScpPolicy(this, "policy", {
      name: "AllowOnly-eu-central-1",
      content: {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Sid": "Statement1",
            "Effect": "Deny",
            "NotAction": [
              "a4b:*",
              "acm:*",
              "aws-marketplace-management:*",
              "aws-marketplace:*",
              "aws-portal:*",
              "budgets:*",
              "ce:*",
              "chime:*",
              "cloudfront:*",
              "config:*",
              "cur:*",
              "directconnect:*",
              "ec2:DescribeRegions",
              "ec2:DescribeTransitGateways",
              "ec2:DescribeVpnGateways",
              "fms:*",
              "globalaccelerator:*",
              "health:*",
              "iam:*",
              "importexport:*",
              "kms:*",
              "mobileanalytics:*",
              "networkmanager:*",
              "organizations:*",
              "pricing:*",
              "route53:*",
              "route53domains:*",
              "s3:GetAccountPublic*",
              "s3:ListAllMyBuckets",
              "s3:PutAccountPublic*",
              "shield:*",
              "sts:*",
              "support:*",
              "trustedadvisor:*",
              "waf-regional:*",
              "waf:*",
              "wafv2:*",
              "wellarchitected:*",
              "cloudformation:GetTemplateSummary",
              "access-analyzer:*"
            ],
            "Resource": "*",
            "Condition": {
              "StringNotEquals": {
                "aws:RequestedRegion": [
                  "eu-central-1"
                ]
              },
              "StringLike": {
                "aws:PrincipalArn": [
                  "*AWSReservedSSO_SandboxAccess*"
                ]
              }
            }
          }
        ]
      }
    })
  }
}
