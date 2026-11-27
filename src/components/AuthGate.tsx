import { useEffect, useState } from "react";
import { getCurrentUser, logout, type User } from "../api/backend";
import App from "../App";
import AuthForm from "./AuthForm";
import Header from "./Header";

export default function AuthGate() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"checking" | "ready" | "error">(
    "checking",
  );

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        console.error("Failed to check session:", error);
        setStatus("error");
      });
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  }

  if (user) {
    // key: remount App (and drop all state) when a different user logs in.
    return <App key={user.id} user={user} onLogout={handleLogout} />;
  }

  return (
    <>
      <Header />
      <main>
        {status === "checking" && <p className="loading">Loading…</p>}
        {status === "error" && (
          <p className="error">
            Could not reach the server. Please try again later.
          </p>
        )}
        {status === "ready" && <AuthForm onAuthenticated={setUser} />}
      </main>
    </>
  );
}
