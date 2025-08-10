import { useEffect, useMemo, useState } from "react";
import heroImg from "@/assets/hero-nebula.jpg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "./DatePicker";
import { ApodItem, fetchApodByDate, toggleFavorite, isFavorite, fetchRandom } from "@/lib/apod";
import { ArrowLeft, ArrowRight, Download, Heart, Maximize2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

function toISO(d: Date) { return format(d, 'yyyy-MM-dd'); }

type ApodHeroProps = { onRandom?: () => void };

export const ApodHero = ({ onRandom }: ApodHeroProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [item, setItem] = useState<ApodItem | null>(null);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const fav = useMemo(() => item ? isFavorite(item) : false, [item]);

  useEffect(() => {
    let active = true;
    setItem(null);
    fetchApodByDate(toISO(date))
      .then((data) => { if (active) setItem(data); })
      .catch(() => toast({ title: 'Failed to load APOD', description: 'Please try another date or set your API key.' }));
    return () => { active = false; };
  }, [date]);

  // Re-fetch current date when API key changes (no full page refresh needed)
  useEffect(() => {
    const handler = () => {
      setItem(null);
      fetchApodByDate(toISO(date))
        .then((data) => setItem(data))
        .catch(() => toast({ title: 'Failed to load APOD', description: 'Please try another date or set your API key.' }));
    };
    window.addEventListener('apod:apiKeyChanged', handler as EventListener);
    return () => window.removeEventListener('apod:apiKeyChanged', handler as EventListener);
  }, [date]);

  // Listen for global random trigger (from Header button)
  useEffect(() => {
    const onRandom = async () => {
      const [rand] = await fetchRandom(1);
      if (rand?.date) {
        setDate(new Date(rand.date));
        document.querySelector('section[aria-label="Daily Astronomy Picture"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('apod:random', onRandom as EventListener);
    return () => window.removeEventListener('apod:random', onRandom as EventListener);
  }, []);

  const changeDay = (delta: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + delta);
    const today = new Date();
    if (next > today) return; // don't go into the future
    setDate(next);
  };

  const openViewer = () => { if (!item) return; setZoom(1); setOpen(true); };

  return (
    <section aria-label="Daily Astronomy Picture" className="relative">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-elegant">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Deep space nebula background" className="h-full w-full object-cover opacity-30" />
        </div>
        <div className="relative p-6 sm:p-10 bg-background/40 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">NASA APOD — Astronomy Picture of the Day</h1>
              <p className="text-muted-foreground max-w-2xl">Explore the cosmos through NASA's daily imagery. Browse by date, save your favorites, and discover random wonders.</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="hero" onClick={async () => { const [rand] = await fetchRandom(1); if (rand?.date) { setDate(new Date(rand.date)); document.querySelector('section[aria-label=\"Daily Astronomy Picture\"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } onRandom?.(); }} aria-label="Random APOD"><RefreshCw /> Random</Button>
                <Button variant="glass" onClick={() => { changeDay(-1); document.querySelector('section[aria-label=\"Daily Astronomy Picture\"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} aria-label="Previous day"><ArrowLeft /> Previous</Button>
                <Button variant="glass" onClick={() => { changeDay(1); document.querySelector('section[aria-label=\"Daily Astronomy Picture\"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} aria-label="Next day" disabled={new Date(toISO(date)) >= new Date(format(new Date(), 'yyyy-MM-dd'))}><ArrowRight /> Next</Button>
                <DatePicker date={date} onChange={(d) => { setDate(d); document.querySelector('section[aria-label=\"Daily Astronomy Picture\"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} />
              </div>
            </div>
            {item && (
              <div className="w-full md:w-[480px] lg:w-[560px]">
                <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/60">
                  <CardContent className="p-0">
                    <div key={item.date} className="relative aspect-video group animate-fade-in">
                      {item.media_type === 'image' ? (
                        <img src={item.url} alt={`${item.title} — ${item.date}`} className="h-full w-full object-cover" />
                      ) : (
                        <img src={item.thumbnail_url || item.url} alt={`${item.title} — ${item.date}`} className="h-full w-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-end gap-2">
                        <Button variant="glass" size="icon" onClick={openViewer} aria-label="Open viewer"><Maximize2 /></Button>
                        <Button variant={fav ? 'destructive' : 'hero'} size="icon" aria-label="Toggle favorite" onClick={() => item && toggleFavorite(item)}>
                          <Heart className={fav ? 'fill-current' : ''} />
                        </Button>
                        {item.media_type === 'image' && (
                          <a href={item.hdurl || item.url} download>
                            <Button variant="glass" size="icon" aria-label="Download image"><Download /></Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-3 space-y-1">
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.explanation}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(item.date), 'PPPP')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{item?.date}</p>
              <p className="font-semibold">{item?.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="glass" size="sm" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>+ Zoom</Button>
              <Button variant="glass" size="sm" onClick={() => setZoom((z) => Math.max(1, z - 0.25))}>- Zoom</Button>
              <Button variant="hero" size="sm" onClick={() => setZoom(1)}>Reset</Button>
            </div>
          </div>
          <div className="max-h-[70vh] overflow-auto rounded-md border border-border/60 bg-background/60">
            {item?.media_type === 'image' ? (
              <img src={item?.hdurl || item?.url} alt={item?.title || 'APOD image'} style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }} className="transition-transform duration-200 mx-auto" />
            ) : (
              <div className="aspect-video w-full">
                <iframe src={item?.url} title={item?.title} className="h-full w-full" allowFullScreen />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
