import type { Provider } from "@/types/auth.type";
import GoogleLogo from "./google-logo";
import LocalLogo from "./local-logo";
import MergedLogo from "./merged-logo";

interface Props {
  provider: Provider;
}

const LogoType = ({ provider }: Props) => {
  return (
    <>
      {provider === "local" && <LocalLogo imgClass="size-[15px]" />}
      {provider === "google" && <GoogleLogo imgClass="size-[15px]" />}
      {provider === "merged" && <MergedLogo imgClass="size-[15px]" />}
    </>
  );
};

export default LogoType;
