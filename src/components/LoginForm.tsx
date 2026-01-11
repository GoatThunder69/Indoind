import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateKeyWithDevice, LoginKey } from "@/lib/supabaseDatabase";
import { Shield, Key, AlertCircle, Loader2, Monitor, Smartphone } from "lucide-react";
import { getDeviceInfo } from "@/lib/deviceFingerprint";

interface LoginFormProps {
  onLogin: (key: LoginKey) => void;
  onAdminClick: () => void;
}

const LoginForm = ({ onLogin, onAdminClick }: LoginFormProps) => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ count?: number; max?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDeviceInfo(null);
    setLoading(true);

    const result = await validateKeyWithDevice(key.trim());
    
    if (result.success && result.key) {
      setDeviceInfo({ count: result.deviceCount, max: result.maxDevices });
      onLogin(result.key);
    } else {
      setError(result.error || "Invalid access key. Please try again.");
      if (result.deviceCount && result.maxDevices) {
        setDeviceInfo({ count: result.deviceCount, max: result.maxDevices });
      }
    }
    setLoading(false);
  };

  const currentDevice = getDeviceInfo();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-pattern">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-4 animate-pulse-glow">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground text-glow">
            CFMS Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Secure Access Gateway
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                Access Key
              </label>
              <Input
                type="password"
                placeholder="Enter your access key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="font-mono"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{error}</p>
                  {deviceInfo && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Devices registered: {deviceInfo.count}/{deviceInfo.max}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="glow"
              size="xl"
              className="w-full"
              disabled={loading || !key.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Access Portal
                </>
              )}
            </Button>
          </form>

          {/* Device Info */}
          <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {currentDevice.device === 'Mobile' ? (
                <Smartphone className="w-3 h-3" />
              ) : (
                <Monitor className="w-3 h-3" />
              )}
              <span>
                {currentDevice.browser} on {currentDevice.os}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-primary"
              onClick={onAdminClick}
            >
              Admin Access
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          Protected by CFMS Security Protocol
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
