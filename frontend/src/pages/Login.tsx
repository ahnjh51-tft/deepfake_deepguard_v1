import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import deepguardLogo from "@/assets/deepguard-logo.png";

const SAMPLE_HINTS = [
  { label: "管理者", email: "admin@deepguard.jp", password: "Admin#123" },
  { label: "利用者", email: "user@deepguard.jp", password: "User#123" },
];

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "ログイン成功", description: "ようこそ DEEPGUARD へ" });
    } catch (error) {
      toast({
        title: "ログイン失敗",
        description: error instanceof Error ? error.message : "認証に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D8E7FF] via-white to-[#E0FBFF] px-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-intel-pale-blue/60">
        <CardHeader className="space-y-2 text-center">
          <img src={deepguardLogo} alt="DeepGuard" className="w-20 h-20 mx-auto" />
          <CardTitle className="text-2xl font-bold text-intel-dark-blue">DEEPGUARD ログイン</CardTitle>
          <CardDescription className="text-foreground/70">
            管理者と利用者のサンプルアカウントでログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/70">メールアドレス</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="border-intel-pale-blue/60 focus:border-intel-medium-blue focus:ring-intel-medium-blue"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/70">パスワード</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="border-intel-pale-blue/60 focus:border-intel-medium-blue focus:ring-intel-medium-blue"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-intel-medium-blue hover:bg-intel-dark-blue text-white font-semibold"
              disabled={loading}
            >
              {loading ? "認証中..." : "ログイン"}
            </Button>
          </form>
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground/60 mb-2">サンプルアカウント</p>
            <div className="space-y-2">
              {SAMPLE_HINTS.map((hint) => (
                <div
                  key={hint.email}
                  className="p-3 rounded-lg bg-intel-pale-blue/20 border border-intel-pale-blue/60"
                >
                  <p className="text-xs text-foreground/60">{hint.label}</p>
                  <p className="text-sm font-medium text-intel-medium-blue break-all">{hint.email}</p>
                  <p className="text-xs text-foreground/60">PW: {hint.password}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
