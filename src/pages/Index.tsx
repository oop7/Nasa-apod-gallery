import { useEffect } from "react";
import Header from "@/components/Header";
import { ApodHero } from "@/components/apod/ApodHero";
import { ApodGallery } from "@/components/apod/ApodGallery";
import { fetchRandom } from "@/lib/apod";

const Index = () => {
  useEffect(() => {
    document.title = "NASA APOD Explorer | Daily Astronomy Picture";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Explore NASA\'s Astronomy Picture of the Day (APOD). Browse by date, save favorites, and discover random cosmic wonders.');
  }, []);

  const handleRandom = async () => {
    const [rand] = await fetchRandom(1);
    if (rand?.date) {
      // Open in a new tab directly (video) or just navigate by hash with date reference in future
      // For now, scroll to hero and let user see Random via button in hero as visual feedback
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
