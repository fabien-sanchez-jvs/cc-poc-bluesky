import { RouterProvider } from "react-router-dom";
import { SessionProvider } from "./contexts/session";
import { router } from "./router.service";

function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}

export default App;
