import { ClientMetadata } from "@atproto/oauth-client-node";

export class ClientMetadataEntity implements ClientMetadata {
  client_id: ClientMetadata["client_id"];
  client_name: string | undefined;
  client_uri: ClientMetadata["client_uri"];
  redirect_uris: ClientMetadata["redirect_uris"];
  logo_uri: ClientMetadata["logo_uri"];
  tos_uri: ClientMetadata["tos_uri"];
  policy_uri: ClientMetadata["policy_uri"];
  scope: string | undefined;
  grant_types: ClientMetadata["grant_types"];
  response_types: ClientMetadata["response_types"];
  application_type: ClientMetadata["application_type"];
  token_endpoint_auth_method: ClientMetadata["token_endpoint_auth_method"];
  dpop_bound_access_tokens: boolean | undefined;
  subject_type: "public" | "pairwise";
  authorization_signed_response_alg: string;

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
    this.subject_type = metadata.subject_type;
    this.authorization_signed_response_alg =
      metadata.authorization_signed_response_alg;
  }
}
