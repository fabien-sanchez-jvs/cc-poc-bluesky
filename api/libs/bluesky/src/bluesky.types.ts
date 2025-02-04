/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

type BsDid = `did:${string}`;
type BsVerificationMethodType = 'Multikey' | string;
type BsServiceType = 'AtprotoPersonalDataServer' | string;
type BsSessionStatus = 'takendown' | 'suspended' | 'deactivated' | string;

interface BsVerificationMethod {
  id: BsDid;
  type: BsVerificationMethodType;
  controller: BsDid;
  publicKeyMultibase: string;
}

interface BsService {
  id: string;
  type: BsServiceType;
  serviceEndpoint: string;
}

interface BsDidDoc {
  '@context': Array<string>;
  id: BsDid;
  alsoKnownAs: Array<string>;
  verificationMethod: Array<BsVerificationMethod>;
  service: Array<BsService>;
}

export interface BsSession {
  accessJwt: string; // durée de vie 2 heures
  refreshJwt: string; // durée de vie 3 mois
  handle: string;
  did: BsDid;
  didDoc?: BsDidDoc;
  email?: string;
  emailConfirmed?: boolean;
  emailAuthFactor?: boolean;
  active?: boolean;
  status?: BsSessionStatus;
}
