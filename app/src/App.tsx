import { SessionProvider } from "./contexts/session";

function App() {
  return (
    <SessionProvider>
      <> App </>
    </SessionProvider>
  );
}

export default App;
