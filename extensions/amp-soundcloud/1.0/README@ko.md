# Bento Soundcloud

[Soundcloud](https://soundcloud.com) 클립을 삽입합니다.

## 웹 컴포넌트

적절한 로딩을 보장하고 사용자 지정 스타일을 추가하기 전에 각 Bento 컴포넌트의 필수 CSS 라이브러리를 삽입해야 합니다. 또는 인라인으로 지원되는 경량의 사전 업그레이드 스타일을 사용해 보세요. [레이아웃 및 스타일](#layout-and-style)을 참조하시길 바랍니다.

`<bento-soundcloud>` 웹 컴포넌트의 활용 사례는 아래 예시에서 확인할 수 있습니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### 예시: `<script>`를 통해 삽입하기

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-soundcloud {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js"
  ></script>
  <style>
    bento-soundcloud {
      aspect-ratio: 1;
    }
  </style>
</head>
<bento-soundcloud
  id="my-track"
  data-trackid="243169232"
  data-visual="true"
></bento-soundcloud>
<div class="buttons" style="margin-top: 8px">
  <button id="change-track">Change track</button>
</div>

<script>
  (async () => {
    const soundcloud = document.querySelector('#my-track');
    await customElements.whenDefined('bento-soundcloud');

    // set up button actions
    document.querySelector('#change-track').onclick = () => {
      soundcloud.setAttribute('data-trackid', '243169232');
      soundcloud.setAttribute('data-color', 'ff5500');
      soundcloud.removeAttribute('data-visual');
    };
  })();
</script>
```

### 레이아웃 및 스타일

Bento 컴포넌트에는 [콘텐츠 이동](https://web.dev/cls/) 없이 적절한 로드를 보장하는 데 필요한 작은 CSS 라이브러리가 있습니다. 순서 기반의 특수성으로 인해 사용자 지정 스타일보다 스타일시트가 먼저 삽입되어 있는지 수동으로 확인해야 합니다.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

또는 경량의 사전 업그레이드 스타일을 인라인으로 활용할 수도 있습니다.

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 컨테이너 유형

`bento-soundcloud` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### 속성

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>이 속성은 <code>data-playlistid</code>가 정의되지 않은 경우 필요합니다.<br> 이 속성의 값은 트랙의 ID로 정수입니다.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>이 속성은 <code>data-trackid</code>가 정의되지 않은 경우 필요합니다. 이 속성의 값은 트랙의 ID로 정수입니다.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token(선택 사항)</strong></td>
    <td>트랙이 비공개인 경우 트랙의 시크릿 토큰입니다.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual(선택 사항)</strong></td>
    <td>
<code>true</code>로 설정된 경우 전체 너비의 "비주얼" 모드가 표시되며, 그렇지 않은 경우 "클래식" 모드로 표시됩니다. 기본값은 <code>false</code>입니다.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color(선택 사항)</strong></td>
    <td>이 속성은 "클래식" 모드에 대한 사용자 지정 색상 재정의입니다. 속성은 "비주얼" 모드에서 무시됩니다. 앞에 #를 더하지 않고 16진수 색상 값을 지정합니다(예: <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Preact/React 컴포넌트

아래의 예시는 Preact 또는 React 라이브러리와 함께 사용할 수 있는 함수형 컴포넌트로 `<BentoSoundcloud>`가 활용된 방식을 보여줍니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/soundcloud
```

```javascript
import React from 'react';
import {BentoSoundcloud} from '@bentoproject/soundcloud/react';
import '@bentoproject/soundcloud/styles.css';

function App() {
  return <BentoSoundcloud trackId="243169232" visual={true}></BentoSoundcloud>;
}
```

### 레이아웃 및 스타일

#### 컨테이너 유형

`BentoSoundcloud` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

또는 `className`을 통해 적용 가능합니다.

```jsx
<BentoSoundcloud
  className="custom-styles"
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### 프로퍼티

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>이 속성은 <code>data-playlistid</code>가 정의되지 않은 경우 필요합니다.<br> 이 속성의 값은 트랙의 ID로 정수입니다.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>이 속성은 <code>data-trackid</code>가 정의되지 않은 경우 필요합니다. 이 속성의 값은 트랙의 ID로 정수입니다.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken(선택 사항)</strong></td>
    <td>트랙이 비공개인 경우 트랙의 시크릿 토큰입니다.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual(선택 사항)</strong></td>
    <td>
<code>true</code>로 설정된 경우 전체 너비의 "비주얼" 모드가 표시되며, 그렇지 않은 경우 "클래식" 모드로 표시됩니다. 기본값은 <code>false</code>입니다.</td>
  </tr>
  <tr>
    <td width="40%"><strong>색상(선택 사항)</strong></td>
    <td>이 속성은 "클래식" 모드에 대한 사용자 지정 색상 재정의입니다. 속성은 "비주얼" 모드에서 무시됩니다. 앞에 #를 더하지 않고 16진수 색상 값을 지정합니다(예: <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
