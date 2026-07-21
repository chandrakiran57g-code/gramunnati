import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Phone, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import MathCaptcha, { validateCaptchaOrThrow } from "@/components/shared/MathCaptcha";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!captchaValid) {
      setError("Please solve the captcha correctly");
      return;
    }
    setLoading(true);
    try {
      validateCaptchaOrThrow(captchaToken, captchaAnswer);
      await login(mobile, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid mobile or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      showPublicChrome
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in with your mobile number"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="mobile"
              type="tel"
              autoComplete="tel"
              autoFocus
              placeholder="9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password *</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <MathCaptcha
          onValidChange={(ok, token, answer) => {
            setCaptchaValid(ok);
            setCaptchaToken(token);
            setCaptchaAnswer(answer);
          }}
        />

        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || !captchaValid}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
