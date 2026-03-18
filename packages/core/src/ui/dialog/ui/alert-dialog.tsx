import { FloatingOverlay, FloatingPortal } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { AlertDialogActions } from './alert-dialog-actions.tsx';
import { AlertDialogContents } from './alert-dialog-contents.tsx';
import { AlertDialogHeader } from './alert-dialog-header.tsx';
import { dialog, useDialogStore } from '../model/dialog-store.ts';
import { useDialogController } from '../model/use-dialog-controller.ts';
import { zIndex } from '@/constants';
import { detectDeviceTypeAndOS } from '@/lib';
import { FlexColumn } from '@/ui/layout';

const { isMobile } = detectDeviceTypeAndOS();

export function AlertDialog() {
  const dialogOpen = useDialogStore((state) => state.dialogOpen);
  const dialogConfig = useDialogStore(useShallow((state) => state.dialogConfig));
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useDialogController({
    modalRef: dialogRef,
    isOpen: dialogOpen,
    onClose: () => {
      dialog.close();
    },
  });

  const ignoreEnterRef = useRef(true);

  useEffect(() => {
    if (dialogOpen) {
      ignoreEnterRef.current = true;
      const timer = setTimeout(() => {
        ignoreEnterRef.current = false;
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (dialogOpen && isMobile) {
      const scrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (!dialogOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && dialogConfig.onConfirm && !ignoreEnterRef.current) {
        dialog.close();

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            dialogConfig.onConfirm?.();
          });
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dialogOpen, dialogConfig]);

  return (
    <FloatingPortal>
      <AnimatePresence initial={false}>
        {dialogOpen && (
          <>
            <FlexColumn
              ref={dialogRef}
              as={motion.div}
              tabIndex={-1}
              // initial={{ opacity: 0.6, scale: 0.94, x: '-50%', y: '-40%' }}
              // animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              // exit={{ opacity: 0.2, scale: 0.98, x: '-50%', y: '-45%' }}
              initial={{ opacity: 0.8, scale: 0.96, x: '-50%', y: '-46%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.98, x: '-50%', y: '-48%' }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                zIndex: zIndex.dialog,
                width: 'clamp(18rem, 82vw, 26rem)',
                maxHeight: 'clamp(0px, 80vh, 25rem)',
                background: '#ffffff',
                paddingInline: '1rem',
                paddingBlock: '1rem',
                borderRadius: '0.5rem',
                justifyContent: 'space-between',
                outline: 'none',
                userSelect: 'none',
                border: '1px solid #ECEEF3',
                boxShadow: '0 8px 24px rgba(16, 24, 40, 0.12), 0 2px 8px rgba(16, 24, 40, 0.06)',
                gap: '0.5rem',
              }}
            >
              <AlertDialogHeader
                title={dialogConfig.title}
                isEmptyContents={!dialogConfig.content}
              />
              <AlertDialogContents contents={dialogConfig.content} />
              <AlertDialogActions dialogConfig={dialogConfig} />
            </FlexColumn>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.01 }}
              style={{
                zIndex: zIndex.dialogOverlay,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <FloatingOverlay
                lockScroll
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  pointerEvents: dialogOpen ? 'auto' : 'none',
                }}
                onClick={() => {
                  if (dialogOpen && dialogConfig.overlayClose) {
                    dialog.close();
                  }
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </FloatingPortal>
  );
}
