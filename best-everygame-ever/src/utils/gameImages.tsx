export type GameImageResult = {
  imageUrl: string;
  source: "wikipedia-thumbnail" | "wikipedia-image" | "openverse";
  sourceTitle?: string;
};

const IMAGE_CACHE_KEY = "best-every-game-ever-image-cache";

type ImageCache = Record<string, GameImageResult | null>;

type WikipediaSearchResponse = {
  query?: {
    search?: Array<{
      title: string;
    }>;
  };
};

type WikipediaPageImagesResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title: string;
        thumbnail?: {
          source: string;
        };
        images?: Array<{
          title: string;
        }>;
      }
    >;
  };
};

type WikipediaImageInfoResponse = {
  query?: {
    pages?: Record<
      string,
      {
        imageinfo?: Array<{
          url?: string;
          thumburl?: string;
        }>;
      }
    >;
  };
};

type OpenverseResponse = {
  results?: Array<{
    title?: string;
    url?: string;
    thumbnail?: string;
  }>;
};

function normalizeCacheKey(title: string): string {
  return title.trim().toLowerCase();
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/^file:/, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function readImageCache(): ImageCache {
  const stored = localStorage.getItem(IMAGE_CACHE_KEY);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored) as ImageCache;
  } catch {
    localStorage.removeItem(IMAGE_CACHE_KEY);
    return {};
  }
}

function saveImageCache(cache: ImageCache): void {
  localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
}

async function searchWikipediaPage(gameTitle: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: `"${gameTitle}" video game`,
    srlimit: "5",
    format: "json",
    origin: "*",
  });

  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?${params.toString()}`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as WikipediaSearchResponse;
  const results = data.query?.search ?? [];

  if (results.length === 0) {
    return null;
  }

  const normalizedGameTitle = normalizeText(gameTitle);

  const closestMatch = results.find((result) =>
    normalizeText(result.title).includes(normalizedGameTitle),
  );

  return closestMatch?.title ?? results[0].title;
}

async function fetchWikipediaPageImages(pageTitle: string): Promise<{
  thumbnailUrl: string | null;
  imageTitles: string[];
}> {
  const params = new URLSearchParams({
    action: "query",
    prop: "pageimages|images",
    titles: pageTitle,
    piprop: "thumbnail",
    pithumbsize: "900",
    imlimit: "50",
    format: "json",
    origin: "*",
  });

  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?${params.toString()}`,
  );

  if (!response.ok) {
    return {
      thumbnailUrl: null,
      imageTitles: [],
    };
  }

  const data = (await response.json()) as WikipediaPageImagesResponse;

  const page = Object.values(data.query?.pages ?? {})[0];

  return {
    thumbnailUrl: page?.thumbnail?.source ?? null,
    imageTitles: page?.images?.map((image) => image.title) ?? [],
  };
}

function scoreWikipediaImage(imageTitle: string, gameTitle: string): number {
  const image = normalizeText(imageTitle);
  const game = normalizeText(gameTitle);

  let score = 0;

  if (image.includes(game)) {
    score += 100;
  }

  if (image.includes("cover")) {
    score += 90;
  }

  if (image.includes("box art") || image.includes("boxart")) {
    score += 90;
  }

  if (image.includes("poster")) {
    score += 50;
  }

  if (image.includes("screenshot")) {
    score += 30;
  }

  if (image.includes("logo")) {
    score += 15;
  }

  const unwantedTerms = [
    "wikidata",
    "commons logo",
    "padlock",
    "icon",
    "symbol",
    "stub",
    "portal",
    "question book",
    "featured article",
    "edit clear",
  ];

  if (unwantedTerms.some((term) => image.includes(term))) {
    score -= 500;
  }

  return score;
}

function rankWikipediaImages(
  imageTitles: string[],
  gameTitle: string,
): string[] {
  return [...imageTitles]
    .filter((title) => {
      const lowerTitle = title.toLowerCase();

      return (
        !lowerTitle.endsWith(".svg") &&
        !lowerTitle.endsWith(".ogg") &&
        !lowerTitle.endsWith(".oga") &&
        !lowerTitle.endsWith(".webm")
      );
    })
    .sort(
      (first, second) =>
        scoreWikipediaImage(second, gameTitle) -
        scoreWikipediaImage(first, gameTitle),
    );
}

async function fetchWikipediaImageUrl(
  imageTitle: string,
): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    prop: "imageinfo",
    titles: imageTitle,
    iiprop: "url",
    iiurlwidth: "900",
    format: "json",
    origin: "*",
  });

  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?${params.toString()}`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as WikipediaImageInfoResponse;

  const page = Object.values(data.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];

  return info?.thumburl ?? info?.url ?? null;
}

async function searchWikipediaImage(
  gameTitle: string,
): Promise<GameImageResult | null> {
  const pageTitle = await searchWikipediaPage(gameTitle);

  if (!pageTitle) {
    return null;
  }

  const { thumbnailUrl, imageTitles } =
    await fetchWikipediaPageImages(pageTitle);

  if (thumbnailUrl) {
    return {
      imageUrl: thumbnailUrl,
      source: "wikipedia-thumbnail",
      sourceTitle: pageTitle,
    };
  }

  const rankedImages = rankWikipediaImages(imageTitles, gameTitle);

  for (const imageTitle of rankedImages.slice(0, 8)) {
    const imageUrl = await fetchWikipediaImageUrl(imageTitle);

    if (imageUrl) {
      return {
        imageUrl,
        source: "wikipedia-image",
        sourceTitle: imageTitle,
      };
    }
  }

  return null;
}

async function searchOpenverseImage(
  gameTitle: string,
): Promise<GameImageResult | null> {
  const params = new URLSearchParams({
    q: `${gameTitle} video game`,
    page_size: "10",
  });

  const response = await fetch(
    `https://api.openverse.org/v1/images/?${params.toString()}`,
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OpenverseResponse;

  const result = data.results?.find((item) => item.thumbnail || item.url);

  const imageUrl = result?.thumbnail ?? result?.url;

  if (!imageUrl) {
    return null;
  }

  return {
    imageUrl,
    source: "openverse",
    sourceTitle: result?.title,
  };
}

export async function findGameImage(
  gameTitle: string,
): Promise<GameImageResult | null> {
  const cacheKey = normalizeCacheKey(gameTitle);
  const cache = readImageCache();

  if (cacheKey in cache) {
    return cache[cacheKey];
  }

  try {
    const wikipediaResult = await searchWikipediaImage(gameTitle);

    if (wikipediaResult) {
      cache[cacheKey] = wikipediaResult;
      saveImageCache(cache);

      return wikipediaResult;
    }

    const openverseResult = await searchOpenverseImage(gameTitle);

    cache[cacheKey] = openverseResult;
    saveImageCache(cache);

    return openverseResult;
  } catch (error) {
    console.error(`Automatic image search failed for "${gameTitle}":`, error);

    return null;
  }
}
