import { createClient } from "@supabase/supabase-js";

// Supabase 프로젝트 설정
const supabaseUrl = "https://dlybuimbtisewglpwnem.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRseWJ1aW1idGlzZXdnbHB3bmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjQxMzQsImV4cCI6MjA4MDE0MDEzNH0.2WpDHxIYXp9UYMn22N_HHQ-oTyf2wng-72V6HCEDElA";

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// 타입 정의
export interface SongForm {
  id?: string;
  user_id?: string;
  song_name: string;
  structure: string[];
  lyrics: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

// 인증 관련 함수
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    
    if (error) {
      console.error("OAuth error:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Unexpected OAuth error:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

