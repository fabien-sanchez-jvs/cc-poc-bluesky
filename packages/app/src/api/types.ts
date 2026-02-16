import z from "zod";

export type LoginRequest = {
  handle: string;
  password: string;
};

export interface Root {
  did: string;
  didDoc: DidDoc;
  handle: string;
  email: string;
  emailConfirmed: boolean;
  emailAuthFactor: boolean;
  accessJwt: string;
  refreshJwt: string;
  active: boolean;
}

export interface DidDoc {
  "@context": string[];
  id: string;
  alsoKnownAs: string[];
  verificationMethod: VerificationMethod[];
  service: Service[];
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase: string;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
}

const VerificationMethodSchema = z.object({
  id: z.string(),
  type: z.string(),
  controller: z.string(),
  publicKeyMultibase: z.string(),
});

const ServiceSchema = z.object({
  id: z.string(),
  type: z.string(),
  serviceEndpoint: z.string(),
});

const DidDocSchema = z.object({
  "@context": z.array(z.string()),
  id: z.string(),
  alsoKnownAs: z.array(z.string()),
  verificationMethod: z.array(VerificationMethodSchema),
  service: z.array(ServiceSchema),
}); 

export const LoginResponseSchema = z.object({
  did: z.string(),
  didDoc: z.optional(DidDocSchema),
  handle: z.string(),
  email: z.string(),
  emailConfirmed: z.boolean(),
  emailAuthFactor: z.boolean(),
  accessJwt: z.string(),
  refreshJwt: z.string(),
  active: z.boolean(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
