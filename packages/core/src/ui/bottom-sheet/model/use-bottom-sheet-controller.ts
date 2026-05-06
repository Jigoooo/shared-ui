import { type RefObject, useEffect } from 'react';

export function useBottomSheetController({
  modalRef,
  isOpen,
  onClose,
  useHistory: _useHistory = true,
}: {
  modalRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  useHistory?: boolean;
}) {
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          const isModalFocused =
            modalRef.current?.contains(document.activeElement as Node) ||
            !document.activeElement ||
            document.activeElement === document.body;

          if (isModalFocused) {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown, {
        capture: true,
        passive: false,
      });
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, modalRef, onClose]);
}
