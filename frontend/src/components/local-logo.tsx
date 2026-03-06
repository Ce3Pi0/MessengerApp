import logo from "@/assets/whop-logo.svg";
import { cn } from "@/lib/utils";

interface LogoProps {
  imgClass?: string;
}

const LocalLogo = ({ imgClass = "size-[30px]" }: LogoProps) => (
  <div className="flex items-center gap-2 w-fit">
    <img src={logo} alt="Local" className={cn(imgClass)} />
  </div>
);

export default LocalLogo;
