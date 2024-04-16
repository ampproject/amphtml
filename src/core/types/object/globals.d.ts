export {};

declare global {
  // A type for Objects that can be JSON serialized or that come from
  // JSON serialization. Requires the objects fields to be accessed with
  // bracket notation object['name'] to make sure the fields do not get
  // obfuscated.
  // TODO(rcebulko): Closure Compiler used this and the @dict annotation to check
  // that properties are only accessed using bracket notation. We need to
  // verify this works with TypeScript/esbuild.
  interface JsonObject {
    [key: string]: any;
  }
}
