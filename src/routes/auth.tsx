import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Compass } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — CareerFit India" },
      {
        name: "description",
        content: "Sign in to analyze your resume and track job applications across India.",
      },
      { property: "og:title", content: "Sign in — CareerFit India" },
      { property: "og:description", content: "Access your resume analysis and job matches." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (
        data.session ||
        (typeof window !== "undefined" &&
          window.localStorage.getItem("careerfit_demo_auth") === "true")
      ) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
  }, [navigate]);

  async function quickDemoLogin() {
    setBusy(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("careerfit_demo_auth", "true");
    }
    setBusy(false);
    toast.success("Welcome! Logged in as Demo Candidate.");
    navigate({ to: "/dashboard", replace: true });
  }

  async function signIn() {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setBusy(true);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("careerfit_demo_auth");
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in successfully!");
    navigate({ to: "/dashboard", replace: true });
  }

  async function signUp() {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setBusy(true);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("careerfit_demo_auth");
    }
    const signUpOptions: { emailRedirectTo?: string; data: { full_name: string } } = {
      data: { full_name: fullName },
    };
    if (typeof window !== "undefined") {
      signUpOptions.emailRedirectTo = window.location.origin;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: signUpOptions,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success("Account created! Please check your email for a confirmation link.");
      return;
    }
    toast.success("Account created and signed in!");
    navigate({ to: "/dashboard", replace: true });
  }

  async function google() {
    setBusy(true);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("careerfit_demo_auth");
    }
    const redirectUrl = typeof window !== "undefined" ? window.location.origin : undefined;
    const lovableOptions = redirectUrl ? { redirect_uri: redirectUrl } : {};

    try {
      // Try Lovable auth first
      const lovableResult = await lovable.auth.signInWithOAuth("google", lovableOptions);

      if (lovableResult?.error) {
        const errMsg = typeof lovableResult.error === "object" && lovableResult.error !== null && "message" in lovableResult.error
          ? (lovableResult.error as { message: string }).message
          : String(lovableResult.error);
        
        if (errMsg.includes("missing OAuth secret") || errMsg.includes("Unsupported provider")) {
          toast.error("Google OAuth is not configured on this Supabase project. Please sign in with Email or use Instant Demo Access.");
        } else {
          toast.error(errMsg);
        }
      }
    } catch {
      // Fallback to Supabase direct OAuth
      const supabaseOptions = redirectUrl ? { redirectTo: redirectUrl } : {};
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: supabaseOptions,
      });
      if (error) {
        const msg = error.message || String(error);
        if (msg.includes("missing OAuth secret") || msg.includes("Unsupported provider")) {
          toast.error("Google OAuth is not configured in Supabase. Please use Email or Instant Demo Access.");
        } else {
          toast.error(msg);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <Compass className="size-5" />
          </span>
          <span className="font-display text-base font-semibold">
            CareerFit <span className="text-primary">India</span>
          </span>
        </Link>

        <h1 className="mb-2 text-center font-display text-2xl font-semibold">
          Sign in to CareerFit India
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Analyze your resume, match jobs and internships, and track applications across India.
        </p>

        <div className="surface-panel space-y-4 rounded-2xl p-6">
          <Button
            size="lg"
            className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
            disabled={busy}
            onClick={quickDemoLogin}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "⚡ Instant Demo Access (1-Click)"
            )}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or sign in with credentials
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={busy} onClick={signIn}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Sign in
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-up">Email</Label>
                <Input
                  id="email-up"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-up">Password</Label>
                <Input
                  id="password-up"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <Button className="w-full" disabled={busy} onClick={signUp}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Create account
              </Button>
            </TabsContent>
          </Tabs>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" disabled={busy} onClick={google}>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
