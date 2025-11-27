import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Music2, ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface LocationState {
  structure: string[];
  lyrics: Record<string, string>;
}

const FinalSong = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!state?.structure || !state?.lyrics) {
      navigate("/");
      return;
    }
  }, [state, navigate]);

  const handleBack = () => {
    navigate("/lyrics", { state: { structure: state?.structure } });
  };

  const handleCopyAll = () => {
    if (!state) return;

    const fullSong = state.structure
      .map((section) => {
        const sectionLyrics = state.lyrics[section];
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

  if (!state?.structure || !state?.lyrics) {
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
            Back to Lyrics
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-music-primary to-music-accent">
              <Music2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-music-primary to-music-accent bg-clip-text text-transparent">
                Final Song
              </h1>
              <p className="text-muted-foreground">
                Your complete song with structure
              </p>
            </div>
          </div>

          <div className="flex justify-end">
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
          <div className="space-y-6">
            {state.structure.map((section, index) => {
              const sectionLyrics = state.lyrics[section];
              
              return (
                <div
                  key={index}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-music-primary/20 to-music-accent/20 border-2 border-music-primary/30 flex items-center justify-center">
                      <span className="font-mono text-xs font-bold text-music-primary">
                        {index + 1}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-music-primary">
                      [{section}]
                    </h2>
                  </div>

                  {/* Section Lyrics */}
                  {sectionLyrics && sectionLyrics.trim() ? (
                    <div className="pl-11 space-y-1">
                      {sectionLyrics.split("\n").map((line, lineIndex) => (
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
                  const sectionLyrics = state.lyrics[section];
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
      </div>
    </div>
  );
};

export default FinalSong;
