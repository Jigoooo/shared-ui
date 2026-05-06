import { FloatingPortal } from '@floating-ui/react';
import { AnimatePresence, motion, type PanInfo, useDragControls } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { BottomSheetGrab } from './bottom-sheet-grab.tsx';
import { BottomSheetOverlay } from './bottom-sheet-overlay.tsx';
import { getBottomSheetContainerStyle, getBottomSheetStyle } from '../config/bottom-sheet-style.ts';
import { type BottomSheetProps } from '../model/bottom-sheet-type.ts';
import { useBottomSheetController } from '../model/use-bottom-sheet-controller.ts';
import { useThresholdInPixels } from '../model/use-threshold-in-pixels.ts';
import { modalBottomSheetStackActions } from '@/hooks';

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

  // controlled 컴포넌트도 modal/bottomsheet stack에 등록 — type은 'controlled-bottomsheet'로 구분.
  // popstate 시 onClose 트리거되도록 push, 외부 isOpen 변경/unmount 시엔 onClose 중복 호출 방지를 위해 removeItem 사용.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const id = `controlled-bottomsheet_${Date.now()}_${Math.random()}`;
    if (shouldUseHistory) {
      window.history.pushState({ __layer: 'bottomsheet', bottomsheetId: id }, '');
    }
    modalBottomSheetStackActions.push(id, 'controlled-bottomsheet', () => {
      onCloseRef.current();
    });
    return () => {
      modalBottomSheetStackActions.removeItem(id);

      // 외부 isOpen=false 또는 unmount: 우리가 push한 history step이 아직 top이면 같이 정리.
      // history.back으로 발생할 popstate가 root 핸들러를 거쳐 다른 stack entry를 잘못 닫지 않도록 차단.
      // (shouldUseHistory가 false면 pushState도 안 했으므로 정리할 step도 없음)
      if (!shouldUseHistory) return;
      const currentState = window.history.state;
      const isOurStepTop =
        currentState?.__layer === 'bottomsheet' && currentState?.bottomsheetId === id;
      if (isOurStepTop) {
        const blocker = (e: PopStateEvent) => {
          e.stopImmediatePropagation();
        };
        window.addEventListener('popstate', blocker, { once: true, capture: true });
        window.history.back();
      }
    };
  }, [isOpen, shouldUseHistory]);

  // close 액션:
  // - shouldUseHistory: historyBack으로 popstate 트리거 → root 핸들러가 stack pop + onClose 호출
  // - !shouldUseHistory: onClose 직접 호출 (cleanup에서 stack 정리)
  const handleClose = () => {
    if (shouldUseHistory) {
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
