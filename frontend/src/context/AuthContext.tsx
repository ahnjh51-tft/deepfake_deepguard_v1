import { createContext, useContext, useMemo, useState } from "react";

type Role = "admin" | "user";

interface Account {
  email: string;
  password: string;
  role: Role;
  name: string;
}

export interface AuthUser {
  email: string;
  role: Role;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const SAMPLE_ACCOUNTS: Account[] = [
  {
    email: "admin@deepguard.jp",
    password: "Admin#123",
    role: "admin",
    name: "管理者アカウント",
  },
  {
    email: "user@deepguard.jp",
    password: "User#123",
    role: "user",
    name: "利用者アカウント",
  },
];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, password: string) => {
    const account = SAMPLE_ACCOUNTS.find(
      (acc) => acc.email === email.trim().toLowerCase() && acc.password === password
    );
    if (!account) {
      throw new Error("メールアドレスまたはパスワードが正しくありません。");
    }
    setUser({ email: account.email, role: account.role, name: account.name });
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

