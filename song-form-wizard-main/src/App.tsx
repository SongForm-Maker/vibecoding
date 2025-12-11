import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index";
import Lyrics from "./pages/Lyrics";
import FinalSong from "./pages/FinalSong";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// OAuth 콜백 처리
const AuthCallbackHandler = () => {
  useEffect(() => {
    // 페이지 로드 시 세션 확인 및 URL 정리
    const handleAuthCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // 세션이 있으면 hash를 제거하여 깔끔한 URL 유지
          if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      } catch (error) {
        console.error("Error handling auth callback:", error);
      }
    };

    handleAuthCallback();

    // OAuth 콜백 이벤트 처리
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // 로그인 성공 시 hash 제거
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthCallbackHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lyrics" element={<Lyrics />} />
            <Route path="/final" element={<FinalSong />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
