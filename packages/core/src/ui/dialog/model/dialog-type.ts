import type { ReactNode } from 'react';

export type DialogConfig = {
  title?: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  withCancel?: boolean;
  overlayClose?: boolean;
  dialogType?: DialogType;
};

export type DialogStates = {
  dialogOpen: boolean;
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
