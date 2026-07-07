import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ADMIN_SAVED_EVENT } from '@/api/apiClient';

/**
 * Global "Changes saved" confirmation shown after every successful admin
 * mutation (create/update/delete/upload), no matter which page triggered it.
 * Debounced so multi-step saves show a single confirmation.
 */
export default function AdminSaveIndicator() {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => {
    const onSaved = () => {
      // Debounce: wait briefly so multi-request saves confirm once at the end.
      clearTimeout(showTimer.current);
      showTimer.current = setTimeout(() => {
        setVisible(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setVisible(false), 2500);
      }, 400);
    };
    window.addEventListener(ADMIN_SAVED_EVENT, onSaved);
    return () => {
      window.removeEventListener(ADMIN_SAVED_EVENT, onSaved);
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4" />
          Changes saved
        </motion.div>
      )}
    </AnimatePresence>
  );
}
