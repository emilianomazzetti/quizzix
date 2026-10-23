/**
 * Educational Image Library & Search Engine
 * Integrato con Wikimedia Commons API (milioni di immagini didattiche libere HD)
 * e libreria curata per materie scolastiche.
 */

export interface WebImage {
  id: string;
  title: string;
  category: 'Storia' | 'Scienze' | 'Geografia' | 'Arte' | 'Matematica' | 'Animali' | 'Generale';
  url: string;
  tags: string[];
}

export const CURATED_LIBRARY: WebImage[] = [
  // Storia
  {
    id: 'hist-1',
    title: 'Napoleone Bonaparte a cavallo',
    category: 'Storia',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    tags: ['napoleone', 'bonaparte', 'storia', 'imperatore', 'francia', 'cavallo', 'battaglia']
  },
  {
    id: 'hist-2',
    title: 'Colosseo di Roma Antica',
    category: 'Storia',
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80',
    tags: ['roma', 'colosseo', 'romani', 'gladiatori', 'italia', 'antichita', 'storia']
  },
  {
    id: 'hist-3',
    title: 'Piramidi di Giza ed Egitto',
    category: 'Storia',
    url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&auto=format&fit=crop&q=80',
    tags: ['egitto', 'piramidi', 'faraone', 'giza', 'storia antica', 'antico egitto']
  },
  {
    id: 'hist-4',
    title: 'Castello Medievale e Cavalieri',
    category: 'Storia',
    url: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?w=600&auto=format&fit=crop&q=80',
    tags: ['medioevo', 'castello', 'cavaliere', 'fortezza', 'storia', 'torre']
  },
  {
    id: 'hist-5',
    title: 'Partenone e Grecia Antica',
    category: 'Storia',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
    tags: ['grecia', 'atene', 'partenone', 'filosofia', 'storia', 'tempio']
  },
  {
    id: 'hist-6',
    title: 'Caravella di Cristoforo Colombo',
    category: 'Storia',
    url: 'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=600&auto=format&fit=crop&q=80',
    tags: ['colombo', 'scoperta', 'america', 'caravella', 'veliero', 'nave', 'storia']
  },

  // Scienze & Natura
  {
    id: 'sci-1',
    title: 'Cellula al Microscopio',
    category: 'Scienze',
    url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
    tags: ['cellula', 'biologia', 'microscopio', 'dna', 'scienza', 'laboratorio']
  },
  {
    id: 'sci-2',
    title: 'Sistema Solare e Pianeti',
    category: 'Scienze',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80',
    tags: ['spazio', 'pianeta', 'terra', 'marte', 'universo', 'stelle', 'astronomia', 'sole']
  },
  {
    id: 'sci-3',
    title: 'Vulcano in Eruzione',
    category: 'Scienze',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&auto=format&fit=crop&q=80',
    tags: ['vulcano', 'lava', 'geologia', 'magma', 'eruzione', 'terra', 'natura']
  },
  {
    id: 'sci-4',
    title: 'Doppia Elica del DNA',
    category: 'Scienze',
    url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
    tags: ['dna', 'genetica', 'scienza', 'molecola', 'biologia', 'medicina']
  },
  {
    id: 'sci-5',
    title: 'Foresta Pluviale e Fotosintesi',
    category: 'Scienze',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
    tags: ['alberi', 'foresta', 'piante', 'natura', 'fotosintesi', 'ecologia']
  },
  {
    id: 'sci-6',
    title: 'Atomo e Fisica Quantistica',
    category: 'Scienze',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    tags: ['atomo', 'fisica', 'elettroni', 'energia', 'scienza', 'nucleo']
  },

  // Geografia
  {
    id: 'geo-1',
    title: 'Globo Terrestre e Continenti',
    category: 'Geografia',
    url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80',
    tags: ['mondo', 'globo', 'continenti', 'mappa', 'terra', 'geografia', 'oceani']
  },
  {
    id: 'geo-2',
    title: 'Catena Montuosa delle Alpi',
    category: 'Geografia',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    tags: ['montagna', 'alpi', 'neve', 'cime', 'paesaggio', 'geografia', 'vette']
  },
  {
    id: 'geo-3',
    title: 'Fiume che attraversa la Valle',
    category: 'Geografia',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    tags: ['fiume', 'acqua', 'valle', 'corso d acqua', 'geografia', 'natura']
  },
  {
    id: 'geo-4',
    title: 'Deserto del Sahara con Dune',
    category: 'Geografia',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80',
    tags: ['deserto', 'sabbia', 'dune', 'sahara', 'caldo', 'geografia']
  },
  {
    id: 'geo-5',
    title: 'Costa e Barriera Corallina',
    category: 'Geografia',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    tags: ['mare', 'costa', 'oceano', 'coralli', 'spiaggia', 'geografia']
  },

  // Arte
  {
    id: 'art-1',
    title: 'Monna Lisa (Gioconda) di Leonardo',
    category: 'Arte',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    tags: ['gioconda', 'monna lisa', 'leonardo', 'dipinto', 'arte', 'museo', 'louvre']
  },
  {
    id: 'art-2',
    title: 'Notte Stellata di Van Gogh',
    category: 'Arte',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
    tags: ['van gogh', 'quadro', 'arte', 'pittura', 'stelle', 'colori', 'notte']
  },
  {
    id: 'art-3',
    title: 'Tavolozza di Colori e Pennelli',
    category: 'Arte',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
    tags: ['pennello', 'colori', 'tavolozza', 'disegno', 'pittura', 'arte']
  },
  {
    id: 'art-4',
    title: 'David di Michelangelo',
    category: 'Arte',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    tags: ['scultura', 'statua', 'marmo', 'michelangelo', 'firenze', 'arte', 'rinascimento']
  },

  // Animali
  {
    id: 'anim-1',
    title: 'Leone nella Savana Africana',
    category: 'Animali',
    url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600&auto=format&fit=crop&q=80',
    tags: ['leone', 'savana', 'predatore', 'africa', 'mammifero', 'animale']
  },
  {
    id: 'anim-2',
    title: 'Delfino nel Mare Azzurro',
    category: 'Animali',
    url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=600&auto=format&fit=crop&q=80',
    tags: ['delfino', 'mare', 'oceano', 'mammifero marino', 'animali', 'nuoto']
  },
  {
    id: 'anim-3',
    title: 'Aquila Reale in Volo',
    category: 'Animali',
    url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=600&auto=format&fit=crop&q=80',
    tags: ['aquila', 'uccello', 'volo', 'rapace', 'cielo', 'animali', 'ali']
  },
  {
    id: 'anim-4',
    title: 'Orso Polare sui Ghiacci',
    category: 'Animali',
    url: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600&auto=format&fit=crop&q=80',
    tags: ['orso polare', 'polo nord', 'artico', 'ghiaccio', 'animali', 'neve']
  },
  {
    id: 'anim-5',
    title: 'Talpa che scava nel terreno',
    category: 'Animali',
    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
    tags: ['talpa', 'terra', 'prato', 'buche', 'animale', 'sotterraneo']
  },

  // Matematica & Geometria
  {
    id: 'math-1',
    title: 'Forme Geometriche e Solidi',
    category: 'Matematica',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    tags: ['geometria', 'forme', 'matematica', 'solidi', 'cubo', 'piramide', 'sfera']
  },
  {
    id: 'math-2',
    title: 'Calcolatrice e Numeri',
    category: 'Matematica',
    url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80',
    tags: ['calcolatrice', 'numeri', 'operazioni', 'matematica', 'calcoli', 'algebra']
  },
  {
    id: 'math-3',
    title: 'Compasso e Goniometro per Disegno Tecnico',
    category: 'Matematica',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    tags: ['compasso', 'goniometro', 'angoli', 'geometria', 'disegno tecnico', 'misure']
  }
];

export function searchLocalCuratedImages(query: string, category: string = 'Tutte'): WebImage[] {
  const normQuery = query.trim().toLowerCase();

  return CURATED_LIBRARY.filter((img) => {
    const matchCat = category === 'Tutte' || img.category.toLowerCase() === category.toLowerCase();
    if (!matchCat) return false;
    if (!normQuery) return true;

    const inTitle = img.title.toLowerCase().includes(normQuery);
    const inTags = img.tags.some((t) => t.toLowerCase().includes(normQuery));
    return inTitle || inTags;
  });
}

// Chiave configurabile con VITE_PIXABAY_API_KEY (file .env o secret di GitHub).
// Su un sito statico la chiave resta comunque visibile nel browser: usa una chiave gratuita dedicata.
const PIXABAY_API_KEY: string =
  (import.meta.env.VITE_PIXABAY_API_KEY as string | undefined) || '58158131-d9a95b0e0ed423ae0b87a0e20';

/**
 * Cerca immagini HD ad alta risoluzione su Pixabay tramite API ufficiale
 */
export async function searchPixabayImages(query: string): Promise<WebImage[]> {
  const clean = query.trim();
  if (!clean) return [];

  try {
    const qParam = encodeURIComponent(clean);
    // SafeSearch attivo per ambiente scolastico, 30 risultati ad alta qualità
    const endpoint = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${qParam}&image_type=photo&safesearch=true&per_page=30`;

    const res = await fetch(endpoint);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.hits || !Array.isArray(data.hits)) return [];

    return data.hits.map((hit: any) => {
      const tagList = (hit.tags || '').split(',').map((t: string) => t.trim());
      const mainTag = tagList[0] || clean;
      const titleCap = mainTag.charAt(0).toUpperCase() + mainTag.slice(1);

      return {
        id: `pix-${hit.id}`,
        title: titleCap,
        category: 'Generale',
        url: hit.webformatURL || hit.largeImageURL || hit.previewURL,
        tags: tagList.map((t: string) => t.toLowerCase())
      };
    });
  } catch (err) {
    console.warn('Pixabay API search note:', err);
    return [];
  }
}

/**
 * Cerca immagini libere su Wikimedia Commons API
 */
export async function searchWikimediaImages(query: string): Promise<WebImage[]> {
  const clean = query.trim();
  if (!clean) return [];

  try {
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      clean
    )}&gsrnamespace=6&gsrlimit=18&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=600&format=json&origin=*`;

    const res = await fetch(endpoint);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.query || !data.query.pages) return [];

    const results: WebImage[] = [];
    const pages = Object.values(data.query.pages) as any[];

    for (const p of pages) {
      const info = p.imageinfo && p.imageinfo[0];
      if (info && info.thumburl) {
        // Filter out non-image files (like audio/video or pdf)
        const mime = info.mime || '';
        if (mime.startsWith('image/')) {
          const rawTitle = (p.title || '')
            .replace(/^File:/i, '')
            .replace(/\.[a-zA-Z0-9]+$/, '')
            .replace(/_/g, ' ');

          results.push({
            id: `wiki-${p.pageid || Math.random().toString(36).substring(2, 7)}`,
            title: rawTitle.length > 55 ? `${rawTitle.substring(0, 52)}...` : rawTitle,
            category: 'Generale',
            url: info.thumburl,
            tags: [clean.toLowerCase()]
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.warn('Wikimedia Commons search fallback note:', err);
    return [];
  }
}

/**
 * Ricerca unificata Web: Pixabay HD come sorgente primaria + Wikimedia Commons come integrazione
 */
export async function searchWebImages(query: string): Promise<WebImage[]> {
  const clean = query.trim();
  if (!clean) return [];

  // 1. Esegui la ricerca Pixabay primaria
  const pixabayResults = await searchPixabayImages(clean);

  // Se Pixabay ha già fornito molti risultati soddisfacenti, usali
  if (pixabayResults.length >= 8) {
    return pixabayResults;
  }

  // 2. Altrimenti integra con Wikimedia Commons
  const wikiResults = await searchWikimediaImages(clean);
  const combined = [...pixabayResults, ...wikiResults];

  // Rimuovi duplicati di URL
  const seen = new Set<string>();
  const unique: WebImage[] = [];
  for (const img of combined) {
    if (!seen.has(img.url)) {
      seen.add(img.url);
      unique.push(img);
    }
  }

  return unique;
}
