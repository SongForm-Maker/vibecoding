import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, onAuthStateChange, getCurrentUser, signInWithGoogle, signOut } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 사용자 확인
    getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("Error signing in:", error);
        // 에러를 throw하지 않고 로그만 남김 (OAuth는 리디렉션되므로)
        return;
      }
      // OAuth는 리디렉션되므로 여기서는 아무것도 하지 않음
    } catch (error) {
      console.error("Sign in failed:", error);
      // 에러를 throw하지 않고 로그만 남김
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Error signing out:", error);
        // 에러를 throw하지 않고 로그만 남김
      }
    } catch (error) {
      console.error("Sign out failed:", error);
      // 에러를 throw하지 않고 로그만 남김
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

