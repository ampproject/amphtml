export function resolveURL(url, path) {
  // Invalid URL
  if (typeof url !== 'string' || url === '') {return '';}
  // Absolute URL http://,https://,//
  if (/^(https?:)?\/\//i.test(url)) {return url;}
  // Data URI
  if (/^data:.*,.*$/i.test(url)) {return url;}
  // Blob URL
  if (/^blob:.*$/i.test(url)) {return url;}
  // Relative URL
  return path + url;
}
