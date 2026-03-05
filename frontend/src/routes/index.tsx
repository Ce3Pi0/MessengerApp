import BaseLayout from "@/layout/base-layout";
import { Route, Routes } from "react-router-dom";
import { authRoutesPath, protectedRoutesPath } from "./routes";
import AppLayout from "@/layout/app-layout";
import RouteGuard from "./routes-guard";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RouteGuard requiredAuth={false} />}>
        <Route element={<BaseLayout />}>
          {authRoutesPath?.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      <Route path="/" element={<RouteGuard requiredAuth={true} />}>
        <Route element={<AppLayout />}>
          {protectedRoutesPath?.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
