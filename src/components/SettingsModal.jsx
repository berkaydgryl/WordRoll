import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Volume2, BarChart3, Trash2, Info, Github, Linkedin, ExternalLink } from 'lucide-react';

const SPEED_OPTIONS = [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '1.5x', value: 1.5 },
];

const SettingsModal = ({
    isOpen,
    onClose,
    isDarkMode,
    onToggleDarkMode,
    autoSpeak,
    onToggleAutoSpeak,
    speechRate,
    onChangeSpeechRate,
    speechVolume,
    onChangeSpeechVolume,
    stats,
    onClearFavorites,
    onResetAll,
}) => {

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
                        className="fixed inset-x-0 bottom-0 sm:inset-0 sm:m-auto w-full sm:max-w-md sm:h-auto max-h-[90vh] bg-white dark:bg-apple-darkCard flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-100 dark:border-apple-darkBorder"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                    >
                        {/* Drag handle (mobile) */}
                        <div className="sm:hidden flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                        </div>

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-apple-darkBorder flex justify-between items-center">
                            <h2 className="text-lg font-bold text-apple-text dark:text-apple-darkText">Ayarlar</h2>
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={onClose}
                                aria-label="Modalı Kapat"
                                className="p-3 hover:bg-gray-100 dark:hover:bg-apple-darkCardHover rounded-full transition-colors text-apple-grey"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                            {/* ── Görünüm ── */}
                            <Section title="Görünüm">
                                <SettingRow
                                    icon={isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                    label="Karanlık Mod"
                                >
                                    <Toggle checked={isDarkMode} onChange={onToggleDarkMode} ariaLabel="Karanlık modu aç/kapat" />
                                </SettingRow>
                            </Section>

                            {/* ── Ses ── */}
                            <Section title="Ses">
                                <SettingRow icon={<Volume2 className="w-4 h-4" />} label="Otomatik Oku">
                                    <Toggle checked={autoSpeak} onChange={onToggleAutoSpeak} ariaLabel="Otomatik okumayı aç/kapat" />
                                </SettingRow>

                                <div className="mt-6 pl-8">
                                    <p className="text-xs text-apple-grey dark:text-apple-darkGrey mb-2 font-medium">Konuşma Hızı</p>
                                    <div className="flex gap-2">
                                        {SPEED_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => onChangeSpeechRate(opt.value)}
                                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${speechRate === opt.value
                                                    ? 'bg-apple-blue text-white shadow-sm'
                                                    : 'bg-gray-100 dark:bg-apple-darkCardHover text-apple-grey dark:text-apple-darkGrey hover:bg-gray-200 dark:hover:bg-apple-darkBorder'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 pl-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor="volume-slider" className="text-xs text-apple-grey dark:text-apple-darkGrey font-medium">
                                            Ses Yüksekliği
                                        </label>
                                        <span className="text-[10px] font-bold text-apple-blue">{Math.round(speechVolume * 100)}%</span>
                                    </div>
                                    <input
                                        id="volume-slider"
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={speechVolume}
                                        onChange={(e) => onChangeSpeechVolume(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 dark:bg-apple-darkCard rounded-lg appearance-none cursor-pointer accent-apple-blue"
                                        aria-label="Ses Yüksekliği"
                                    />
                                </div>
                            </Section>

                            {/* ── İstatistikler ── */}
                            <Section title="İstatistikler">
                                <div className="grid grid-cols-2 gap-3">
                                    <StatCard icon={<BarChart3 className="w-4 h-4 text-apple-blue" />} value={stats.totalRolls} label="Roll Sayısı" />
                                    <StatCard icon={<span className="text-red-400 text-sm">♥</span>} value={stats.totalFavorites} label="Favori" />
                                </div>
                            </Section>

                            {/* ── Veri Yönetimi ── */}
                            <Section title="Veri Yönetimi">
                                <button
                                    onClick={onClearFavorites}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Favorileri Temizle
                                </button>
                                <button
                                    onClick={onResetAll}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all mt-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Tüm Veriyi Sıfırla
                                </button>
                            </Section>

                            {/* ── Hakkında ── */}
                            <Section title="Hakkında">
                                <div className="bg-gray-50 dark:bg-apple-darkCardHover rounded-2xl p-4">
                                    <p className="font-bold text-apple-text dark:text-apple-darkText text-sm">WordRoll <span className="text-apple-grey dark:text-apple-darkGrey font-normal">v1.0.0</span></p>
                                    <p className="text-xs text-apple-grey dark:text-apple-darkGrey mt-1 leading-relaxed">
                                        Modern İngilizce kelime öğrenme uygulaması.
                                    </p>
                                    <div className="h-px bg-gray-200 dark:bg-apple-darkBorder my-3" />
                                    <p className="text-xs text-apple-text dark:text-apple-darkText font-medium">Berkay Doğruyol</p>
                                    <p className="text-[11px] text-apple-grey dark:text-apple-darkGrey">Altınbaş Üniversitesi — Yazılım Mühendisliği</p>
                                    <div className="flex gap-3 mt-3">
                                        <a
                                            href="https://github.com/berkaydgryl"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-apple-grey dark:text-apple-darkGrey hover:text-apple-text dark:hover:text-apple-darkText transition-colors"
                                        >
                                            <Github className="w-3.5 h-3.5" /> GitHub
                                        </a>
                                        <a
                                            href="https://www.linkedin.com/in/berkay-doğruyol-b18689240/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-apple-grey dark:text-apple-darkGrey hover:text-apple-text dark:hover:text-apple-darkText transition-colors"
                                        >
                                            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                        </a>
                                    </div>
                                </div>
                            </Section>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

/* ── Sub-components ── */

const Section = ({ title, children }) => (
    <div>
        <h3 className="text-[11px] uppercase tracking-wider font-bold text-apple-grey dark:text-apple-darkGrey mb-3">{title}</h3>
        {children}
    </div>
);

const SettingRow = ({ icon, label, children }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
            <span className="text-apple-grey dark:text-apple-darkGrey">{icon}</span>
            <span className="text-sm font-medium text-apple-text dark:text-apple-darkText">{label}</span>
        </div>
        {children}
    </div>
);

const Toggle = ({ checked, onChange, ariaLabel }) => (
    <button
        onClick={onChange}
        aria-label={ariaLabel}
        aria-pressed={checked}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-apple-blue' : 'bg-gray-300 dark:bg-gray-600'
            }`}
    >
        <motion.div
            animate={{ x: checked ? 20 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
    </button>
);

const StatCard = ({ icon, value, label }) => (
    <div className="bg-gray-50 dark:bg-apple-darkCardHover rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">{icon}</div>
        <p className="text-2xl font-bold text-apple-text dark:text-apple-darkText">{value}</p>
        <p className="text-[10px] uppercase tracking-wider text-apple-grey dark:text-apple-darkGrey font-medium">{label}</p>
    </div>
);

export default SettingsModal;
