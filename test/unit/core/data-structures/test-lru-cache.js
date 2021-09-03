import {LruCache} from '#core/data-structures/lru-cache';

describes.sandboxed('data structures - LruCache', {}, () => {
  let cache;

  beforeEach(() => {
    cache = new LruCache(5);
    for (let i = 0; i < 5; i++) {
      cache.put(i, i);
    }
  });

  it('should create a prototype-less object for caching', () => {
    expect(cache.get('constructor')).to.be.undefined;
  });

  it('should cache up to capacity', () => {
    for (let i = 0; i < 5; i++) {
      expect(cache.get(i)).to.equal(i);
    }
  });

  it('should not-evict when putting same key', () => {
    for (let i = 0; i < 5; i++) {
      cache.put(0, i);
    }
    expect(cache.get(0)).to.equal(4);
    for (let i = 1; i < 5; i++) {
      expect(cache.get(i)).to.equal(i);
    }
  });

  it('should never be over cap', () => {
    for (let i = 5; i < 10; i++) {
      cache.put(i, i);
    }
    for (let i = 0; i < 5; i++) {
      expect(cache.get(i)).to.be.undefined;
    }
  });

  it('should evict least recently used', () => {
    expect(cache.get(0)).to.equal(0);
    cache.put(5, 5);
    expect(cache.get(0)).to.equal(0);
    expect(cache.get(5)).to.equal(5);
    expect(cache.get(1)).to.be.undefined;
  });
});
