import { useEffect } from "react";
import Header from "@/components/Header";
import { ApodHero } from "@/components/apod/ApodHero";
import { ApodGallery } from "@/components/apod/ApodGallery";

const Index = () => {
  useEffect(() => {
    document.title = "NASA APOD Explorer | Daily Astronomy Picture";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Explore NASA\'s Astronomy Picture of the Day (APOD). Browse by date, save favorites, and discover random cosmic wonders.');
  }, []);

  const handleRandom = async () => {
    // Trigger a global random event so ApodHero fetches a new item
    try {
      window.dispatchEvent(new Event('apod:random'));
    } catch {}
    // Smoothly scroll to hero section
    const hero = document.querySelector('section[aria-label="Daily Astronomy Picture"]');
    if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      <Header onRandom={handleRandom} />
      <main className="container mx-auto px-4 py-6">
        <ApodHero onRandom={handleRandom} />
        <ApodGallery />
      </main>
    </div>
  );
};

export default Index;
