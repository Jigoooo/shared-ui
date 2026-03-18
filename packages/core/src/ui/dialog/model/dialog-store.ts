import { create } from 'zustand';

import { type DialogStates, type DialogStore, DialogType } from './dialog-type.ts';
import { modalBottomSheetStackActions } from '@/hooks';

const dialogInitialState: DialogStates = {
  dialogOpen: false,
  _dialogId: null,
  dialogConfig: {
    title: '',
    content: '',
    confirmText: '확인',
    cancelText: '취소',
    withCancel: false,
    overlayClose: true,
    dialogType: DialogType.INFO,
    onConfirm: () => {},
    onCancel: () => {},
  },
};

export const useDialogStore = create<DialogStore>()((setState, getState) => {
  return {
    ...dialogInitialState,
    actions: {
      open: (dialogConfig) => {
        const dialogId = `dialog_${Date.now()}_${Math.random()}`;
        window.history.pushState({ __layer: 'dialog', dialogId }, '');
        modalBottomSheetStackActions.push(dialogId, 'dialog', () => {
          // popstate에 의해 닫힐 때 실행되는 콜백
          // UI 상태는 이미 close()에서 정리되므로 여기서는 스택 정리만 수행
        });
        setState((state) => ({
          ...state,
          dialogOpen: true,
          _dialogId: dialogId,
          dialogConfig: {
            ...dialogInitialState.dialogConfig,
            ...dialogConfig,
            withCancel: dialogConfig.cancelText !== undefined ? true : !!dialogConfig.withCancel,
            onConfirm: () => {
              if (dialogConfig.onConfirm) dialogConfig.onConfirm();
            },
            onCancel: () => {
              if (dialogConfig.onCancel) dialogConfig.onCancel();
            },
          },
        }));
      },
      openAsync: (dialogConfig) =>
        new Promise((resolve) => {
          const dialogId = `dialog_${Date.now()}_${Math.random()}`;
          window.history.pushState({ __layer: 'dialog', dialogId }, '');
          modalBottomSheetStackActions.push(dialogId, 'dialog', () => {
            // popstate에 의해 닫힐 때 실행되는 콜백
            // UI 상태는 이미 close()에서 정리되므로 여기서는 resolve(false)만 수행
            resolve(false);
          });
          setState((state) => ({
            ...state,
            dialogOpen: true,
            _dialogId: dialogId,
            dialogConfig: {
              ...dialogInitialState.dialogConfig,
              ...dialogConfig,
              withCancel: dialogConfig.cancelText !== undefined ? true : !!dialogConfig.withCancel,
              onConfirm: () => {
                if (dialogConfig.onConfirm) dialogConfig.onConfirm();
                resolve(true);
              },
              onCancel: () => {
                if (dialogConfig.onCancel) dialogConfig.onCancel();
                resolve(false);
              },
            },
          }));
        }),
      close: () => {
        const { _dialogId } = getState();
        setState(() => ({ ...dialogInitialState, dialogOpen: false, _dialogId: null }));
        if (_dialogId) {
          window.history.back();
        }
      },
      success: (dialogConfig) => {
        getState().actions.open({ ...dialogConfig, dialogType: DialogType.SUCCESS });
      },
      successAsync: (dialogConfig) => {
        return getState().actions.openAsync({ ...dialogConfig, dialogType: DialogType.SUCCESS });
      },
      error: (dialogConfig) => {
        getState().actions.open({ ...dialogConfig, dialogType: DialogType.ERROR });
      },
      errorAsync: (dialogConfig) => {
        return getState().actions.openAsync({ ...dialogConfig, dialogType: DialogType.ERROR });
      },
      warning: (dialogConfig) => {
        getState().actions.open({ ...dialogConfig, dialogType: DialogType.WARNING });
      },
      warningAsync: (dialogConfig) => {
        return getState().actions.openAsync({ ...dialogConfig, dialogType: DialogType.WARNING });
      },
      info: (dialogConfig) => {
        getState().actions.open({ ...dialogConfig, dialogType: DialogType.INFO });
      },
      infoAsync: (dialogConfig) => {
        return getState().actions.openAsync({ ...dialogConfig, dialogType: DialogType.INFO });
      },
    },
  };
});

export const dialog = useDialogStore.getState().actions;
