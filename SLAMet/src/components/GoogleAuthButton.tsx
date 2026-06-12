import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

type GoogleAuthButtonProps = {
  onSuccess: (credential: string) => void;
  onError?: (message: string) => void;
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function GoogleAuthButton({ onSuccess, onError }: GoogleAuthButtonProps) {
  if (!googleClientId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Add <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> to a{" "}
        <code className="font-mono">.env</code> file to enable Google sign-in.
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(response: CredentialResponse) => {
          if (!response.credential) {
            onError?.("Google did not return a credential.");
            return;
          }

          onSuccess(response.credential);
        }}
        onError={() => onError?.("Google sign-in failed. Try again.")}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="320"
      />
    </div>
  );
}
