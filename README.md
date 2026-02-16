# Bluesky POC

Application Bluesky avec authentification et gestion de session utilisateur.

## Architecture

### AtpAgent (AT Protocol Agent)

L'application utilise **AtpAgent** de la bibliothèque `@atproto/api` pour communiquer avec Bluesky.

**Service connecté :** `https://bsky.social`

**Méthodes utilisées :**

#### `agent.login(identifier: string, password: string)`
Authentifie un utilisateur avec son handle Bluesky et son mot de passe.

**Paramètres :**
- `identifier` : Le handle de l'utilisateur (ex: `user.bsky.social`)
- `password` : Le mot de passe de l'utilisateur

**Retour :**
- Objet de session contenant `accessJwt`, `refreshJwt`, `handle`, `did`, etc.

**Utilisation :**
```typescript
const result = await this.agent.login({
  identifier: handle,
  password: password,
});
```

#### `agent.resumeSession(session: SessionData)`
Reprend une session existante avec les tokens stockés.

**Paramètres :**
- `handle` : Le handle de l'utilisateur
- `accessJwt` : Le token d'accès
- `refreshJwt` : Le token de rafraîchissement (valable 3 mois)
- `did` : L'identifiant décentralisé de l'utilisateur
- `active` : Statut de la session

**Utilisation :**
```typescript
await this.agent.resumeSession({
  handle: "user.bsky.social",
  accessJwt: "...",
  refreshJwt: "...",
  did: "did:...",
  active: true,
});
```

### Authentification Bluesky

**Tokens de session :**
- **Access Token** : Valable pour la session actuelle
- **Refresh Token** : Valable **3 mois** - utilisé pour renouveler les access tokens expirés

**Flux d'authentification :**
1. L'utilisateur se connecte avec son handle et mot de passe
2. L'API Bluesky retourne les tokens d'accès et de rafraîchissement
3. Les données de session sont stockées de manière sécurisée
4. L'application peut accéder au contenu avec les tokens valides


