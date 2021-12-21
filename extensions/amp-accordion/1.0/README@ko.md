# Bento 아코디언

축소 및 확장 가능한 콘텐츠 섹션을 표시합니다. 이 컴포넌트를 통해 사용자는 콘텐츠 개요를 한눈에 살펴보고 원하는 섹션으로 이동할 수 있습니다. 효과적으로 사용될 경우 모바일 기기에서 스크롤의 필요성이 감소합니다.

-   Bento 아코디언에는 1개 이상의 `<section>` 요소가 직접 하위 요소로 허용됩니다.
-   `<section>`에는 정확히 2개의 직접 하위 요소가 포함되어야 합니다.
-   각 `<section>`의 첫 번째 하위 요소는 Bento 아코디언의 해당 섹션에 대한 제목으로, `<h1>-<h6>` 또는 `<header>`와 같은 제목 요소여야 합니다.
-   `<section>`의 두 번째 하위 요소는 확장/축소 가능한 콘텐츠입니다.
    -   [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md)에서 허용되는 모든 태그가 사용될 수 있습니다.
-   `<section>` 제목을 클릭하거나 탭하면 해당 섹션이 확장 또는 축소됩니다
-   `id` 정의된 Bento 아코디언은 사용자가 도메인에 있는 동안 각 섹션을 축소 또는 확장 상태로 유지합니다.

## 웹 컴포넌트

적절한 로딩을 보장하고 사용자 지정 스타일을 추가하기 전에 각 Bento 컴포넌트의 필수 CSS 라이브러리를 삽입해야 합니다. 또는 인라인으로 지원되는 경량의 사전 업그레이드 스타일을 사용해 보세요. [레이아웃 및 스타일](#layout-and-style)을 참조하시길 바랍니다.

`<bento-accordion>` 웹 컴포넌트의 활용 사례는 아래 예시에서 확인할 수 있습니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### 예시: `<script>`를 통해 삽입하기

아래 예시에는 3가지 섹션으로 구성된 `bento-accordion`이 삽입되어 있습니다. 세 번째 섹션의 `expanded` 속성은 페이지 로드 시 확장됩니다.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
  />
</head>
<body>
  <bento-accordion id="my-accordion" disable-session-states>
    <section>
      <h2>Section 1</h2>
      <p>Content in section 1.</p>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>Content in section 2.</div>
    </section>
    <section expanded>
      <h2>Section 3</h2>
      <div>Content in section 3.</div>
    </section>
  </bento-accordion>
  <script>
    (async () => {
      const accordion = document.querySelector('#my-accordion');
      await customElements.whenDefined('bento-accordion');
      const api = await accordion.getApi();

      // programatically expand all sections
      api.expand();
      // programatically collapse all sections
      api.collapse();
    })();
  </script>
</body>
```

### 상호작용 및 API 사용

독립적으로 사용되는 Bento 구동 컴포넌트는 API를 통해 고도의 상호작용을 지원합니다. 문서에 다음 스크립트 태그를 삽입하여 `bento-accordion` 컴포넌트 API에 액세스할 수 있습니다.

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### 동작

##### toggle()

`toggle` 동작은 `bento-accordion` 섹션의 `expanded` 및`collapsed` 상태를 전환합니다. 인수 없이 호출되면 아코디언의 전체 섹션 상태가 전환됩니다. 특정 섹션을 지정하려면 `section` 인수를 추가하고 해당하는 <code>id</code>를 값으로 사용하세요.

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.toggle();
    };
    document.querySelector('#button2').onclick = () => {
      api.toggle('section1');
    };
  })();
</script>
```

##### expand()

`expand` 동작은 `bento-accordion` 섹션을 확장합니다. 섹션이 이미 확장된 경우 확장 상태로 유지됩니다. 인수 없이 호출되면 아코디언의 전체 섹션이 확장됩니다. 섹션을 지정하려면 `section` 인수를 추가하고 해당하는 <code>id</code>를 값으로 사용하세요.

```html
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.expand();
    };
    document.querySelector('#button2').onclick = () => {
      api.expand('section1');
    };
  })();
</script>
```

##### collapse()

`collapse` 동작은 `bento-accordion` 섹션을 축소합니다. 섹션이 이미 축소된 경우 축소 상태로 유지됩니다. 인수 없이 호출되면 아코디언의 전체 섹션이 축소됩니다. 섹션을 지정하려면 `section` 인수를 추가하고 해당하는 <code>id</code>를 값으로 사용하세요.

```html
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.collapse();
    };
    document.querySelector('#button2').onclick = () => {
      api.collapse('section1');
    };
  })();
</script>
```

#### 이벤트

`bento-accordion` API를 사용하면 다음 이벤트를 기록하고 그에 응답할 수 있습니다.

##### expand

이 이벤트는 아코디언 섹션이 확장되고, 확장된 섹션에서 처리될 때 트리거됩니다.

아래 예시를 참조하세요.

##### collapse

이 이벤트는 아코디언 섹션이 축소되고, 축소된 섹션에서 처리될 때 트리거됩니다.

아래 예시를 보면, `section 1`에서 `expand` 이벤트의 수신을 대기한 후 확장되었을 때 `section 2`를 확장합니다. `section 2`에서 `collapse` 이벤트의 수신을 대기한 후 축소되었을 때 `section 1`을 축소합니다.

아래 예시를 참조하세요.

```html
<bento-accordion id="eventsAccordion" animate>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</bento-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => {
      api.expand('section2');
    });
    section2.addEventListener('collapse', () => {
      api.collapse('section1');
    });
  })();
</script>
```

### 레이아웃 및 스타일

Bento 컴포넌트에는 [콘텐츠 이동](https://web.dev/cls/) 없이 적절한 로드를 보장하는 데 필요한 작은 CSS 라이브러리가 있습니다. 순서 기반의 특수성으로 인해 사용자 지정 스타일보다 스타일시트가 먼저 삽입되어 있는지 수동으로 확인해야 합니다.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

또는 경량의 사전 업그레이드 스타일을 인라인으로 활용할 수도 있습니다.

```html
<style>
  bento-accordion {
    display: block;
    contain: layout;
  }

  bento-accordion,
  bento-accordion > section,
  bento-accordion > section > :first-child {
    margin: 0;
  }

  bento-accordion > section > * {
    display: block;
    float: none;
    overflow: hidden; /* clearfix */
    position: relative;
  }

  @media (min-width: 1px) {
    :where(bento-accordion > section) > :first-child {
      cursor: pointer;
      background-color: #efefef;
      padding-right: 20px;
      border: 1px solid #dfdfdf;
    }
  }

  .i-amphtml-accordion-header {
    cursor: pointer;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }

  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating),
  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating)
    * {
    display: none !important;
  }
</style>
```

### 속성

#### animate

`<bento-accordion>`에 `animate` 속성을 삽입하면 콘텐츠가 확장될 때 "롤다운" 애니메이션을 추가하고 축소될 때 "롤업" 애니메이션을 추가할 수 있습니다.

이 속성은 [미디어 쿼리](./../../../docs/spec/amp-html-responsive-attributes.md)에 따라 구성될 수 있습니다.

```html
<bento-accordion animate>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Content in section 2.</div>
  </section>
</bento-accordion>
```

#### expanded

중첩된 `<section>`에 `expanded` 속성을 적용하면 페이지 로드 시 해당 섹션이 확장됩니다.

```html
<bento-accordion>
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section3" expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome expanded content</div>
  </section>
</bento-accordion>
```

#### expand-single-section

`expand-single-section` 속성을 `<bento-accordion>` 요소에 적용하면 한 번에 섹션 1개만 확장되도록 허용합니다. 즉, 사용자가 축소된 `<section>`을 탭하면 해당 섹션이 확장되며 다른 확장된 `<section>`은 축소됩니다.

```html
<bento-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <img
      src="https://source.unsplash.com/random/320x256"
      width="320"
      height="256"
    />
  </section>
</bento-accordion>
```

### 스타일링

`bento-accordion` 요소 선택자를 사용하여 아코디언의 스타일을 자유롭게 지정할 수 있습니다.

amp-accordion의 스타일을 지정할 때 다음 사항에 유의하세요.

-   `bento-accordion` 요소는 항상 `display: block`으로 설정됩니다.
-   `float`은 `<section>`, 제목 또는 콘텐츠 요소의 스타일을 지정할 수 없습니다.
-   확장된 섹션은 `expanded` 속성을 `<section>` 요소에 적용합니다.
-   콘텐츠 요소는 `overflow: hidden`으로 클리어 픽스되므로 스크롤바가 없습니다.
-   `<bento-accordion>`, `<section>`, 제목 및 콘텐츠 요소의 여백은 `0`으로 설정되나 사용자 지정 스타일로 재정의할 수 있습니다.
-   헤더와 콘텐츠 요소는 모두 `position: relative`로 설정됩니다.

---

## Preact/React 컴포넌트

아래의 예시는 Preact 또는 React 라이브러리와 함께 사용할 수 있는 기능적 컴포넌트로 `<BentoAccordion>`이 활용된 방식을 보여줍니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/accordion
```

```javascript
import React from 'react';
import {BentoAccordion} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';

function App() {
  return (
    <BentoAccordion>
      <BentoAccordionSection key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

### 상호작용 및 API 사용

Bento 컴포넌트는 API를 통해 고도의 상호작용을 지원합니다. `ref`를 전달하여 `BentoAccordion` 컴포넌트 API에 액세스할 수 있습니다.

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader><h1>Section 1</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader><h1>Section 2</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader><h1>Section 3</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### 동작

`BentoAccordion` API를 사용하면 다음 동작을 수행할 수 있습니다.

##### toggle()

`toggle` 동작은 `bento-accordion` 섹션의 `expanded` 및`collapsed` 상태를 전환합니다. 인수 없이 호출되면 아코디언의 전체 섹션 상태가 전환됩니다. 특정 섹션을 지정하려면 `section` 인수를 추가하고 해당하는 <code>id</code>를 값으로 사용하세요.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

`expand` 동작은 `bento-accordion` 섹션을 확장합니다. 섹션이 이미 확장된 경우 확장 상태로 유지됩니다. 인수 없이 호출되면 아코디언의 전체 섹션이 확장됩니다. 섹션을 지정하려면 `section` 인수를 추가하고 해당하는 <code>id</code>를 값으로 사용하세요.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

`collapse` 동작은 `bento-accordion` 섹션을 축소합니다. 섹션이 이미 축소된 경우 축소 상태로 유지됩니다. 인수 없이 호출되면 아코디언의 전체 섹션이 축소됩니다. 섹션을 지정하려면 `section` 인수를 추가하고 해당하는 <code>id</code>를 값으로 사용하세요.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### 이벤트

Bento 아코디언 API를 사용하면 다음 이벤트를 기록하고 그에 응답할 수 있습니다.

##### onExpandStateChange

이 이벤트는 아코디언 섹션이 확장되고, 확장된 섹션에서 처리될 때 트리거됩니다.

아래 예시를 참조하세요.

##### onCollapse

이 이벤트는 아코디언 섹션이 축소되고, 축소된 섹션에서 처리될 때 트리거됩니다.

아래 예시를 보면, `section 1`에서 `expand` 이벤트의 수신을 대기한 후 확장되었을 때 `section 2`를 확장합니다. `section 2`에서 `collapse` 이벤트의 수신을 대기한 후 축소되었을 때 `section 1`을 축소합니다.

아래 예시를 참조하세요.

```jsx
<BentoAccordion ref={ref}>
  <BentoAccordionSection
    id="section1"
    key={1}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section1 expanded' : 'section1 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 1</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 1</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section2"
    key={2}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section2 expanded' : 'section2 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 2</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 2</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section3"
    key={3}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section3 expanded' : 'section3 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 3</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 3</BentoAccordionContent>
  </BentoAccordionSection>
</BentoAccordion>
```

### 레이아웃 및 스타일

#### 컨테이너 유형

`BentoAccordion` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소에 크기를 적용해야 합니다.

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

또는 `className`을 통해 적용 가능합니다.

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### 프로퍼티

#### BentoAccordion

##### animate

true인 경우 각 섹션의 확장 및 축소 중에 "롤다운"/"롤업" 애니메이션이 사용됩니다. 기본값: `false`

##### expandSingleSection

true인 경우 섹션 1개를 확장하면 다른 모든 섹션이 자동으로 축소됩니다. 기본값: `false`

#### BentoAccordionSection

##### animate

true인 경우 섹션의 확장 및 축소 중에 "롤다운"/"롤업" 애니메이션이 사용됩니다. 기본값: `false`

##### expanded

true인 경우 섹션이 확장됩니다. 기본값: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

확장 상태 변경의 리스닝을 위한 콜백입니다. 섹션 확장되기만 했는지 나타내는 매개변수로 부울 플래그가 사용됩니다(`false`는 축소 상태임을 나타냅니다).

#### BentoAccordionHeader

#### 일반 프로퍼티

이 컴포넌트는 React 및 Preact 컴포넌트용 [일반 프로퍼티](../../../docs/spec/bento-common-props.md)를 지원합니다.

BentoAccordionHeader는 아직 사용자 지정 프로퍼티를 지원하지 않습니다.

#### BentoAccordionContent

#### 일반 프로퍼티

이 컴포넌트는 React 및 Preact 컴포넌트용 [일반 프로퍼티](../../../docs/spec/bento-common-props.md)를 지원합니다.

BentoAccordionContent는 아직 사용자 지정 프로퍼티를 지원하지 않습니다.
