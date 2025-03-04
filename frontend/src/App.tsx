import { Routes, Route, useLocation } from "react-router-dom";
import { Outlet, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { useMe } from "./hooks/auth.hooks";

/* Pages */
import HomePage from "@/Pages/Home.page";
import AppSidebar from "@/Components/layout/Sidebar";
import FeedPage from "./Pages/Feed.page";
import LoginPage from "./Pages/Login.page";
import LogoutPage from "./Pages/Logout.page";
import CreatePostPage from "./Pages/Create-post.page";
import EditProfile from "./Pages/EditProfile";
import ProfilePage from "./Pages/ProfilePage";

/**
 * Routes that should not show the sidebar
 */
const HIDE_SIDEBAR_ROUTES = ["/login"];

/**
 * A router that protects the routes it wraps by checking if the user is authenticated.
 *
 */
function AuthenticatedRouter() {
  const { data, isPending } = useMe();

  if (isPending) return "loading..."; // TODO: better loading view

  if (!data?.authenticated || !data.user) return <Navigate to="/login" />;

  return <Outlet />;
}

/**
 * A router that protects the routes it wraps by checking if the user is unauthenticated.
 *
 */
function UnauthenticatedRouter() {
  const { data, isPending } = useMe();

  if (isPending) return "loading..."; // TODO: better loading view

  if (data?.authenticated || data?.user) return <Navigate to="/feed" />;

  return <Outlet />;
}

/**
 * The main application component.
 */
function App() {
  const { pathname } = useLocation();

  const shouldShowSidebar = useMemo(
    () => !HIDE_SIDEBAR_ROUTES.includes(pathname),
    [pathname]
  );

  return (
    <div className="w-screen h-screen flex flex-row flex-nowrap justify-start">
      {shouldShowSidebar && <AppSidebar />}
      <main className="grow bg-amber-200 h-screen flex flex-col flex-nowrap overflow-x-hidden overflow-y-auto">
        <Routes>
          <Route index element={<HomePage />} />
          <Route element={<AuthenticatedRouter />}>
            <Route path="/post" element={<CreatePostPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<UnauthenticatedRouter />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route path="*" element={<div>404 - Not found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
