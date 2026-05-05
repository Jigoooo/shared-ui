import { FloatingOverlay } from '@floating-ui/react';
import { motion } from 'framer-motion';

import { bottomSheetOverlayStyle } from '../config/bottom-sheet-style.ts';

interface BottomSheetOverlayProps {
  isClosing: boolean;
  onOverlayClick: () => void;
  duration?: number;
}

export function BottomSheetOverlay({
  isClosing,
  onOverlayClick,
  duration = 0.1,
}: BottomSheetOverlayProps) {
  return (
    <motion.div
      role='presentation'
      aria-hidden='true'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      style={bottomSheetOverlayStyle}
    >
      <FloatingOverlay
        lockScroll
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          pointerEvents: isClosing ? 'none' : 'auto',
        }}
        onClick={() => {
          if (!isClosing) {
            onOverlayClick();
          }
        }}
      />
    </motion.div>
  );
}
