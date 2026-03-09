import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wifi, X } from 'lucide-react';

const Toast = ({ message, type = 'warning', isVisible, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const iconMap = {
        warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
        offline: <Wifi className="w-4 h-4 text-orange-500 shrink-0" />,
        error: <X className="w-4 h-4 text-red-500 shrink-0" />
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] max-w-sm w-[calc(100%-2rem)]"
                >
                    <div className="bg-white dark:bg-apple-darkCard border border-gray-200 dark:border-apple-darkBorder rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                        {iconMap[type] || iconMap.warning}
                        <p className="text-sm text-apple-text dark:text-apple-darkText font-medium flex-1">{message}</p>
                        <button
                            onClick={onClose}
                            aria-label="Bildirimi Kapat"
                            className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
