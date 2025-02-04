import { SyntheticEvent, useState } from "react";
import { loginFormState } from "./types";
import { useSession } from "../../contexts/session";

export function LoginForm() {
  const { login } = useSession();
  const [data, setdata] = useState<loginFormState>({
    user: "",
    password: "",
  });

  const loginAction = (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (async () => {
      await login(data.user, data.password);
    })();
  };

  return (
    <form onSubmit={loginAction}>
      <p>
        <label style={{ display: "inline-block", width: "5em" }} htmlFor="user">
          user *
        </label>
        <input
          type="text"
          id="user"
          name="user"
          autoComplete="username"
          value={data.user}
          onChange={(e) => setdata((d) => ({ ...d, user: e.target.value }))}
        />
      </p>
      <p>
        <label style={{ display: "inline-block", width: "5em" }} htmlFor="pass">
          password *
        </label>
        <input
          type="password"
          id="pass"
          name="pass"
          value={data.password}
          autoComplete="current-password"
          onChange={(e) => setdata((d) => ({ ...d, password: e.target.value }))}
        />
      </p>
      <p>
        <button type="submit">Se connecter</button>
      </p>
    </form>
  );
}
