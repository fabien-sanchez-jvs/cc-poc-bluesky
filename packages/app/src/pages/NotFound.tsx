import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="page-container">
      <div className="text-center" style={{ maxWidth: "400px" }}>
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "700",
            color: "var(--gray-900)",
            marginBottom: "var(--spacing-md)",
          }}
        >
          404
        </h1>
        <h2 className="mt-4">Page non trouvée</h2>
        <p className="mt-2">La page que vous recherchez n'existe pas.</p>
        <div className="mt-5">
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
