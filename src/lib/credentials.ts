export {
  type AccessToken,
  type AccessTokenProvider,
  type AccessTokenProviderOptions,
  type CredentialsClientContext,
  type FederationAccessToken,
  type FederationPrincipal,
  type FederationTokenDetails,
  type IdentityTokenProvider,
  type IdentityTokenRequest,
  WorkloadIdentityError,
} from './credentials/types';
export { TokenCache } from './credentials/token-cache';
export {
  type FederationAssertionExchangeParams,
  type FederationExchangeResult,
  type OIDCFederationConfig,
  exchangeFederationAssertion,
  oidcFederationProvider,
} from './credentials/oidc-federation';
export {
  type AWSSTSIdentityTokenOptions,
  type IdentityTokenSourceOptions,
  identityTokenFromAWSSTS,
  identityTokenFromFile,
  identityTokenFromGCPMetadata,
  identityTokenFromGitHubActions,
  identityTokenFromValue,
} from './credentials/identity-token';
export { type IdentityTokenSource, federationCredentialsFromEnv } from './credentials/credential-chain';
