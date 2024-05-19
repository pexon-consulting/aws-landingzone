import { Construct } from 'constructs'

import * as iam from 'aws-cdk-lib/aws-iam'
import { timeStamp } from 'console'

interface OidcProviderProps {}

export class OidcProvider extends Construct {
  public openIdConnectProvider: iam.OpenIdConnectProvider
  constructor(scope: Construct, id: string, props?: OidcProviderProps) {
    super(scope, id)

    this.openIdConnectProvider = new iam.OpenIdConnectProvider(this, 'GitHubOIDCProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    })
  }
}
