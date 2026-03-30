import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import AvatarWithBadge from "./avatar-with-badge";
import { isUserOnline } from "@/lib/helper";
import LogoType from "./logo-type";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { PencilLineIcon, Trash2Icon } from "lucide-react";
import { useTheme } from "./theme-provider";

const UserDropdown = () => {
  const navigate = useNavigate();
  const themeData = useTheme();

  const BASE_URL =
    import.meta.env.MODE === "development" ? import.meta.env.VITE_API_URL : "/";
  const backendUrl =
    import.meta.env.MODE === "development"
      ? BASE_URL + "api/v1/auth/google"
      : "api/v1/auth/google";

  const { user, logout, enable2fa } = useAuth();

  const isOnline = isUserOnline(user?._id);

  const handleEnable2FA = () => {
    enable2fa();
    navigate(PROTECTED_ROUTES.ENABLE_2FA);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div role="button">
          <AvatarWithBadge
            name={user?.name || "unknown"}
            src={user?.avatar || ""}
            isOnline={isOnline}
            className={themeData.theme === "dark" ? "bg-accent" : "bg-white"}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 rounded-lg z-99999" align="end">
        <DropdownMenuLabel>Account Details</DropdownMenuLabel>
        <hr />
        <DropdownMenuItem
          onClick={() => navigate(PROTECTED_ROUTES.EDIT_ACCOUNT)}
          className="flex flex-row justify-between items-center"
        >
          <PencilLineIcon className="size-3" />
          {user?.name}
          <LogoType provider={user?.provider || "local"} />
        </DropdownMenuItem>
        <hr />
        {user?.provider === "local" && (
          // Google OAuth login
          <DropdownMenuItem onClick={() => (window.location.href = backendUrl)}>
            Link Account
          </DropdownMenuItem>
        )}
        {user?.provider === "google" && (
          <DropdownMenuItem
            onClick={() => navigate(PROTECTED_ROUTES.SET_PASSWORD)}
          >
            Set Password
          </DropdownMenuItem>
        )}
        {user?.provider !== "google" && (
          <DropdownMenuItem
            onClick={() => navigate(PROTECTED_ROUTES.CHANGE_PASSWORD)}
          >
            Change Password
          </DropdownMenuItem>
        )}
        {!user?.enabled2fa && (
          <DropdownMenuItem onClick={() => handleEnable2FA()}>
            Enable 2FA
          </DropdownMenuItem>
        )}
        {user?.enabled2fa && (
          <DropdownMenuItem
            onClick={() => navigate(PROTECTED_ROUTES.CONFIRM_DISABLE_2FA)}
          >
            Disable 2FA
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={logout}>
          Logout
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => navigate(PROTECTED_ROUTES.DELETE_ACCOUNT)}
        >
          <Trash2Icon />
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
