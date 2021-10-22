import {
  intersectionEntryToJson,
  measureIntersection,
} from '#core/dom/layout/intersection';

describes.fakeWin('DOM - layout - intersection observer', {}, (env) => {
  function getInObConstructorStub() {
    const ctor = (cb) => {
      if (ctor.callback) {
        throw new Error('Only a single InOb instance allowed per Window.');
      }
      const observedEls = new Set();
      ctor.callback = (entries) => {
        if (entries.some((x) => !observedEls.has(x.target))) {
          throw new Error(
            'Attempted to fire intersection for unobserved element.'
          );
        }
        cb(entries);
      };
      return {
        observe: (e) => observedEls.add(e),
        unobserve: (e) => observedEls.delete(e),
        disconnect: () => observedEls.clear(),
      };
    };
    return ctor;
  }

  function fireIntersections(entries) {
    if (entries.length == 0) {
      return;
    }
    const win = entries[0].target.ownerDocument.defaultView;
    win.IntersectionObserver.callback(entries);
  }

  let el;
  beforeEach(() => {
    env.win.IntersectionObserver = getInObConstructorStub();
    el = env.win.document.createElement('p');
    env.win.document.body.appendChild(el);
  });

  it('should measure intersection for an element', async () => {
    const intersection = measureIntersection(el);
    fireIntersections([{x: 100, target: el}]);
    expect(await intersection).eql({x: 100, target: el});
  });

  it('should dedupe multiple measures', async () => {
    const measure1 = measureIntersection(el);
    const measure2 = measureIntersection(el);
    expect(measure1).equal(measure2);
  });

  it('should not dedupe multiple measures with entries in between', async () => {
    const measure1 = measureIntersection(el);
    fireIntersections([{x: 100, target: el}]);
    const measure2 = measureIntersection(el);

    expect(measure1).not.equal(measure2);
  });

  it('should only use the latest entry', async () => {
    const intersection = measureIntersection(el);
    const firstEntry = {x: 0, target: el};
    const secondEntry = {x: 100, target: el};

    fireIntersections([firstEntry, secondEntry]);
    expect(await intersection).equal(secondEntry);
  });

  it('should measure multiple elements', async () => {
    const el2 = env.win.document.createElement('p');
    env.win.document.body.appendChild(el2);

    const intersection1 = measureIntersection(el);
    const intersection2 = measureIntersection(el2);

    const firstEntry = {x: 0, target: el};
    const secondEntry = {x: 2, target: el2};

    fireIntersections([secondEntry]);
    fireIntersections([firstEntry]);

    expect(await intersection1).equal(firstEntry);
    expect(await intersection2).equal(secondEntry);
  });

  it('should support measuring elements from multiple windows', async () => {
    const el1 = {
      ownerDocument: {
        defaultView: {IntersectionObserver: getInObConstructorStub()},
      },
    };
    const el2 = {
      ownerDocument: {
        defaultView: {IntersectionObserver: getInObConstructorStub()},
      },
    };

    const intersection1 = measureIntersection(el1);
    const intersection2 = measureIntersection(el2);
    const firstEntry = {target: el1};
    const secondEntry = {target: el2};
    fireIntersections([firstEntry]);
    fireIntersections([secondEntry]);

    expect(await intersection1).equal(firstEntry);
    expect(await intersection2).equal(secondEntry);
  });

  describe('intersectionEntryToJson', () => {
    const zeros = {
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      top: 0,
      bottom: 0,
      x: 0,
      y: 0,
    };

    it('clones an IntersectionObserverEntry', () => {
      const entry = {
        time: 0,
        intersectionRatio: 0,
        rootBounds: zeros,
        intersectionRect: zeros,
        boundingClientRect: zeros,
      };
      const json = intersectionEntryToJson(entry);
      expect(entry).eql(json);
      expect(entry).not.equal(json);
    });

    it('clones with null rootBounds', () => {
      const entry = {
        time: 0,
        intersectionRatio: 0,
        rootBounds: null,
        intersectionRect: zeros,
        boundingClientRect: zeros,
      };
      const json = intersectionEntryToJson(entry);
      expect(entry).eql(json);
      expect(entry).not.equal(json);
    });
  });
});
