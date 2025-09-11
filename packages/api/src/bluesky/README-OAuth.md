# Documentation OAuth pour AT Protocol - Guide en Français

Cette documentation explique le profil OAuth utilisé par AT Protocol (le protocole derrière Bluesky) pour l'authentification et l'autorisation des clients.

## Vue d'ensemble

OAuth est le mécanisme principal dans AT Protocol pour permettre aux clients de faire des requêtes autorisées vers les instances PDS (Personal Data Server). Cette spécification utilise u---

_Cette documentation est basée sur la spécification OAuth officielle d'AT Protocol. Pour les détails d'implémentation et les guides pour développeurs, consultez la [documentation SDK](https://docs.bsky.app/docs/advanced-guides/oauth-client) et les [exemples d'implémentation](https://github.com/bluesky-social/atproto)._

## Implémentation Pratique avec @atproto/oauth-client-node

### 📦 Installation

```bash
npm install @atproto/oauth-client-node @atproto/api @atproto/jwk-jose
```

### 🏗️ Configuration pour application backend (Client Confidentiel)

#### 1. Structure du projet

```
mon-app/
├── src/
│   ├── server.js
│   ├── oauth-client.js
│   └── stores/
│       ├── session-store.js
│       └── state-store.js
├── static/
│   ├── client-metadata.json
│   └── jwks.json
└── package.json
```

#### 2. Configuration du client OAuth

```javascript
// src/oauth-client.js
import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { JoseKey } from "@atproto/jwk-jose";
import { createSessionStore, createStateStore } from "./stores/index.js";

export async function createOAuthClient() {
  const client = new NodeOAuthClient({
    // Métadonnées client (exposées sur /client-metadata.json)
    clientMetadata: {
      client_id: "https://mon-app.com/client-metadata.json",
      client_name: "Mon Application AT Protocol",
      client_uri: "https://mon-app.com",
      logo_uri: "https://mon-app.com/logo.png",
      tos_uri: "https://mon-app.com/tos",
      policy_uri: "https://mon-app.com/privacy",
      redirect_uris: ["https://mon-app.com/oauth/callback"],
      grant_types: ["authorization_code", "refresh_token"],
      scope: "atproto transition:generic",
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "ES256",
      dpop_bound_access_tokens: true,
      jwks_uri: "c",
    },

    // Jeu de clés pour l'authentification client
    keyset: await Promise.all([
      JoseKey.fromImportable(process.env.PRIVATE_KEY_1, "key1"),
      JoseKey.fromImportable(process.env.PRIVATE_KEY_2, "key2"),
    ]),

    // Stockage des états d'autorisation (temporaire)
    stateStore: createStateStore(),

    // Stockage des sessions authentifiées (persistant)
    sessionStore: createSessionStore(),

    // Verrou pour éviter les accès concurrents (optionnel en instance unique)
    // requestLock: createRequestLock(),
  });

  return client;
}
```

#### 3. Implémentation des stores

```javascript
// src/stores/session-store.js
import Database from "better-sqlite3";

const db = new Database("sessions.db");

// Initialiser la table
db.exec(`
  CREATE TABLE IF NOT EXISTS oauth_sessions (
    sub TEXT PRIMARY KEY,
    session_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export function createSessionStore() {
  return {
    async set(sub, sessionData) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO oauth_sessions (sub, session_data, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(sub, JSON.stringify(sessionData));
    },

    async get(sub) {
      const stmt = db.prepare(
        "SELECT session_data FROM oauth_sessions WHERE sub = ?",
      );
      const row = stmt.get(sub);
      return row ? JSON.parse(row.session_data) : undefined;
    },

    async del(sub) {
      const stmt = db.prepare("DELETE FROM oauth_sessions WHERE sub = ?");
      stmt.run(sub);
    },
  };
}
```

```javascript
// src/stores/state-store.js
const stateMap = new Map();

// Nettoyage automatique des états expirés (1 heure)
setInterval(
  () => {
    const now = Date.now();
    for (const [key, { timestamp }] of stateMap.entries()) {
      if (now - timestamp > 60 * 60 * 1000) {
        // 1 heure
        stateMap.delete(key);
      }
    }
  },
  15 * 60 * 1000,
); // Nettoyage toutes les 15 minutes

export function createStateStore() {
  return {
    async set(key, internalState) {
      stateMap.set(key, {
        data: internalState,
        timestamp: Date.now(),
      });
    },

    async get(key) {
      const entry = stateMap.get(key);
      if (!entry) return undefined;

      // Vérifier l'expiration
      if (Date.now() - entry.timestamp > 60 * 60 * 1000) {
        stateMap.delete(key);
        return undefined;
      }

      return entry.data;
    },

    async del(key) {
      stateMap.delete(key);
    },
  };
}
```

#### 4. Serveur Express avec OAuth

```javascript
// src/server.js
import express from "express";
import { Agent } from "@atproto/api";
import { createOAuthClient } from "./oauth-client.js";

const app = express();
const client = await createOAuthClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Exposition des métadonnées OAuth
app.get("/client-metadata.json", (req, res) => {
  res.json(client.clientMetadata);
});

app.get("/jwks.json", (req, res) => {
  res.json(client.jwks);
});

// Page de connexion
app.get("/login", (req, res) => {
  res.send(`
    <form action="/oauth/authorize" method="post">
      <input type="text" name="handle" placeholder="votre.handle.bsky.social" required>
      <button type="submit">Se connecter avec AT Protocol</button>
    </form>
  `);
});

// Initiation du flux OAuth
app.post("/oauth/authorize", async (req, res, next) => {
  try {
    const { handle } = req.body;
    const state = crypto.randomUUID();

    // Annulation si la connexion est fermée
    const ac = new AbortController();
    req.on("close", () => ac.abort());

    const url = await client.authorize(handle, {
      signal: ac.signal,
      state,
      scope: "atproto transition:generic",
    });

    res.redirect(url.toString());
  } catch (err) {
    next(err);
  }
});

// Callback OAuth
app.get("/oauth/callback", async (req, res, next) => {
  try {
    const params = new URLSearchParams(req.url.split("?")[1]);
    const { session, state } = await client.callback(params);

    console.log("Utilisateur authentifié:", session.did);
    console.log("État OAuth:", state);

    // Créer un agent pour les requêtes API
    const agent = new Agent(session);

    // Récupérer le profil utilisateur
    const profile = await agent.getProfile({ actor: session.did });

    res.json({
      success: true,
      user: {
        did: session.did,
        handle: profile.data.handle,
        displayName: profile.data.displayName,
        description: profile.data.description,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Restauration de session utilisateur
app.get("/api/user/:did", async (req, res, next) => {
  try {
    const { did } = req.params;

    // Restaurer la session OAuth
    const session = await client.restore(did);
    const agent = new Agent(session);

    // Les tokens sont automatiquement rafraîchis si nécessaire
    const profile = await agent.getProfile({ actor: did });

    res.json(profile.data);
  } catch (err) {
    next(err);
  }
});

// Publication d'un post
app.post("/api/post", async (req, res, next) => {
  try {
    const { did, text } = req.body;

    const session = await client.restore(did);
    const agent = new Agent(session);

    const post = await agent.post({
      text,
      createdAt: new Date().toISOString(),
    });

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// Déconnexion
app.post("/api/logout/:did", async (req, res, next) => {
  try {
    const { did } = req.params;

    // Révoquer la session
    await client.revoke(did);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Gestion des événements de session
client.addEventListener("updated", (event) => {
  console.log("Session mise à jour:", event.detail.did);
});

client.addEventListener("deleted", (event) => {
  const { sub, cause } = event.detail;
  console.log("Session supprimée:", sub, "Cause:", cause.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
```

### 📱 Configuration pour application native (Client Public)

```javascript
// Pour une app Electron, mobile, etc.
import { NodeOAuthClient } from "@atproto/oauth-client-node";

const client = await NodeOAuthClient.fromClientId({
  clientId: "https://mon-app.com/client-metadata.json",

  stateStore: createLocalStateStore(), // Stockage local (localStorage, fichier)
  sessionStore: createLocalSessionStore(), // Stockage local sécurisé
});

// Les métadonnées client doivent être hébergées sur mon-app.com :
// {
//   "client_id": "https://mon-app.com/client-metadata.json",
//   "application_type": "native",
//   "token_endpoint_auth_method": "none",
//   "redirect_uris": ["mon-app://oauth/callback"],
//   // ... autres champs
// }
```

### 🔄 Utilisation avec l'API AT Protocol

```javascript
// Une fois la session obtenue
const agent = new Agent(session);

// Publications
await agent.post({ text: "Hello AT Protocol!" });
await agent.deletePost(postUri);
await agent.like(uri, cid);
await agent.repost(uri, cid);

// Profils et social
await agent.getProfile({ actor: "alice.bsky.social" });
await agent.follow("did:plc:abc123");
await agent.getFollows({ actor: session.did });

// Timeline et contenu
await agent.getTimeline({ limit: 50 });
await agent.getPostThread({ uri: postUri });

// Notifications
await agent.listNotifications();
await agent.updateSeenNotifications();

// Upload de média
const blob = await agent.uploadBlob(imageData, { encoding: "image/jpeg" });
await agent.post({
  text: "Voici ma photo !",
  embed: {
    $type: "app.bsky.embed.images",
    images: [{ image: blob, alt: "Photo" }],
  },
});
```

### 🛠️ Génération des clés pour clients confidentiels

```javascript
// Génération d'une paire de clés ES256
import { generateKeyPair } from "crypto";
import { writeFileSync } from "fs";

generateKeyPair(
  "ec",
  {
    namedCurve: "prime256v1",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  },
  (err, publicKey, privateKey) => {
    if (err) throw err;

    // Sauvegarder les clés de manière sécurisée
    writeFileSync("private-key-1.pem", privateKey);
    writeFileSync("public-key-1.pem", publicKey);

    console.log(
      "Clés générées ! Ajoutez PRIVATE_KEY_1 à vos variables d'environnement",
    );
  },
);
```

### 🔄 Gestion avancée : Silent Sign-In

```javascript
// Tentative de connexion silencieuse
app.post("/oauth/authorize", async (req, res) => {
  const { handle, silent } = req.body;

  try {
    const url = await client.authorize(handle, {
      prompt: silent ? "none" : undefined,
      state: JSON.stringify({ user: req.user?.id, handle, retry: !silent }),
    });

    res.redirect(url);
  } catch (err) {
    next(err);
  }
});

// Callback avec gestion des tentatives silencieuses
app.get("/oauth/callback", async (req, res) => {
  const params = new URLSearchParams(req.url.split("?")[1]);

  try {
    const { session, state } = await client.callback(params);
    // Succès
    res.redirect("/?success=true");
  } catch (err) {
    if (
      err instanceof OAuthCallbackError &&
      ["login_required", "consent_required"].includes(err.params.get("error"))
    ) {
      // Tentative silencieuse échouée, retry avec prompt
      const { handle, user } = JSON.parse(err.state);
      const url = await client.authorize(handle, {
        state: JSON.stringify({ user, handle, retry: false }),
      });

      res.redirect(url);
      return;
    }

    throw err;
  }
});
```

Cette implémentation vous donne une base solide pour intégrer OAuth AT Protocol dans votre application Node.js !

### 📚 Ressources supplémentaires

- [Exemple complet d'application](https://github.com/bluesky-social/statusphere-example-app)
- [Guide officiel AT Protocol](https://atproto.com/guides/applications)
- [Documentation @atproto/api](https://github.com/bluesky-social/atproto/tree/main/packages/api)profil" particulier d'OAuth qui combine plusieurs standards OAuth modernes.

### Principes de base

AT Protocol utilise **OAuth 2.1** avec les caractéristiques suivantes :

- Seul le type de "authorization code" est supporté
- **PKCE** (Proof Key for Code Exchange) obligatoire
- **DPoP** (Demonstrating Proof of Possession) requis pour lier les tokens à des instances spécifiques de clients
- **PAR** (Pushed Authorization Requests) pour simplifier le flux d'autorisation

## Types de Clients

### Clients Confidentiels

Les clients confidentiels peuvent s'authentifier auprès des serveurs d'autorisation en utilisant une clé de signature cryptographique :

- Possèdent typiquement un service web qui détient la clé
- Peuvent obtenir des durées de session plus longues
- Les tokens de rafraîchissement sont liés à la clé utilisée lors de l'émission initiale

### Clients Publics

Les clients publics ne s'authentifient pas avec une clé de signature client :

- Logiciel client s'exécutant entièrement sur les appareils des utilisateurs finaux
- Ou simplement choix de ne pas implémenter l'authentification par clé

### Types d'environnement

#### Clients Web

- Services web et applications navigateur
- URLs de redirection : URLs web classiques qui s'ouvrent dans un navigateur

#### Clients Natifs

- Applications mobiles et de bureau natives
- URLs de redirection : peuvent utiliser des schémas de callback spécifiques à la plateforme

## Document de Métadonnées Client (Client ID)

Chaque client doit publier un fichier JSON de "métadonnées client" sur le web public. Ce fichier sera récupéré dynamiquement par les serveurs d'autorisation.

### Champs obligatoires

```json
{
  "client_id": "https://app.example.com/client-metadata.json",
  "application_type": "web",
  "grant_types": ["authorization_code", "refresh_token"],
  "scope": "atproto transition:generic",
  "response_types": ["code"],
  "redirect_uris": ["https://app.example.com/callback"],
  "dpop_bound_access_tokens": true
}
```

### Champs pour clients confidentiels

```json
{
  "token_endpoint_auth_method": "private_key_jwt",
  "token_endpoint_auth_signing_alg": "ES256",
  "jwks": {
    "keys": [
      {
        "kty": "EC",
        "crv": "P-256",
        "x": "WKn-ZIGevcwGIyyrzFoZNBdaq9_TsqzGHwHitJBcBmXduzPE5-T__a1MpsBX10Do",
        "y": "MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
        "kid": "key-1",
        "use": "sig",
        "alg": "ES256"
      }
    ]
  }
}
```

## Qu'est-ce que JWKS (JSON Web Key Set) ?

JWKS est un format JSON standardisé ([RFC 7517](https://datatracker.ietf.org/doc/html/rfc7517)) pour publier des clés cryptographiques publiques. Dans AT Protocol OAuth, il sert à :

### 🔐 Authentification des clients confidentiels

- Les clients confidentiels signent leurs requêtes avec une clé privée
- Le serveur d'autorisation vérifie ces signatures avec la clé publique correspondante
- JWKS est le mécanisme pour publier ces clés publiques

### 📊 Structure d'une clé JWKS (ES256)

- `kty` : Type de clé ("EC" pour Elliptic Curve)
- `crv` : Courbe elliptique utilisée ("P-256" pour ES256)
- `x`, `y` : Coordonnées du point sur la courbe elliptique (clé publique)
- `kid` : Identifiant unique de la clé
- `use` : Usage de la clé ("sig" pour signature)
- `alg` : Algorithme cryptographique ("ES256")

### 🔄 Alternative avec jwks_uri

Au lieu d'inclure directement les clés dans les métadonnées client, vous pouvez les publier séparément :

```json
{
  "token_endpoint_auth_method": "private_key_jwt",
  "token_endpoint_auth_signing_alg": "ES256",
  "jwks_uri": "https://app.example.com/.well-known/jwks.json"
}
```

### 🛠️ Génération et rotation des clés

- Générez une paire de clés EC P-256 (privée/publique)
- Publiez la clé publique dans JWKS
- Gardez la clé privée secrète côté client
- Rotation périodique recommandée pour la sécurité

### 💻 Exemple pratique de génération JWKS

```javascript
// Génération d'une paire de clés EC P-256
const { generateKeyPair } = require("crypto");

generateKeyPair(
  "ec",
  {
    namedCurve: "prime256v1", // P-256
  },
  (err, publicKey, privateKey) => {
    if (err) throw err;

    // Export de la clé publique au format JWK
    const jwk = publicKey.export({ format: "jwk" });

    // Ajout des métadonnées
    const completeJwk = {
      ...jwk,
      kid: "key-" + Date.now(), // Identifiant unique
      use: "sig",
      alg: "ES256",
    };

    // Structure JWKS complète
    const jwks = {
      keys: [completeJwk],
    };

    console.log("JWKS à publier:", JSON.stringify(jwks, null, 2));
  },
);
```

### 🔏 Utilisation pour signer un JWT client assertion

```javascript
const jwt = require("jsonwebtoken");

// Création du client assertion JWT
const clientAssertion = jwt.sign(
  {
    iss: clientId, // Émetteur = client_id
    sub: clientId, // Sujet = client_id
    aud: authorizationServerIssuer, // Audience = serveur d'autorisation
    jti: randomUUID(), // ID unique du JWT
    iat: Math.floor(Date.now() / 1000), // Émis à
    exp: Math.floor(Date.now() / 1000) + 300, // Expire dans 5 min
  },
  privateKey,
  {
    algorithm: "ES256",
    keyid: "key-1", // Doit correspondre au 'kid' dans JWKS
  },
);
```

### Exception pour le développement localhost

Pour faciliter le développement, une exception spéciale est faite pour les clients avec `client_id` ayant l'origine `http://localhost` :

```
http://localhost?redirect_uri=http://127.0.0.1:3000/callback&scope=atproto
```

## Authentification d'Identité

Un aspect crucial d'AT Protocol OAuth est l'authentification de l'identité du compte. Le client doit :

1. **Résoudre l'identité** : À partir d'un handle ou DID fourni par l'utilisateur
2. **Vérifier l'autorité** : Confirmer que le serveur d'autorisation est bien autoritaire pour le compte
3. **Valider la réponse** : Vérifier que le champ `sub` dans la réponse token correspond au DID attendu

### Flux de démarrage

Le client peut démarrer de deux façons :

- **Avec un identifiant de compte** : handle ou DID fourni par l'utilisateur
- **Avec un nom d'hôte de serveur** : PDS ou entryway fourni par l'utilisateur

## Scopes (Portées) d'Autorisation

### Scope obligatoire

- `atproto` : Requis pour toutes les sessions OAuth AT Protocol

### Scopes transitoires

En attendant le système de scopes basé sur les namespaces Lexicon :

- `transition:generic` : Permissions larges équivalentes aux "App Passwords"
  - Écriture de tout type d'enregistrement de repository
  - Upload de blobs (fichiers média)
  - Lecture/écriture des préférences personnelles
  - Pas d'accès aux DMs
- `transition:chat.bsky` : Accès aux messages directs
  - Endpoints API pour les Lexicons `chat.bsky`
  - Nécessite aussi `transition:generic`

- `transition:email` : Accès à l'adresse email du compte

## Requêtes d'Autorisation

### Champs de requête obligatoires

```javascript
const authRequest = {
  client_id: "https://app.example.com/client-metadata.json",
  response_type: "code",
  code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM", // PKCE
  code_challenge_method: "S256",
  state: "randomly-generated-state-token",
  redirect_uri: "https://app.example.com/callback",
  scope: "atproto transition:generic",
  login_hint: "user.bsky.social", // optionnel
};
```

### PKCE (Proof Key for Code Exchange)

PKCE est obligatoire pour toutes les requêtes d'autorisation :

```javascript
// Génération du code verifier
const codeVerifier = generateRandomString(128);

// Génération du challenge
const codeChallenge = base64UrlEncode(sha256(codeVerifier));

// Dans la requête
const request = {
  code_challenge: codeChallenge,
  code_challenge_method: "S256",
};
```

### PAR (Pushed Authorization Requests)

Toutes les requêtes d'autorisation doivent utiliser PAR :

```javascript
// 1. POST vers le PAR endpoint
const parResponse = await fetch(parEndpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    DPoP: dpopToken,
  },
  body: new URLSearchParams(authRequest),
});

const { request_uri } = await parResponse.json();

// 2. Redirection vers l'endpoint d'autorisation
const authUrl = `${authorizationEndpoint}?client_id=${clientId}&request_uri=${request_uri}`;
```

## Tokens et Durée de Session

### Tokens d'accès

- Utilisés pour autoriser les requêtes client vers le PDS
- Durée de vie courte (< 30 minutes, recommandé 5-15 minutes)
- Liés à une clé DPoP unique

### Tokens de rafraîchissement

- Utilisés pour demander de nouveaux tokens
- Généralement à usage unique dans AT Protocol OAuth
- Durées de vie variables selon le type de client :
  - **Clients publics "non fiables"** : session limitée à 7 jours, tokens individuels à 24h
  - **Clients confidentiels** : session potentiellement illimitée, tokens individuels à 180 jours

### Exemple de rafraîchissement de token

```javascript
const refreshResponse = await fetch(tokenEndpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    DPoP: newDpopToken,
  },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: currentRefreshToken,
    client_id: clientId,
  }),
});

const { access_token, refresh_token, scope, sub } =
  await refreshResponse.json();
```

## DPoP (Demonstrating Proof of Possession)

DPoP est obligatoire pour tous les types de clients. Chaque requête doit inclure un token DPoP unique :

```javascript
// Génération d'un token DPoP
const dpopToken = await generateDpopToken({
  method: "POST",
  url: tokenEndpoint,
  accessToken: accessToken, // si applicable
  nonce: serverNonce,
  jti: randomUUID(),
});

// Utilisation dans la requête
await fetch(endpoint, {
  headers: {
    Authorization: `DPoP ${accessToken}`,
    DPoP: dpopToken,
  },
});
```

### Nonces DPoP

- Les nonces fournis par le serveur sont obligatoires
- Durée de vie maximale de 5 minutes
- Les clients doivent suivre les nonces par session de compte et par serveur
- Gestion des erreurs 400 pour rotation des nonces

## Métadonnées du Serveur d'Autorisation

### Serveur de Ressources (PDS)

Métadonnées à `/.well-known/oauth-protected-resource` :

```json
{
  "authorization_servers": ["https://auth.example.com"]
}
```

### Serveur d'Autorisation

Métadonnées à `/.well-known/oauth-authorization-server` :

```json
{
  "issuer": "https://auth.example.com",
  "authorization_endpoint": "https://auth.example.com/oauth/authorize",
  "token_endpoint": "https://auth.example.com/oauth/token",
  "pushed_authorization_request_endpoint": "https://auth.example.com/oauth/par",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "code_challenge_methods_supported": ["S256"],
  "token_endpoint_auth_methods_supported": ["none", "private_key_jwt"],
  "token_endpoint_auth_signing_alg_values_supported": ["ES256"],
  "scopes_supported": ["atproto", "transition:generic", "transition:chat.bsky"],
  "authorization_response_iss_parameter_supported": true,
  "require_pushed_authorization_requests": true,
  "dpop_signing_alg_values_supported": ["ES256"],
  "client_id_metadata_document_supported": true
}
```

## Résumé du Flux d'Autorisation

1. **Résolution d'identité** : Le client résout l'identifiant de compte vers un document DID
2. **Découverte du serveur** : Extraction de l'URL PDS et résolution vers le serveur d'autorisation
3. **PAR** : Requête d'autorisation poussée avec PKCE et DPoP
4. **Redirection utilisateur** : Vers l'interface d'autorisation du serveur
5. **Approbation** : L'utilisateur s'authentifie et approuve la requête
6. **Callback** : Redirection vers le client avec le code d'autorisation
7. **Échange de tokens** : Le client échange le code contre des tokens d'accès
8. **Vérification** : Validation obligatoire de l'identité du compte (`sub` field)
9. **Utilisation** : Requêtes autorisées vers le PDS avec tokens d'accès et DPoP

## Considérations de Sécurité

### Métadonnées Client

- N'importe qui peut créer un client avec n'importe quel contenu
- Les champs `client_name`, `client_uri`, et `logo_uri` ne sont pas vérifiés
- Risque d'usurpation d'identité de clients légitimes
- Recommandation : maintenir une liste de `client_id` "fiables"

### Protection SSRF

- Attention aux requêtes HTTP vers des URLs externes
- Utiliser des clients HTTP "durcis" pour éviter les attaques SSRF
- Protections contre les dénis de service

### Validation stricte

- Vérification obligatoire du champ `sub` à la fin du flux
- Validation de la cohérence entre DID et serveur d'autorisation
- Gestion sécurisée des nonces et prévention des rejeux

## Changements Futurs Possibles

- Période de grâce pour les échecs de requêtes de métadonnées client
- Relaxation de l'exigence d'une seule URL de serveur d'autorisation
- Révision des détails sur les durées de vie des sessions et tokens

---

_Cette documentation est basée sur la spécification OAuth officielle d'AT Protocol. Pour les détails d'implémentation et les guides pour développeurs, consultez la [documentation SDK](https://docs.bsky.app/docs/advanced-guides/oauth-client) et les [exemples d'implémentation](https://github.com/bluesky-social/atproto)._
