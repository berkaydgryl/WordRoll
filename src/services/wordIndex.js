import localIndex from '../data/word-index.json';

const GITHUB_INDEX_URL = null; // Henüz GitHub'a yüklenmediyse null bırakın
// Örnek: 'https://raw.githubusercontent.com/KULLANICI/wordroll-data/main/word-index.json'

let cachedIndex = null;

export async function loadWordIndex() {
    if (cachedIndex) return cachedIndex;

    // GitHub'dan çekmeyi dene
    if (GITHUB_INDEX_URL) {
        try {
            const res = await fetch(GITHUB_INDEX_URL);
            if (res.ok) {
                cachedIndex = await res.json();
                console.log('[WordIndex] GitHub\'dan yüklendi.');
                return cachedIndex;
            }
        } catch (err) {
            console.warn('[WordIndex] GitHub erişilemedi, yerel indeks kullanılıyor.', err.message);
        }
    }

    // Yerel fallback
    cachedIndex = localIndex;
    console.log('[WordIndex] Yerel indeks yüklendi.');
    return cachedIndex;
}

export function getRandomWord(index, level, excludeWord = null) {
    const words = index[level];
    if (!words || words.length === 0) return null;

    const available = excludeWord
        ? words.filter(w => w.toLowerCase() !== excludeWord.toLowerCase())
        : words;

    if (available.length === 0) return words[0];
    return available[Math.floor(Math.random() * available.length)];
}
