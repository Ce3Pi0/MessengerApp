import blackGoogleLogo from "@/assets/google.svg";
import whiteGoogleLogo from "@/assets/google-white.svg";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";

interface LogoProps {
  imgClass?: string;
}

const GoogleLogo = ({ imgClass = "size-[30px]" }: LogoProps) => {
  const { theme } = useTheme();

  const [googleLogo, setGoogleLogo] = useState(
    theme === "dark" ? whiteGoogleLogo : blackGoogleLogo,
  );

  useEffect(() => {
    setGoogleLogo(theme === "dark" ? whiteGoogleLogo : blackGoogleLogo);
  }, [theme]);

  return (
    <div className="flex items-center gap-2 w-fit">
      {/* TODO: Add this to docs */}
      {/* Google icon by https://icons8.com */}
      {/* <a target="_blank" href="https://icons8.com/icon/60984/google">Google</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a> */}
      <img src={googleLogo} alt="Google" className={cn(imgClass)} />
    </div>
  );
};

export default GoogleLogo;
