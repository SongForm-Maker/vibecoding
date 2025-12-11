import { createClient } from "@supabase/supabase-js";

// Supabase 프로젝트 설정
const supabaseUrl = "https://tmdphdzhenjjdgjwlgby.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZHBoZHpoZW5qamRnandsZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MzE4MzUsImV4cCI6MjA4MTAwNzgzNX0.TwW--KcGakzrkw33Jyf2CMH0sHIlBZgUwgy_5WwPNDM";

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
    // 현재 URL의 origin을 안전하게 가져오기
    const redirectTo = typeof window !== 'undefined' 
      ? `${window.location.origin}/`
      : 'http://localhost:8080/';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
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
    
    // OAuth는 리디렉션되므로 data.url이 있으면 리디렉션됨
    if (data?.url) {
      // 리디렉션은 Supabase가 자동으로 처리
      return { data, error: null };
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

