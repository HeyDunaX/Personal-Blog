// Paste your Supabase credentials here if you are not using environment variables:
const FALLBACK_SUPABASE_URL = "";
const FALLBACK_SUPABASE_ANON_KEY = "";

const getNormalizedUrl = (url) => {
  if (!url) return '';
  let trimmed = url.trim();
  if (trimmed.endsWith('/rest/v1/')) {
    trimmed = trimmed.slice(0, -9);
  } else if (trimmed.endsWith('/rest/v1')) {
    trimmed = trimmed.slice(0, -8);
  }
  if (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed;
};

export const supabaseUrl = getNormalizedUrl(import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL);
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

const getHeaders = () => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json'
});

export const getArticlesFromDb = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/articles?select=*&order=date.desc`, {
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.statusText}`);
  }
  const data = await response.json();
  return data.map((art) => ({
    id: art.id,
    title: art.title,
    abstract: art.abstract,
    date: art.date,
    url: art.url,
    coverImage: art.coverimage || art.cover_image || art.coverImage
  }));
};

export const insertArticleToDb = async (article) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const dbArticle = {
    id: article.id,
    title: article.title,
    abstract: article.abstract,
    date: article.date,
    url: article.url,
    coverimage: article.coverImage
  };
  const response = await fetch(`${supabaseUrl}/rest/v1/articles`, {
    method: 'POST',
    body: JSON.stringify(dbArticle),
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation'
    }
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to insert article: ${errText}`);
  }
  const data = await response.json();
  return data[0];
};

export const deleteArticleFromDb = async (id) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error(`Failed to delete article: ${response.statusText}`);
  }
  return true;
};
