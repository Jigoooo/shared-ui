import { FloatingPortal } from '@floating-ui/react';
import { AnimatePresence, motion, type PanInfo, useDragControls } from 'framer-motion';
import { useRef } from 'react';

import { BottomSheetGrab } from './bottom-sheet-grab.tsx';
import { BottomSheetOverlay } from './bottom-sheet-overlay.tsx';
import { getBottomSheetContainerStyle, getBottomSheetStyle } from '../config/bottom-sheet-style.ts';
import { type BottomSheetProps } from '../model/bottom-sheet-type.ts';
import { useBottomSheetController } from '../model/use-bottom-sheet-controller.ts';
import { useThresholdInPixels } from '../model/use-threshold-in-pixels.ts';

export function BottomSheet({
  isOpen,
  onClose,
  children,
  maxHeight = 'auto',
  dragThreshold = 80,
  bottomInset = 0,
  showGrab = true,
  grabContainerStyle,
  grabStyle,
  animationDuration = 0.54,
  overlayDuration = 0.1,
  useHistory = true,
  onHistoryBack,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const bottomSheetContainerStyle = getBottomSheetContainerStyle({ maxHeight });
  const bottomSheetStyle = getBottomSheetStyle({ bottomInset });

  // onHistoryBack이 있으면 외부에서 history를 관리하므로 내부 history 사용 안 함
  const shouldUseHistory = onHistoryBack ? false : useHistory;
  const historyBack = onHistoryBack ?? (() => window.history.back());

  useBottomSheetController({
    modalRef: sheetRef,
    isOpen,
    onClose,
    useHistory: shouldUseHistory,
  });

  const thresholdPx = useThresholdInPixels(dragThreshold, sheetRef.current);

  const handleClose = () => {
    if (onHistoryBack) {
      historyBack();
    } else if (shouldUseHistory) {
      historyBack();
    } else {
      onClose();
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > thresholdPx) {
      handleClose();
    }
  };

  return (
    <FloatingPortal>
      <AnimatePresence initial={false}>
        {isOpen && (
          <BottomSheetOverlay
            isClosing={!isOpen}
            onOverlayClick={handleClose}
            duration={overlayDuration}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isOpen && (
          <>
            <motion.div
              ref={sheetRef}
              role='dialog'
              aria-modal='true'
              aria-label='Bottom sheet'
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                duration: animationDuration,
                ease: [0.32, 0.72, 0, 1],
              }}
              drag='y'
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              dragSnapToOrigin={true}
              onDrag={(_, info) => {
                if (info.offset.y < 0) {
                  dragControls.stop();
                }
              }}
              onDragStart={(_, info) => {
                if (info.delta.y < 0) {
                  dragControls.stop();
                }
              }}
              onDragEnd={handleDragEnd}
              style={bottomSheetContainerStyle}
            >
              {showGrab && (
                <BottomSheetGrab
                  grabContainerStyle={grabContainerStyle}
                  grabStyle={grabStyle}
                  dragControls={dragControls}
                />
              )}

              <div role='document' style={bottomSheetStyle}>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </FloatingPortal>
  );
}
