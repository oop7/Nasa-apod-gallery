import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiKey, getApiKey } from "@/lib/apod";
import { Sparkles, Settings, Shuffle, Star, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

type HeaderProps = {
  onRandom?: () => void;
};

const Header = ({ onRandom }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState<string>(getApiKey() === 'DEMO_KEY' ? '' : getApiKey());
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-border/60 bg-background/60">
      <div className="container mx-auto flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Sparkles className="text-primary" />
          <p className="text-lg font-semibold tracking-tight">APOD Explorer</p>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="hero" size="sm" onClick={onRandom} aria-label="Surprise me">
            <Shuffle />
            Surprise me
          </Button>
          <Button asChild variant="ghost" size="sm" aria-label="View favorites">
            <a href="#favorites" className="story-link flex items-center gap-2">
              <Star /> Favorites
            </a>
          </Button>
          <Button variant="glass" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="glass" size="icon" aria-label="Settings">
                <Settings />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>NASA API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You can use the default DEMO_KEY or add your own NASA API key for higher rate limits.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input id="apiKey" placeholder="DEMO_KEY (default)" value={key} onChange={(e) => setKey(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button variant="default" onClick={() => { setApiKey(key.trim()); setOpen(false); }}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </nav>
      </div>
    </header>
  );
};

export default Header;
