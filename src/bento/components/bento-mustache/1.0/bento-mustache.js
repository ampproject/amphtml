// Bento components must import `bento-mustache.js` instead of `mustache` directly.
// This is so that the bundler links it to the external `bento-mustache.js` binary.
import mustache from '#bento/third_party/mustache/mustache';

export default mustache;
