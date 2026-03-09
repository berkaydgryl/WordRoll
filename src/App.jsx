import React, { useState, useCallback, useEffect, useRef } from 'react';
import WordCard from './components/WordCard';
import FavoritesModal from './components/FavoritesModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import useLocalStorage from './hooks/useLocalStorage';
import { loadWordIndex, getRandomWord } from './services/wordIndex';
import { getFullWordData } from './services/apiService';
import fallbackData from './data/fallback-words.json';
import { Settings, Bookmark, RotateCcw, Loader2 } from 'lucide-react';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MAX_RETRIES = 3;

function App() {
    // Persistent state
    const [selectedLevel, setSelectedLevel] = useLocalStorage('wordroll-level', 'A1');
    const [favorites, setFavorites] = useLocalStorage('wordroll-favorites', []);
    const [isDarkMode, setIsDarkMode] = useLocalStorage('wordroll-dark', false);
    const [autoSpeak, setAutoSpeak] = useLocalStorage('wordroll-autospeak', false);
    const [speechRate, setSpeechRate] = useLocalStorage('wordroll-speechrate', 1);
    const [speechVolume, setSpeechVolume] = useLocalStorage('wordroll-volume', 1);
    const [totalRolls, setTotalRolls] = useLocalStorage('wordroll-rolls', 0);

    // Ephemeral state
    const [currentWord, setCurrentWord] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isFavModalOpen, setIsFavModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isIndexLoading, setIsIndexLoading] = useState(true);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'warning' });

    // Refs
    const wordIndexRef = useRef(null);

    // ─── Startup: Load word index ───
    useEffect(() => {
        (async () => {
            try {
                wordIndexRef.current = await loadWordIndex();
            } catch {
                wordIndexRef.current = null;
            }
            setIsIndexLoading(false);
        })();
    }, []);

    // ─── Dark mode ───
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            document.body.style.backgroundColor = '#1c1c1e';
            document.body.style.color = '#F5F5F7';
        } else {
            root.classList.remove('dark');
            document.body.style.backgroundColor = '#F5F5F7';
            document.body.style.color = '#1D1D1F';
        }
    }, [isDarkMode]);

    // ─── Voice Synchronization ───
    // Bu özellik kullanıcı talebiyle kaldırıldı. Singleton (WordCard) otomatik çalışacak.

    // ─── Show toast helper ───
    const showToast = (message, type = 'warning') => {
        setToast({ visible: true, message, type });
    };

    // ─── Fallback roll (offline) ───
    const rollFromFallback = useCallback(() => {
        const levelWords = fallbackData[selectedLevel] || fallbackData['A1'] || [];
        if (levelWords.length === 0) return null;
        const word = levelWords[Math.floor(Math.random() * levelWords.length)];
        return { ...word, id: `fallback-${word.word}-${Date.now()}` };
    }, [selectedLevel]);

    // ─── Main Roll Algorithm ───
    const handleRoll = useCallback(async () => {
        if (isRolling) return;

        setIsRolling(true);
        setTotalRolls(prev => prev + 1);

        const index = wordIndexRef.current;

        // İndeks yoksa fallback kullan
        if (!index || !index[selectedLevel] || index[selectedLevel].length === 0) {
            showToast('Kelime indeksi yüklenemedi, yedek listeden devam ediyoruz.', 'offline');
            const fallbackWord = rollFromFallback();
            setTimeout(() => {
                setCurrentWord(fallbackWord);
                setIsRolling(false);
            }, 600);
            return;
        }

        // API ile çekmeyi dene (max 3 retry)
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            const randomWord = getRandomWord(index, selectedLevel, currentWord?.word);
            if (!randomWord) break;

            try {
                const wordData = await getFullWordData(randomWord, selectedLevel);
                if (wordData) {
                    setCurrentWord(wordData);
                    setIsRolling(false);
                    return;
                }
                // wordData null → yeterli anlam yok, sessizce tekrar dene
            } catch {
                // API hatası → tekrar dene
            }
        }

        // Tüm denemeler başarısız → fallback
        showToast('API\'ye ulaşılamadı, yedek kelimelerle devam ediyoruz.', 'offline');
        const fallbackWord = rollFromFallback();
        setCurrentWord(fallbackWord);
        setIsRolling(false);

    }, [isRolling, selectedLevel, currentWord, rollFromFallback]);

    // ─── Favorites ───
    const toggleFavorite = (word) => {
        setFavorites(prev => {
            const isFav = prev.find(f => f.id === word.id);
            if (isFav) return prev.filter(f => f.id !== word.id);
            return [...prev, word];
        });
    };

    const handleClearFavorites = () => {
        if (window.confirm('Tüm favorilerin silinecek. Emin misin?')) setFavorites([]);
    };

    const handleResetAll = () => {
        if (window.confirm('Tüm verilerin silinecek. Emin misin?')) {
            setFavorites([]);
            setTotalRolls(0);
            setSelectedLevel('A1');
            setAutoSpeak(false);
            setSpeechRate(1);
            setSpeechVolume(1);
            setIsDarkMode(false);
            setCurrentWord(null);
        }
    };

    const isCurrentFavorite = currentWord && favorites.find(f => f.id === currentWord.id);

    // ─── Index loading state ───
    if (isIndexLoading) {
        return (
            <div className="min-h-screen min-h-dvh bg-apple-bg dark:bg-apple-darkBg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
                    <p className="text-apple-grey dark:text-apple-darkGrey text-sm font-medium">
                        Kelime havuzu yükleniyor...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-h-dvh bg-apple-bg dark:bg-apple-darkBg flex flex-col items-center p-6 sm:p-12 transition-colors duration-300">
            {/* Header */}
            <header className="w-full max-w-md flex justify-between items-center mb-12">
                <h1 className="text-2xl font-bold text-apple-text dark:text-apple-darkText tracking-tight flex items-center gap-0.5">
                    Word<span className="text-apple-blue">Roll</span>
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsFavModalOpen(true)}
                        aria-label="Favorilerim"
                        className="relative p-3 bg-white dark:bg-apple-darkCard shadow-sm border border-gray-100 dark:border-apple-darkBorder rounded-xl text-apple-grey dark:text-apple-darkGrey hover:text-apple-blue hover:shadow-md transition-all active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center"
                    >
                        <Bookmark className="w-5 h-5" />
                        {favorites.length > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-apple-darkCard rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        aria-label="Ayarlar"
                        className="p-3 bg-white dark:bg-apple-darkCard shadow-sm border border-gray-100 dark:border-apple-darkBorder rounded-xl text-apple-grey dark:text-apple-darkGrey hover:text-apple-text dark:hover:text-apple-darkText hover:shadow-md transition-all active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Level Selector */}
            <div className="w-full max-w-md bg-white/50 dark:bg-apple-darkCard/50 backdrop-blur-md p-1 rounded-2xl flex gap-1 mb-12 shadow-sm border border-white dark:border-apple-darkBorder">
                {LEVELS.map(level => (
                    <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        aria-label={`${level} seviyesini seç`}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${selectedLevel === level
                            ? 'bg-apple-blue text-white shadow-md'
                            : 'text-apple-grey dark:text-apple-darkGrey hover:bg-white dark:hover:bg-apple-darkCardHover hover:text-apple-text dark:hover:text-apple-darkText'
                            }`}
                    >
                        {level}
                    </button>
                ))}
            </div>

            {/* Main Card Area */}
            <main className="w-full flex-1 flex flex-col items-center justify-center gap-12">
                {!currentWord && !isRolling ? (
                    <div className="text-center space-y-6 max-w-sm px-4">
                        <div className="w-24 h-24 bg-apple-blue shadow-lg shadow-blue-200 dark:shadow-none rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 relative overflow-hidden group">
                            <RotateCcw className="w-10 h-10 text-white z-10 group-hover:rotate-180 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-apple-text dark:text-apple-darkText tracking-tight">Yeni Dünyalar Keşfet</h2>
                            <p className="text-apple-grey dark:text-apple-darkGrey text-sm leading-relaxed">
                                Misyonumuz, dil yolculuğunda sana sınıfının en iyisi telaffuz ve minimalist bir deneyim sunmak. Seviyeyi seç ve bugün yeni bir kelime mühürle.
                            </p>
                        </div>
                    </div>
                ) : (
                    <WordCard
                        word={currentWord}
                        isRolling={isRolling}
                        isFavorite={isCurrentFavorite}
                        onToggleFavorite={toggleFavorite}
                        speechRate={speechRate}
                        speechVolume={speechVolume}
                        autoSpeak={autoSpeak}
                    />
                )}

                {/* Roll Button */}
                <button
                    onClick={handleRoll}
                    disabled={isRolling}
                    aria-label={isRolling ? 'Kelime aranıyor...' : 'Yeni kelime getir'}
                    className={`
            group relative px-12 py-5 rounded-3xl font-bold text-lg tracking-wide
            transition-all duration-500 overflow-hidden
            ${isRolling
                            ? 'bg-gray-200 dark:bg-apple-darkCard text-gray-400 dark:text-gray-600 cursor-not-allowed scale-95'
                            : 'bg-apple-blue text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-2xl hover:shadow-blue-300 dark:hover:shadow-blue-900/40 hover:-translate-y-1 active:scale-95'}
          `}
                >
                    <span className="relative z-10 flex items-center gap-3">
                        {isRolling ? 'Aranıyor...' : 'Roll Now'}
                        {!isRolling && <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />}
                    </span>
                    {!isRolling && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                </button>
            </main>

            {/* Modals */}
            <FavoritesModal
                isOpen={isFavModalOpen}
                onClose={() => setIsFavModalOpen(false)}
                favorites={favorites}
                onRemove={toggleFavorite}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
                autoSpeak={autoSpeak}
                onToggleAutoSpeak={() => setAutoSpeak(prev => !prev)}
                speechRate={speechRate}
                onChangeSpeechRate={setSpeechRate}
                speechVolume={speechVolume}
                onChangeSpeechVolume={setSpeechVolume}
                stats={{ totalRolls, totalFavorites: favorites.length }}
                onClearFavorites={handleClearFavorites}
                onResetAll={handleResetAll}
            />

            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />

            {/* Footer */}
            <footer className="mt-12 text-apple-grey dark:text-apple-darkGrey text-[10px] uppercase font-bold tracking-widest flex gap-8">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {wordIndexRef.current?.[selectedLevel]?.length || 0} KELİME
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                    {favorites.length} FAVORİ
                </div>
            </footer>
        </div>
    );
}

export default App;
