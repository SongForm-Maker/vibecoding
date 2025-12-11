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
        // URL에 access_token이나 error가 있는지 확인 (OAuth 콜백)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasAuthParams = hashParams.has('access_token') || hashParams.has('error');
        
        if (hasAuthParams) {
          console.log('OAuth callback detected, processing...');
          
          // 세션 확인
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
          }
          
          if (session) {
            console.log('Session established successfully');
            // 세션이 있으면 hash를 제거하여 깔끔한 URL 유지
            if (window.location.hash) {
              const cleanUrl = window.location.pathname + window.location.search;
              window.history.replaceState(null, "", cleanUrl);
            }
          }
        } else {
          // 일반 페이지 로드 시에도 세션 확인
          const { data: { session } } = await supabase.auth.getSession();
          if (session && window.location.hash) {
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
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === "SIGNED_IN" && session) {
        console.log('User signed in successfully');
        // 로그인 성공 시 hash 제거
        if (window.location.hash) {
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState(null, "", cleanUrl);
        }
      } else if (event === "SIGNED_OUT") {
        console.log('User signed out');
      } else if (event === "TOKEN_REFRESHED") {
        console.log('Token refreshed');
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
