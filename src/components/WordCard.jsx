import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Volume2 } from 'lucide-react';

// ─── Singleton Voice Guard (Bileşenin DIŞINDA tanımlanmalı) ───
let globalSelectedVoice = null;

const initializeVoice = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;

    // Özgüvenli ve tok erkek sesi öncelik sırası (Kullanıcı Talebi)
    const preferredVoice =
        voices.find(v => v.name === 'Google US English Male') ||
        voices.find(v => v.name.includes('David')) ||
        voices.find(v => v.name === 'Apple Ian') ||
        voices.find(v => v.name === 'Apple Nathan') ||
        voices.find(v => v.name.toLowerCase().includes('male') && v.lang.startsWith('en')) ||
        voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
        globalSelectedVoice = preferredVoice;
        console.log('[WordRoll] Ses Kilitlendi:', globalSelectedVoice.name);
    }
};

// Sesler yüklendiğinde bir kez çalıştır
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = initializeVoice;
    initializeVoice();
}

const WordCard = ({ word, isFavorite, onToggleFavorite, isRolling, speechRate = 1, speechVolume = 1, autoSpeak = false }) => {
    const audioRef = useRef(null);
    const isFirstRender = useRef(true); // Hayalet ses koruması

    if (!word && !isRolling) return null;

    const speakWord = (text, rate = 1, volume = 1) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        // Her zaman önce mevcut sesleri durdur (Çakışma Önleme)
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = volume; // Ses yüksekliğini mühürle

        // ─── Katı Atama (Strict Voice Binding) ───
        // Global referansı zorla bağla (Strict Binding)
        if (globalSelectedVoice) {
            utterance.voice = globalSelectedVoice;
        } else {
            initializeVoice(); // Ses kaybolduysa tekrar bulmayı dene
            utterance.voice = globalSelectedVoice;
        }

        if (globalSelectedVoice) {
            console.log(`[WordRoll] Locked Voice: ${globalSelectedVoice.name}`);
        }

        window.speechSynthesis.speak(utterance);
    };

    const handleSpeak = (text) => speakWord(text, speechRate, speechVolume);

    const handlePlayAudio = () => {
        if (word?.audioUrl && audioRef.current) {
            // Audio çalmadan önce TTS'i durdur (Çakışma Önleme)
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            audioRef.current.play().catch(() => handleSpeak(word.word));
        } else {
            handleSpeak(word.word);
        }
    };

    // ─── Otomatik Okuma ve Roll Koruması ───
    useEffect(() => {
        // İlk açılışta asla okuma yapma
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Roll sonrası kontrol: Sadece ayar "true" ise, kelime varsa ve roll bittiyse
        const shouldAutoSpeak = autoSpeak === true && word && !isRolling;

        if (shouldAutoSpeak) {
            const timer = setTimeout(() => {
                handlePlayAudio();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [word?.id, autoSpeak, isRolling, speechVolume]);

    // Eski format uyumluluğu (examples dizisi) + yeni format (definitions dizisi)
    const displayItems = word?.definitions || word?.examples?.map(ex => ({
        definition: '',
        translation: '',
        example: ex.en,
        exampleTr: ex.tr
    })) || [];

    return (
        <div className="relative w-full max-w-md mx-auto">
            {word?.audioUrl && <audio ref={audioRef} src={word.audioUrl} preload="none" />}

            <AnimatePresence mode="wait">
                {isRolling ? (
                    <motion.div
                        key="rolling"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="w-full min-h-[420px] sm:min-h-[480px] bg-white dark:bg-apple-darkCard rounded-3xl shadow-apple dark:shadow-apple-dark flex items-center justify-center border border-gray-100 dark:border-apple-darkBorder"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-apple-blue border-t-transparent rounded-full"
                            />
                            <p className="text-apple-grey dark:text-apple-darkGrey font-medium text-sm">Kelime aranıyor...</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={word.id}
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -24, scale: 1.05 }}
                        transition={{ type: "spring", damping: 22, stiffness: 120 }}
                        className="w-full min-h-[420px] sm:min-h-[480px] bg-white dark:bg-apple-darkCard rounded-3xl shadow-apple dark:shadow-apple-dark p-6 sm:p-8 flex flex-col border border-gray-100 dark:border-apple-darkBorder"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <span className="px-3 py-1 bg-apple-softBlue dark:bg-apple-blue/10 text-apple-blue rounded-full text-[11px] font-bold tracking-wider uppercase">
                                {word.level} · {word.type}
                            </span>
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => onToggleFavorite(word)}
                                aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                                className={`p-3 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center ${isFavorite
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500 shadow-sm'
                                    : 'bg-gray-50 dark:bg-apple-darkCardHover text-gray-300 dark:text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </motion.button>
                        </div>

                        {/* Word + Pronunciation */}
                        <div className="flex-1 flex flex-col justify-center text-center">
                            <div className="mb-1 flex items-center justify-center gap-2.5">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-apple-text dark:text-apple-darkText tracking-tight">
                                    {word.word}
                                </h1>
                                <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={handlePlayAudio}
                                    aria-label="Telaffuzu Dinle"
                                    className="p-3 rounded-full text-apple-grey dark:text-apple-darkGrey hover:text-apple-blue hover:bg-apple-softBlue dark:hover:bg-apple-blue/10 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    title="Telaffuzu Dinle"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </motion.button>
                            </div>

                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-apple-blue/30 to-transparent mx-auto my-3" />

                            <h2 className="text-xl sm:text-2xl font-semibold text-apple-blue mb-5">{word.meaning}</h2>

                            {/* Definitions with examples */}
                            <div className="space-y-3 text-left overflow-y-auto max-h-52 sm:max-h-60 pr-1 custom-scrollbar">
                                {displayItems.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50/80 dark:bg-apple-darkCardHover p-3.5 rounded-2xl border border-gray-100/60 dark:border-apple-darkBorder/60">
                                        {item.definition && (
                                            <p className="text-apple-text dark:text-apple-darkText text-xs font-semibold mb-1 leading-relaxed">
                                                {idx + 1}. {item.definition}
                                            </p>
                                        )}
                                        {item.translation && item.translation !== item.definition && (
                                            <p className="text-apple-secondaryLight dark:text-apple-secondaryDark text-[11px] mb-2 italic">
                                                {item.translation}
                                            </p>
                                        )}
                                        {item.example && (
                                            <div className="mt-1.5 pl-2 border-l-2 border-apple-blue/20">
                                                <p className="text-apple-text dark:text-apple-darkText/90 font-medium text-sm leading-relaxed">
                                                    "{item.example}"
                                                </p>
                                                {item.exampleTr && (
                                                    <p className="text-apple-secondaryLight dark:text-apple-secondaryDark text-xs leading-relaxed mt-0.5">
                                                        {item.exampleTr}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WordCard;
