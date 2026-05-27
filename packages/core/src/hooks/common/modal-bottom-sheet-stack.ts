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
  /**
   * 특정 엔트리를 동기적으로 닫는다(프로그램적 close 경로).
   * stack에서 제거 + resolve 콜백 실행 후 history.back()으로 슬롯을 회수하며,
   * 그 back()이 유발하는 popstate 1회는 내부적으로 무시 처리해 이중 pop을 막는다.
   * 모든 history/stack 동기화 로직을 이 모듈 안에 캡슐화한다.
   */
  closeByHistory: (id: string) => void;
  /**
   * root popstate 리스너가 위임하는 단일 핸들러.
   * 프로그램적 close가 표시한 무시 플래그를 소비하거나, 없으면 LIFO로 최상단을 닫는다.
   */
  handlePopState: () => void;
};

type ModalBottomSheetStackStore = StackState & {
  actions: StackActions;
};

const MAX_STACK_DEPTH = 10;

export const useModalBottomSheetStackStore = create<ModalBottomSheetStackStore>()((
  setState,
  getState,
) => {
  // 프로그램적 close가 동기 정리 후 부르는 history.back()의 popstate 1회를 무시하기 위한 플래그.
  let suppressNextPop = false;

  return {
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

      closeByHistory: (id) => {
        const { stack } = getState();
        const entry = stack.find((e) => e.id === id);
        if (!entry) return;
        // 동기 정리: resolve 콜백(상태 닫기 등)이 "엔트리가 stack을 떠날 때"의 단일 소유자.
        entry.resolve();
        setState({ stack: stack.filter((e) => e.id !== id) });
        // history 슬롯 회수. 이 back()의 popstate 1회는 handlePopState에서 무시된다.
        suppressNextPop = true;
        window.history.back();
      },

      handlePopState: () => {
        // 프로그램적 close가 이미 동기 정리한 popstate면 소비하고 종료(이중 pop 방지).
        if (suppressNextPop) {
          suppressNextPop = false;
          return;
        }
        // 그 외(브라우저 뒤로가기 등)는 LIFO로 최상단만 닫는다.
        const { stack } = getState();
        if (stack.length === 0) return;
        const top = stack[stack.length - 1];
        setState({ stack: stack.slice(0, -1) });
        top.resolve();
      },
    },
  };
});

export const modalBottomSheetStackActions = useModalBottomSheetStackStore.getState().actions;
