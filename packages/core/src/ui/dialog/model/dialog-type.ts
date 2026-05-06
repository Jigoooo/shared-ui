import type { ReactNode } from 'react';

export type DialogConfig = {
  title?: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  // `() => void` 시그니처는 TypeScript의 특수 규칙으로 어떤 반환값도 허용됩니다
  // (React onClick과 동일 패턴). async 함수, setState 직접 반환 모두 lint 에러 없이 가능.
  onConfirm?: () => void;
  onCancel?: () => void;
  withCancel?: boolean;
  overlayClose?: boolean;
  dialogType?: DialogType;
};

export type DialogStates = {
  dialogOpen: boolean;
  _dialogId: string | null;
  dialogConfig: DialogConfig;
};

export type DialogStore = DialogStates & {
  actions: {
    open: (openDialog: DialogConfig) => void;
    openAsync: (openDialog: DialogConfig) => Promise<boolean>;
    close: () => void;
    success: (openDialog: DialogConfig) => void;
    successAsync: (openDialog: DialogConfig) => Promise<boolean>;
    error: (openDialog: DialogConfig) => void;
    errorAsync: (openDialog: DialogConfig) => Promise<boolean>;
    warning: (openDialog: DialogConfig) => void;
    warningAsync: (openDialog: DialogConfig) => Promise<boolean>;
    info: (openDialog: DialogConfig) => void;
    infoAsync: (openDialog: DialogConfig) => Promise<boolean>;
  };
};

export enum DialogType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}
