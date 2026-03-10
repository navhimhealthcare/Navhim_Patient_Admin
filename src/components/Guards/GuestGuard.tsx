import { Navigate, Outlet } from "react-router-dom";
import { getLocalStorageItem } from "../../utils/helpers";
import { LOCAL_DATA_STORE } from "../../utils/constants";

export default function GuestGuard({ children }: any) {
  const token = getLocalStorageItem(LOCAL_DATA_STORE.JWT_TOKEN);

  // If user is already logged in, redirect them away from the login/landing page
  if (token) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
