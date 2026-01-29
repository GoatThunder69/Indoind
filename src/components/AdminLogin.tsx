import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { validateAdminPassword, initializeAdminSettings } from "@/lib/adminAuth";

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLogin = ({ onLogin, onBack }: AdminLoginProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize admin settings on mount
    initializeAdminSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Ensure default settings exist before validating (first-run UX).
      await initializeAdminSettings();
      const isValid = await validateAdminPassword(password.trim());
      
      if (isValid) {
        onLogin();
      } else {
        setError("Invalid admin password.");
      }
    } catch (err) {
      setError("Failed to validate password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-pattern">
      <div className="w-full max-w-md animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portal
        </Button>

        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 border border-warning/30 mb-4">
            <ShieldCheck className="w-10 h-10 text-warning" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            Restricted Access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-warning/20 rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-warning" />
                Admin Password
              </label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="xl"
              className="w-full bg-warning text-warning-foreground hover:bg-warning/90"
              disabled={loading || !password.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Access Admin Panel
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Administrative access is logged and monitored
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
