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
    // stack/history 동기화 로직은 stack 모듈에 캡슐화. 여기서는 popstate를 위임만 한다.
    const handlePopState = () => modalBottomSheetStackActions.handlePopState();

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
