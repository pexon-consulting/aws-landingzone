import { Construct } from 'constructs'

import * as iam from 'aws-cdk-lib/aws-iam'

interface GithubCicdRoleProps {
  oidcProvider: iam.OpenIdConnectProvider
}

export class GithubCicdRole extends Construct {
  constructor(scope: Construct, id: string, props: GithubCicdRoleProps) {
    super(scope, id)

    const { oidcProvider } = props

    // Create a role to be assumed by GitHub Actions
    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      assumedBy: new iam.WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': 'repo:pexon-consulting/aws-landingzone:ref:refs/heads/main',
        },
      }),
      description: 'Role to be assumed by GitHub Actions',
    })

    // Attach policies to the role
    githubActionsRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'))
  }
}
