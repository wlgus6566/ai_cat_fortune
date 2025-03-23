import { getRequestConfig } from 'next-intl/server';

// 영어 및 한국어 메시지 가져오기
import en from './en.json';
import ko from './ko.json';

// 번역 언어 목록 (영어와 한국어 지원)
export const locales = ['en', 'ko'];
export const defaultLocale = 'ko'; // 기본 언어는 한국어

// next-intl 번역 설정
export async function getTranslations() {
  return {
    en,
    ko
  };
}

// 서버 컴포넌트에서 사용할 수 있는 getRequestConfig 설정
export default getRequestConfig(async ({ locale }) => {
  return {
    locale: (locale || defaultLocale) as string,
    messages: locale === 'en' ? en : ko,
  };
});

// 클라이언트 컴포넌트에서 사용할 메시지
export const messages = {
  en,
  ko
}; 