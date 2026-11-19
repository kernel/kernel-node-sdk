import { readEnv } from '../../internal/utils/env';
import {
  identityTokenFromAWSSTS,
  identityTokenFromFile,
  identityTokenFromGCPMetadata,
  identityTokenFromGitHubActions,
  identityTokenFromValue,
} from './identity-token';
import { oidcFederationProvider } from './oidc-federation';
import type { AccessTokenProvider, IdentityTokenProvider } from './types';
import { WorkloadIdentityError } from './types';

export const IDENTITY_TOKEN_SOURCES = ['github_actions', 'gcp_metadata', 'aws_sts', 'file', 'env'] as const;
export type IdentityTokenSource = (typeof IDENTITY_TOKEN_SOURCES)[number];

/**
 * Builds workload identity credentials from the environment, or returns
 * `null` when the environment does not configure them.
 *
 * `KERNEL_FEDERATION_RULE_ID` names the federation rule. The identity token
 * comes from the source `KERNEL_IDENTITY_TOKEN_SOURCE` selects. When that is
 * unset, the first of these that applies is used:
 *
 *   1. `KERNEL_IDENTITY_TOKEN_FILE`
 *   2. `KERNEL_IDENTITY_TOKEN` (good for one exchange only)
 *   3. GitHub Actions, when `ACTIONS_ID_TOKEN_REQUEST_URL` is present
 *
 * A source that is selected but not usable throws, rather than leaving the
 * caller to find out on the first request.
 */
export function federationCredentialsFromEnv(): AccessTokenProvider | null {
  const federationRuleId = readEnv('KERNEL_FEDERATION_RULE_ID');
  if (!federationRuleId) return null;

  const identityTokenProvider = identityTokenProviderFromEnv();
  if (!identityTokenProvider) return null;

  return oidcFederationProvider({ identityTokenProvider, federationRuleId });
}

// One wrapper per value for the whole process, so a second client built from
// the same environment cannot send a token the first one already exchanged.
const staticTokenProviders = new Map<string, IdentityTokenProvider>();

function staticIdentityToken(token: string): IdentityTokenProvider {
  let provider = staticTokenProviders.get(token);
  if (!provider) {
    provider = identityTokenFromValue(token);
    staticTokenProviders.set(token, provider);
  }
  return provider;
}

function identityTokenProviderFromEnv(): IdentityTokenProvider | null {
  const source = readEnv('KERNEL_IDENTITY_TOKEN_SOURCE');
  const tokenFile = readEnv('KERNEL_IDENTITY_TOKEN_FILE');
  const tokenValue = readEnv('KERNEL_IDENTITY_TOKEN');

  switch (source) {
    case undefined:
      if (tokenFile) return identityTokenFromFile(tokenFile);
      if (tokenValue) return staticIdentityToken(tokenValue);
      if (readEnv('ACTIONS_ID_TOKEN_REQUEST_URL')) return identityTokenFromGitHubActions();
      return null;
    case 'github_actions':
      if (!readEnv('ACTIONS_ID_TOKEN_REQUEST_URL') || !readEnv('ACTIONS_ID_TOKEN_REQUEST_TOKEN')) {
        throw new WorkloadIdentityError(
          'KERNEL_IDENTITY_TOKEN_SOURCE is github_actions, but ACTIONS_ID_TOKEN_REQUEST_URL and ACTIONS_ID_TOKEN_REQUEST_TOKEN are not set. Add `permissions: id-token: write` to the workflow or job.',
        );
      }
      return identityTokenFromGitHubActions();
    case 'gcp_metadata':
      return identityTokenFromGCPMetadata();
    case 'aws_sts':
      return identityTokenFromAWSSTS();
    case 'file':
      if (!tokenFile) {
        throw new WorkloadIdentityError(
          'KERNEL_IDENTITY_TOKEN_SOURCE is file, but KERNEL_IDENTITY_TOKEN_FILE is not set.',
        );
      }
      return identityTokenFromFile(tokenFile);
    case 'env':
      if (!tokenValue) {
        throw new WorkloadIdentityError(
          'KERNEL_IDENTITY_TOKEN_SOURCE is env, but KERNEL_IDENTITY_TOKEN is not set.',
        );
      }
      return staticIdentityToken(tokenValue);
    default:
      throw new WorkloadIdentityError(
        `KERNEL_IDENTITY_TOKEN_SOURCE is "${source}"; expected one of ${IDENTITY_TOKEN_SOURCES.join(', ')}.`,
      );
  }
}
