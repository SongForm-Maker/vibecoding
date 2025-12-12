import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Music2, Plus, Trash2, ArrowRight, FileText, GripVertical, X, Check, Pencil, FolderOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAllSongForms, type SongForm } from "@/lib/songFormApi";

interface LocationState {
  songName?: string;
  structure?: string[];
  lyrics?: Record<string, string>;
}

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signIn, signOut } = useAuth();
  const [songName, setSongName] = useState("");
  const [structure, setStructure] = useState("");
  const [parsedStructure, setParsedStructure] = useState<string[]>([]);
  const [previousLyrics, setPreviousLyrics] = useState<Record<string, string> | undefined>(undefined);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedSongs, setSavedSongs] = useState<SongForm[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Lyrics 페이지에서 돌아왔을 때 기존 내용 복원
  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state) {
      if (state.songName) {
        setSongName(state.songName);
      }
      if (state.structure && state.structure.length > 0) {
        setParsedStructure(state.structure);
        // structure 문자열도 복원
        const structureString = state.structure.join(", ");
        setStructure(structureString);
      }
      // 이전에 작성한 가사가 있으면 저장
      if (state.lyrics) {
        setPreviousLyrics(state.lyrics);
      }
      // state를 사용했으므로 초기화 (다음 방문 시 중복 방지)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleStructureChange = (value: string) => {
    setStructure(value);
    
    // Parse the structure input - support dash, comma, and space as separators
    // Also convert numbers: 1=intro, 2=interlude, 3=outro
    const sections = value
      .split(/[-,\s]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => {
        if (s === '1') return 'intro';
        if (s === '2') return 'interlude';
        if (s === '3') return 'outro';
        return s;
      });
    
    setParsedStructure(sections);
  };

  const handleClear = () => {
    setStructure("");
    setParsedStructure([]);
    toast.success("Structure cleared");
  };

  const handleCopy = () => {
    if (structure) {
      navigator.clipboard.writeText(structure);
      toast.success("Structure copied to clipboard");
    }
  };

  const handleAddSection = (sectionName: string) => {
    const newStructure = structure 
      ? `${structure}, ${sectionName.toLowerCase()}`
      : sectionName.toLowerCase();
    handleStructureChange(newStructure);
  };

  const handleNext = () => {
    if (parsedStructure.length === 0) {
      toast.error("Please enter a song structure first");
      return;
    }
    
    navigate("/lyrics", { 
      state: { 
        songName, 
        structure: parsedStructure,
        lyrics: previousLyrics, // 이전에 작성한 가사가 있으면 함께 전달
      } 
    });
  };

  // Structure Preview 관련 함수들
  const updateStructureFromArray = (newArray: string[]) => {
    setParsedStructure(newArray);
    // structure 문자열도 업데이트
    const newStructure = newArray.join(", ");
    setStructure(newStructure);
  };

  const handleDeleteSection = (index: number) => {
    const newArray = parsedStructure.filter((_, i) => i !== index);
    updateStructureFromArray(newArray);
    toast.success("Section deleted");
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(parsedStructure[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (!editValue.trim()) {
      toast.error("Section name cannot be empty");
      return;
    }
    const newArray = [...parsedStructure];
    newArray[index] = editValue.trim();
    updateStructureFromArray(newArray);
    setEditingIndex(null);
    setEditValue("");
    toast.success("Section updated");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newArray = [...parsedStructure];
    const draggedItem = newArray[draggedIndex];
    newArray.splice(draggedIndex, 1);
    newArray.splice(dropIndex, 0, draggedItem);
    updateStructureFromArray(newArray);
    setDraggedIndex(null);
    toast.success("Section reordered");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 저장된 곡 불러오기
  const handleLoadSaved = async () => {
    if (!user) {
      toast.error("Please log in to load saved songs");
      return;
    }

    setLoadingSongs(true);
    setShowLoadDialog(true);
    setSearchQuery(""); // 다이얼로그 열 때 검색어 초기화

    try {
      const result = await getAllSongForms();
      if (result.success && result.data) {
        setSavedSongs(result.data);
        if (result.data.length === 0) {
          toast.info("No saved songs found");
        }
      } else {
        toast.error(result.error || "Failed to load saved songs");
      }
    } catch (error) {
      console.error("Error loading songs:", error);
      toast.error("Failed to load saved songs");
    } finally {
      setLoadingSongs(false);
    }
  };

  // 검색어로 악보 필터링
  const filteredSongs = savedSongs.filter((song) =>
    song.song_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSong = (song: SongForm) => {
    if (!song.song_name || !song.structure) {
      toast.error("Invalid song data");
      return;
    }

    // Song Name과 Structure 복원
    setSongName(song.song_name);
    setParsedStructure(song.structure);
    const structureString = song.structure.join(", ");
    setStructure(structureString);

    setShowLoadDialog(false);

    // Lyrics가 있으면 Lyrics 페이지로, 없으면 Index 페이지에 표시
    if (song.lyrics && Object.keys(song.lyrics).length > 0) {
      navigate("/lyrics", {
        state: {
          songName: song.song_name,
          structure: song.structure,
          lyrics: song.lyrics,
        },
      });
      toast.success("Song loaded successfully");
    } else {
      toast.success("Song structure loaded. Add lyrics to continue.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-music-bg-subtle to-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Login/Logout UI */}
        <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-2 sm:gap-4 mb-4">
          {loading ? (
            <span className="text-muted-foreground text-xs sm:text-sm">Loading...</span>
          ) : user ? (
            <>
              <span className="text-muted-foreground text-xs sm:text-sm break-all text-right">{user.email}</span>
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
                className="text-xs sm:text-sm"
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
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              Login with Google
            </Button>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div 
            className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-music-primary to-music-accent mb-3 sm:mb-4 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.open("https://music.bugs.co.kr/", "_blank")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                window.open("https://music.bugs.co.kr/", "_blank");
              }
            }}
          >
            <Music2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-music-primary to-music-accent bg-clip-text text-transparent leading-normal pb-2 px-2">
            Song Form Maker
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Organize your song's form with ease. Enter sections like verse, chorus, bridge using simple notation.
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 shadow-xl border-2 backdrop-blur-sm bg-card/95">
          <div className="space-y-4 sm:space-y-6">
            {/* Song Name Input */}
            <div className="space-y-3">
              <Label htmlFor="song-name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-music-primary" />
                Song Name
              </Label>
              <Input
                id="song-name"
                type="text"
                placeholder="e.g., My Awesome Song"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                className="text-base sm:text-lg py-4 sm:py-6 px-3 sm:px-4 font-mono border-2 focus:border-music-primary transition-colors placeholder:opacity-50"
              />
            </div>

            {/* Input Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Music2 className="w-4 h-4 text-music-primary" />
                Song Structure
              </label>
              
              {/* Quick Add Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSection("Intro")}
                  className="gap-1 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Intro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSection("Interlude")}
                  className="gap-1 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Interlude
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSection("Outro")}
                  className="gap-1 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Outro
                </Button>
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g., a - b - c - a - d - c  or  intro, verse, chorus, verse, outro"
                  value={structure}
                  onChange={(e) => handleStructureChange(e.target.value)}
                  className="text-base sm:text-lg py-4 sm:py-6 px-3 sm:px-4 font-mono border-2 focus:border-music-primary transition-colors"
                />
              </div>
              <div className="text-xs text-muted-foreground space-y-1 px-1">
                <p>· Click buttons to add intro/interlude/outro, or type letters (a, b, c) and names (verse, chorus, bridge).</p>
                <p>· Use numbers: 1=intro, 2=interlude, 3=outro.</p>
                <p>· Separate with dashes (-), commas (,) or spaces.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
              {user && (
                <Button
                  variant="outline"
                  onClick={handleLoadSaved}
                  className="gap-2 text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Load Saved</span>
                  <span className="sm:hidden">Load</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={!structure}
                className="gap-2 text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={!structure}
                className="gap-2 text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Copy Structure</span>
                <span className="sm:hidden">Copy</span>
              </Button>
              <Button
                onClick={handleNext}
                disabled={!structure}
                className="gap-2 bg-gradient-to-r from-music-primary to-music-accent hover:opacity-90 transition-opacity text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <span className="hidden sm:inline">Next: Add Lyrics</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Structure Visualization */}
        {parsedStructure.length > 0 && (
          <Card className="max-w-3xl mx-auto mt-6 sm:mt-8 p-4 sm:p-6 md:p-8 shadow-xl border-2 backdrop-blur-sm bg-card/95 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Music2 className="w-4 h-4 sm:w-5 sm:h-5 text-music-accent" />
              Structure Preview
            </h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {parsedStructure.map((section, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative px-3 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-br from-music-primary/10 to-music-accent/10 border-2 border-music-primary/20 hover:border-music-accent/40 transition-all duration-300 hover:scale-105 cursor-move ${
                    draggedIndex === index ? "opacity-50" : ""
                  }`}
                >
                  {editingIndex === index ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(index);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                        className="h-8 text-sm font-mono"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveEdit(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <GripVertical className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="font-mono text-xs sm:text-sm font-semibold text-foreground pl-2 sm:pl-4">
                        {section}
                      </span>
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-music-secondary text-[10px] sm:text-xs flex items-center justify-center font-bold text-music-secondary-foreground">
                        {index + 1}
                      </div>
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(index)}
                          className="h-6 w-6 p-0 hover:bg-music-primary/20"
                        >
                          <Pencil className="w-3 h-3 text-music-primary" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSection(index)}
                          className="h-6 w-6 p-0 hover:bg-red-500/20"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Total sections: <span className="font-semibold text-foreground">{parsedStructure.length}</span>
                <span className="ml-4 text-xs">💡 Drag to reorder, hover to edit/delete</span>
              </p>
            </div>
          </Card>
        )}

        {/* Examples Section */}
        <div className="max-w-3xl mx-auto mt-8">
          <Card className="p-6 bg-music-bg-subtle/50 border border-border/50">
            <h3 className="font-semibold mb-3 text-foreground">Example Structures:</h3>
            <div className="space-y-2 text-sm text-muted-foreground font-mono">
              <p>• <span className="text-music-primary">a1, a2, b, c, d</span></p>
              <p>• <span className="text-music-primary">intro - verse - chorus - verse - chorus - bridge - chorus - outro</span></p>
              <p>• <span className="text-music-primary">a, b, c, c, c, interlude, d, d, outro</span></p>
            </div>
          </Card>
        </div>

        {/* Load Saved Songs Dialog */}
        <Dialog 
          open={showLoadDialog} 
          onOpenChange={(open) => {
            setShowLoadDialog(open);
            if (!open) {
              setSearchQuery(""); // 다이얼로그 닫을 때 검색어 초기화
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Load Saved Song</DialogTitle>
              <DialogDescription>
                Search and select a saved song to load. Songs are organized by song name.
              </DialogDescription>
            </DialogHeader>
            
            {/* 검색 입력 필드 */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by song name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <p className="text-xs text-muted-foreground mt-2">
                  {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              {loadingSongs ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading saved songs...
                </div>
              ) : filteredSongs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? (
                    <>
                      No songs found matching "{searchQuery}".
                      <br />
                      <span className="text-xs">Try a different search term.</span>
                    </>
                  ) : (
                    "No saved songs found."
                  )}
                </div>
              ) : (
                filteredSongs.map((song) => (
                  <Card
                    key={song.id}
                    className="p-4 hover:bg-music-primary/10 cursor-pointer transition-colors"
                    onClick={() => handleSelectSong(song)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {song.song_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {song.structure?.length || 0} sections
                          {song.created_at && (
                            <span className="ml-2">
                              • {new Date(song.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                        {song.structure && song.structure.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {song.structure.slice(0, 5).join(", ")}
                            {song.structure.length > 5 && "..."}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSong(song);
                        }}
                      >
                        Load
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
