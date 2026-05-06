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
import { modalBottomSheetStackActions } from '@/hooks';

const initialConfig: BottomSheetConfig = {
  maxHeight: 'auto',
  dragThreshold: 80,
  bottomInset: 0,
  showGrab: true,
  closeAsyncTimeout: 350,
  animationDuration: 0.54,
  overlayDuration: 0.1,
};

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const [activeSheet, setActiveSheet] = useState<BottomSheetItem | null>(null);
  const [sheetConfig, setSheetConfig] = useState<BottomSheetConfig>(initialConfig);
  const [isClosing, setIsClosing] = useState(false);

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

  // 모든 close 경로의 단일 진입점.
  // - shouldUseHistory: state 정리 + historyBack으로 popstate 트리거 → root 핸들러가 stack pop + popWaiterRef resolve 처리
  // - !shouldUseHistory: state 정리 + closeItem으로 직접 stack 정리
  const close = useCallback(() => {
    if (!activeSheet) return;
    setIsClosing(true);
    setActiveSheet(null);
    if (shouldUseHistory) {
      historyBack();
    } else {
      modalBottomSheetStackActions.closeItem(activeSheet.id);
    }
  }, [activeSheet, shouldUseHistory, historyBack]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > thresholdPx) {
      close();
    }
  };

  const closeAsync = useCallback(() => {
    if (!activeSheet) return Promise.resolve();
    return new Promise<void>((resolve) => {
      popWaiterRef.current = resolve;
      close();
    });
  }, [activeSheet, close]);

  const open = useCallback(
    async (
      id: string,
      render: (props: BottomSheetRenderProps) => ReactNode,
      config?: BottomSheetConfig,
    ) => {
      if (activeSheet) {
        await closeAsync();
      }

      setIsClosing(false);
      setActiveSheet({ id, render });
      setSheetConfig(() => ({ ...initialConfig, ...config }));

      // history 상태 등록 후 바텀시트 스택에 push (새 config 기준으로 shouldUseHistory 계산)
      const newConfig = { ...initialConfig, ...config };
      const newShouldUseHistory = newConfig.onHistoryBack ? false : (newConfig.useHistory ?? true);
      if (newShouldUseHistory) {
        window.history.pushState({ __layer: 'bottomsheet', bottomsheetId: id }, '');
      }
      modalBottomSheetStackActions.push(id, 'bottomsheet', () => {
        // popstate(또는 closeItem)에 의해 닫힐 때 실행되는 콜백.
        // close()를 호출하면 history.back/closeItem이 재진입되어 무한 루프/잘못된 navigation을 일으키므로
        // 여기서는 state setter만 직접 호출 (history/stack은 이미 정리된 상태에서 들어오는 콜백).
        setIsClosing(true);
        setActiveSheet(null);

        setTimeout(() => {
          queueMicrotask(() => {
            const resolve = popWaiterRef.current;
            if (resolve) {
              resolve();
              popWaiterRef.current = null;
            }
          });
        }, sheetConfig.closeAsyncTimeout);
      });
    },
    [activeSheet, closeAsync, sheetConfig.closeAsyncTimeout],
  );

  useBottomSheetController({
    modalRef: sheetRef,
    isOpen: !!activeSheet,
    onClose: close,
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
            <BottomSheetOverlay
              isClosing={!activeSheet}
              onOverlayClick={close}
              duration={sheetConfig.overlayDuration}
            />
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
                duration: sheetConfig.animationDuration,
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
                  isOpen: !isClosing,
                  close: close,
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
