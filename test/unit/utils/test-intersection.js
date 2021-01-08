/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {measureIntersection} from '../../../src/utils/intersection';

describes.fakeWin('utils/intersection', {}, (env) => {
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
});
