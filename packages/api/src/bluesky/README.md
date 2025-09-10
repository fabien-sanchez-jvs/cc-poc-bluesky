# 🚀 Déclarer et utiliser une application Bluesky (Web + OAuth)

## 1. Concept de base

* Bluesky repose sur **AT Protocol**, qui ne centralise pas l’enregistrement des applications.
* Ton **`client_id` est l’URL d’un fichier JSON** (`client-metadata.json`) que tu héberges toi-même.
* Ce fichier décrit ton application et permet aux serveurs Bluesky de savoir qui tu es.

---

## 2. Étapes de déclaration d’une app

### a) Créer un fichier `client-metadata.json`

Exemple minimal pour une application web :

```json
{
  "client_id": "https://mon-app.com/client-metadata.json",
  "client_name": "Mon App Bluesky",
  "client_uri": "https://mon-app.com",
  "logo_uri": "https://mon-app.com/logo.png",
  "tos_uri": "https://mon-app.com/tos",
  "policy_uri": "https://mon-app.com/policy",
  "redirect_uris": ["https://mon-app.com/callback"],
  "scope": "atproto",
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "application_type": "web",
  "token_endpoint_auth_method": "none"
}
```

👉 Héberge ce fichier à `https://mon-app.com/client-metadata.json`.
👉 L’URL **est ton `client_id`**.

---

### b) Utiliser ce `client_id` dans ton backend

Ton serveur va charger automatiquement la config OAuth depuis ce fichier.
Exemple TypeScript (Node.js) :

```ts
import { NodeOAuthClient } from "@atproto/oauth-client-node";

const client = await NodeOAuthClient.fromClientId({
  clientId: "https://mon-app.com/client-metadata.json",
});
```

---

## 3. Flux d’authentification OAuth (utilisateur final)

1. **Login**

   * Tu génères une URL d’autorisation :

     ```ts
     const url = await client.authorize();
     res.redirect(url); // redirige l’utilisateur vers Bluesky
     ```

2. **Callback**

   * Bluesky redirige vers `https://mon-app.com/callback?code=...`.
   * Ton backend échange ce `code` contre un **access token** (et refresh token).

     ```ts
     const session = await client.callback(req.url);
     // session.accessToken et session.refreshToken disponibles
     ```

3. **Stockage**

   * Tu sauvegardes les tokens de l’utilisateur (base de données).
   * Ces tokens représentent **l’autorisation de l’utilisateur** pour publier ou lire en son nom.

---

## 4. Publier un message sur Bluesky

Une fois connecté, ton backend peut utiliser [`@bluesky-social/api`](https://www.npmjs.com/package/@bluesky-social/api) avec l’`accessToken`.

Exemple TypeScript :

```ts
import { AtpAgent } from "@bluesky-social/api";

async function publishPost(accessToken: string, text: string) {
  const agent = new AtpAgent({ service: "https://bsky.social" });
  agent.setHeader("Authorization", `Bearer ${accessToken}`);

  const res = await agent.post({
    $type: "app.bsky.feed.post",
    text,
    createdAt: new Date().toISOString(),
  });

  console.log("Post publié :", res.uri);
}
```

---

## 5. Gestion du Refresh Token

* L’`accessToken` expire rapidement.
* Tu dois utiliser le `refreshToken` pour obtenir un nouveau jeton sans que l’utilisateur ait à se reconnecter.

```ts
const newSession = await client.refreshToken(oldRefreshToken);
```

---

## ✅ Récapitulatif

| Étape | Action                                                                 |
| ----- | ---------------------------------------------------------------------- |
| **1** | Créer et héberger un fichier `client-metadata.json` décrivant ton app. |
| **2** | Utiliser l’URL de ce fichier comme `client_id`.                        |
| **3** | Implémenter le flux OAuth (authorize → callback → access token).       |
| **4** | Sauvegarder `accessToken` et `refreshToken` pour chaque utilisateur.   |
| **5** | Utiliser `@bluesky-social/api` avec le token pour publier des posts.   |
| **6** | Rafraîchir les tokens automatiquement en backend.                      |

