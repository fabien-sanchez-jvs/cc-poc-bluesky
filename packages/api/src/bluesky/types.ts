export interface ClientMetadata {
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
}
