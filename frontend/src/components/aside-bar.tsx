import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "./theme-provider";
import { isUserOnline } from "@/lib/helper";
import Logo from "./logo";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AvatarWithBadge from "./avatar-with-badge";
import MergedLogo from "./merged-logo";
import LocalLogo from "./local-logo";
import GoogleLogo from "./google-logo";
import { useNavigate } from "react-router-dom";

const AsideBar = () => {
  const BASE_URL =
    import.meta.env.MODE === "development" ? import.meta.env.VITE_API_URL : "/";
  const backendUrl =
    import.meta.env.MODE === "development"
      ? BASE_URL + "/api/v1/auth/google"
      : "/api/v1/auth/google";

  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const isOnline = isUserOnline(user?._id);

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div role="button">
                <AvatarWithBadge
                  name={user?.name || "unknown"}
                  src={user?.avatar || ""}
                  isOnline={isOnline}
                  className="bg-white"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 rounded-lg z-99999"
              align="end"
            >
              {/* TODO: Separate components */}
              <DropdownMenuLabel className="flex flex-row justify-between">
                <p>{user?.name}</p>
                {user?.provider === "local" && (
                  <LocalLogo imgClass="size-[15px]" />
                )}
                {user?.provider === "google" && (
                  <GoogleLogo imgClass="size-[15px]" />
                )}
                {user?.provider === "merged" && (
                  <MergedLogo imgClass="size-[15px]" />
                )}
              </DropdownMenuLabel>
              <hr />
              {user?.provider === "local" && (
                <DropdownMenuItem
                  onClick={() => (window.location.href = backendUrl)}
                >
                  Link Account
                </DropdownMenuItem>
              )}
              {user?.provider === "google" && (
                <DropdownMenuItem>Set Password</DropdownMenuItem>
              )}
              {user?.provider !== "google" && (
                <DropdownMenuItem onClick={() => navigate("/change-password")}>
                  Change Password
                </DropdownMenuItem>
              )}
              {!user?.enabled2fa && (
                <DropdownMenuItem>Enable 2FA</DropdownMenuItem>
              )}
              {user?.enabled2fa && (
                <DropdownMenuItem>Disable 2FA</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>

              {/* TODO: Add link account, change password and enable mfa functionalities here */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
};

export default AsideBar;
