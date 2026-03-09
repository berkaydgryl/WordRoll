const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const TRANSLATE_API = 'https://api.mymemory.translated.net/get';

// Oturum bazlı cache
const wordCache = new Map();

/**
 * Kelimeyi Free Dictionary API'den çeker.
 * En az 2 farklı anlam ve örnek cümle arar.
 */
async function fetchDictionary(word) {
    const res = await fetch(`${DICT_API}/${encodeURIComponent(word)}`);
    if (!res.ok) throw new Error(`Dictionary API: ${res.status}`);
    const data = await res.json();
    return data;
}

/**
 * MyMemory API ile İngilizce→Türkçe çeviri yapar.
 */
async function translateToTurkish(text) {
    try {
        const res = await fetch(
            `${TRANSLATE_API}?q=${encodeURIComponent(text)}&langpair=en|tr`
        );
        if (!res.ok) throw new Error(`Translation API: ${res.status}`);
        const data = await res.json();
        return data.responseData?.translatedText || text;
    } catch {
        return text; // Çeviri başarısız olursa orijinali döndür
    }
}

/**
 * Dictionary API yanıtından en az 2 anlamlı bir yapı çıkarır.
 * Her anlam için: definition, example, partOfSpeech.
 * Başarısız olursa null döner.
 */
function extractMeanings(dictData) {
    const meanings = [];

    for (const entry of dictData) {
        for (const m of entry.meanings || []) {
            for (const def of m.definitions || []) {
                if (def.definition && meanings.length < 2) {
                    meanings.push({
                        partOfSpeech: m.partOfSpeech || '',
                        definition: def.definition,
                        example: def.example || null
                    });
                }
                if (meanings.length >= 2) break;
            }
            if (meanings.length >= 2) break;
        }
        if (meanings.length >= 2) break;
    }

    return meanings.length >= 2 ? meanings : null;
}

/**
 * Ses URL'sini çıkarır.
 */
function extractAudioUrl(dictData) {
    for (const entry of dictData) {
        for (const phonetic of entry.phonetics || []) {
            if (phonetic.audio) return phonetic.audio;
        }
    }
    return null;
}

/**
 * Tam kelime verisini döndürür (cache'li).
 * Başarısızlıkta null döner → üst katman retry yapar.
 */
export async function getFullWordData(word, level) {
    const cacheKey = word.toLowerCase();

    // Cache kontrolü
    if (wordCache.has(cacheKey)) {
        return wordCache.get(cacheKey);
    }

    try {
        // 1. Dictionary API
        const dictData = await fetchDictionary(word);
        const meanings = extractMeanings(dictData);

        if (!meanings) return null; // Yeterli veri yok → retry

        const audioUrl = extractAudioUrl(dictData);

        // 2. Her anlam için çeviri (paralel)
        const [def1Tr, def2Tr, ex1Tr, ex2Tr] = await Promise.all([
            translateToTurkish(meanings[0].definition),
            translateToTurkish(meanings[1].definition),
            meanings[0].example ? translateToTurkish(meanings[0].example) : Promise.resolve(''),
            meanings[1].example ? translateToTurkish(meanings[1].example) : Promise.resolve('')
        ]);

        // Ana Türkçe anlamı kısa tut (ilk tanımın çevirisi)
        const mainMeaningTr = await translateToTurkish(word);

        const wordData = {
            id: `${level}-${cacheKey}-${Date.now()}`,
            word: dictData[0]?.word || word,
            meaning: mainMeaningTr,
            type: meanings.map(m => capitalize(m.partOfSpeech)).filter(Boolean).join(' / ') || 'Unknown',
            level,
            audioUrl,
            definitions: [
                {
                    definition: meanings[0].definition,
                    translation: def1Tr,
                    example: meanings[0].example || `The word "${word}" is commonly used.`,
                    exampleTr: ex1Tr || `"${word}" kelimesi yaygın olarak kullanılır.`
                },
                {
                    definition: meanings[1].definition,
                    translation: def2Tr,
                    example: meanings[1].example || `You can use "${word}" in many sentences.`,
                    exampleTr: ex2Tr || `"${word}" kelimesini birçok cümlede kullanabilirsiniz.`
                }
            ]
        };

        // Cache'e kaydet
        wordCache.set(cacheKey, wordData);
        return wordData;

    } catch (err) {
        console.warn(`[API] "${word}" için veri çekilemedi:`, err.message);
        return null;
    }
}

/**
 * API durumunu kontrol eder (basit health check).
 */
export async function checkApiHealth() {
    try {
        const res = await fetch(`${DICT_API}/hello`, { method: 'HEAD' });
        return res.ok;
    } catch {
        return false;
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
