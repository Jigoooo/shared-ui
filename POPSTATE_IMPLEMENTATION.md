# popstate 리스너 ThemeProvider 통합 가이드

crypto-bot-web의 패턴을 futur/shared-ui 프로젝트에 적용하여, popstate 이벤트를 중앙집중식으로 관리하는 시스템을 구현했습니다.

## 📋 개요

이전에는 각 ModalContextProvider와 BottomSheetProvider가 독립적으로 popstate 리스너를 등록했습니다. 이제는 **ThemeProvider 레벨에서 단일 popstate 리스너를 등록**하고, **모달과 바텀시트의 스택을 중앙에서 관리**합니다.

## 🏗️ 구조

### 1. Modal/BottomSheet Stack Store
**파일**: `packages/core/src/hooks/common/modal-bottom-sheet-stack.ts`

```typescript
// 모달과 바텀시트를 모두 추적하는 Zustand store
export const useModalBottomSheetStackStore = create<ModalBottomSheetStackStore>(...)

// 스택 관리 액션:
// - push(id, type, resolve): 스택에 아이템 추가
// - pop(): 스택에서 최상단 아이템 제거 및 반환
// - closeItem(id): 특정 ID의 아이템 제거
// - peek(): 최상단 아이템 조회 (제거 안 함)
// - has(id): 아이템 존재 여부 확인
```

**특징**:
- 모달과 바텀시트를 구분하는 `ModalStackItem` 타입
- 최대 스택 깊이 제한 (10)
- 중복 등록 방지

### 2. ThemeProvider popstate 리스너
**파일**: `packages/core/src/theme/model/theme-provider.tsx`

```typescript
useEffect(() => {
  const handlePopState = () => {
    const top = modalBottomSheetStackActions.peek();
    if (!top) return; // 스택이 비어있으면 페이지 네비게이션 진행

    // LIFO: 최상단 모달/바텀시트만 닫기
    const popped = modalBottomSheetStackActions.pop();
    if (popped) {
      popped.resolve(); // resolve 콜백 실행
    }
  };

  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);
```

**동작**:
- Root 레벨 단일 리스너로 모든 popstate 이벤트 처리
- LIFO(Last In First Out) 순서로 모달/바텀시트 닫기
- 스택이 비면 자동으로 페이지 네비게이션 진행

### 3. ModalContextProvider 스택 연동
**파일**: `packages/core/src/ui/modal/ui/modal-context-provider.tsx`

```typescript
// 모달 열기 시 스택에 push
const open = (id, render, config) => {
  // ...기존 로직...
  
  // 모달 스택에 push
  modalBottomSheetStackActions.push(id, 'modal', () => {
    // popstate에 의해 닫힐 때 실행되는 콜백
    // 모달 닫기 로직
  });
};

// 모달 닫을 때 스택에서 제거
const onClose = () => {
  // ...기존 로직...
  modalBottomSheetStackActions.closeItem(top.id);
};
```

### 4. BottomSheetProvider 스택 연동
**파일**: `packages/core/src/ui/bottom-sheet/ui/bottom-sheet-provider.tsx`

```typescript
// 바텀시트 열기 시 스택에 push
const open = async (id, render, config) => {
  // ...기존 로직...
  
  // 바텀시트 스택에 push
  modalBottomSheetStackActions.push(id, 'bottomsheet', () => {
    // popstate에 의해 닫힐 때 실행되는 콜백
    // 바텀시트 닫기 로직
  });
};

// 바텀시트 닫을 때 스택에서 제거
const onClose = () => {
  // ...기존 로직...
  modalBottomSheetStackActions.closeItem(activeSheet.id);
};
```

## 🔄 동작 흐름

### 모달/바텀시트 열기
```
user opens modal
  ↓
ModalContextProvider.open()
  ↓
push(modalId, 'modal', resolveCallback) to stack
  ↓
window.history.pushState() [implicit]
  ↓
modal rendered
```

### 뒤로가기 (Back 버튼 또는 history.back())
```
user presses back button or calls history.back()
  ↓
browser triggers popstate event
  ↓
ThemeProvider.handlePopState()
  ↓
peek() → get top modal/bottomsheet
  ↓
pop() → remove from stack
  ↓
call resolve() callback
  ↓
modal/bottomsheet closes
  ↓
animation cleanup
```

### 모든 모달/바텀시트 닫혀있을 때 뒤로가기
```
user presses back when no modal/sheet open
  ↓
browser triggers popstate event
  ↓
ThemeProvider.handlePopState()
  ↓
peek() returns null (stack is empty)
  ↓
return early → allow normal page navigation
```

## 📦 hooks/index.ts 내보내기

```typescript
export {
  useModalBottomSheetStackStore,
  modalBottomSheetStackActions,
  type ModalStackItem,
  type StackEntry,
} from './common/modal-bottom-sheet-stack.ts';
```

## ✅ 장점

1. **중앙집중식 관리**: 모든 popstate 이벤트를 한 곳에서 처리
2. **명확한 LIFO 순서**: 가장 최근에 열린 모달/바텀시트부터 닫힘
3. **깔끔한 인터페이스**: Provider들이 스택 관리 로직에 집중하지 않음
4. **중복 리스너 제거**: ModalStackManager 같은 별도 컴포넌트 불필요
5. **타입 안정성**: TypeScript 지원으로 런타임 에러 방지
6. **디버깅 용이**: 스택 상태 추적 가능

## 🔍 주의사항

1. **ThemeProvider 필수**: ThemeProvider가 Root에 있어야 popstate 리스너 작동
2. **resolve 콜백**: 각 modal/bottomsheet의 resolve 콜백은 반드시 설정해야 함
3. **history.back() 사용**: window.history.back()으로만 닫아야 스택과 동기화됨
4. **스택 깊이 제한**: 최대 10개까지 중첩 가능 (필요시 조정 가능)

## 💾 파일 변경 사항

| 파일 | 변경 | 설명 |
|------|------|------|
| `hooks/common/modal-bottom-sheet-stack.ts` | 새로 생성 | 모달/바텀시트 스택 store |
| `hooks/index.ts` | 추가 | 스택 store export |
| `theme/model/theme-provider.tsx` | 수정 | popstate 리스너 추가 |
| `ui/modal/ui/modal-context-provider.tsx` | 수정 | 스택 push/closeItem 연동 |
| `ui/bottom-sheet/ui/bottom-sheet-provider.tsx` | 수정 | 스택 push/closeItem 연동 |

## 🚀 사용 예시

기존 코드와 동일하게 사용 가능합니다:

```typescript
// 모달 열기
const { open, close } = useModal();
const id = open(() => <MyModal />, { closeOnBackdropClick: true });

// 뒤로가기로 자동 닫힘
// user presses back → popstate → modal closes

// 명시적으로 닫기
close();
```

## 🔗 참고

- crypto-bot-web의 `ModalStackManager` 패턴 기반
- Zustand 상태 관리 (기존 프로젝트와 동일)
- React 18+ useEffect 안전 지원
