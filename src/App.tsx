/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBasket, 
  ChefHat, 
  ChevronRight, 
  Sparkles, 
  ArrowLeft,
  Search,
  Tag,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  HelpCircle
} from 'lucide-react';
import { getSpecials } from './services/mockSpecials';
import { suggestRecipes, generateRecipeImage } from './services/geminiService';
import { SpecialItem, Recipe } from './types';

export default function App() {
  const [specials, setSpecials] = useState<SpecialItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTooltip, setHoveredTooltip] = useState<{ 
    description: string; 
    rect: DOMRect; 
  } | null>(null);

  useEffect(() => {
    getSpecials().then(setSpecials);
  }, []);

  const toggleItem = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const handleSuggest = async () => {
    if (selectedItems.size === 0) return;
    
    setLoading(true);
    setRecipes([]);
    setActiveRecipe(null);
    
    try {
      const selectedList = specials.filter(s => selectedItems.has(s.id));
      const suggestions = await suggestRecipes(selectedList);
      
      // Initially show text, then load images
      setRecipes(suggestions);
      
      // Load images one by one in background
      const withImages = await Promise.all(suggestions.map(async (r) => {
        const imageUrl = await generateRecipeImage(r.name, r.ingredients);
        return { ...r, imageUrl };
      }));
      
      setRecipes(withImages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpecials = specials.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1D1D1D] font-sans selection:bg-[#E2F1E7]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#EEE7E1] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#4A7C59] rounded-xl flex items-center justify-center text-white">
              <ShoppingBasket size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#2D3A3A]">FreshFinds</h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-[#8C7A6B]">Market Specials • AI Recipes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-[#F3F0ED] rounded-full px-4 py-2 gap-2 border border-transparent focus-within:border-[#4A7C59] transition-all">
              <Search size={16} className="text-[#8C7A6B]" />
              <input 
                type="text" 
                placeholder="Search deals..." 
                className="bg-transparent outline-none text-sm w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={handleSuggest}
              disabled={selectedItems.size === 0 || loading}
              className={`
                px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all
                ${selectedItems.size > 0 && !loading 
                  ? 'bg-[#4A7C59] text-white hover:bg-[#3A6B49] shadow-lg shadow-[#4A7C59]/20' 
                  : 'bg-[#E5E1DD] text-[#8C7A6B] cursor-not-allowed'}
              `}
            >
              <Sparkles size={16} />
              {loading ? 'Thinking...' : `Inspire Me (${selectedItems.size})`}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Specials Grid */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-serif text-[#2D3A3A]">Today's Yield</h2>
              <span className="text-xs bg-[#E2F1E7] text-[#3A6B49] px-3 py-1 rounded-full font-bold">
                {specials.length} DEALS
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
              {filteredSpecials.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  onClick={() => toggleItem(item.id)}
                  className={`
                    group cursor-pointer relative p-4 rounded-2xl border-2 transition-all duration-300
                    ${selectedItems.has(item.id) 
                      ? 'bg-[#E2F1E7] border-[#4A7C59]' 
                      : 'bg-white border-[#F3F0ED] hover:border-[#DED6CF] hover:shadow-sm'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <HelpCircle 
                        size={14} 
                        aria-label="More information"
                        className="text-[#8C7A6B] hover:text-[#4A7C59] transition-colors cursor-help"
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredTooltip({ description: item.description, rect });
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          setHoveredTooltip(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {selectedItems.has(item.id) && (
                        <CheckCircle2 size={16} className="text-[#4A7C59]" />
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#2D3A3A] mb-2">{item.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#4A7C59]">${item.salePrice.toFixed(2)}</span>
                    <span className="text-xs text-[#8C7A6B] line-through">${item.originalPrice.toFixed(2)}</span>
                    <span className="ml-auto text-[10px] font-bold text-white bg-[#D45D5D] px-2 py-0.5 rounded-full">
                      -{Math.round((1 - item.salePrice / item.originalPrice) * 100)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Right: Recipe Results */}
          <section className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeRecipe ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl border border-[#EEE7E1] overflow-hidden shadow-xl"
                >
                  <div className="relative h-96 group">
                    {activeRecipe.imageUrl ? (
                      <img 
                        src={activeRecipe.imageUrl} 
                        alt={activeRecipe.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F3F0ED] flex items-center justify-center flex-col animate-pulse">
                        <UtensilsCrossed size={48} className="text-[#DED6CF] mb-4" />
                        <p className="text-sm text-[#8C7A6B] font-medium">Framing your gourmet creation...</p>
                      </div>
                    )}
                    <button 
                      onClick={() => setActiveRecipe(null)}
                      className="absolute top-6 left-6 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
                    <h2 className="absolute bottom-10 left-10 text-4xl font-bold text-white font-serif max-w-lg leading-tight">
                      {activeRecipe.name}
                    </h2>
                  </div>

                  <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C7A6B] mb-6 flex items-center gap-2">
                        <Tag size={14} className="text-[#4A7C59]" /> Ingredients
                      </h3>
                      <ul className="space-y-3">
                        {activeRecipe.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-start gap-3 text-[#2D3A3A] group">
                            <span className="w-1.5 h-1.5 bg-[#4A7C59] rounded-full mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                            <span className="text-[15px] leading-snug">{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C7A6B] mb-6 flex items-center gap-2">
                        <Clock size={14} className="text-[#4A7C59]" /> Instructions
                      </h3>
                      <div className="space-y-6">
                        {activeRecipe.instructions.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <span className="text-2xl font-serif font-black text-[#E5E1DD] leading-none">{i + 1}</span>
                            <p className="text-[15px] text-[#2D3A3A] leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : recipes.length > 0 ? (
                <div className="flex flex-col gap-8">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl font-bold font-serif text-[#2D3A3A]">Supper is Served</h2>
                    <p className="text-[#8C7A6B] text-sm">Select a dish to start cooking</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recipes.map((recipe, idx) => (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setActiveRecipe(recipe)}
                        className="group cursor-pointer bg-white rounded-3xl border border-[#EEE7E1] overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="h-56 relative overflow-hidden bg-[#F3F0ED]">
                          {recipe.imageUrl ? (
                            <img 
                              src={recipe.imageUrl} 
                              alt={recipe.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ChefHat size={32} className="text-[#DED6CF] animate-bounce" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#4A7C59]">
                            {recipe.ingredients.length} Items
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-[#2D3A3A] mb-2 group-hover:text-[#4A7C59] transition-colors line-clamp-1">
                            {recipe.name}
                          </h3>
                          <p className="text-sm text-[#8C7A6B] line-clamp-2 mb-4 leading-relaxed">
                            {recipe.ingredients.slice(0, 3).join(', ')}...
                          </p>
                          <div className="flex items-center text-[#4A7C59] text-sm font-bold gap-1 group-hover:gap-2 transition-all">
                            View Recipe <ChevronRight size={16} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center text-center px-10">
                  <div className="w-24 h-24 bg-[#F3F0ED] rounded-full flex items-center justify-center text-[#8C7A6B] mb-8 relative">
                    <ChefHat size={40} className="relative z-10" />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0 bg-[#E2F1E7] rounded-full"
                    />
                  </div>
                  <h2 className="text-3xl font-bold font-serif text-[#2D3A3A] mb-4">What's for dinner tonight?</h2>
                  <p className="text-[#8C7A6B] max-w-md mb-8 leading-relaxed">
                    Select the market specials that catch your eye, and our culinary AI will craft personalized gourmet recipes just for you.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-[#8C7A6B] uppercase tracking-widest leading-loose">
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#4A7C59]" /> Gourmet Logic</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#4A7C59]" /> Visual plating</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#4A7C59]" /> Market Fresh</span>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {hoveredTooltip && createPortal(
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{ 
            top: hoveredTooltip.rect.top - 8,
            left: hoveredTooltip.rect.left + (hoveredTooltip.rect.width / 2),
            transform: 'translate(-50%, -100%)'
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-64"
          >
            <div className="p-3 bg-[#1D1D1D] text-white text-[11px] leading-relaxed rounded-xl shadow-2xl border border-white/10 relative">
              {hoveredTooltip.description}
              <div className="absolute top-full left-1/2 -ml-2 border-8 border-transparent border-t-[#1D1D1D]" />
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E1DD;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #DED6CF;
        }
      `}</style>
    </div>
  );
}
