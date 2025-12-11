import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Music2, ArrowLeft, Copy, Check, Download, Save, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { saveSongForm, getSongFormByName } from "@/lib/songFormApi";

interface LocationState {
  songName?: string;
  structure: string[];
  lyrics: Record<string, string>;
}

const FinalSong = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signIn, signOut } = useAuth();
  const state = location.state as LocationState | null;
  const [copied, setCopied] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // 가사 수정을 위한 상태
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedLyrics, setEditedLyrics] = useState<Record<string, string>>({});
  const [tempEditValue, setTempEditValue] = useState("");

  useEffect(() => {
    if (!state?.structure || !state?.lyrics) {
      navigate("/");
      return;
    }
    // 초기 가사 상태를 editedLyrics에 복사
    if (state.lyrics && Object.keys(editedLyrics).length === 0) {
      setEditedLyrics({ ...state.lyrics });
    }
  }, [state, navigate]);

  const handleBack = () => {
    // 수정된 가사가 있으면 그것을 전달, 없으면 원본 가사 전달
    const lyricsToPass = Object.keys(editedLyrics).length > 0 
      ? editedLyrics 
      : state?.lyrics || {};
    
    navigate("/lyrics", { 
      state: { 
        songName: state?.songName,
        structure: state?.structure,
        lyrics: lyricsToPass,
      } 
    });
  };

  // 가사 편집 시작
  const handleStartEdit = (section: string) => {
    const currentLyrics = editedLyrics[section] || state?.lyrics[section] || "";
    setTempEditValue(currentLyrics);
    setEditingSection(section);
  };

  // 가사 편집 취소
  const handleCancelEdit = () => {
    setEditingSection(null);
    setTempEditValue("");
  };

  // 가사 편집 저장
  const handleSaveEdit = (section: string) => {
    setEditedLyrics((prev) => ({
      ...prev,
      [section]: tempEditValue,
    }));
    setEditingSection(null);
    setTempEditValue("");
    toast.success(`Lyrics for "${section}" updated`);
  };

  const handleCopyAll = () => {
    if (!state) return;

    // 수정된 가사가 있으면 그것을 사용, 없으면 원본 사용
    const lyricsToUse = Object.keys(editedLyrics).length > 0 
      ? editedLyrics 
      : state.lyrics;

    const fullSong = state.structure
      .map((section) => {
        const sectionLyrics = lyricsToUse[section];
        if (sectionLyrics && sectionLyrics.trim()) {
          return `[${section}]\n${sectionLyrics}`;
        }
        return `[${section}]`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(fullSong);
    setCopied(true);
    toast.success("Full song copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getLyricsOnlyText = () => {
    if (!state) return "";
    
    // 수정된 가사가 있으면 그것을 사용, 없으면 원본 사용
    const lyricsToUse = Object.keys(editedLyrics).length > 0 
      ? editedLyrics 
      : state.lyrics;
    
    const lyricsParts: string[] = [];
    
    state.structure.forEach((section, index) => {
      const sectionLower = section.toLowerCase();
      
      // interlude 섹션 처리
      if (sectionLower === "interlude") {
        // interlude 앞에 빈 줄 추가 (이전 섹션이 있고 내용이 있는 경우)
        if (lyricsParts.length > 0 && lyricsParts[lyricsParts.length - 1].trim().length > 0) {
          lyricsParts.push("");
        }
        lyricsParts.push("[interlude]");
        // interlude 뒤에 빈 줄 추가
        lyricsParts.push("");
        return;
      }
      
      // 일반 섹션 처리
      const sectionLyrics = lyricsToUse[section];
      if (sectionLyrics && sectionLyrics.trim()) {
        // 이전 섹션이 interlude가 아니었다면 빈 줄 추가
        if (index > 0) {
          const prevSection = state.structure[index - 1].toLowerCase();
          if (prevSection !== "interlude" && lyricsParts.length > 0 && lyricsParts[lyricsParts.length - 1].trim().length > 0) {
            lyricsParts.push("");
          }
        }
        lyricsParts.push(sectionLyrics);
      }
    });
    
    // 맨 첫 줄에 Song Name 추가, 그 다음 빈 줄
    const songName = state.songName?.trim() || "Song";
    const lyricsText = lyricsParts.join("\n");
    return `${songName}\n\n${lyricsText}`;
  };

  const handleDownload = () => {
    if (!state) return;

    const lyricsOnly = getLyricsOnlyText();
    const blob = new Blob([lyricsOnly], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // 파일명: song_name_날짜 형식
    const songName = state.songName?.trim() || "song";
    const date = new Date().toISOString().split("T")[0];
    const fileName = `${songName}_${date}.txt`;
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Song downloaded as text file");
  };

  const handleSave = async () => {
    if (!state || !user) {
      toast.error("Please log in to save your song");
      return;
    }

    if (!state.songName || !state.songName.trim()) {
      toast.error("Please enter a song name");
      return;
    }

    setIsSaving(true);

    try {
      // 기존 파일 확인
      const existingSong = await getSongFormByName(state.songName.trim());
      
      if (existingSong.success && existingSong.data) {
        // 기존 파일이 있으면 업데이트 확인 다이얼로그 표시
        setShowUpdateDialog(true);
        setIsSaving(false);
        return;
      }

      // 기존 파일이 없으면 바로 저장
      await performSave();
    } catch (error) {
      console.error("Error checking existing song:", error);
      toast.error("Failed to check existing song");
      setIsSaving(false);
    }
  };

  const performSave = async () => {
    if (!state) return;

    setIsSaving(true);
    setShowUpdateDialog(false);

    try {
      // 수정된 가사가 있으면 그것을 사용, 없으면 원본 사용
      const lyricsToSave = Object.keys(editedLyrics).length > 0 
        ? editedLyrics 
        : state.lyrics;

      const result = await saveSongForm(
        state.songName!.trim(),
        state.structure,
        lyricsToSave
      );

      if (result.success) {
        toast.success("Song saved successfully!");
        // 저장 후 editedLyrics를 업데이트하여 원본과 동기화
        setEditedLyrics(lyricsToSave);
      } else {
        toast.error(result.error || "Failed to save song");
      }
    } catch (error) {
      console.error("Error saving song:", error);
      toast.error("Failed to save song");
    } finally {
      setIsSaving(false);
    }
  };

  if (!state?.structure || !state?.lyrics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-music-bg-subtle to-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Login/Logout UI */}
        <div className="flex justify-end items-center gap-4 mb-4">
          {loading ? (
            <span className="text-muted-foreground text-sm">Loading...</span>
          ) : user ? (
            <>
              <span className="text-muted-foreground text-sm">{user.email}</span>
              <Button 
                onClick={async () => {
                  try {
                    await signOut();
                    toast.success("Logged out successfully");
                  } catch (error) {
                    toast.error("Failed to log out");
                  }
                }} 
                variant="outline" 
                size="sm"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              onClick={async () => {
                try {
                  await signIn();
                  // OAuth는 리디렉션되므로 여기서는 메시지 표시 안 함
                } catch (error) {
                  toast.error("Failed to sign in. Please check if Google OAuth is enabled in Supabase.");
                }
              }} 
              variant="outline" 
              size="sm"
            >
              Login with Google
            </Button>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lyrics
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-music-primary to-music-accent">
              <Music2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-music-primary to-music-accent bg-clip-text text-transparent leading-normal pb-2">
                Final Song
              </h1>
              <p className="text-muted-foreground">
                Your complete song with structure
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {user && (
              <Button
                onClick={handleSave}
                disabled={isSaving || !state?.songName}
                variant="outline"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save to Database"}
              </Button>
            )}
            <Button
              onClick={handleDownload}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download as Text
            </Button>
            <Button
              onClick={handleCopyAll}
              className="gap-2 bg-gradient-to-r from-music-primary to-music-accent hover:opacity-90 transition-opacity"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Full Song
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Final Song Display */}
        <Card className="max-w-4xl mx-auto p-8 shadow-lg border-2 backdrop-blur-sm bg-card/95">
          {state.songName && (
            <>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {state.songName}
              </h2>
              <div className="border-b border-border mb-6" />
            </>
          )}
          <div className="space-y-6">
            {state.structure.map((section, index) => {
              // 수정된 가사가 있으면 그것을 사용, 없으면 원본 사용
              const currentLyrics = editedLyrics[section] !== undefined 
                ? editedLyrics[section] 
                : state.lyrics[section];
              const isEditing = editingSection === section;
              
              return (
                <div
                  key={index}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-music-primary/20 to-music-accent/20 border-2 border-music-primary/30 flex items-center justify-center">
                        <span className="font-mono text-xs font-bold text-music-primary">
                          {index + 1}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-music-primary">
                        [{section}]
                      </h2>
                    </div>
                    {/* Edit Button */}
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(section)}
                        className="gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                    )}
                  </div>

                  {/* Section Lyrics - Edit Mode or View Mode */}
                  {isEditing ? (
                    <div className="pl-11 space-y-3">
                      <Textarea
                        value={tempEditValue}
                        onChange={(e) => setTempEditValue(e.target.value)}
                        className="min-h-[200px] font-mono text-sm resize-y border-2 focus:border-music-primary transition-colors"
                        placeholder={`Enter lyrics for section "${section}"...`}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(section)}
                          className="gap-2 bg-gradient-to-r from-music-primary to-music-accent hover:opacity-90"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : currentLyrics && currentLyrics.trim() ? (
                    <div className="pl-11 space-y-1">
                      {currentLyrics.split("\n").map((line, lineIndex) => (
                        <p
                          key={lineIndex}
                          className="text-foreground font-mono text-sm leading-relaxed"
                        >
                          {line || "\u00A0"}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-11">
                      <p className="text-muted-foreground italic text-sm">
                        (instrumental)
                      </p>
                    </div>
                  )}

                  {/* Spacer between sections */}
                  {index < state.structure.length - 1 && (
                    <div className="h-6" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Stats Card */}
        <Card className="max-w-4xl mx-auto mt-8 p-6 bg-music-bg-subtle/50 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Song Statistics
              </h3>
              <p className="text-sm text-muted-foreground">
                {state.structure.length} sections total
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total lines</p>
              <p className="text-2xl font-bold text-music-primary">
                {state.structure.reduce((total, section) => {
                  // 수정된 가사가 있으면 그것을 사용, 없으면 원본 사용
                  const sectionLyrics = editedLyrics[section] !== undefined 
                    ? editedLyrics[section] 
                    : state.lyrics[section];
                  if (!sectionLyrics) return total;
                  return (
                    total +
                    sectionLyrics.split("\n").filter((line) => line.trim()).length
                  );
                }, 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* Update Confirmation Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Existing Song?</DialogTitle>
              <DialogDescription>
                A song with the name "{state?.songName}" already exists. Do you want to update it with the current content?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpdateDialog(false);
                  setIsSaving(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={performSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-music-primary to-music-accent hover:opacity-90"
              >
                {isSaving ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FinalSong;
