import mergedLogo from "@/assets/merge.svg";
import { cn } from "@/lib/utils";

interface LogoProps {
  imgClass?: string;
}

const MergedLogo = ({ imgClass = "size-[30px]" }: LogoProps) => (
  <div className="flex items-center gap-2 w-fit">
    {/* <a href="https://www.flaticon.com/free-icons/combine" title="combine icons">Combine icons created by mavadee - Flaticon</a> */}
    <img src={mergedLogo} alt="Merged" className={cn(imgClass)} />
  </div>
);

export default MergedLogo;
