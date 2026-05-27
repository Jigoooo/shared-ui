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
  // openAsync로 열린 다이얼로그의 미해결 resolve. 제자리 교체 시 false로 정리해 댕글링 방지.
  let pendingResolve: ((value: boolean) => void) | null = null;

  /**
   * open/openAsync의 공통 prelude.
   * 이미 열린 다이얼로그가 있으면 "제자리 교체"를 준비한다.
   * - 이전 stack 엔트리를 cleanup 콜백 없이 제거 (removeItem → history.back 재진입 방지)
   * - 이전 openAsync promise를 false로 정리
   * - 기존 history 슬롯을 재사용하므로 pushState 생략 (depth 증가 없음)
   * 신규 오픈일 때만 history 슬롯을 새로 push 한다.
   */
  const beginOpen = (dialogId: string) => {
    const { _dialogId } = getState();

    if (_dialogId) {
      modalBottomSheetStackActions.removeItem(_dialogId);
      if (pendingResolve) {
        pendingResolve(false);
        pendingResolve = null;
      }
    } else {
      window.history.pushState({ __layer: 'dialog', dialogId }, '');
    }
  };

  return {
    ...dialogInitialState,
    actions: {
      open: (dialogConfig) => {
        const dialogId = `dialog_${Date.now()}_${Math.random()}`;
        beginOpen(dialogId);
        pendingResolve = null;
        modalBottomSheetStackActions.push(dialogId, 'dialog', () => {
          // popstate에 의해 닫힐 때 실행되는 콜백
          setState(() => ({ ...dialogInitialState, dialogOpen: false, _dialogId: null }));
          pendingResolve = null;
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
          beginOpen(dialogId);
          pendingResolve = resolve;
          modalBottomSheetStackActions.push(dialogId, 'dialog', () => {
            // popstate에 의해 닫힐 때 실행되는 콜백
            setState(() => ({ ...dialogInitialState, dialogOpen: false, _dialogId: null }));
            resolve(false);
            pendingResolve = null;
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
        if (!_dialogId) return;
        // closeByHistory가 stack 제거 + resolve 콜백(상태 닫기 + openAsync false + pendingResolve 정리)을
        // 동기 실행하고 history.back()까지 처리한다. popstate를 기다리지 않으므로
        // 직후 open()이 호출돼도 일관된 상태를 보장한다.
        modalBottomSheetStackActions.closeByHistory(_dialogId);
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
