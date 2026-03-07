import Confirm2fa from "@/pages/auth/confirm-2fa";
import Enable2fa from "@/pages/auth/enable-2fa";
import ForgotPassword from "@/pages/auth/forgot-password";
import SignIn from "@/pages/auth/sign-in";
import SignUp from "@/pages/auth/sign-up";
import Verify2fa from "@/pages/auth/verify-2fa";
import Chats from "@/pages/chat";
import SingleChat from "@/pages/chat/chatId";
import LinkingError from "@/pages/error/linking-error";
import ChangePassword from "@/pages/other/change-password";
import SetPassword from "@/pages/other/set-password";

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_2FA: "/2fa",
};

export const PROTECTED_ROUTES = {
  CHAT: "/chat",
  SINGLE_CHAT: "/chat/:chatId",
  LINKING_ERROR: "/linking-error",
  CHANGE_PASSWORD: "/change-password",
  SET_PASSWORD: "/set-password",
  ENABLE_2FA: "/enable-2fa",
  VERIFY_2FA: "/verify-2fa",
};

export const OTHER_ROUTES = {
  ROOT: "/",
  NOT_FOUND: "*",
};

export const authRoutesPath = [
  {
    path: AUTH_ROUTES.SIGN_IN,
    element: <SignIn />,
  },
  {
    path: AUTH_ROUTES.SIGN_UP,
    element: <SignUp />,
  },
  {
    path: AUTH_ROUTES.FORGOT_PASSWORD,
    element: <ForgotPassword />,
  },
  {
    path: AUTH_ROUTES.VERIFY_2FA,
    element: <Confirm2fa />,
  },
];

export const protectedRoutesPath = [
  {
    path: PROTECTED_ROUTES.CHAT,
    element: <Chats />,
  },
  {
    path: PROTECTED_ROUTES.SINGLE_CHAT,
    element: <SingleChat />,
  },
  {
    path: PROTECTED_ROUTES.LINKING_ERROR,
    element: <LinkingError />,
  },
  {
    path: PROTECTED_ROUTES.CHANGE_PASSWORD,
    element: <ChangePassword />,
  },
  {
    path: PROTECTED_ROUTES.SET_PASSWORD,
    element: <SetPassword />,
  },
  {
    path: PROTECTED_ROUTES.ENABLE_2FA,
    element: <Enable2fa />,
  },
  {
    path: PROTECTED_ROUTES.VERIFY_2FA,
    element: <Verify2fa />,
  },
];

export const isAuthRoute = (pathName: string) => {
  return Object.values(AUTH_ROUTES).includes(pathName);
};
