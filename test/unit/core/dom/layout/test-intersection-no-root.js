import {measureIntersectionNoRoot} from '#core/dom/layout/intersection-no-root';

describes.fakeWin(
  'DOM - layout - intersection observer (no-root)',
  {},
  (env) => {
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
      const intersection = measureIntersectionNoRoot(el);
      fireIntersections([{x: 100, target: el}]);
      expect(await intersection).eql({x: 100, target: el});
    });

    it('should dedupe multiple measures', async () => {
      const measure1 = measureIntersectionNoRoot(el);
      const measure2 = measureIntersectionNoRoot(el);
      expect(measure1).equal(measure2);
    });

    it('should not dedupe multiple measures with entries in between', async () => {
      const measure1 = measureIntersectionNoRoot(el);
      fireIntersections([{x: 100, target: el}]);
      const measure2 = measureIntersectionNoRoot(el);

      expect(measure1).not.equal(measure2);
    });

    it('should only use the latest entry', async () => {
      const intersection = measureIntersectionNoRoot(el);
      const firstEntry = {x: 0, target: el};
      const secondEntry = {x: 100, target: el};

      fireIntersections([firstEntry, secondEntry]);
      expect(await intersection).equal(secondEntry);
    });

    it('should measure multiple elements', async () => {
      const el2 = env.win.document.createElement('p');
      env.win.document.body.appendChild(el2);

      const intersection1 = measureIntersectionNoRoot(el);
      const intersection2 = measureIntersectionNoRoot(el2);

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

      const intersection1 = measureIntersectionNoRoot(el1);
      const intersection2 = measureIntersectionNoRoot(el2);
      const firstEntry = {target: el1};
      const secondEntry = {target: el2};
      fireIntersections([firstEntry]);
      fireIntersections([secondEntry]);

      expect(await intersection1).equal(firstEntry);
      expect(await intersection2).equal(secondEntry);
    });
  }
);
