import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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

export function RegisterPage() {
  const navigate = useNavigate();
  const { user, isInitializing, registerWithEmail, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isInitializing) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerWithEmail(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join SLAM.et to run the DEMO"
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerLinkTo="/login"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className={authLabelClass}>Name</span>
          <input
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={authInputClass}
          />
        </label>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={authInputClass}
          />
        </label>

        <label className="block">
          <span className={authLabelClass}>Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={authInputClass}
          />
        </label>

        {error && <p className={authErrorClass}>{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={authSubmitClass}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
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
            navigate("/dashboard", { replace: true });
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
