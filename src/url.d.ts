/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * TODO(#34453): The URL constructor isn't supported in IE11, but is supported
 * everywhere else. There's a lot of code paths (and all uses of the LruCache)
 * that are built around this polyfill. Once we can drop IE11 support and just
 * use the URL constructor, we can clear out all of parseWithA, all the URL
 * cache logic (incl. additional caches in other call-sites). Most is guarded by
 * isEsm() and is only included in nomodule builds, but still.
 */
export function parseUrlDeprecated(url: string, nocache?: boolean): Location;
