declare module '#core/assert' {
  function devAssert<T>(subject: T | null | undefined, msg?: string, ...any): T;
  function userAssert<T>(subject: T | null | undefined, msg?: string, ...any): T;
  function devAssertElement<T>(subject: T, msg?: string, ...any): HTMLElement;
  function devAssertString<T>(subject: T, msg?: string, ...any): string;
  function devAssertNumber<T>(subject: T, msg?: string, ...any): number;
}
