import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApodItem, toggleFavorite, isFavorite } from "@/lib/apod";
import { Heart, ImageIcon, Play, Maximize2 } from "lucide-react";
import { useState } from "react";

type ApodCardProps = {
  item: ApodItem;
  onOpen?: (item: ApodItem) => void;
  onFavoriteChange?: () => void;
};

export const ApodCard = ({ item, onOpen, onFavoriteChange }: ApodCardProps) => {
  const [fav, setFav] = useState<boolean>(isFavorite(item));
  const isVideo = item.media_type === 'video';
  const thumb = isVideo ? item.thumbnail_url || item.url : item.url;

  const handleFav = () => {
    toggleFavorite(item);
    setFav(isFavorite(item));
    onFavoriteChange?.();
  };

  return (
    <Card className="group overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-video cursor-pointer" onClick={() => onOpen?.(item)}>
          <img
            src={thumb}
            alt={`${item.title} — NASA APOD ${item.date}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              {isVideo ? <Play /> : <ImageIcon />}
              <span className="line-clamp-1">{item.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="glass" size="icon" onClick={(e) => { e.stopPropagation(); onOpen?.(item); }} aria-label="Open viewer">
                <Maximize2 />
              </Button>
              <Button variant={fav ? 'destructive' : 'hero'} size="icon" onClick={(e) => { e.stopPropagation(); handleFav(); }} aria-label="Toggle favorite">
                <Heart className={fav ? 'fill-current' : ''} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
