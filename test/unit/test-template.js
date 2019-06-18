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
import {Services} from '../../src/services';
import {getServiceForDoc, resetServiceForTesting} from '../../src/service';

describes.fakeWin('Template', {amp: true}, env => {
  let templates;
  let doc;
  let win;
  let container;

  beforeEach(() => {
    win = env.win;
    installTemplatesService(win);
    templates = Services.templatesFor(win);
    doc = win.document;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    resetServiceForTesting(win, 'templates');
    document.body.removeChild(container);
  });

  class TemplateImpl extends BaseTemplate {
    render(data) {
      const elem = doc.createElement('div');
      elem.textContent = 'abc' + data.value;
      return elem;
    }
  }

  class TemplateImplCheckingViewer extends TemplateImpl {
    render(data) {
      if (!this.viewerCanRenderTemplates()) {
        throw new Error();
      }

      return super.render(data);
    }
  }

  let count = 0;

  function createTemplateElement() {
    const id = ++count;
    const type = `amp-template-${id}`;
    const element = doc.createElement('template');
    element.setAttribute('type', type);
    container.appendChild(element);
    return element;
  }

  it('should render immediately', () => {
    const templateElement = createTemplateElement();
    registerExtendedTemplate(
      win,
      templateElement.getAttribute('type'),
      TemplateImpl
    );
    return templates.renderTemplate(templateElement, {value: 1}).then(res => {
      expect(res.textContent).to.equal('abc1');
    });
  });

  it('should render when detached', () => {
    const templateElement = createTemplateElement();
    // Use TemplateImplCheckingViewer to make sure viewerCanRenderTemplates
    // works correctly when the template is later detached.
    registerExtendedTemplate(
      win,
      templateElement.getAttribute('type'),
      TemplateImplCheckingViewer
    );
    const viewerService = getServiceForDoc(templateElement, 'viewer');
    env.sandbox.stub(viewerService, 'hasCapability').returns(true);
    return templates
      .renderTemplate(templateElement, {value: 1})
      .then(() => {
        templateElement.parentElement.removeChild(templateElement);
        return templates.renderTemplate(templateElement, {value: 2});
      })
      .then(res => {
        expect(res.textContent).to.equal('abc2');
      });
  });

  it('should render array', () => {
    const templateElement = createTemplateElement();
    registerExtendedTemplate(
      win,
      templateElement.getAttribute('type'),
      TemplateImpl
    );
    return templates
      .renderTemplateArray(templateElement, [{value: 1}, {value: 2}])
      .then(res => {
        expect(res).to.have.length.of(2);
        expect(res[0].textContent).to.equal('abc1');
        expect(res[1].textContent).to.equal('abc2');
      });
  });

  it('should NOT allow registering template class twice', () => {
    const templateElement = createTemplateElement();
    registerExtendedTemplate(
      win,
      templateElement.getAttribute('type'),
      TemplateImpl
    );
    allowConsoleError(() => {
      expect(() => {
        registerExtendedTemplate(
          win,
          templateElement.getAttribute('type'),
          TemplateImpl
        );
      }).to.throw(/Duplicate template type/);
    });
  });

  it('should block render until template registered', () => {
    const templateElement = createTemplateElement();
    const scriptElement = doc.createElement('script');
    scriptElement.setAttribute(
      'custom-template',
      templateElement.getAttribute('type')
    );
    doc.body.appendChild(scriptElement);
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
    const templateElement = createTemplateElement();
    const scriptElement = doc.createElement('script');
    scriptElement.setAttribute(
      'custom-template',
      templateElement.getAttribute('type')
    );
    doc.body.appendChild(scriptElement);
    const p = templates.renderTemplate(templateElement, {value: 1});
    registerExtendedTemplate(
      win,
      templateElement.getAttribute('type'),
      TemplateImpl
    );
    return p.then(res => {
      expect(res.textContent).to.equal('abc1');
    });
  });

  it('should unblock render for parallel templates', () => {
    const templateElement = createTemplateElement();
    const scriptElement = doc.createElement('script');
    scriptElement.setAttribute(
      'custom-template',
      templateElement.getAttribute('type')
    );
    doc.body.appendChild(scriptElement);
    const p1 = templates.renderTemplate(templateElement, {value: 1});
    const p2 = templates.renderTemplate(templateElement, {value: 2});
    registerExtendedTemplate(
      win,
      templateElement.getAttribute('type'),
      TemplateImpl
    );
    // This is just a complicated way to say Promise -> all.
    return p1
      .then(res1 => {
        return p2.then(res2 => {
          return [res1, res2];
        });
      })
      .then(res => {
        expect(res[0].textContent).to.equal('abc1');
        expect(res[1].textContent).to.equal('abc2');
      });
  });

  it('should discover template via ID', () => {
    const templateElement = createTemplateElement();
    const type = templateElement.getAttribute('type');
    const id = type + Math.random();
    templateElement.setAttribute('id', id);
    doc.body.appendChild(templateElement);
    registerExtendedTemplate(win, type, TemplateImpl);

    const parentElement = doc.createElement('div');
    parentElement.setAttribute('template', id);
    doc.body.appendChild(parentElement);
    return templates
      .findAndRenderTemplate(parentElement, {value: 1})
      .then(res => {
        expect(res.textContent).to.equal('abc1');
      });
  });

  it('should require discovered template via ID to be "template"', () => {
    const nonTemplateElement = doc.createElement('div');
    const id = 'nontemplate' + Math.random();
    nonTemplateElement.setAttribute('id', id);
    doc.body.appendChild(nonTemplateElement);

    const parentElement = doc.createElement('div');
    parentElement.setAttribute('template', id);
    doc.body.appendChild(parentElement);
    const regexError = new RegExp(
      'Template must be defined in a <template> or ' +
        '<script type="text/plain"> tag'
    );
    allowConsoleError(() => {
      expect(() => {
        templates.findAndRenderTemplate(parentElement, {value: 0});
      }).to.throw(regexError);
    });
  });

  it('should require discovered "script" with type defined', () => {
    // Given a script template with the type not defined.
    const templateElement = doc.createElement('script');
    const id = 'template' + Math.random();
    templateElement.setAttribute('id', id);
    doc.body.appendChild(templateElement);

    const parentElement = doc.createElement('div');
    parentElement.setAttribute('template', id);
    doc.body.appendChild(parentElement);
    const regexError = new RegExp(
      'Template must be defined in a <template> or ' +
        '<script type="text/plain"> tag'
    );
    allowConsoleError(() => {
      expect(() => {
        templates.findAndRenderTemplate(parentElement, {value: 0});
      }).to.throw(regexError);
    });
  });

  it('should discover template via children', () => {
    const templateElement = createTemplateElement();
    const type = templateElement.getAttribute('type');
    registerExtendedTemplate(win, type, TemplateImpl);

    const parentElement = doc.createElement('div');
    parentElement.appendChild(templateElement);
    container.appendChild(parentElement);
    return templates
      .findAndRenderTemplate(parentElement, {value: 1})
      .then(res => {
        expect(res.textContent).to.equal('abc1');
      });
  });

  it('should fail when template not found', () => {
    const parentElement = doc.createElement('div');
    doc.body.appendChild(parentElement);
    allowConsoleError(() => {
      expect(() => {
        templates.findAndRenderTemplate(parentElement, {value: 0});
      }).to.throw(/Template not found/);
    });

    parentElement.setAttribute('template', 'notemplate' + Math.random());
    allowConsoleError(() => {
      expect(() => {
        templates.findAndRenderTemplate(parentElement, {value: 0});
      }).to.throw(/Template not found/);
    });
  });

  it('should detect if a template is present in a container', () => {
    const parentElement = doc.createElement('div');
    doc.body.appendChild(parentElement);
    expect(templates.hasTemplate(parentElement)).to.be.false;

    parentElement.setAttribute('template', 'notemplate' + Math.random());
    expect(templates.hasTemplate(parentElement)).to.be.false;

    const templateElement = createTemplateElement();
    const type = templateElement.getAttribute('type');
    registerExtendedTemplate(env.win, type, TemplateImpl);

    // With template, but different ID
    parentElement.appendChild(templateElement);
    expect(templates.hasTemplate(parentElement)).to.be.false;

    // With template and correct ID
    parentElement.removeAttribute('template');
    expect(templates.hasTemplate(parentElement)).to.be.true;
  });

  it('should discover and render template for an array', () => {
    const templateElement = createTemplateElement();
    const type = templateElement.getAttribute('type');
    const id = type + Math.random();
    templateElement.setAttribute('id', id);
    doc.body.appendChild(templateElement);
    registerExtendedTemplate(win, type, TemplateImpl);

    const parentElement = doc.createElement('div');
    parentElement.setAttribute('template', id);
    doc.body.appendChild(parentElement);
    return templates
      .findAndRenderTemplateArray(parentElement, [{value: 1}, {value: 2}])
      .then(res => {
        expect(res).to.have.length.of(2);
        expect(res[0].textContent).to.equal('abc1');
        expect(res[1].textContent).to.equal('abc2');
      });
  });
});

describes.fakeWin('BaseTemplate', {}, env => {
  let win;
  let doc;
  let templateElement;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    templateElement = doc.createElement('div');
    document.body.appendChild(templateElement);
  });

  afterEach(() => {
    document.body.removeChild(templateElement);
  });

  it('should require render override', () => {
    expect(() => {
      new BaseTemplate(templateElement).render();
    }).to.throw(/Not implemented/);
  });

  it('should unwrap single element', () => {
    const root = doc.createElement('div');
    const element1 = doc.createElement('div');
    root.appendChild(element1);
    expect(new BaseTemplate(templateElement).unwrap(root)).to.equal(element1);
  });

  it('should unwrap with empty/whitespace text', () => {
    const root = doc.createElement('div');
    const element1 = doc.createElement('div');
    root.appendChild(doc.createTextNode('   '));
    root.appendChild(element1);
    root.appendChild(doc.createTextNode(' \n\t  '));
    expect(new BaseTemplate(templateElement).unwrap(root)).to.equal(element1);
  });

  it('should NOT unwrap multiple elements', () => {
    const root = doc.createElement('div');
    root.appendChild(doc.createElement('div'));
    root.appendChild(doc.createElement('div'));
    expect(new BaseTemplate(templateElement).unwrap(root)).to.equal(root);
  });

  it('should NOT unwrap with non-empty/whitespace text', () => {
    const root = doc.createElement('div');
    root.appendChild(doc.createTextNode('a'));
    root.appendChild(doc.createElement('div'));
    expect(new BaseTemplate(templateElement).unwrap(root)).to.equal(root);
  });
});
