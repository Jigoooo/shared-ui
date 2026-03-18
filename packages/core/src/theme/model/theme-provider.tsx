import '../../../public/css/index.css';
import '../../../public/css/code.css';
import '../../../public/css/loader.css';

import { useEffect, type ReactNode } from 'react';

import { ThemeContext } from './theme-context.tsx';
import type { Theme, CustomThemeExtensions } from './theme-type.ts';
import { createTheme } from '../lib/create-theme.ts';
import { modalBottomSheetStackActions } from '@/hooks';

export function ThemeProvider<TCustomTheme extends CustomThemeExtensions = Record<string, never>>({
  theme,
  children,
}: {
  theme?: Theme<TCustomTheme>;
  children: ReactNode;
}) {
  const defaultTheme = createTheme<TCustomTheme>();

  useEffect(() => {
    /**
     * Root 레벨에서 모든 모달/바텀시트의 뒤로가기 이벤트를 중앙집중식으로 관리
     * - 단일 popstate 리스너 등록
     * - 스택의 최상단 모달/바텀시트만 LIFO 순서로 닫힘
     */
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

  return (
    <ThemeContext
      value={{
        theme: theme ?? defaultTheme,
      }}
    >
      {children}
    </ThemeContext>
  );
}
