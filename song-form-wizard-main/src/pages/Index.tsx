import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music2, Plus, Trash2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [structure, setStructure] = useState("");
  const [parsedStructure, setParsedStructure] = useState<string[]>([]);

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
    
    navigate("/lyrics", { state: { structure: parsedStructure } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-music-bg-subtle to-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-music-primary to-music-accent mb-4 animate-pulse">
            <Music2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-music-primary to-music-accent bg-clip-text text-transparent">
            Song Structure Builder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organize your song's form with ease. Enter sections like verse, chorus, bridge using simple notation.
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="max-w-3xl mx-auto p-6 md:p-8 shadow-xl border-2 backdrop-blur-sm bg-card/95">
          <div className="space-y-6">
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
                  className="text-lg py-6 px-4 font-mono border-2 focus:border-music-primary transition-colors"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Click buttons to add intro/interlude/outro, or type letters (a, b, c) and names (verse, chorus, bridge). Use numbers: 1=intro, 2=interlude, 3=outro. Separate with dashes (-), commas (,) or spaces.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={!structure}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={!structure}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Copy Structure
              </Button>
              <Button
                onClick={handleNext}
                disabled={!structure}
                className="gap-2 bg-gradient-to-r from-music-primary to-music-accent hover:opacity-90 transition-opacity"
              >
                Next: Add Lyrics
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Structure Visualization */}
        {parsedStructure.length > 0 && (
          <Card className="max-w-3xl mx-auto mt-8 p-6 md:p-8 shadow-xl border-2 backdrop-blur-sm bg-card/95 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Music2 className="w-5 h-5 text-music-accent" />
              Structure Preview
            </h2>
            <div className="flex flex-wrap gap-3">
              {parsedStructure.map((section, index) => (
                <div
                  key={index}
                  className="group relative px-6 py-3 rounded-lg bg-gradient-to-br from-music-primary/10 to-music-accent/10 border-2 border-music-primary/20 hover:border-music-accent/40 transition-all duration-300 hover:scale-105"
                >
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {section}
                  </span>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-music-secondary text-xs flex items-center justify-center font-bold text-music-secondary-foreground">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Total sections: <span className="font-semibold text-foreground">{parsedStructure.length}</span>
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
      </div>
    </div>
  );
};

export default Index;
