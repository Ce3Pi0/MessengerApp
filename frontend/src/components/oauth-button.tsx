import { Button } from "./ui/button";
import GoogleIcon from "./ui/google-icon";

const OauthButton = () => {
  const BASE_URL =
    import.meta.env.MODE === "development" ? import.meta.env.VITE_API_URL : "/";
  const backendUrl =
    import.meta.env.MODE === "development"
      ? BASE_URL + "api/v1/auth/google"
      : "api/v1/auth/google";

  return (
    <Button
      variant="outline"
      className="flex w-full items-center justify-center space-x-2 py-2"
      asChild
    >
      <a href={backendUrl}>
        <GoogleIcon className="size-5" aria-hidden={true} />
        <span className="text-sm font-medium">Sign in with Google</span>
      </a>
    </Button>
  );
};

export default OauthButton;
