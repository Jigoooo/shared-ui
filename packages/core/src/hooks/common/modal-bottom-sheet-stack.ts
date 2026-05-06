import { create } from 'zustand';

export type ModalStackItem = 'modal' | 'bottomsheet' | 'controlled-bottomsheet' | 'dialog';

export type StackEntry = {
  id: string;
  type: ModalStackItem;
  resolve: () => void;
};

type StackState = {
  stack: StackEntry[];
};

type StackActions = {
  push: (id: string, type: ModalStackItem, resolve: () => void) => void;
  pop: () => StackEntry | undefined;
  closeItem: (id: string) => void;
  /**
   * Remove an entry without invoking its resolve callback.
   * Use for controlled component cleanup where the close path
   * has already been handled (e.g. external isOpen=false).
   */
  removeItem: (id: string) => void;
  peek: () => StackEntry | undefined;
  has: (id: string) => boolean;
};

type ModalBottomSheetStackStore = StackState & {
  actions: StackActions;
};

const MAX_STACK_DEPTH = 10;

export const useModalBottomSheetStackStore = create<ModalBottomSheetStackStore>()(
  (setState, getState) => ({
    stack: [],
    actions: {
      push: (id, type, resolve) => {
        const { stack } = getState();
        // 중복 등록 방지
        if (stack.some((entry) => entry.id === id)) return;
        // 최대 깊이 제한
        if (stack.length >= MAX_STACK_DEPTH) {
          console.warn(`Modal/BottomSheet stack exceeded max depth of ${MAX_STACK_DEPTH}`);
          return;
        }
        setState({ stack: [...stack, { id, type, resolve }] });
      },

      pop: () => {
        const { stack } = getState();
        if (stack.length === 0) return undefined;
        const top = stack[stack.length - 1];
        setState({ stack: stack.slice(0, -1) });
        return top;
      },

      closeItem: (id) => {
        const { stack } = getState();
        const entry = stack.find((e) => e.id === id);
        if (!entry) return;
        // 스택에서 제거 전 resolve 호출
        entry.resolve();
        setState({ stack: stack.filter((e) => e.id !== id) });
      },

      removeItem: (id) => {
        const { stack } = getState();
        if (!stack.some((e) => e.id === id)) return;
        setState({ stack: stack.filter((e) => e.id !== id) });
      },

      peek: () => {
        const { stack } = getState();
        return stack.length > 0 ? stack[stack.length - 1] : undefined;
      },

      has: (id) => {
        const { stack } = getState();
        return stack.some((e) => e.id === id);
      },
    },
  }),
);

export const modalBottomSheetStackActions = useModalBottomSheetStackStore.getState().actions;
