/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {
  BaseTemplate,
  installTemplatesService,
  registerExtendedTemplate,
} from '../../src/service/template-impl';


describe('Template', () => {

  const templates = installTemplatesService(window);

  class TemplateImpl extends BaseTemplate {
    render(data) {
      const elem = document.createElement('div');
      elem.textContent = 'abc' + data.value;
      return elem;
    }
  }

  let count = 0;

  function createTemplateElement() {
    const id = ++count;
    const type = `amp-template-${id}`;
    const element = document.createElement('template');
    element.setAttribute('type', type);
    return element;
  }

  beforeEach(() => {
  });

  it('should render immediately', () => {
    const templateElement = createTemplateElement();
    registerExtendedTemplate(window, templateElement.getAttribute('type'),
        TemplateImpl);
    return templates.renderTemplate(templateElement, {value: 1}).then(res => {
      expect(res.textContent).to.equal('abc1');
    });
  });

  it('should render array', () => {
    const templateElement = createTemplateElement();
    registerExtendedTemplate(window, templateElement.getAttribute('type'),
        TemplateImpl);
    return templates.renderTemplateArray(templateElement,
        [{value: 1}, {value: 2}]).then(res => {
          expect(res).to.have.length.of(2);
          expect(res[0].textContent).to.equal('abc1');
          expect(res[1].textContent).to.equal('abc2');
        });
  });

  it('should NOT allow registering template class twice', () => {
    const templateElement = createTemplateElement();
    registerExtendedTemplate(window, templateElement.getAttribute('type'),
        TemplateImpl);
    expect(() => {
      registerExtendedTemplate(window, templateElement.getAttribute('type'),
          TemplateImpl);
    }).to.throw(/Duplicate template type/);
  });

  it('should fail render if template is not declared', () => {
    const templateElement = createTemplateElement();
    expect(() => {
      templates.renderTemplate(templateElement, {value: 0});
    }).to.throw(/Template must be declared/);
  });

  it('should block render until template registered', () => {
    templates.declaredTemplates_ = undefined;
    const templateElement = createTemplateElement();
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('custom-template',
        templateElement.getAttribute('type'));
    document.body.appendChild(scriptElement);
    let result = undefined;
    templates.renderTemplate(templateElement, {value: 0}).then(res => {
      result = res;
    });
    return Promise.resolve().then(() => {
      return Promise.resolve().then(() => {
        expect(result).to.be.undefined;
      });
    });
  });

  it('should unblock render when template registered', () => {
    templates.declaredTemplates_ = undefined;
    const templateElement = createTemplateElement();
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('custom-template',
        templateElement.getAttribute('type'));
    document.body.appendChild(scriptElement);
    const p = templates.renderTemplate(templateElement, {value: 1});
    registerExtendedTemplate(window, templateElement.getAttribute('type'),
        TemplateImpl);
    return p.then(res => {
      expect(res.textContent).to.equal('abc1');
    });
  });

  it('should unblock render for parallel templates', () => {
    templates.declaredTemplates_ = undefined;
    const templateElement = createTemplateElement();
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('custom-template',
        templateElement.getAttribute('type'));
    document.body.appendChild(scriptElement);
    const p1 = templates.renderTemplate(templateElement, {value: 1});
    const p2 = templates.renderTemplate(templateElement, {value: 2});
    registerExtendedTemplate(window, templateElement.getAttribute('type'),
        TemplateImpl);
    // This is just a complicated way to say Promise -> all.
    return p1.then(res1 => {
      return p2.then(res2 => {
        return [res1, res2];
      });
    }).then(res => {
      expect(res[0].textContent).to.equal('abc1');
      expect(res[1].textContent).to.equal('abc2');
    });
  });

  it('should discover template via ID', () => {
    const templateElement = createTemplateElement();
    const type = templateElement.getAttribute('type');
    const id = type + Math.random();
    templateElement.setAttribute('id', id);
    document.body.appendChild(templateElement);
    registerExtendedTemplate(window, type, TemplateImpl);

    const parentElement = document.createElement('div');
    parentElement.setAttribute('template', id);
    return templates.findAndRenderTemplate(parentElement, {value: 1}).then(
        res => {
          expect(res.textContent).to.equal('abc1');
        });
  });

  it('should require discovered template via ID to be "template"', () => {
    const nonTemplateElement = document.createElement('div');
    const id = 'nontemplate' + Math.random();
    nonTemplateElement.setAttribute('id', id);
    document.body.appendChild(nonTemplateElement);

    const parentElement = document.createElement('div');
    parentElement.setAttribute('template', id);
    expect(() => {
      templates.findAndRenderTemplate(parentElement, {value: 0});
    }).to.throw(/Template element must be a "template" tag/);
  });

  it('should discover template via children', () => {
    const templateElement = createTemplateElement();
    const type = templateElement.getAttribute('type');
    registerExtendedTemplate(window, type, TemplateImpl);

    const parentElement = document.createElement('div');
    parentElement.appendChild(templateElement);
    return templates.findAndRenderTemplate(parentElement, {value: 1}).then(
        res => {
          expect(res.textContent).to.equal('abc1');
        });
  });

  it('should fail when template not found', () => {
    const parentElement = document.createElement('div');
    expect(() => {
      templates.findAndRenderTemplate(parentElement, {value: 0});
    }).to.throw(/Template not found/);

    parentElement.setAttribute('template', 'notemplate' + Math.random());
    expect(() => {
      templates.findAndRenderTemplate(parentElement, {value: 0});
    }).to.throw(/Template not found/);
  });

  it('should discover and render template for an array', () => {
    const templateElement = createTemplateElement();
    const type = templateElement.getAttribute('type');
    const id = type + Math.random();
    templateElement.setAttribute('id', id);
    document.body.appendChild(templateElement);
    registerExtendedTemplate(window, type, TemplateImpl);

    const parentElement = document.createElement('div');
    parentElement.setAttribute('template', id);
    return templates.findAndRenderTemplateArray(parentElement,
        [{value: 1}, {value: 2}]).then(res => {
          expect(res).to.have.length.of(2);
          expect(res[0].textContent).to.equal('abc1');
          expect(res[1].textContent).to.equal('abc2');
        });
  });

  it('should discover and render template for an array', () => {
    const templateElement = createTemplateElement();
    const type = templateElement.getAttribute('type');
    const id = type + Math.random();
    templateElement.setAttribute('id', id);
    document.body.appendChild(templateElement);
    registerExtendedTemplate(window, type, TemplateImpl);

    const parentElement = document.createElement('div');
    parentElement.setAttribute('template', id);
    return templates.findAndRenderTemplateArray(parentElement,
        [{value: 1}, {value: 2}]).then(res => {
          expect(res).to.have.length.of(2);
          expect(res[0].textContent).to.equal('abc1');
          expect(res[1].textContent).to.equal('abc2');
        });
  });
});


describe('BaseTemplate', () => {

  let templateElement;

  beforeEach(() => {
    templateElement = document.createElement('div');
  });

  it('should require render override', () => {
    expect(() => {
      new BaseTemplate(templateElement).render();
    }).to.throw(/Not implemented/);
  });

  it('should unwrap single element', () => {
    const root = document.createElement('div');
    const element1 = document.createElement('div');
    root.appendChild(element1);
    expect(new BaseTemplate(templateElement).unwrap(root)).to.equal(element1);
  });

  it('should unwrap with empty/whitespace text', () => {
    const root = document.createElement('div');
    const element1 = document.createElement('div');
    root.appendChild(document.createTextNode('   '));
    root.appendChild(element1);
    root.appendChild(document.createTextNode(' \n\t  '));
    expect(new BaseTemplate(templateElement).unwrap(root)).to.equal(element1);
  });

  it('should NOT unwrap multiple elements', () => {
    const root = document.createElement('div');
    root.appendChild(document.createElement('div'));
    root.appendChild(document.createElement('div'));
    expect(new BaseTemplate(templateElement).unwrap(root)).to.equal(root);
  });

  it('should NOT unwrap with non-empty/whitespace text', () => {
    const root = document.createElement('div');
    root.appendChild(document.createTextNode('a'));
    root.appendChild(document.createElement('div'));
    expect(new BaseTemplate(templateElement).unwrap(root)).to.equal(root);
  });
});
