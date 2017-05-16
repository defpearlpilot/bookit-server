/*
Expected environment variables from the .env file
 */

export interface Env {
  readonly MICROSOFT_TENANT_ID: string;
  readonly MICROSOFT_APP_ID: string;
  readonly MICROSOFT_CLIENT_SECRET: string;
  readonly USE_CLOUD: boolean;
}


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
  graphAPIParameters?: GraphAPIParameters;
  testMode?: TestMode;
}


export interface GraphAPIParameters {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  tokenEndpoint: string;
}

