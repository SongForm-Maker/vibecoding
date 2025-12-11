import { supabase, type SongForm } from "./supabase";

/**
 * 악보 이름으로 song form을 저장합니다
 */
export async function saveSongForm(
  songName: string,
  structure: string[],
  lyrics: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User must be logged in" };
    }

    const { error } = await supabase
      .from("song_forms")
      .upsert(
        {
          song_name: songName,
          structure: structure,
          lyrics: lyrics,
          user_id: user.id,
        },
        {
          onConflict: "song_name,user_id",
        }
      );

    if (error) {
      console.error("Error saving song form:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 현재 사용자의 모든 song form 목록을 조회합니다
 */
export async function getAllSongForms(): Promise<{
  success: boolean;
  data?: SongForm[];
  error?: string;
}> {
  try {
    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User must be logged in" };
    }

    // RLS가 자동으로 현재 사용자의 데이터만 반환합니다
    const { data, error } = await supabase
      .from("song_forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching song forms:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 악보 이름으로 song form을 조회합니다 (현재 사용자의 것만)
 */
export async function getSongFormByName(
  songName: string
): Promise<{
  success: boolean;
  data?: SongForm;
  error?: string;
}> {
  try {
    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User must be logged in" };
    }

    // RLS가 자동으로 현재 사용자의 데이터만 반환합니다
    const { data, error } = await supabase
      .from("song_forms")
      .select("*")
      .eq("song_name", songName)
      .single();

    if (error) {
      console.error("Error fetching song form:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || undefined };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * song form을 삭제합니다 (현재 사용자의 것만)
 */
export async function deleteSongForm(
  songName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User must be logged in" };
    }

    // RLS가 자동으로 현재 사용자의 데이터만 삭제합니다
    const { error } = await supabase
      .from("song_forms")
      .delete()
      .eq("song_name", songName);

    if (error) {
      console.error("Error deleting song form:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

