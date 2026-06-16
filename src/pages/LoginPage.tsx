import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AuthCard } from "../components/AuthCard";
import {
  authDividerLineClass,
  authDividerTextClass,
  authErrorClass,
  authInputClass,
  authLabelClass,
  authSubmitClass,
} from "../components/auth-styles";
import { GoogleAuthButton } from "../components/GoogleAuthButton";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitializing, loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isInitializing) {
    return null;
  }

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginWithEmail(email, password);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to log in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your SLAM.et account to run the DEMO"
      footerText="Don't have an account?"
      footerLinkLabel="Register"
      footerLinkTo="/register"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className={authLabelClass}>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={authInputClass}
          />
        </label>

        <label className="block">
          <span className={authLabelClass}>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={authInputClass}
          />
        </label>

        {error && <p className={authErrorClass}>{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={authSubmitClass}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className={authDividerLineClass} />
        <span className={authDividerTextClass}>or</span>
        <div className={authDividerLineClass} />
      </div>

      <GoogleAuthButton
        onSuccess={async (credential) => {
          try {
            await loginWithGoogle(credential);
            navigate(redirectTo, { replace: true });
          } catch (googleError) {
            setError(
              googleError instanceof Error
                ? googleError.message
                : "Google sign-in failed.",
            );
          }
        }}
        onError={setError}
      />
    </AuthCard>
  );
}
