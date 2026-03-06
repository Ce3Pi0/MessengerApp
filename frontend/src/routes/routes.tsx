import SignIn from "@/pages/auth/sign-in";
import SignUp from "@/pages/auth/sign-up";
import Chats from "@/pages/chat";
import SingleChat from "@/pages/chat/chatId";
import LinkingError from "@/pages/error/linking-error";
import ChangePassword from "@/pages/other/change-password";

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
};

export const PROTECTED_ROUTES = {
  CHAT: "/chat",
  SINGLE_CHAT: "/chat/:chatId",
  LINKING_ERROR: "/linking-error",
  CHANGE_PASSWORD: "/change-password",
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
];

export const isAuthRoute = (pathName: string) => {
  return Object.values(AUTH_ROUTES).includes(pathName);
};
