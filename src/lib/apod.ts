export type ApodItem = {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  thumbnail_url?: string;
  copyright?: string;
};

const API_BASE = 'https://api.nasa.gov/planetary/apod';
const LS_API_KEY = 'apod_api_key';
const LS_FAVORITES = 'apod_favorites';

export function getApiKey(): string {
  const key = localStorage.getItem(LS_API_KEY);
  return key && key.trim().length > 0 ? key : 'DEMO_KEY';
}

export function setApiKey(key: string) {
  localStorage.setItem(LS_API_KEY, key);
}

function withParams(params: Record<string, string | number | boolean | undefined>): string {
  const usp = new URLSearchParams();
  usp.set('api_key', getApiKey());
  usp.set('thumbs', 'true');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) usp.set(k, String(v));
  });
  return `${API_BASE}?${usp.toString()}`;
}

async function http<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchApodByDate(date?: string): Promise<ApodItem> {
  const url = withParams(date ? { date } : {});
  return http<ApodItem>(url);
}

export async function fetchRandom(count = 1): Promise<ApodItem[]> {
  const url = withParams({ count });
  const data = await http<ApodItem[] | ApodItem>(url);
  return Array.isArray(data) ? data : [data];
}

export async function fetchRange(start_date: string, end_date: string): Promise<ApodItem[]> {
  const url = withParams({ start_date, end_date });
  const data = await http<ApodItem[] | ApodItem>(url);
  return Array.isArray(data) ? data.reverse() : [data];
}

// Favorites in Local Storage
export function getFavorites(): ApodItem[] {
  try {
    const raw = localStorage.getItem(LS_FAVORITES);
    return raw ? (JSON.parse(raw) as ApodItem[]) : [];
  } catch {
    return [];
  }
}

export function isFavorite(item: ApodItem): boolean {
  return getFavorites().some((f) => f.date === item.date);
}

export function toggleFavorite(item: ApodItem): ApodItem[] {
  const favs = getFavorites();
  const idx = favs.findIndex((f) => f.date === item.date);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.unshift(item);
  }
  localStorage.setItem(LS_FAVORITES, JSON.stringify(favs.slice(0, 200)));
  return favs;
}
