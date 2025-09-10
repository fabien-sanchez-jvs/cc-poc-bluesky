import { useEffect } from "react";
import { useGetConnectUrl } from "../hooks/useBlueskyApi";

export function Home() {
  const { data: connectData, loading, error, send } = useGetConnectUrl();

  useEffect(() => {
    send();
  }, [send]);

  const handleConnectClick = () => {
    if (connectData?.url) {
      window.location.href = connectData.url;
    }
  };

  return (
    <div
      className="page-container"
      style={{
        paddingTop: "var(--spacing-xl)",
        paddingBottom: "var(--spacing-xl)",
      }}
    >
      <div className="card text-center" style={{ maxWidth: "600px" }}>
        <h1 className="mb-4">Bienvenue sur Bluesky App</h1>
        <p
          className="mb-5"
          style={{
            fontSize: "1.125rem",
            color: "var(--gray-600)",
          }}
        >
          Connectez-vous à votre compte Bluesky pour commencer à explorer et
          partager.
        </p>

        {error && (
          <div
            className="mb-4"
            style={{
              padding: "var(--spacing-md)",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
              borderRadius: "var(--border-radius)",
            }}
          >
            Erreur lors de la récupération de l'URL de connexion:{" "}
            {error.message}
          </div>
        )}

        <button
          onClick={handleConnectClick}
          disabled={loading || !connectData?.url}
          className="btn btn-primary btn-lg"
          style={{
            minWidth: "200px",
            fontSize: "1.25rem",
            padding: "var(--spacing-lg) var(--spacing-2xl)",
          }}
        >
          {loading ? "Chargement..." : "Se connecter à Bluesky"}
        </button>

        {loading && (
          <div className="mt-3 loading" style={{ color: "var(--gray-500)" }}>
            Récupération de l'URL de connexion...
          </div>
        )}
      </div>
    </div>
  );
}
