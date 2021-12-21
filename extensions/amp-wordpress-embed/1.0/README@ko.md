# Bento WordPress 임베드

## 활용

WordPress 게시물 또는 페이지의 [excerpt](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/)를 표시하는 iframe. Bento WordPress 임베드를 웹 컴포넌트인 [`<bento-wordpress-embed>`](#web-component) 또는 Preact/React 함수형 컴포넌트인 [`<BentoWordPressEmbed>`](#preactreact-component)로 사용해 보세요.

### 웹 컴포넌트

적절한 로딩을 보장하고 사용자 지정 스타일을 추가하기 전에 각 Bento 컴포넌트의 필수 CSS 라이브러리를 삽입해야 합니다. 또는 인라인으로 지원되는 경량의 사전 업그레이드 스타일을 사용해 보세요. [레이아웃 및 스타일](#layout-and-style)을 참조하시길 바랍니다.

`<bento-wordpress-embed>` 웹 컴포넌트의 활용 사례는 아래 예시에서 확인할 수 있습니다.

#### 예시: npm을 통해 가져오기

[example preview="top-frame" playground="false"]

npm을 통해 설치:

```sh
npm install @ampproject/bento-wordpress-embed
```

```javascript
import '@ampproject/bento-wordpress-embed';
```

[/example]

#### 예시: `<script>`를 통해 삽입하기

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-wordpress-embed {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script async src="https://cdn.ampproject.org/v0/bento-wordpress-embed-1.0.js"></script>
</head>
<bento-wordpress-embed id="my-embed"
  data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></bento-wordpress-embed>
<div class="buttons" style="margin-top: 8px;">
  <button id="switch-button">Switch embed</button>
</div>

<script>
  (async () => {
    const embed = document.querySelector('#my-embed');
    await customElements.whenDefined('bento-wordpress-embed');

    // set up button actions
    document.querySelector('#switch-button').onclick = () => embed.setAttribute('data-url', 'https://make.wordpress.org/core/2021/09/09/core-editor-improvement-cascading-impact-of-improvements-to-featured-images/');
  })();
</script>
```

[/example]

#### 레이아웃 및 스타일

Bento 컴포넌트에는 [콘텐츠 이동](https://web.dev/cls/) 없이 적절한 로드를 보장하는 데 필요한 작은 CSS 라이브러리가 있습니다. 순서 기반의 특수성으로 인해 사용자 지정 스타일보다 스타일시트가 먼저 삽입되어 있는지 수동으로 확인해야 합니다.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-wordpress-embed-1.0.css">
```

또는 경량의 사전 업그레이드 스타일을 인라인으로 활용할 수도 있습니다.

```html
<style data-bento-boilerplate>
  bento-wordpress-embed {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**컨테이너 유형**

`bento-wordpress-embed` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```css
bento-wordpress-embed {
  height: 100px;
  width: 100%;
}
```

#### 속성

##### data-url(필수)

임베딩할 게시물의 URL입니다.

### Preact/React 컴포넌트

아래의 예시는 Preact 또는 React 라이브러리와 함께 사용할 수 있는 함수형 컴포넌트로 `<BentoWordPressEmbed>`가 활용된 방식을 보여줍니다.

#### 예시: npm을 통해 가져오기

[example preview="top-frame" playground="false"]

npm을 통해 설치:

```sh
npm install @ampproject/bento-wordpress-embed
```

```jsx
import React from 'react';
import {BentoWordPressEmbed} from '@ampproject/bento-wordpress-embed/react';

function App() {
  return (
    <BentoWordPressEmbed
      url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
    ></BentoWordPressEmbed>
  );
}
```

[/example]

#### 레이아웃 및 스타일

**컨테이너 유형**

`BentoWordPressEmbed` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```jsx
<BentoWordPressEmbed style={{width: '100%', height: '100px'}}
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

또는 `className`을 통해 적용 가능합니다.

```jsx
<BentoWordPressEmbed className="custom-styles"
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

#### 프로퍼티

##### url(필수)

임베딩할 게시물의 URL입니다.
