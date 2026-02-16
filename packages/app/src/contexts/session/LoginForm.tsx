import { type FormEvent, useState } from "react";
import { Button } from "../../components/common";
import { useSession } from "../../hooks/useSession";
import "./LoginForm.css";

export function LoginForm() {
  const { login, isLoading } = useSession();
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (!handle.trim() || !password.trim()) {
        setError("Please fill in all fields");
        return;
      }

      await login(handle, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login",
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Bluesky Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="handle">Handle</label>
            <input
              id="handle"
              type="text"
              placeholder="e.g., user.bsky.social"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Sign In"}
          </Button>
        </form>

        <p className="login-footer">
          Login with your Bluesky credentials to continue
        </p>
      </div>
    </div>
  );
}
