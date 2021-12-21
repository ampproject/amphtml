# Bento Fit Text

주어진 모든 텍스트 내용을 지원되는 공간에 맞출 수 있도록 최적 글꼴 크기를 결정합니다.

Bento Fit Text의 예상 콘텐츠는 텍스트 또는 기타 인라인 콘텐츠이지만 인라인이 아닌 콘텐츠도 포함될 수 있습니다.

## 웹 컴포넌트

적절한 로딩을 보장하고 사용자 지정 스타일을 추가하기 전에 각 Bento 컴포넌트의 필수 CSS 라이브러리를 삽입해야 합니다. 또는 인라인으로 지원되는 경량의 사전 업그레이드 스타일을 사용해 보세요. [레이아웃 및 스타일](#layout-and-style)을 참조하시길 바랍니다.

`<bento-fit-text>` 웹 컴포넌트의 활용 사례는 아래 예시에서 확인할 수 있습니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/fit-text
```

```javascript
import {defineElement as defineBentoFitText} from '@bentoproject/fit-text';
defineBentoFitText();
```

### 예시: `<script>`를 통해 삽입하기

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-fit-text {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<bento-fit-text id="my-fit-text">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque inermis
  reprehendunt.
</bento-fit-text>
<div class="buttons" style="margin-top: 8px">
  <button id="font-button">Change max-font-size</button>
  <button id="content-button">Change content</button>
</div>

<script>
  (async () => {
    const fitText = document.querySelector('#my-fit-text');
    await customElements.whenDefined('bento-fit-text');

    // set up button actions
    document.querySelector('#font-button').onclick = () =>
      fitText.setAttribute('max-font-size', '40');
    document.querySelector('#content-button').onclick = () =>
      (fitText.textContent = 'new content');
  })();
</script>
```

### 콘텐츠 오버플로

`bento-fit-text`의 콘텐츠가 `min-font-size`로 지정된 경우에도 사용 가능한 공간에 맞지 않는다면 넘치는 콘텐츠는 잘려서 숨김 처리됩니다. WebKit 및 Blink 기반 브라우저에서는 넘치는 콘텐츠가 줄임표로 표시됩니다.

다음 예시의 경우 `min-font-size`가 `40`으로 지정되었고, `bento-fit-text` 요소 내부에 더 많은 콘텐츠가 추가되었습니다. 결국 콘텐츠는 고정된 블록 상위 요소의 크기를 초과하므로, 텍스트는 컨테이너에 맞게 잘립니다.

```html
<div style="width: 300px; height: 300px; background: #005af0; color: #fff">
  <bento-fit-text min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </bento-fit-text>
</div>
```

### 레이아웃 및 스타일

Bento 컴포넌트에는 [콘텐츠 이동](https://web.dev/cls/) 없이 적절한 로드를 보장하는 데 필요한 작은 CSS 라이브러리가 있습니다. 순서 기반의 특수성으로 인해 사용자 지정 스타일보다 스타일시트가 먼저 삽입되어 있는지 수동으로 확인해야 합니다.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-fit-text-1.0.css"
/>
```

또는 경량의 사전 업그레이드 스타일을 인라인으로 활용할 수도 있습니다.

```html
<style>
  bento-fit-text {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 컨테이너 유형

`bento-fit-text` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```css
bento-fit-text {
  height: 100px;
  width: 100%;
}
```

### 콘텐츠 오버플로에 대한 접근성 고려 사항

콘텐츠가 넘칠 경우 컨테이너에 맞도록 *시각적*으로는 잘려 있지만, 문서에는 여전히 존재합니다. 페이지에 대량의 콘텐츠를 단순히 ‘채워넣을’ 목적으로 오버플로 동작을 사용해서는 안 됩니다. 콘텐츠가 시각적으로 적절하게 표시될지라도, 사용자가 장애 보조 기술(예: 화면 판독기)을 활용할 경우 잘린 부분의 콘텐츠 전체가 판독/발표되므로 페이지 내용이 너무 많게 느껴질 수 있습니다.

### 속성

#### 미디어 쿼리

`<bento-fit-text>` 속성은 [미디어 쿼리](./../../../docs/spec/amp-html-responsive-attributes.md)에 따라 다른 옵션을 사용하도록 구성할 수 있습니다.

#### `min-font-size`

`bento-fit-text`에서 사용 가능한 픽셀 단위의 최소 글꼴 크기를 정수로 지정합니다.

#### `max-font-size`

`bento-fit-text`에서 사용 가능한 픽셀 단위의 최대 글꼴 크기를 정수로 지정합니다.

---

## Preact/React 컴포넌트

아래의 예시는 Preact 또는 React 라이브러리와 함께 사용할 수 있는 함수형 컴포넌트로 `<BentoFitText>`가 활용된 방식을 보여줍니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/fit-text
```

```javascript
import React from 'react';
import {BentoFitText} from '@bentoproject/fit-text/react';
import '@bentoproject/fit-text/styles.css';

function App() {
  return (
    <BentoFitText>
      Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
      inermis reprehendunt.
    </BentoFitText>
  );
}
```

### 레이아웃 및 스타일

#### 컨테이너 유형

`BentoFitText` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```jsx
<BentoFitText style={{width: 300, height: 100}}>
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

또는 `className`을 통해 적용 가능합니다.

```jsx
<BentoFitText className="custom-styles">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### 프로퍼티

#### `minFontSize`

`bento-fit-text`에서 사용 가능한 픽셀 단위의 최소 글꼴 크기를 정수로 지정합니다.

#### `maxFontSize`

`bento-fit-text`에서 사용 가능한 픽셀 단위의 최대 글꼴 크기를 정수로 지정합니다.
