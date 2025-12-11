import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Music2, ArrowLeft, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface LocationState {
  songName?: string;
  structure: string[];
  lyrics?: Record<string, string>;
}

const Lyrics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [uniqueSections, setUniqueSections] = useState<string[]>([]);
  const [lyrics, setLyrics] = useState<Record<string, string>>({});
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!state?.structure || state.structure.length === 0) {
      navigate("/");
      return;
    }

    // Get unique sections only, filtering out intro/interlude/outro
    // Only include sections that contain alphabetic characters (A, B, C, D, etc.)
    const unique = Array.from(new Set(state.structure)).filter((section) => {
      const lowerSection = section.toLowerCase();
      // Exclude common instrumental sections
      if (lowerSection === "intro" || lowerSection === "interlude" || lowerSection === "outro") {
        return false;
      }
      // Include sections that contain at least one letter
      return /[a-zA-Z]/.test(section);
    });
    setUniqueSections(unique);

    // Initialize lyrics state
    const initialLyrics: Record<string, string> = {};
    unique.forEach((section) => {
      // 기존에 작성한 가사가 있으면 복원, 없으면 빈 문자열
      initialLyrics[section] = state.lyrics?.[section] || "";
    });
    setLyrics(initialLyrics);
    
    // state를 사용했으므로 초기화 (다음 방문 시 중복 방지)
    if (state.lyrics) {
      window.history.replaceState({}, document.title);
    }
  }, [state, navigate]);

  const handleLyricsChange = (section: string, value: string) => {
    setLyrics((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const handleCopySection = (section: string) => {
    const lyricsText = lyrics[section];
    if (lyricsText) {
      navigator.clipboard.writeText(lyricsText);
      setCopiedSection(section);
      toast.success(`Copied lyrics for section "${section}"`);
      setTimeout(() => setCopiedSection(null), 2000);
    } else {
      toast.error("No lyrics to copy");
    }
  };

  const handleCopyAll = () => {
    const fullLyrics = uniqueSections
      .map((section) => {
        const sectionLyrics = lyrics[section];
        return sectionLyrics ? `[${section}]\n${sectionLyrics}` : "";
      })
      .filter((text) => text.length > 0)
      .join("\n\n");

    if (fullLyrics) {
      navigator.clipboard.writeText(fullLyrics);
      toast.success("All lyrics copied to clipboard");
    } else {
      toast.error("No lyrics to copy");
    }
  };

  const handleBack = () => {
    navigate("/", {
      state: {
        songName: state.songName,
        structure: state.structure,
        lyrics: lyrics, // 작성한 가사도 함께 전달
      },
    });
  };

  const handleNext = () => {
    const hasLyrics = Object.values(lyrics).some((text) => text.trim().length > 0);
    if (!hasLyrics) {
      toast.error("Please add lyrics for at least one section");
      return;
    }
    
    navigate("/final", { 
      state: { 
        songName: state.songName,
        structure: state.structure,
        lyrics: lyrics 
      } 
    });
  };

  if (!state?.structure) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-music-bg-subtle to-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Structure
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-music-primary to-music-accent">
              <Music2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-music-primary to-music-accent bg-clip-text text-transparent leading-normal pb-2">
                Write Your Lyrics
              </h1>
              <p className="text-muted-foreground">
                Add lyrics for each unique section
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={handleCopyAll}
              variant="outline"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy All Lyrics
            </Button>
            <Button
              onClick={handleNext}
              className="gap-2 bg-gradient-to-r from-music-primary to-music-accent hover:opacity-90 transition-opacity"
            >
              Next: View Final Song
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lyrics Input Sections */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {uniqueSections.map((section, index) => (
            <Card
              key={section}
              className="p-6 shadow-lg border-2 backdrop-blur-sm bg-card/95 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-music-primary/20 to-music-accent/20 border-2 border-music-primary/30 flex items-center justify-center">
                    <span className="font-mono font-bold text-music-primary">
                      {section}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold">Section: {section}</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopySection(section)}
                  className="gap-2"
                >
                  {copiedSection === section ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <Textarea
                placeholder={`Paste or type lyrics for section "${section}"...\n\nExample:\nFirst line of lyrics\nSecond line of lyrics\nThird line of lyrics`}
                value={lyrics[section]}
                onChange={(e) => handleLyricsChange(section, e.target.value)}
                className="min-h-[200px] font-mono text-base resize-y border-2 focus:border-music-primary transition-colors"
              />

              <div className="mt-3 text-xs text-muted-foreground">
                {lyrics[section].split("\n").filter((line) => line.trim()).length}{" "}
                lines
              </div>
            </Card>
          ))}
        </div>

        {/* Summary Card */}
        {uniqueSections.length > 0 && (
          <Card className="max-w-4xl mx-auto mt-8 p-6 bg-music-bg-subtle/50 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Progress Summary
                </h3>
                <p className="text-sm text-muted-foreground">
                  {Object.values(lyrics).filter((text) => text.trim().length > 0).length}{" "}
                  of {uniqueSections.length} sections completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total lines</p>
                <p className="text-2xl font-bold text-music-primary">
                  {Object.values(lyrics).reduce(
                    (total, text) =>
                      total + text.split("\n").filter((line) => line.trim()).length,
                    0
                  )}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Lyrics;
