import { useEffect, useMemo, useState } from "react";
import { ApodItem, fetchRange, fetchRandom, getFavorites } from "@/lib/apod";
import { ApodCard } from "./ApodCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";

function toISO(d: Date) { return format(d, 'yyyy-MM-dd'); }

const BATCH_DAYS = 12;

export const ApodGallery = () => {
  const [items, setItems] = useState<ApodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<Date>(new Date());
  const [query, setQuery] = useState("");
  const [favoritesVersion, setFavoritesVersion] = useState(0);
  const [selected, setSelected] = useState<ApodItem | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch gallery when API key changes
  useEffect(() => {
    const handler = async () => {
      setLoading(true);
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - (BATCH_DAYS - 1));
        const batch = await fetchRange(toISO(start), toISO(end));
        setItems(batch);
        start.setDate(start.getDate() - 1);
        setCursor(start);
      } catch (e) {
        const random = await fetchRandom(BATCH_DAYS);
        setItems(random);
      } finally {
        setLoading(false);
      }
    };
    window.addEventListener('apod:apiKeyChanged', handler as EventListener);
    return () => window.removeEventListener('apod:apiKeyChanged', handler as EventListener);
  }, []);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    const end = new Date(cursor);
    const start = new Date(cursor);
    start.setDate(start.getDate() - (BATCH_DAYS - 1));
    try {
      const batch = await fetchRange(toISO(start), toISO(end));
      setItems((prev) => [...prev, ...batch]);
      start.setDate(start.getDate() - 1);
      setCursor(start);
    } catch (e) {
      // Fallback to random if range fails (rate limits)
      const random = await fetchRandom(BATCH_DAYS);
      setItems((prev) => [...prev, ...random]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      i.title.toLowerCase().includes(q) || i.explanation.toLowerCase().includes(q)
    );
  }, [items, query]);

  const favorites = useMemo(() => getFavorites(), [favoritesVersion]);

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="text-xl font-semibold">Discover the Cosmos</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Search titles and descriptions" className="w-[280px]" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button variant="glass" onClick={loadMore} disabled={loading} aria-label="Load more">{loading ? 'Loading…' : 'Load more'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((it) => (
          <ApodCard key={`${it.date}-${it.title}`} item={it} onOpen={(item) => { setSelected(item); setZoom(1); }} onFavoriteChange={() => setFavoritesVersion(v => v + 1)} />
        ))}
      </div>

      <div id="favorites" className="mt-12">
        <h3 className="text-lg font-semibold mb-3">Your Favorites</h3>
        {favorites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No favorites yet. Tap the heart on a photo to save it.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((it) => (
              <ApodCard key={`fav-${it.date}-${it.title}`} item={it} onOpen={(item) => { setSelected(item); setZoom(1); }} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl">
          {!!selected && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{selected.date}</p>
                  <p className="font-semibold">{selected.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="glass" size="sm" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>+ Zoom</Button>
                  <Button variant="glass" size="sm" onClick={() => setZoom((z) => Math.max(1, z - 0.25))}>- Zoom</Button>
                  <Button variant="hero" size="sm" onClick={() => setZoom(1)}>Reset</Button>
                  {selected.media_type === 'image' && (
                    <a href={selected.hdurl || selected.url} download>
                      <Button variant="glass" size="sm" aria-label="Download image">Download</Button>
                    </a>
                  )}
                </div>
              </div>
              <div className="max-h-[70vh] overflow-auto rounded-md border border-border/60 bg-background/60">
                {selected.media_type === 'image' ? (
                  <img src={selected.hdurl || selected.url} alt={selected.title} style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }} className="transition-transform duration-200 mx-auto" />
                ) : (
                  <div className="aspect-video w-full">
                    <iframe src={selected.url} title={selected.title} className="h-full w-full" allowFullScreen />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
