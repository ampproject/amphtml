import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {getFlexibleAdSlotData} from '../flexible-ad-slot-utils';

describes.realWin('#getFlexibleAdSlotData', {amp: true}, (env) => {
  let doc, win;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function createResource(
    config,
    layout,
    tagName = 'amp-ad',
    parent = doc.body
  ) {
    config['layout'] = layout;
    const element = createElementWithAttributes(doc, tagName, config);
    parent.appendChild(element);
    return element;
  }

  it('should return the fixed width for FIXED layout', () => {
    const element = createResource({width: 300, height: 250}, 'fixed');
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(300);
  });

  it('should return 0 for FIXED layout and invalid width', () => {
    allowConsoleError(() => {
      const element = createResource({width: 'auto', height: 250}, 'fixed');
      expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(0);
    });
  });

  it('should return 0 for NODISPLAY layout', () => {
    const element = createResource({width: 500}, 'nodisplay');
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(0);
  });

  it('should return 0 for FLEX_ITEM layout', () => {
    const element = createResource({width: 500}, 'flex-item');
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(0);
  });

  it('should return 0 for invalid layout', () => {
    allowConsoleError(() => {
      const element = createResource({width: 500}, 'qwerty');
      expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(0);
    });
  });

  it('should return the max-width, if present, for FILL layout', () => {
    const element = createResource({maxWidth: 300}, 'fill');
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(300);
  });

  it("should return parent's fixed width for FILL layout", () => {
    const parent = document.createElement('div');
    parent.setAttribute('width', 300);
    parent.setAttribute('layout', 'fixed');
    doc.body.appendChild(parent);
    const element = createResource({} /* config */, 'fill', 'amp-ad', parent);
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(300);
  });

  it('should return the max-width, if present, for FIXED_HEIGHT layout', () => {
    const element = createResource({height: 300}, 'fixed-height');
    element.style.maxWidth = '250px';
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(250);
  });

  it("should return parent's fixed width for FIXED_HEIGHT layout", () => {
    const parent = document.createElement('div');
    parent.setAttribute('width', 300);
    parent.setAttribute('layout', 'fixed');
    doc.body.appendChild(parent);
    const element = createResource(
      {height: 250},
      'fixed-height',
      'amp-ad',
      parent
    );
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(300);
  });

  it('should return the max-width, if present, for FLUID layout', () => {
    const element = createResource({height: 300}, 'fluid');
    element.style.maxWidth = '250px';
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(250);
  });

  it("should return parent's fixed width for FLUID layout", () => {
    const parent = document.createElement('div');
    parent.setAttribute('width', 300);
    parent.setAttribute('layout', 'fixed');
    doc.body.appendChild(parent);
    const element = createResource({height: 250}, 'fluid', 'amp-ad', parent);
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(300);
  });

  it('should return the max-width, if present, for RESPONSIVE layout', () => {
    const element = createResource({height: 200, width: 200}, 'responsive');
    element.style.maxWidth = '250px';
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(250);
  });

  it("should return parent's fixed width for RESPONSIVE layout", () => {
    const parent = document.createElement('div');
    parent.setAttribute('width', 300);
    parent.setAttribute('layout', 'fixed');
    doc.body.appendChild(parent);
    const element = createResource(
      {height: 250, width: 250},
      'responsive',
      'amp-ad',
      parent
    );
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(300);
  });

  it('should return the viewport width for CONTAINER layout', () => {
    const element = createResource({} /* config */, 'container');
    env.sandbox
      .stub(Services.viewportForDoc(element), 'getSize')
      .returns({width: 300});
    expect(getFlexibleAdSlotData(win, element).parentWidth).to.equal(300);
  });

  it('should return msz=-1 for non-fixed layouts', () => {
    ['fill', 'fixed-height', 'fluid', 'responsive'].forEach((layout) => {
      const parent = document.createElement('div');
      parent.setAttribute('width', 300);
      parent.setAttribute('layout', 'fixed');
      doc.body.appendChild(parent);
      const element = createResource({height: 250}, layout, 'amp-ad', parent);
      expect(getFlexibleAdSlotData(win, element).slotWidth).to.equal(-1);
    });
  });

  it('should have fwSignal=0 by default', () => {
    const element = document.createElement('div');
    const parent = document.createElement('div');
    parent.appendChild(element);
    doc.body.appendChild(parent);
    for (let el = parent.parentElement; el != null; el = el.parentElement) {
      el.setAttribute('style', 'overflow: visible !important;');
    }
    expect(getFlexibleAdSlotData(win, element).fwSignal).to.equal(0);
  });

  it('should have fwSignal=128 when ancestor is hidden', () => {
    const element = document.createElement('div');
    const parent = document.createElement('div');
    parent.setAttribute('style', 'display: none;');
    parent.appendChild(element);
    doc.body.appendChild(parent);
    for (let el = parent.parentElement; el != null; el = el.parentElement) {
      el.setAttribute('style', 'overflow: visible !important;');
    }
    expect(getFlexibleAdSlotData(win, element).fwSignal).to.equal(128);
  });

  it('should have fwSignal=4 when ancestor has overflow hidden', () => {
    const element = document.createElement('div');
    const parent = document.createElement('div');
    parent.setAttribute('style', 'overflow: hidden;');
    parent.appendChild(element);
    doc.body.appendChild(parent);
    for (let el = parent.parentElement; el != null; el = el.parentElement) {
      el.setAttribute('style', 'overflow: visible !important;');
    }
    expect(getFlexibleAdSlotData(win, element).fwSignal).to.equal(4);
  });

  it('should have parentStyle', () => {
    const element = createResource({height: 200, width: 200}, 'fixed');
    expect(getFlexibleAdSlotData(win, element).parentStyle).to.be.ok;
  });
});
