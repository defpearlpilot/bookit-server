/*
Expected environment variables from the .env file
 */

export interface Env {
  readonly USE_CLOUD: string;
  readonly CLOUD_CONFIG: string;
  readonly ROMAN_SECRET?: string;
  readonly TEST_SECRET?: string;
  readonly BUILDIT_SECRET?: string;
  readonly JWT_TOKEN_SECRET: string;
  readonly MEETING_CACHE_DISABLED: string;
  readonly GROUP_CACHE_DISABLED: string;
}

export type CloudConfiguration = 'roman' | 'contoso';

/*
The internal structure representing the configuration as attributes get
decorated/visited
 */
export enum TestMode {
  NONE,
  UNIT,
  INTEGRATION
}

export interface EnvironmentConfig {
  port?: number;
  graphAPIIdentity?: string;
  domain?: Domain;
  graphAPIParameters?: GraphAPIParameters;
  testMode?: TestMode;
  jwtTokenSecret?: string;
  useMeetingCache?: boolean;
  useGroupCache?: boolean;
}

export interface Domain {
  domainName: string;
  sites: string[];
}

export interface GraphAPIParameters {
  identity: string;
  tenantId: string;
  clientId: string;
  clientSecret?: string;
}


