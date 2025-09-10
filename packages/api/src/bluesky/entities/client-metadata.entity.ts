import type { ClientMetadata } from "../types";

export class ClientMetadataEntity implements ClientMetadata {
  client_id: string;
  client_name: string;
  client_uri: string;
  logo_uri?: string;
  tos_uri?: string;
  policy_uri?: string;
  redirect_uris: string[];
  scope: string;
  grant_types: string[];
  response_types: string[];
  application_type: string;
  token_endpoint_auth_method: string;

  constructor(metadata: ClientMetadata) {
    this.client_id = metadata.client_id;
    this.client_name = metadata.client_name;
    this.client_uri = metadata.client_uri;
    this.logo_uri = metadata.logo_uri;
    this.tos_uri = metadata.tos_uri;
    this.policy_uri = metadata.policy_uri;
    this.redirect_uris = metadata.redirect_uris;
    this.scope = metadata.scope;
    this.grant_types = metadata.grant_types;
    this.response_types = metadata.response_types;
    this.application_type = metadata.application_type;
    this.token_endpoint_auth_method = metadata.token_endpoint_auth_method;
  }
}
