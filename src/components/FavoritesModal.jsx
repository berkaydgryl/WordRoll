import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Trash2, BookOpen } from 'lucide-react';

const FavoritesModal = ({ isOpen, onClose, favorites, onRemove }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFavorites = useMemo(() => {
        if (!searchQuery.trim()) return favorites;
        const q = searchQuery.toLowerCase();
        return favorites.filter(item =>
            item.word.toLowerCase().includes(q) ||
            item.meaning.toLowerCase().includes(q)
        );
    }, [favorites, searchQuery]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        transition={{ type: "spring", damping: 28, stiffness: 160 }}
                        className="fixed inset-x-0 bottom-0 sm:inset-0 sm:m-auto w-full sm:max-w-lg sm:h-[80vh] max-h-[90vh] bg-white dark:bg-apple-darkCard flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-100 dark:border-apple-darkBorder"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                    >
                        <div className="sm:hidden flex justify-center pt-3 pb-1">
                            <div className="w-10 h-[4px] rounded-full bg-gray-300 dark:bg-gray-600" />
                        </div>

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-apple-darkBorder flex justify-between items-center bg-white/70 dark:bg-apple-darkCard/70 backdrop-blur-md">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-apple-text dark:text-apple-darkText">Favorilerim</h2>
                                <p className="text-[11px] text-apple-grey dark:text-apple-darkGrey mt-0.5 font-medium">{favorites.length} kelime kayıtlı</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={onClose}
                                aria-label="Modalı Kapat"
                                className="p-3 hover:bg-gray-100 dark:hover:bg-apple-darkCardHover rounded-full transition-colors text-apple-grey"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Search */}
                        <div className="px-4 py-3 bg-gray-50/50 dark:bg-black/20">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-grey pointer-events-none" />
                                <input
                                    id="search-favorites"
                                    type="text"
                                    placeholder="Kelime veya anlam ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label="Favorilerde ara"
                                    className="w-full bg-white dark:bg-apple-darkCardHover py-3 pl-10 pr-4 rounded-xl text-sm shadow-sm ring-1 ring-gray-200 dark:ring-apple-darkBorder focus:ring-2 focus:ring-apple-blue outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 text-apple-text dark:text-apple-darkText"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {filteredFavorites.length > 0 ? (
                                    <div className="grid gap-3">
                                        {filteredFavorites.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                                                className="group bg-white dark:bg-apple-darkCardHover p-4 rounded-2xl border border-gray-100 dark:border-apple-darkBorder shadow-sm hover:shadow-apple dark:hover:shadow-apple-dark transition-all"
                                            >
                                                {/* Top row: Level + Word + Delete */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-apple-blue uppercase tracking-wider bg-apple-softBlue dark:bg-apple-blue/10 px-1.5 py-0.5 rounded shrink-0">
                                                            {item.level}
                                                        </span>
                                                        <h3 className="font-bold text-apple-text dark:text-apple-darkText">{item.word}</h3>
                                                        <span className="text-xs text-apple-grey dark:text-apple-darkGrey">—</span>
                                                        <span className="text-sm text-apple-blue font-medium">{item.meaning}</span>
                                                    </div>
                                                    <motion.button
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => onRemove(item)}
                                                        aria-label={`${item.word} kelimesini favorilerden kaldır`}
                                                        className="p-3.5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100"
                                                        title="Favorilerden Kaldır"
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </motion.button>
                                                </div>

                                                {/* Example sentence — supports both definitions[] and examples[] */}
                                                {(() => {
                                                    const def = item.definitions?.[0];
                                                    const ex = item.examples?.[0];
                                                    const enText = def?.example || ex?.en;
                                                    const trText = def?.exampleTr || ex?.tr;
                                                    if (!enText) return null;
                                                    return (
                                                        <div className="pl-0.5 mt-1">
                                                            <p className="text-xs text-apple-text dark:text-apple-darkText/90 leading-relaxed italic">
                                                                "{enText}"
                                                            </p>
                                                            {trText && (
                                                                <p className="text-[11px] text-apple-secondaryLight dark:text-apple-secondaryDark leading-relaxed mt-0.5">
                                                                    {trText}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center py-16"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-apple-darkCardHover rounded-2xl flex items-center justify-center mb-4">
                                            <BookOpen className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <p className="text-apple-grey dark:text-apple-darkGrey text-sm font-medium">
                                            {searchQuery ? 'Aramanızla eşleşen kelime bulunamadı.' : 'Henüz favori kelimen yok.'}
                                        </p>
                                        <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">
                                            {searchQuery ? 'Farklı bir anahtar kelime dene.' : 'Kelimelerin yanındaki ♡ ikonuna bas.'}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FavoritesModal;
