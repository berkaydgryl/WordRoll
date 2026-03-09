import { useState, useEffect } from 'react';

/**
 * Custom hook to manage state in LocalStorage.
 * @param {string} key - The key for LocalStorage.
 * @param {any} initialValue - Initial value if none exists in LocalStorage.
 */
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`LocalStorage reading error for key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`LocalStorage writing error for key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}

export default useLocalStorage;
