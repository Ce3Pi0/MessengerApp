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
import { OTHER_ROUTES, PROTECTED_ROUTES } from "@/routes/routes";

const UserDropdown = () => {
  const navigate = useNavigate();

  const BASE_URL =
    import.meta.env.MODE === "development" ? import.meta.env.VITE_API_URL : "/";
  const backendUrl =
    import.meta.env.MODE === "development"
      ? BASE_URL + "/api/v1/auth/google"
      : "/api/v1/auth/google";

  const { user, logout, enable2fa, disable2fa } = useAuth();

  const isOnline = isUserOnline(user?._id);

  const handleEnable2FA = async () => {
    const res = await enable2fa();
    if (res) navigate(PROTECTED_ROUTES.ENABLE_2FA);
  };

  const handleDisable2FA = async () => {
    const res = await disable2fa();
    if (res) navigate(OTHER_ROUTES.ROOT);
  };

  return (
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
      <DropdownMenuContent className="w-48 rounded-lg z-99999" align="end">
        <DropdownMenuLabel className="flex flex-row justify-between">
          <p>{user?.name}</p>
          <LogoType provider={user?.provider || "local"} />
        </DropdownMenuLabel>
        <hr />
        {user?.provider === "local" && (
          // Google OAuth login
          <DropdownMenuItem onClick={() => (window.location.href = backendUrl)}>
            Link Account
          </DropdownMenuItem>
        )}
        {/* TODO: Implement UI and logic */}
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
          <DropdownMenuItem onClick={() => handleDisable2FA()}>
            Disable 2FA
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={logout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
