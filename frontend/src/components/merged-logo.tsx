import blackMergedLogo from "@/assets/merge.svg";
import whiteMergedLogo from "@/assets/merge-white.svg";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

interface LogoProps {
  imgClass?: string;
}

const MergedLogo = ({ imgClass = "size-[30px]" }: LogoProps) => {
  const { theme } = useTheme();

  const [mergedLogo, setMergedLogo] = useState(
    theme === "dark" ? whiteMergedLogo : blackMergedLogo,
  );

  useEffect(() => {
    setMergedLogo(theme === "dark" ? whiteMergedLogo : blackMergedLogo);
  }, [theme]);

  return (
    <div className="flex items-center gap-2 w-fit">
      {/* <a href="https://www.flaticon.com/free-icons/combine" title="combine icons">Combine icons created by mavadee - Flaticon</a> */}
      <img src={mergedLogo} alt="Merged" className={cn(imgClass)} />
    </div>
  );
};

export default MergedLogo;
