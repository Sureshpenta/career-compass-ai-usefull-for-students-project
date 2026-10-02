import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (
      typeof window !== "undefined" &&
      window.localStorage.getItem("careerfit_demo_auth") === "true"
    ) {
      return {
        user: {
          id: "00000000-0000-0000-0000-000000000000",
          email: "demo@careerfit.in",
          user_metadata: { full_name: "Demo Candidate" },
        },
      };
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
