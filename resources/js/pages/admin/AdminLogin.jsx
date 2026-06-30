import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import { isAdminAuthenticated, authenticateAdmin } from '@/lib/adminAuth';
import { adminRoutes } from '@/lib/adminRoutes';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isAdminAuthenticated()) {
    return <Navigate to={adminRoutes.dashboard} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authenticateAdmin(email, password);

    if (!result.ok) {
      setError(result.error || 'Login failed');
      setLoading(false);
      return;
    }

    navigate(adminRoutes.dashboard, { replace: true });
    setLoading(false);
  };

  return (
    <AuthLayout icon={Shield} title="GramUnnati Admin" subtitle="Sign in to the management control room">
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="admin-email" type="email" autoComplete="username" autoFocus placeholder="admin@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="admin-password" type="password" autoComplete="current-password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <Button type="submit" className="h-12 w-full font-medium brand-gradient text-white border-0" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : 'Enter admin panel'}
        </Button>
      </form>
    </AuthLayout>
  );
}
