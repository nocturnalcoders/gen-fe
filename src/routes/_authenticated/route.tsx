import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api } from "@/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = await api.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth", search: { redirect: window.location.pathname } });
    }
    return { user: session.user };
  },
  component: () => <Outlet />,
});
