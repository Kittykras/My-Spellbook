import { useState, type SubmitEvent } from "react";
import { login, register, type User } from "../api/backend";

type AuthFormProps = {
  onAuthenticated: (user: User) => void;
};

export default function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("auth-email") ?? "").trim();
    const password = String(formData.get("auth-password") ?? "");

    setError("");
    setIsSubmitting(true);
    try {
      const user = isRegister
        ? await register(email, password)
        : await login(email, password);
      onAuthenticated(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="auth-title">
      <h2 id="auth-title">{isRegister ? "Create account" : "Log in"}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            name="auth-email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            name="auth-password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            required
          />
          {isRegister && <p className="field-help">At least 8 characters.</p>}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="button-wrapper">
          <button type="submit" disabled={isSubmitting}>
            {isRegister ? "Create account" : "Log in"}
          </button>
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(isRegister ? "login" : "register");
              setError("");
            }}
          >
            {isRegister
              ? "I already have an account"
              : "Create a new account"}
          </button>
        </div>
      </form>
    </section>
  );
}
