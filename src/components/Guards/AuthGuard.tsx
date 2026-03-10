import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getLocalStorageItem } from "../../utils/helpers";
import { LOCAL_DATA_STORE } from "../../utils/constants";

export default function AuthGuard({ children }: any) {
  const token = getLocalStorageItem(LOCAL_DATA_STORE.JWT_TOKEN);
  const location = useLocation();

  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
