import { Outlet, Link } from "react-router-dom";

export function Layout() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      <nav
        style={{
          backgroundColor: "var(--white)",
          boxShadow: "var(--shadow-sm)",
          borderBottom: "var(--border-width) solid var(--gray-200)",
          padding: "0 var(--spacing-md)",
        }}
      >
        <div className="container">
          <div
            className="d-flex justify-between align-center"
            style={{ height: "64px" }}
          >
            <div className="d-flex align-center">
              <Link
                to="/"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "var(--primary-color)",
                  textDecoration: "none",
                }}
              >
                Bluesky App
              </Link>
            </div>
            <div className="d-flex align-center gap-md">
              <Link
                to="/"
                style={{
                  color: "var(--gray-600)",
                  textDecoration: "none",
                  padding: "var(--spacing-sm) var(--spacing-md)",
                  borderRadius: "var(--border-radius)",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  transition: "var(--transition)",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color =
                    "var(--primary-color)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "var(--gray-600)";
                }}
              >
                Accueil
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
