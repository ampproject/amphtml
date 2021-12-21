# Bento Stream Gallery

## 활용

Bento Stream Gallery는 수평 축을 따라 한 번에 여러 개의 유사한 콘텐츠를 표시하는 데 적합합니다. 한층 사용자 지정된 UX를 구현하려면 [`bento-base-carousel`](../../amp-base-carousel/1.0/README.md)을 참조하세요.

Bento Stream Gallery를 웹 컴포넌트([`<bento-stream-gallery>`](#web-component)) 또는 Preact/React 함수형 컴포넌트([`<BentoStreamGallery>`](#preactreact-component))로 사용해 보세요.

### 웹 컴포넌트

적절한 로딩을 보장하고 사용자 지정 스타일을 추가하기 전에 각 Bento 컴포넌트의 필수 CSS 라이브러리를 삽입해야 합니다. 또는 인라인으로 지원되는 경량의 사전 업그레이드 스타일을 사용해 보세요. [레이아웃 및 스타일](#layout-and-style)을 참조하시길 바랍니다.

`<bento-stream-gallery>` 웹 컴포넌트의 활용 사례는 아래 예시에서 확인할 수 있습니다.

#### 예시: npm을 통해 가져오기

[example preview="top-frame" playground="false"]

npm을 통해 설치:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import '@ampproject/bento-stream-gallery';
```

[/example]

#### 예시: `<script>`를 통해 삽입하기

아래 예시에는 3가지 섹션으로 구성된 `bento-stream-gallery`가 삽입되어 있습니다. 세 번째 섹션의 `expanded` 속성은 페이지 로드 시 확장됩니다.

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <script async src="https://cdn.ampproject.org/v0/bento-stream-gallery-1.0.js"></script>
  <link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">

</head>
<body>
  <bento-stream-gallery>
    <img src="img1.png">
    <img src="img2.png">
    <img src="img3.png">
    <img src="img4.png">
    <img src="img5.png">
    <img src="img6.png">
    <img src="img7.png">
  </bento-stream-gallery>
  <script>
    (async () => {
      const streamGallery = document.querySelector('#my-stream-gallery');
      await customElements.whenDefined('bento-stream-gallery');
      const api = await streamGallery.getApi();

      // programatically expand all sections
      api.next();
      // programatically collapse all sections
      api.prev();
      // programatically go to slide
      api.goToSlide(4);
    })();
  </script>
</body>
```

[/example]

#### 상호작용 및 API 사용

독립적으로 사용되는 Bento 구동 컴포넌트는 API를 통해 고도의 상호작용을 지원합니다. 문서에 다음 스크립트 태그를 삽입하여 `bento-stream-gallery` 컴포넌트 API에 액세스할 수 있습니다.

```javascript
await customElements.whenDefined('bento-stream-gallery');
const api = await streamGallery.getApi();
```

##### 동작

**next()**

표시되는 슬라이드 개수만큼 캐러셀을 앞으로 이동시킵니다.

```js
api.next();
```

**prev()**

표시되는 슬라이드 개수만큼 캐러셀을 뒤로 이동시킵니다.

```js
api.prev();
```

**goToSlide(인덱스: 숫자)**

`index` 인수를 통해 캐러셀을 지정된 슬라이드로 이동시킵니다. 참고: `index`는 <code>0</code> 이상이며 제공된 슬라이드 개수보다 적은 숫자로 정규화됩니다.

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### Events

Bento Stream Gallery 컴포넌트를 사용하면 다음 이벤트를 기록하고 그에 응답할 수 있습니다.

**slideChange**

캐러셀에 표시되는 인덱스가 변경되면 트리거되는 이벤트입니다. 신규 인덱스는 `event.data.index`를 통해 사용할 수 있습니다.

```js
streamGallery.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### 레이아웃 및 스타일

Bento 컴포넌트에는 [콘텐츠 이동](https://web.dev/cls/) 없이 적절한 로드를 보장하는 데 필요한 작은 CSS 라이브러리가 있습니다. 순서 기반의 특수성으로 인해 사용자 지정 스타일보다 스타일시트가 먼저 삽입되어 있는지 수동으로 확인해야 합니다.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">
```

또는 경량의 사전 업그레이드 스타일을 인라인으로 활용할 수도 있습니다.

```html
<style data-bento-boilerplate>
  bento-stream-gallery {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 속성

##### 동작

###### `controls`

`"always"`, `"auto"` 또는 `"never"`, 기본값은 `"auto"`입니다. 이전/다음 탐색 화살표의 표시 여부와 표시 시점을 지정합니다. 참고: `outset-arrows`가 `true`인 경우 화살표는 `"always"`로 표시됩니다.

- `always`: 화살표가 항상 표시됩니다.
- `auto`: 캐러셀이 가장 최근에 마우스를 통해 상호작용을 받은 경우 화살표가 표시되고 캐러셀이 가장 최근에 터치 기기를 통해 상호작용을 받은 경우 화살표가 표시되지 않습니다. 터치 기기를 처음으로 로드한 경우 첫 상호작용이 있을 때까지 화살표가 표시됩니다.
- `never`: 화살표는 표시되지 않습니다.

###### `extra-space`

`"around"` 또는 미지정. 캐러셀에서 표시되는 슬라이드의 계산된 개수를 표시한 후 여분 공간이 할당되는 방식을 결정합니다. `"around"`인 경우 `justify-content: center`로 공백이 캐러셀 주변에 고르게 분포됩니다. 또는 LTR 문서의 경우 공간이 캐러셀 오른쪽에 할당되고 RTL 문서의 경우 공간이 캐러셀 왼쪽에 할당됩니다.

###### `loop`

`true` 또는 `false`, 기본값은 `true`입니다. true인 경우 사용자는 캐러셀을 통해 첫 번째 항목에서 마지막 항목으로 또는 그 반대로 이동할 수 있습니다. 루핑이 발생하려면 표시된 슬라이드가 3개 이상이어야 합니다.

###### `outset-arrows`

`true` 또는 `false`, 기본값은 `false`입니다. true인 경우 캐러셀은 슬라이드의 시작 부분 및 양쪽에 화살표를 표시합니다. 시작 화살표를 사용하면 슬라이드 컨테이너의 유효 길이가 주어진 컨테이너에 할당된 공간보다 100px 짧습니다(양쪽 화살표 하나당 50px). false인 경우 캐러셀은 슬라이드의 왼쪽 및 오른쪽 가장자리 상단에서 화살표를 삽입 및 오버레이로 표시합니다.

###### `peek`

숫자, 기본값은 `0`이빈다. 사용자에 대한 어포던스로 캐러셀이 스와이프 가능함을 나타내며, (현재 슬라이드의 한쪽 또는 양쪽에) 표시할 추가 슬라이드의 개수를 결정합니다.

##### 갤러리 슬라이드 가시성

###### `min-visible-count`

숫자, 기본값은 `1`입니다. 주어진 시간에 표시할 최소 슬라이드 수를 지정합니다. 분수 값을 사용하여 추가 슬라이드의 일부를 표시할 수 있습니다.

###### `max-visible-count`

숫자, 기본값은 <code>Number.MAX_VALUE</code>입니다. 주어진 시간에 표시할 최대 슬라이드 수를 지정합니다. 분수 값을 사용하여 추가 슬라이드의 일부를 표시할 수 있습니다.

###### `min-item-width`

숫자, 기본값은 `1`입니다. 각 항목의 최소 너비를 지정합니다. 이는 갤러리의 전체 너비 내에서 한 번에 표시 가능한 전체 항목 수를 결정하는 데 사용됩니다.

###### `max-item-width`

숫자, 기본값은 <code>Number.MAX_VALUE</code>입니다. 각 항목의 최대 너비를 지정합니다. 이는 갤러리의 전체 너비 내에서 한 번에 표시 가능한 전체 항목 수를 결정하는 데 사용됩니다.

##### 슬라이드 스냅핑

###### `slide-align`

`start` 또는 `center`입니다. 정렬을 시작할 때 슬라이드의 시작(예: 가로 정렬의 경우 왼쪽 가장자리) 부분이 캐러셀의 시작에 정렬됩니다. 중앙 정렬 시 슬라이드의 중앙 부분은 캐러셀의 중앙과 정렬됩니다.

###### `snap`

`true` 또는 `false`, 기본값은 `true`입니다. 스크롤 시 슬라이드에 캐러셀 스냅 여부를 지정합니다.

#### 스타일링

`bento-stream-gallery` 요소 선택자를 사용하여 streamGallery의 스타일을 자유롭게 지정할 수 있습니다.

### Preact/React 컴포넌트

아래의 예시는 Preact 또는 React 라이브러리와 함께 사용할 수 있는 함수형 컴포넌트로 `<BentoStreamGallery>`가 활용된 방식을 보여줍니다.

#### 예시: npm을 통해 가져오기

[example preview="top-frame" playground="false"]

npm을 통해 설치:

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import React from 'react';
import { BentoStreamGallery } from '@ampproject/bento-stream-gallery/react';
import '@ampproject/bento-stream-gallery/styles.css';

function App() {
  return (
    <BentoStreamGallery>
      <img src="img1.png">
      <img src="img2.png">
      <img src="img3.png">
      <img src="img4.png">
      <img src="img5.png">
      <img src="img6.png">
      <img src="img7.png">
    </BentoStreamGallery>
  );
}
```

[/example]

#### 상호작용 및 API 사용

Bento 컴포넌트는 API를 통해 고도의 상호작용을 지원합니다. `ref`를 전달하여  `BentoStreamGallery` 컴포넌트 API에 액세스할 수 있습니다.

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoStreamGallery ref={ref}>
      <img src="img1.png">
      <img src="img2.png">
      <img src="img3.png">
      <img src="img4.png">
      <img src="img5.png">
      <img src="img6.png">
      <img src="img7.png">
    </BentoStreamGallery>
  );
}
```

##### 동작

`BentoStreamGallery` API를 사용하면 다음 동작을 수행할 수 있습니다.

**next()**

<code>advanceCount</code> 슬라이드를 통해 캐러셀을 앞으로 이동시킵니다.

```javascript
ref.current.next();
```

**prev()**

<code>advanceCount</code> 슬라이드를 통해 캐러셀을 뒤로 이동시킵니다.

```javascript
ref.current.prev();
```

**goToSlide(인덱스: 숫자)**

`index` 인수를 통해 캐러셀을 지정된 슬라이드로 이동시킵니다. 참고: `index`는 `0` 이상이며 제공된 슬라이드 개수보다 적은 숫자로 정규화됩니다.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

##### 이벤트

**onSlideChange**

캐러셀에 표시되는 인덱스가 변경되면 트리거되는 이벤트입니다.

```jsx
<BentoStreamGallery onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoStreamGallery>
```

#### 레이아웃 및 스타일

**컨테이너 유형**

`BentoStreamGallery` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(예: `width`로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소에 크기를 적용해야 합니다.

```jsx
<BentoStreamGallery style={{width: '300px'}}>
  ...
</BentoStreamGallery>
```

또는 `className`을 통해 적용 가능합니다.

```jsx
<BentoStreamGallery className='custom-styles'>
  ...
</BentoStreamGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

#### 프로퍼티

##### 일반 프로퍼티

이 컴포넌트는 React 및 Preact 컴포넌트용 [일반 프로퍼티](../../../docs/spec/bento-common-props.md)를 지원합니다.

##### 동작

###### `controls`

`"always"`, `"auto"` 또는 `"never"`, 기본값은 `"auto"`입니다. 이전/다음 탐색 화살표의 표시 여부와 표시 시점을 지정합니다. 참고: `outset-arrows`가 `true`인 경우 화살표는 `"always"`로 표시됩니다.

- `always`: 화살표가 항상 표시됩니다.
- `auto`: 캐러셀이 가장 최근에 마우스를 통해 상호작용을 받은 경우 화살표가 표시되고 캐러셀이 가장 최근에 터치 기기를 통해 상호작용을 받은 경우 화살표가 표시되지 않습니다. 터치 기기를 처음으로 로드한 경우 첫 상호작용이 있을 때까지 화살표가 표시됩니다.
- `never`: 화살표가 표시되지 않습니다.

###### `extraSpace`

`"around"` 또는 미지정. 캐러셀에서 표시되는 슬라이드의 계산된 개수를 표시한 후 여분 공간이 할당되는 방식을 결정합니다. `"around"`인 경우 `justify-content: center`로 공백이 캐러셀 주변에 고르게 분포됩니다. 또는 LTR 문서의 경우 공간이 캐러셀 오른쪽에 할당되고 RTL 문서의 경우 공간이 캐러셀 왼쪽에 할당됩니다.

###### `loop`

`true` 또는 `false`, 기본값은 `true`입니다. true인 경우 사용자는 캐러셀을 통해 첫 번째 항목에서 마지막 항목으로 또는 그 반대로 이동할 수 있습니다. 루핑이 발생하려면 표시된 슬라이드가 3개 이상이어야 합니다.

###### `outsetArrows`

`true` 또는 `false`, 기본값은 `false`입니다. true인 경우 캐러셀은 슬라이드의 시작 부분 및 양쪽에 화살표를 표시합니다. 시작 화살표를 사용하면 슬라이드 컨테이너의 유효 길이가 주어진 컨테이너에 할당된 공간보다 100px 짧습니다(양쪽 화살표 하나당 50px). false인 경우 캐러셀은 슬라이드의 왼쪽 및 오른쪽 가장자리 상단에서 화살표를 삽입 및 오버레이로 표시합니다.

###### `peek`

숫자, 기본값은 `0`이빈다. 사용자에 대한 어포던스로 캐러셀이 스와이프 가능함을 나타내며, (현재 슬라이드의 한쪽 또는 양쪽에) 표시할 추가 슬라이드의 개수를 결정합니다.

##### 갤러리 슬라이드 가시성

###### `minVisibleCount`

숫자, 기본값은 `1`입니다. 주어진 시간에 표시할 최소 슬라이드 수를 지정합니다. 분수 값을 사용하여 추가 슬라이드의 일부를 표시할 수 있습니다.

###### `maxVisibleCount`

숫자, 기본값은 <code>Number.MAX_VALUE</code>입니다. 주어진 시간에 표시할 최대 슬라이드 수를 지정합니다. 분수 값을 사용하여 추가 슬라이드의 일부를 표시할 수 있습니다.

###### `minItemWidth`

숫자, 기본값은 `1`입니다. 각 항목의 최소 너비를 지정합니다. 이는 갤러리의 전체 너비 내에서 한 번에 표시 가능한 전체 항목 수를 결정하는 데 사용됩니다.

###### `maxItemWidth`

숫자, 기본값은 <code>Number.MAX_VALUE</code>입니다. 각 항목의 최대 너비를 지정합니다. 이는 갤러리의 전체 너비 내에서 한 번에 표시 가능한 전체 항목 수를 결정하는 데 사용됩니다.

##### 슬라이드 스냅핑

###### `slideAlign`

`start` 또는 `center`입니다. 정렬을 시작할 때 슬라이드의 시작(예: 가로 정렬의 경우 왼쪽 가장자리) 부분이 캐러셀의 시작에 정렬됩니다. 중앙 정렬 시 슬라이드의 중앙 부분은 캐러셀의 중앙과 정렬됩니다.

###### `snap`

`true` 또는 `false`, 기본값은 `true`입니다. 스크롤 시 슬라이드에 캐러셀 스냅 여부를 지정합니다.
