import { useTheme } from "./theme-provider";
import Logo from "./logo";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import UserDropdown from "./user-dropdown";

const AsideBar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <aside className="top-0 fixed inset-y-0 w-11 left-0 z-9999 h-svh bg-primary/85 shadow-sm">
      <div className="w-full h-full px-1 pt-1 pb-6 flex flex-col items-center justify-between">
        <Logo
          url={PROTECTED_ROUTES.CHAT}
          imgClass="size-7"
          textClass="text-white"
          showText={false}
        />

        <div className="flex flex-col items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="border-0 rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

          <UserDropdown />
        </div>
      </div>
    </aside>
  );
};

export default AsideBar;
