import SignIn from "@/pages/auth/sign-in";
import SignUp from "@/pages/auth/sign-up";
import Chats from "@/pages/chat";
import SingleChat from "@/pages/chat/chatId";

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
};

export const PROTECTED_ROUTES = {
  CHAT: "/chat",
  SINGLE_CHAT: "/chat/:chatId",
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
];

export const isAuthRoute = (pathName: string) => {
  return Object.values(AUTH_ROUTES).includes(pathName);
};
