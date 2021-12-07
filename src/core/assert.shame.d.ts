declare module '#core/assert' {
  function devAssert<T>(T, string?, ...any): T;
  function userAssert<T>(T, string?, ...any): T;
  function devAssertElement<T>(T, string?, ...any): HTMLElement;
  function devAssertString<T>(T, string?, ...any): string;
}
