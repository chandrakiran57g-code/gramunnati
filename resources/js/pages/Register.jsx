import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User, Phone, CheckCircle, Briefcase, MapPin } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import MathCaptcha, { validateCaptchaOrThrow } from "@/components/shared/MathCaptcha";
import { useGeoPickers } from "@/hooks/useGeoPickers";
import { isValidEmail, isValidIndianMobile, normalizeMobile } from "@/lib/formValidation";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [mandalName, setMandalName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const geo = useGeoPickers();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!isValidIndianMobile(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    if (email.trim() && !isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (!geo.geoIds.state_id || !geo.geoIds.district_id) {
      setError("Please select your state and district");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!captchaValid) {
      setError("Please solve the captcha correctly");
      return;
    }

    setLoading(true);
    try {
      validateCaptchaOrThrow(captchaToken, captchaAnswer);
      const data = await register({
        email: email || undefined,
        password,
        fullName,
        mobile: normalizeMobile(mobile),
        profession: profession.trim() || undefined,
        stateId: geo.geoIds.state_id,
        districtId: geo.geoIds.district_id,
        mandalName: mandalName.trim() || undefined,
      });

      if (data?.user && !data?.session) {
        setSuccess(true);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        icon={CheckCircle}
        title="Check your email"
        subtitle={email ? `We sent a confirmation link to ${email}` : "Account created successfully"}
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {email ? "Click the link in the email to verify your account." : "You can now log in with your mobile number."}
          </p>
          <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
            Back to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
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
          <Label htmlFor="fullName">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="fullName"
              type="text"
              autoFocus
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="mobile"
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profession">Profession</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="profession"
              type="text"
              placeholder="e.g. Teacher, Farmer, Engineer"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <select
              id="state"
              value={geo.stateId}
              onChange={(e) => geo.setStateId(e.target.value)}
              className="w-full h-12 rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              <option value="">Select state</option>
              {geo.states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District *</Label>
            <select
              id="district"
              value={geo.districtId}
              onChange={(e) => geo.setDistrictId(e.target.value)}
              className="w-full h-12 rounded-md border border-input bg-background px-3 text-sm"
              required
              disabled={!geo.stateId}
            >
              <option value="">Select district</option>
              {geo.districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mandal">Mandal (optional)</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="mandal"
              type="text"
              placeholder="Enter your mandal name"
              value={mandalName}
              onChange={(e) => setMandalName(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
