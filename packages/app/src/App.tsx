import { RouterProvider } from "react-router-dom";
import { SessionProvider } from "./contexts/session";
import { router } from "./routes";

export function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}
