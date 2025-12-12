import { FloatingPortal } from '@floating-ui/react';
import { AnimatePresence, motion, type PanInfo, useDragControls } from 'framer-motion';
import { type ReactNode, useCallback, useRef, useState } from 'react';

import { BottomSheetGrab } from './bottom-sheet-grab.tsx';
import { BottomSheetOverlay } from './bottom-sheet-overlay.tsx';
import { getBottomSheetContainerStyle, getBottomSheetStyle } from '../config/bottom-sheet-style.ts';
import { BottomSheetContext } from '../model/bottom-sheet-context.ts';
import {
  type BottomSheetConfig,
  type BottomSheetItem,
  type BottomSheetRenderProps,
} from '../model/bottom-sheet-type.ts';
import { useBottomSheetController } from '../model/use-bottom-sheet-controller.ts';
import { useThresholdInPixels } from '../model/use-threshold-in-pixels.ts';

const initialConfig: BottomSheetConfig = {
  maxHeight: 'auto',
  dragThreshold: 80,
  bottomInset: 0,
  showGrab: true,
  closeAsyncTimeout: 350,
};

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const [activeSheet, setActiveSheet] = useState<BottomSheetItem | null>(null);
  const [sheetConfig, setSheetConfig] = useState<BottomSheetConfig>(initialConfig);

  const sheetRef = useRef<HTMLDivElement>(null);
  const popWaiterRef = useRef<() => void | null>(null);
  const dragControls = useDragControls();

  const bottomSheetContainerStyle = getBottomSheetContainerStyle({
    maxHeight: sheetConfig.maxHeight ?? 'auto',
  });
  const bottomSheetStyle = getBottomSheetStyle({ bottomInset: sheetConfig.bottomInset ?? 0 });

  const thresholdPx = useThresholdInPixels(sheetConfig.dragThreshold ?? 80, sheetRef.current);

  // onHistoryBack이 있으면 외부에서 history를 관리하므로 내부 history 사용 안 함
  const shouldUseHistory = sheetConfig.onHistoryBack ? false : (sheetConfig.useHistory ?? true);
  const historyBack = sheetConfig.onHistoryBack ?? (() => window.history.back());

  const handleClose = () => {
    if (sheetConfig.onHistoryBack) {
      historyBack();
    } else if (shouldUseHistory) {
      historyBack();
    } else {
      close();
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > thresholdPx) {
      handleClose();
    }
  };

  const close = () => {
    setActiveSheet(null);
  };

  const closeAsync = useCallback(() => {
    return new Promise<void>((resolve) => {
      popWaiterRef.current = resolve;
      if (sheetConfig.onHistoryBack) {
        historyBack();
      } else if (shouldUseHistory) {
        historyBack();
      } else {
        close();
        setTimeout(() => {
          queueMicrotask(() => {
            resolve();
            popWaiterRef.current = null;
          });
        }, sheetConfig.closeAsyncTimeout);
      }
    });
  }, [shouldUseHistory, historyBack, sheetConfig.closeAsyncTimeout, sheetConfig.onHistoryBack]);

  const open = useCallback(
    async (
      id: string,
      render: (props: BottomSheetRenderProps) => ReactNode,
      config?: BottomSheetConfig,
    ) => {
      if (activeSheet) {
        await closeAsync();
      }

      setActiveSheet({ id, render });
      setSheetConfig(() => ({ ...initialConfig, ...config }));
    },
    [activeSheet, closeAsync],
  );

  useBottomSheetController({
    modalRef: sheetRef,
    isOpen: !!activeSheet,
    onClose: () => {
      close();

      setTimeout(() => {
        queueMicrotask(() => {
          const resolve = popWaiterRef.current;
          if (resolve) {
            resolve();
            popWaiterRef.current = null;
          }
        });
      }, sheetConfig.closeAsyncTimeout);
    },
    useHistory: shouldUseHistory,
  });

  const contextValue = {
    open,
    close,
    isOpen: !!activeSheet,
    activeSheetId: activeSheet?.id ?? null,
  };

  return (
    <BottomSheetContext value={contextValue}>
      {children}

      <FloatingPortal>
        <AnimatePresence initial={false}>
          {!!activeSheet && (
            <BottomSheetOverlay isClosing={!activeSheet} onOverlayClick={handleClose} />
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {!!activeSheet && (
            <motion.div
              ref={sheetRef}
              role='dialog'
              aria-modal='true'
              aria-label='Bottom sheet'
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                duration: 0.54,
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
              {sheetConfig.showGrab && (
                <BottomSheetGrab
                  grabContainerStyle={sheetConfig.grabContainerStyle}
                  grabStyle={sheetConfig.grabStyle}
                  dragControls={dragControls}
                />
              )}

              <div role='document' style={bottomSheetStyle}>
                {activeSheet.render({
                  isOpen: true,
                  close: handleClose,
                  closeAsync,
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </BottomSheetContext>
  );
}
