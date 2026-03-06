import AppWrapper from "@/components/app-wrapper";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <AppWrapper>
      <div className="h-full">
        {/* Chat List */}
        <Outlet />
      </div>
    </AppWrapper>
  );
};

export default AppLayout;
