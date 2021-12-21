# Bento 사이드바

탐색, 링크, 버튼, 메뉴와 같은 임시 액세스를 위한 메타 콘텐츠 표시 방법을 제공합니다. 버튼을 누르면 사이드바를 표시할 수 있으며, 메인 콘텐츠는 시각적으로 그 아래에 남아 있습니다.

## 웹 컴포넌트

적절한 로딩을 보장하고 사용자 지정 스타일을 추가하기 전에 각 Bento 컴포넌트의 필수 CSS 라이브러리를 삽입해야 합니다. 또는 인라인으로 지원되는 경량의 사전 업그레이드 스타일을 사용해 보세요. [레이아웃 및 스타일](#layout-and-style)을 참조하시길 바랍니다.

`<bento-sidebar>` 웹 컴포넌트의 활용 사례는 아래 예시에서 확인할 수 있습니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### 예시: `<script>`를 통해 삽입하기

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-sidebar:not([open]) {
      display: none !important;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.js"
  ></script>
</head>
<body>
  <bento-sidebar id="sidebar1" side="right">
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
  </bento-sidebar>

  <div class="buttons" style="margin-top: 8px">
    <button id="open-sidebar">Open sidebar</button>
  </div>

  <script>
    (async () => {
      const sidebar = document.querySelector('#sidebar1');
      await customElements.whenDefined('bento-sidebar');
      const api = await sidebar.getApi();

      // set up button actions
      document.querySelector('#open-sidebar').onclick = () => api.open();
    })();
  </script>
</body>
```

### Bento 툴바

미디어 쿼리로 `toolbar` 속성을 지정하고 `<bento-sidebar>`의 하위 요소인 `<nav>` 요소의 요소 id를 통해 `toolbar-target` 속성을 지정하여 `<body>`에 표시되는 Bento Toolbar 요소를 생성할 수 있습니다. `toolbar`는 `<nav>` 요소와 그 하위 요소를 복제하며 해당 요소를 `toolbar-target` 요소에 추가합니다.

#### 동작

- `toolbar` 속성 및 `toolbar-target` 속성으로 nav 요소를 추가하여 툴바를 구현할 수 있습니다.
- nav 요소는 `<bento-sidebar>`의 하위 요소로, `<nav toolbar="(media-query)" toolbar-target="elementID">` 형식을 준수해야 합니다.
    - 예를 들어, `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`와 같이 툴바를 적절히 사용할 수 있습니다.
- 툴바 동작은 `toolbar` 속성의 media-query가 유효한 동안에만 적용됩니다. 또한 `toolbar-target` 속성 id가 툴바를 적용할 페이지에 존재해야 합니다.

##### 예시: 기본 툴바

다음 예시에서는 창 너비가 767px 이하인 경우 `toolbar`가 표시됩니다. `toolbar`에는 검색 입력 요소가 포함됩니다. `toolbar` 요소는 `<div id="target-element">` 요소에 추가됩니다.

```html
<bento-sidebar id="sidebar1" side="right">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>

  <nav toolbar="(max-width: 767px)" toolbar-target="target-element">
    <ul>
      <li>
        <input placeholder="Search..." />
      </li>
    </ul>
  </nav>
</bento-sidebar>

<div id="target-element"></div>
```

### 상호작용 및 API 사용

독립형 웹 컴포넌트로 사용되는 Bento 구동 컴포넌트는 API를 통해 고도의 상호작용을 지원합니다. 문서에 다음 스크립트 태그를 삽입하여 `bento-sidebar` 컴포넌트 API에 액세스할 수 있습니다.

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### 동작

`bento-sidebar` API를 사용하면 다음 동작을 수행할 수 있습니다.

##### open()

사이드바를 엽니다.

```javascript
api.open();
```

##### close()

사이드바를 닫습니다.

```javascript
api.close();
```

##### toggle()

사이드바 열림 상태를 전환합니다.

```javascript
api.toggle(0);
```

### 레이아웃 및 스타일

Bento 컴포넌트에는 [콘텐츠 이동](https://web.dev/cls/) 없이 적절한 로드를 보장하는 데 필요한 작은 CSS 라이브러리가 있습니다. 순서 기반의 특수성으로 인해 사용자 지정 스타일보다 스타일시트가 먼저 삽입되어 있는지 수동으로 확인해야 합니다.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

또는 경량의 사전 업그레이드 스타일을 인라인으로 활용할 수도 있습니다.

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### 사용자 지정 스타일

표준 CSS를 사용해 `bento-sidebar` 컴포넌트의 스타일을 지정할 수 있습니다.

- `bento-sidebar`의 `width`는 사전 설정된 45px 값에서 너비 조정이 가능하도록 설정할 수 있습니다.
- 필요한 경우 사이드바의 높이를 조정하도록 `bento-sidebar`의 높이를 설정할 수도 있습니다. 높이가 100vw를 초과하면 사이드바에 세로 스크롤바가 표시됩니다. 사이드바의 사전 설정된 높이는 100vw이며 CSS로 더 짧게 재정의할 수 있습니다.
- 페이지에서 사이드바가 열려 있는 경우  `bento-sidebar` 태그에 설정된 `open` 속성을 통해 사이드바의 현재 상태가 공개됩니다.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### UX 고려 사항

`<bento-sidebar>`를 사용할 경우 사용자는 고정 위치 헤더가 표시될 수 있는 모바일로 페이지를 보는 경우가 많다는 점을 염두에 두세요. 또한 브라우저가 페이지 상단에 자체 고정 헤더를 표시하는 경우가 많습니다. 화면 상단에 다른 고정 위치 요소를 추가할 경우 사용자에게 새로운 정보를 제공하지 않는 콘텐츠가 모바일 화면의 큰 공간을 차지합니다.

따라서 사이드바를 여는 어포던스는 고정된 전체 너비 헤더 영역에 배치하지 않는 것이 좋습니다.

- 사이드바는 페이지 왼쪽 또는 오른쪽에만 표시될 수 있습니다.
- 사이드바의 최대 높이는 100vh이며, 높이가 100vh를 초과하면 세로 스크롤바가 표시됩니다. 기본 높이는 CSS를 통해 100vh로 설정되며 CSS로 재정의할 수 있습니다.
- 사이드바 너비는 CSS를 사용하여 설정하고 조정할 수 있습니다.
- 접근성을 고려한 DOM의 논리적 순서를 유지하고 컨테이너 요소로 인한 동작 변경을 방지하려면 `<bento-sidebar>`를 `<body>`의 직접 하위 요소로 설정하는 것이 *권장*됩니다. `z-index`가 설정된 `bento-sidebar`의 상위 요소가 있을 경우 사이드가바가 다른 요소(예: 헤더) 아래에 표시되어 기능상 오류가 발생할 수 있습니다.

### 속성

#### side

사이드바가 어느 방향에서 열리는지 보여줍니다(`left` 또는 `right`).  `side`가 지정되지 않은 경우 `side` 값은 `body` 태그의 `dir` 속성(`ltr` =&gt; `left` , `rtl` =&gt; `right`)에서 상속됩니다. `dir`가 없을 경우 `side`의 기본값은 `left`입니다.

#### open

이 속성은 사이드바가 열려 있을 때 표시됩니다.

#### toolbar

이 속성은 `<nav toolbar="(media-query)" toolbar-target="elementID">` 요소의 하위 요소로 표시되며 툴바 표시 시점의 미디어 쿼리를 허용합니다. 툴바 사용과 관련한 자세한 내용은 [툴바](#bento-toolbar) 섹션을 참조하세요.

#### toolbar-target

이 속성은 `<nav toolbar="(media-query)" toolbar-target="elementID">` 요소의 하위 요소로 표시되며, 페이지의 요소 id를 허용합니다. `toolbar-target` 속성은 기본 툴바 스타일링 없이도 페이지에서 요소의 지정된 ID에 툴바를 배치합니다. 툴바 사용과 관련한 자세한 내용은 [툴바](#bento-toolbar) 섹션을 참조하세요.

---

## Preact/React 컴포넌트

아래의 예시는 Preact 또는 React 라이브러리와 함께 사용할 수 있는 함수형 컴포넌트로 `<BentoSidebar>`가 활용된 방식을 보여줍니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/sidebar
```

```javascript
import React from 'react';
import {BentoSidebar} from '@bentoproject/sidebar/react';
import '@bentoproject/sidebar/styles.css';

function App() {
  return (
    <BentoSidebar>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

### Bento 툴바

미디어 쿼리로 `toolbar` 프로퍼티를 지정하고 `<BentoSidebar>`의 하위 요소인 `<BentoSidebarToolbar>` 컴포넌트의 요소 id를 통해 `toolbarTarget` 프로퍼티를 지정하여 `<body>`에 표시되는 Bento Toolbar 요소를 생성할 수 있습니다. `toolbar`는 `<BentoSidebarToolbar>` 요소와 그 하위 요소를 복제하며 해당 요소를 `toolbarTarget` 요소에 추가합니다.

#### 동작

- `toolbar` 프로퍼티 및 `toolbarTarget` 프로퍼티로 nav 요소를 추가하여 툴바를 구현할 수 있습니다.
- nav 요소는 `<BentoSidebar>`의 하위 요소로, `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` 형식을 준수해야 합니다.
    - 예를 들어, `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`와 같이 툴바를 적절히 사용할 수 있습니다.
- 툴바 동작은 `toolbar` 프로퍼티의 media-query가 유효한 동안에만 적용됩니다. 또한 `toolbarTarget` 프로퍼티 id가 툴바를 적용할 페이지에 존재해야 합니다.

##### 예시: 기본 툴바

다음 예시에서는 창 너비가 767px 이하인 경우 `toolbar`가 표시됩니다. `toolbar`에는 검색 입력 요소가 포함됩니다. `toolbar` 요소는 `<div id="target-element">` 요소에 추가됩니다.

```jsx
<>
  <BentoSidebar>
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
    <BentoSidebarToolbar
      toolbar="(max-width: 767px)"
      toolbarTarget="target-element"
    >
      <ul>
        <li>Toolbar Item 1</li>
        <li>Toolbar Item 2</li>
      </ul>
    </BentoSidebarToolbar>
  </BentoSidebar>

  <div id="target-element"></div>
</>
```

### 상호작용 및 API 사용

Bento 컴포넌트는 API를 통해 고도의 상호작용을 지원합니다. `ref`를 전달하여  `BentoSidebar` 컴포넌트 API에 액세스할 수 있습니다.

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoSidebar ref={ref}>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

#### 동작

`BentoSidebar` API를 사용하면 다음 동작을 수행할 수 있습니다.

##### open()

사이드바를 엽니다.

```javascript
ref.current.open();
```

##### close()

사이드바를 닫습니다.

```javascript
ref.current.close();
```

##### toggle()

사이드바 열림 상태를 전환합니다.

```javascript
ref.current.toggle(0);
```

### 레이아웃 및 스타일

표준 CSS를 사용해 `BentoSidebar` 컴포넌트의 스타일을 지정할 수 있습니다.

- `bento-sidebar`의 `width`는 사전 설정된 45px 값에서 너비 조정이 가능하도록 설정할 수 있습니다.
- 필요한 경우 사이드바의 높이를 조정하도록 `bento-sidebar`의 높이를 설정할 수도 있습니다. 높이가 100vw를 초과하면 사이드바에 세로 스크롤바가 표시됩니다. 사이드바의 사전 설정된 높이는 100vw이며 CSS로 더 짧게 재정의할 수 있습니다.

컴포넌트를 원하는 방식으로 렌더링하려면 컴포넌트에 크기를 적용해야 합니다. 인라인으로 적용될 수 있습니다.

```jsx
<BentoSidebar style={{width: 300, height: '100%'}}>
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

또는 `className`을 통해 적용 가능합니다.

```jsx
<BentoSidebar className="custom-styles">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

```css
.custom-styles {
  height: 100%;
  width: 300px;
}
```

### UX 고려 사항

`<BentoSidebar>`를 사용할 경우 사용자는 고정 위치 헤더가 표시될 수 있는 모바일로 페이지를 보는 경우가 많다는 점을 염두에 두세요. 또한 브라우저가 페이지 상단에 자체 고정 헤더를 표시하는 경우가 많습니다. 화면 상단에 다른 고정 위치 요소를 추가할 경우 사용자에게 새로운 정보를 제공하지 않는 콘텐츠가 모바일 화면의 큰 공간을 차지합니다.

따라서 사이드바를 여는 어포던스는 고정된 전체 너비 헤더 영역에 배치하지 않는 것이 좋습니다.

- 사이드바는 페이지 왼쪽 또는 오른쪽에만 표시될 수 있습니다.
- 사이드바의 최대 높이는 100vh이며, 높이가 100vh를 초과하면 세로 스크롤바가 표시됩니다. 기본 높이는 CSS를 통해 100vh로 설정되며 CSS로 재정의할 수 있습니다.
- 사이드바 너비는 CSS를 사용하여 설정하고 조정할 수 있습니다.
- 접근성을 고려한 DOM의 논리적 순서를 유지하고 컨테이너 요소로 인한 동작 변경을 방지하려면 `<BentoSidebar>`를 <code>&lt;body&gt;</code>의 직접 하위 요소로 설정하는 것이 <em>권장</em>됩니다. `z-index`가 설정된 `BentoSidebar`의 상위 요소가 있을 경우 사이드가바가 다른 요소(예: 헤더) 아래에 표시되어 기능상 오류가 발생할 수 있습니다.

### 프로퍼티

#### side

사이드바가 어느 방향에서 열리는지 보여줍니다(`left` 또는 `right`).  `side`가 지정되지 않은 경우 `side` 값은 `body` 태그의 `dir` 속성(`ltr` =&gt; `left` , `rtl` =&gt; `right`)에서 상속됩니다. `dir`가 없을 경우 `side`의 기본값은 `left`입니다.

#### toolbar

이 프로퍼티는 `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` 요소의 하위 요소로 표시되며 툴바 표시 시점의 미디어 쿼리를 허용합니다. 툴바 사용과 관련한 자세한 내용은 [툴바](#bento-toolbar) 섹션을 참조하세요.

#### toolbarTarget

이 속성은 `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`의 하위 요소로 표시되며, 페이지의 요소 id를 허용합니다. `toolbarTarget` 속성은 기본 툴바 스타일링 없이도 페이지에서 요소의 지정된 ID에 툴바를 배치합니다. 툴바 사용과 관련한 자세한 내용은 [툴바](#bento-toolbar) 섹션을 참조하세요.
