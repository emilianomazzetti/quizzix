import React, { useState, useEffect } from 'react';
import { Search, Globe, Link as LinkIcon, X, Check, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { searchLocalCuratedImages, searchWebImages, WebImage } from '../utils/imageSearch';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentImage?: string;
}

const CATEGORIES = ['Tutte', 'Storia', 'Scienze', 'Geografia', 'Arte', 'Animali', 'Matematica'] as const;

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImage
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'url'>('search');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutte');
  const [customUrl, setCustomUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const [webResults, setWebResults] = useState<WebImage[]>([]);
  const [isLoadingWeb, setIsLoadingWeb] = useState(false);

  // Local curated results for immediate display
  const localImages = searchLocalCuratedImages(query, selectedCategory);

  // Trigger web search on query change with debounce (Pixabay HD API + Wikimedia)
  useEffect(() => {
    if (!isOpen || activeTab !== 'search') return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setWebResults([]);
      setIsLoadingWeb(false);
      return;
    }

    setIsLoadingWeb(true);
    const timer = setTimeout(() => {
      searchWebImages(trimmed)
        .then((res) => {
          setWebResults(res);
        })
        .finally(() => {
          setIsLoadingWeb(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [query, isOpen, activeTab]);

  if (!isOpen) return null;

  // Merge results, removing any duplicate URLs
  const allImages: WebImage[] = [];
  const seenUrls = new Set<string>();

  [...webResults, ...localImages].forEach((img) => {
    if (!seenUrls.has(img.url)) {
      seenUrls.add(img.url);
      allImages.push(img);
    }
  });

  const handleSelect = (url: string) => {
    onSelectImage(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Galleria & Ricerca Immagini Web</h3>
              <p className="text-xs text-slate-400">
                Centinaia di migliaia di immagini ad alta definizione da Pixabay & Wikimedia Commons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-3 bg-slate-950/30 gap-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            Cerca sul Web (Pixabay HD & Wikimedia)
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Incolla Link Diretto URL
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'search' ? (
            <>
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cerca qualsiasi materia (es. Napoleone, Sistema Solare, Colosseo, Piramidi, Cellula, Leone)..."
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  {isLoadingWeb ? (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
                  ) : query ? (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-400 font-bold mr-1">Filtro Materia:</span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Status & Results */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  {allImages.length} immagini trovate
                  {isLoadingWeb && ' • Ricerca web in corso...'}
                </span>
                <span className="text-indigo-400 font-medium">Tocca un'immagine per inserirla nel quiz</span>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {allImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => handleSelect(img.url)}
                    className="group relative aspect-video sm:aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500 cursor-pointer transition-all hover:scale-[1.02] shadow-md flex flex-col justify-end"
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    <div className="relative p-2.5 z-10 space-y-0.5">
                      <p className="text-[11px] font-bold text-white line-clamp-1 leading-tight">
                        {img.title}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-slate-300 font-semibold">
                        <span className="px-1.5 py-0.5 bg-black/60 rounded-md backdrop-blur-xs">
                          {img.category}
                        </span>
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          Scegli
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {allImages.length === 0 && !isLoadingWeb && (
                <div className="p-12 text-center text-slate-400 bg-slate-950/60 rounded-3xl border border-dashed border-slate-800 space-y-2">
                  <p className="font-bold text-sm">Nessuna immagine trovata per "{query}"</p>
                  <p className="text-xs text-slate-500">
                    Prova a cercare con un termine diverso oppure incolla direttamente un URL dal web nella scheda "Incolla Link".
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Custom URL Tab */
            <div className="space-y-4 max-w-lg mx-auto py-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Indirizzo Web dell'immagine (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setPreviewImage(e.target.value);
                    }}
                    placeholder="https://esempio.it/foto.jpg"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleSelect(customUrl)}
                    disabled={!customUrl.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Usa Questa
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Puoi incollare qualsiasi link immagine valido (terminante in .jpg, .png o .webp).
                </p>
              </div>

              {/* Preview */}
              {previewImage && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Anteprima immagine:
                  </span>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <img
                      src={previewImage}
                      alt="Anteprima"
                      className="w-full h-full object-contain"
                      onError={() => setPreviewImage(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
