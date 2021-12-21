# Bento 캐러셀

세로축 또는 가로축을 따라 유사한 콘텐츠 여러 개를 표시하는 일반 캐러셀.

컴포넌트의 직접 하위 요소는 각 캐러셀의 항목으로 간주됩니다. 노드별로 임의의 하위 요소가 포함될 수도 있습니다.

캐러셀은 임의 개수의 항목으로 구성되거나 단일 항목을 앞으로 혹은 뒤로 이동시키는 선택적 탐색 화살표로 구성됩니다.

사용자가 스와이프하거나 사용자 지정 가능한 화살표 버튼을 사용하는 경우 캐러셀은 항목 사이를 이동합니다.

## 웹 컴포넌트

적절한 로딩을 보장하고 사용자 지정 스타일을 추가하기 전에 각 Bento 컴포넌트의 필수 CSS 라이브러리를 삽입해야 합니다. 또는 인라인으로 지원되는 경량의 사전 업그레이드 스타일을 사용해 보세요. [레이아웃 및 스타일](#layout-and-style)을 참조하시길 바랍니다.

`<bento-base-carousel>` 웹 컴포넌트의 활용 사례는 아래 예시에서 확인할 수 있습니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### 예시: `<script>`를 통해 삽입하기

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-base-carousel {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
  ></script>
  <style>
    bento-base-carousel,
    bento-base-carousel > div {
      aspect-ratio: 4/1;
    }
    .red {
      background: darkred;
    }
    .blue {
      background: steelblue;
    }
    .green {
      background: seagreen;
    }
  </style>
</head>
<bento-base-carousel id="my-carousel">
  <div class="red"></div>
  <div class="blue"></div>
  <div class="green"></div>
</bento-base-carousel>
<div class="buttons" style="margin-top: 8px">
  <button id="prev-button">Go to previous slide</button>
  <button id="next-button">Go to next slide</button>
  <button id="go-to-button">Go to slide with green gradient</button>
</div>

<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('bento-base-carousel');
    const api = await carousel.getApi();

    // programatically advance to next slide
    api.next();

    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

### 상호작용 및 API 사용

독립형 웹 컴포넌트로 사용되는 Bento 구동 컴포넌트는 API를 통해 고도의 상호작용을 지원합니다. 문서에 다음 스크립트 태그를 삽입하여 `bento-base-carousel` 컴포넌트 API에 액세스할 수 있습니다.

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### 동작

`bento-base-carousel` API를 사용하면 다음 동작을 수행할 수 있습니다.

##### next()

<code>advance-count</code> 슬라이드를 통해 캐러셀을 앞으로 이동시킵니다.

```javascript
api.next();
```

##### prev()

<code>advance-count</code> 슬라이드를 통해 캐러셀을 뒤로 이동시킵니다.

```javascript
api.prev();
```

##### goToSlide(인덱스: 숫자)

`index` 인수를 통해 캐러셀을 지정된 슬라이드로 이동시킵니다. 참고: `index`는 `0` 이상이며 제공된 슬라이드 개수보다 적은 숫자로 정규화됩니다.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### 이벤트

`bento-base-carousel` API를 사용하면 다음 이벤트를 기록하고 그에 응답할 수 있습니다.

##### slideChange

캐러셀에 표시되는 인덱스가 변경되면 트리거되는 이벤트입니다. 신규 인덱스는 `event.data.index`를 통해 사용할 수 있습니다.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### 레이아웃 및 스타일

Bento 컴포넌트에는 [콘텐츠 이동](https://web.dev/cls/) 없이 적절한 로드를 보장하는 데 필요한 작은 CSS 라이브러리가 있습니다. 순서 기반의 특수성으로 인해 사용자 지정 스타일보다 스타일시트가 먼저 삽입되어 있는지 수동으로 확인해야 합니다.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

또는 경량의 사전 업그레이드 스타일을 인라인으로 활용할 수도 있습니다.

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 컨테이너 유형

`bento-base-carousel` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### 오른쪽에서 왼쪽으로 슬라이드 변경

오른쪽에서 왼쪽으로 읽는(rtl) 컨텍스트(예: 아랍어, 히브리어 페이지)에 있을 경우 `<bento-base-carousel>`을 정의해야 합니다. 일반적으로 해당 요소 없이도 캐러셀이 작동하지만 일부 버그가 발생할 수 있습니다. 다음과 같이 캐러셀이 `rtl`로 작동하도록 명시할 수 있습니다.

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

캐러셀이 RTL 컨텍스트에 있으나 LTR로 작동하도록 하려면 해당 캐러셀을 명시적으로 `dir="ltr"`에 설정할 수 있습니다.

### 슬라이드 레이아웃

`mixed-lengths`가 지정되지 **않은** 경우 슬라이드 크기는 캐러셀에 따라 자동 조정됩니다.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

슬라이드는 캐러셀이 배치될 때 암시적 높이를 갖습니다. 해당 높이는 CSS를 사용해 쉽게 변경할 수 있습니다. 높이를 지정하면 슬라이드가 캐러셀 내에서 중앙에 세로로 위치합니다.

슬라이드 콘텐츠가 중앙에 가로로 위치하게 하려면 래핑 요소를 생성하고 이를 사용하여 콘텐츠를 중앙에 배치하세요.

### 표시되는 슬라이드 수

미디어 쿼리에 대한 응답으로 `visible-slides`를 사용하여 표시되는 슬라이드 수를 변경하려는 경우, 표시되는 슬라이드의 새로운 개수와 일치하도록 캐러셀 자체의 가로세로 비율을 변경하고 싶을 수 있습니다. 예를 들어, 한 번에 3개의 슬라이드를 1:1 가로세로 비율로 표시하려는 경우 캐러셀의 가로세로 비율은 3:1로 설정하는 것이 좋습니다. 마찬가지로 한 번에 4개의 슬라이드를 사용할 경우 4:1의 가로세로 비율이 필요합니다. 또한 `visible-slides`를 변경할 경우 `advance-count`도 변경하는 것이 좋습니다.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<bento-base-carousel
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <img style="height: 100%; width: 100%" src="…" />
  …
</bento-base-carousel>
```

### 속성

#### 미디어 쿼리

`<bento-base-carousel>` 속성은 [미디어 쿼리](./../../../docs/spec/amp-html-responsive-attributes.md)에 따라 다른 옵션을 사용하도록 구성할 수 있습니다.

#### 표시되는 슬라이드 수

##### mixed-length

`true` 또는 `false`, 기본값은 `false`입니다. true인 경우 각 슬라이드에 기존 너비(가로인 경우 높이)를 사용합니다. 따라서 다양한 너비의 슬라이드가 포함된 캐러셀을 사용할 수 있습니다.

##### visible-count

숫자, 기본값은 `1`입니다. 주어진 시간에 표시할 슬라이드 수를 지정합니다. 분수 값을 사용하여 추가 슬라이드의 일부를 표시할 수 있습니다. 이 옵션은 `mixed-length` 가 `true`인 경우 무시됩니다.

##### advance-count

숫자, 기본값은 `1`입니다. 이전 또는 다음 화살표를 사용하여 이동할 경우 캐러셀에서 이동할 슬라이드 개수를 지정합니다. `visible-count` 속성을 지정할 때 유용합니다.

#### 자동 이동

##### auto-advance

`true` 또는 `false`, 기본값은 `false`입니다. 지연에 따라 캐러셀이 다음 슬라이드로 자동으로 이동합니다. 사용자가 수동으로 슬라이드를 변경하면 자동 이동이 정지됩니다. `loop`가 활성화되지 않은 경우 마지막 항목에 도달하면 자동 이동이 역방향으로 진행되어 첫 번째 항목으로 이동합니다.

##### auto-advance-count

숫자, 기본값은 `1`입니다. 자동 이동 시 캐러셀에서 이동할 슬라이드 개수를 지정합니다. `visible-count` 속성을 지정할 때 유용합니다.

##### auto-advance-interval

숫자, 기본값은 `1000`입니다. 캐러셀의 다음 자동 이동 사이의 시간(밀리초)을 지정합니다.

##### auto-advance-loops

숫자, 기본값은 `∞`입니다. 캐러셀이 정지하기 전 슬라이드를 이동해야 하는 횟수입니다.

#### 스냅핑

##### snap

`true` 또는 `false`, 기본값은 `true`입니다. 스크롤 시 슬라이드에 캐러셀 스냅 여부를 지정합니다.

##### snap-align

`start` 또는 `center`입니다. 정렬을 시작할 때 슬라이드의 시작(예: 가로 정렬의 경우 왼쪽 가장자리) 부분이 캐러셀의 시작에 정렬됩니다. 중앙 정렬 시 슬라이드의 중앙 부분은 캐러셀의 중앙과 정렬됩니다.

##### snap-by

숫자, 기본값은 `1`입니다. 숫자, 기본값은 1입니다 스냅의 사소한 디테일을 지정하며 `visible-count`을 사용할 때 유용합니다.

#### 기타

##### controls

`"always"`, `"auto"` 또는 `"never"`, 기본값은 `"auto"`입니다. 이전/다음 탐색 화살표의 표시 여부와 표시 시점을 지정합니다. 참고: `outset-arrows`가 `true`인 경우 화살표는 `"always"`로 표시됩니다.

-   `always`: 화살표가 항상 표시됩니다.
-   `auto`: 캐러셀이 가장 최근에 마우스를 통해 상호작용을 받은 경우 화살표가 표시되고 캐러셀이 가장 최근에 터치 기기를 통해 상호작용을 받은 경우 화살표가 표시되지 않습니다. 터치 기기를 처음으로 로드한 경우 첫 상호작용이 있을 때까지 화살표가 표시됩니다.
-   `never`: 화살표가 표시되지 않습니다.

##### slide

숫자, 기본값은 `0`입니다. 캐러셀에 표시되는 첫 슬라이드를 지정합니다. `Element.setAttribute`로 변경되어 현재 표시되는 슬라이드를 제어할 수 있습니다.

##### loop

`true` 또는 `false`, 생략된 경우 기본값은 `false`입니다. true인 경우 사용자는 캐러셀을 통해 첫 번째 항목에서 마지막 항목으로 또는 그 반대로 이동할 수 있습니다. 루핑이 발생하려면 표시된 슬라이드의 `visible-count`가 3회 이상이어야 합니다.

##### orientation

`horizontal` 또는 `vertical`, 기본값은 `horizontal`입니다. `horizontal`인 경우 캐러셀은 사용자가 왼쪽, 오른쪽으로 스와이프할 수 있도록 가로로 배치됩니다. `vertical`인 경우 캐러셀은 사용자가 왼쪽, 오른쪽으로 스와이프할 수 있도록 가로로 배치됩니다.

### 스타일링

`bento-base-carousel` 요소 선택자를 사용하여 스타일과 캐러셀을 자유롭게 지정할 수 있습니다.

#### 화살표 버튼 사용자 지정

사용자 지정 마크업을 전달하여 화살표 버튼을 사용자 지정할 수 있습니다. 예를 들어 다음 HTML 및 CSS를 사용하여 기본 스타일을 다시 생성할 수 있습니다.

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<bento-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</bento-base-carousel>
```

---

## Preact/React 컴포넌트

아래의 예시는 Preact 또는 React 라이브러리와 함께 사용할 수 있는 함수형 컴포넌트로 `<BentoBaseCarousel>`가 활용된 방식을 보여줍니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/base-carousel
```

```javascript
import React from 'react';
import {BentoBaseCarousel} from '@bentoproject/base-carousel/react';
import '@bentoproject/base-carousel/styles.css';

function App() {
  return (
    <BentoBaseCarousel>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

### 상호작용 및 API 사용

Bento 컴포넌트는 API를 통해 고도의 상호작용을 지원합니다. `ref`를 전달하여 `BentoBaseCarousel` 컴포넌트 API에 액세스할 수 있습니다.

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoBaseCarousel ref={ref}>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

#### 동작

`BentoBaseCarousel` API를 사용하면 다음 동작을 수행할 수 있습니다.

##### next()

`advanceCount` 슬라이드를 통해 캐러셀을 앞으로 이동시킵니다.

```javascript
ref.current.next();
```

##### prev()

`advanceCount` 슬라이드를 통해 캐러셀을 뒤로 이동시킵니다.

```javascript
ref.current.prev();
```

##### goToSlide(인덱스: 숫자)

`index` 인수를 통해 캐러셀을 지정된 슬라이드로 이동시킵니다. 참고: `index`는 `0` 이상이며 제공된 슬라이드 개수보다 적은 숫자로 정규화됩니다.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### 이벤트

`BentoBaseCarousel` API를 사용하면 다음 이벤트를 기록하고 그에 응답할 수 있습니다.

##### onSlideChange

캐러셀에 표시되는 인덱스가 변경되면 트리거되는 이벤트입니다.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### 레이아웃 및 스타일

#### 컨테이너 유형

`BentoBaseCarousel` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

또는 `className`을 통해 적용 가능합니다.

```jsx
<BentoBaseCarousel className="custom-styles">
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}

.custom-styles > * {
  aspect-ratio: 4/1;
}
```

### 오른쪽에서 왼쪽으로 슬라이드 변경

오른쪽에서 왼쪽으로 읽는(rtl) 컨텍스트(예: 아랍어, 히브리어 페이지)에 있을 경우 `<BentoBaseCarousel>`을 정의해야 합니다. 일반적으로 해당 요소 없이도 캐러셀이 작동하지만 일부 버그가 발생할 수 있습니다. 다음과 같이 캐러셀이 `rtl`로 작동하도록 명시할 수 있습니다.

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

캐러셀이 RTL 컨텍스트에 있으나 LTR로 작동하도록 하려면 해당 캐러셀을 명시적으로 `dir="ltr"`에 설정할 수 있습니다.

### 슬라이드 레이아웃

<code>mixedLengths</code>가 지정되지 <strong>않은</strong> 경우 슬라이드 크기는 캐러셀에 따라 자동 조정됩니다.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

슬라이드는 캐러셀이 배치될 때 암시적 높이를 갖습니다. 해당 높이는 CSS를 사용해 쉽게 변경할 수 있습니다. 높이를 지정하면 슬라이드가 캐러셀 내에서 중앙에 세로로 위치합니다.

슬라이드 콘텐츠가 중앙에 가로로 위치하게 하려면 래핑 요소를 생성하고 이를 사용하여 콘텐츠를 중앙에 배치하세요.

### 표시되는 슬라이드 수

미디어 쿼리에 대한 응답으로 `visibleSlides`를 사용하여 표시되는 슬라이드 수를 변경하려는 경우, 표시되는 슬라이드의 새로운 개수와 일치하도록 캐러셀 자체의 가로세로 비율을 변경하고 싶을 수 있습니다. 예를 들어, 한 번에 3개의 슬라이드를 1:1 가로세로 비율로 표시하려는 경우 캐러셀의 가로세로 비율은 3:1로 설정하는 것이 좋습니다. 마찬가지로 한 번에 4개의 슬라이드를 사용할 경우 4:1의 가로세로 비율이 필요합니다. 또한 `visibleSlides`를 변경할 경우 `advanceCount`도 변경하는 것이 좋습니다.

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel
  visibleCount={count}
  advanceCount={count}
>
  <img style={{height: '100%', width: '100%'}} src="…" />
  …
</BentoBaseCarousel>
```

### 프로퍼티

#### 표시되는 슬라이드 수

##### mixedLength

`true` 또는 `false`, 기본값은 `false`입니다. true인 경우 각 슬라이드에 기존 너비(가로인 경우 높이)를 사용합니다. 따라서 다양한 너비의 슬라이드가 포함된 캐러셀을 사용할 수 있습니다.

##### visibleCount

숫자, 기본값은 `1`입니다. 주어진 시간에 표시할 슬라이드 수를 지정합니다. 분수 값을 사용하여 추가 슬라이드의 일부를 표시할 수 있습니다. 이 옵션은 `mixedLength` 가 `true`인 경우 무시됩니다.

##### advanceCount

숫자, 기본값은 `1`입니다. 이전 또는 다음 화살표를 사용하여 이동할 경우 캐러셀에서 이동할 슬라이드 개수를 지정합니다. `visibleCount` 속성을 지정할 때 유용합니다.

#### 자동 이동

##### autoAdvance

`true` 또는 `false`, 기본값은 `false`입니다. 지연에 따라 캐러셀이 다음 슬라이드로 자동으로 이동합니다. 사용자가 수동으로 슬라이드를 변경하면 자동 이동이 정지됩니다. `loop`가 활성화되지 않은 경우 마지막 항목에 도달하면 자동 이동이 역방향으로 진행되어 첫 번째 항목으로 이동합니다.

##### autoAdvanceCount

숫자, 기본값은 `1`입니다. 자동 이동 시 캐러셀에서 이동할 슬라이드 개수를 지정합니다. `visible-count` 속성을 지정할 때 유용합니다.

##### autoAdvanceInterval

숫자, 기본값은 `1000`입니다. 캐러셀의 다음 자동 이동 사이의 시간(밀리초)을 지정합니다.

##### autoAdvanceLoops

숫자, 기본값은 `∞`입니다. 캐러셀이 정지하기 전 슬라이드를 이동해야 하는 횟수입니다.

#### 스냅핑

##### snap

`true` 또는 `false`, 기본값은 `true`입니다. 스크롤 시 슬라이드에 캐러셀 스냅 여부를 지정합니다.

##### snapAlign

`start` 또는 `center`입니다. 정렬을 시작할 때 슬라이드의 시작(예: 가로 정렬의 경우 왼쪽 가장자리) 부분이 캐러셀의 시작에 정렬됩니다. 중앙 정렬 시 슬라이드의 중앙 부분은 캐러셀의 중앙과 정렬됩니다.

##### snapBy

숫자, 기본값은 `1`입니다. 숫자, 기본값은 1입니다 스냅의 사소한 디테일을 지정하며 `visible-count`을 사용할 때 유용합니다.

#### 기타

##### controls

`"always"`, `"auto"` 또는 `"never"`, 기본값은 `"auto"`입니다. 이전/다음 탐색 화살표의 표시 여부와 표시 시점을 지정합니다. 참고: `outset-arrows`가 `true`인 경우 화살표는 `"always"`로 표시됩니다.

-   `always`: 화살표가 항상 표시됩니다.
-   `auto`: 캐러셀이 가장 최근에 마우스를 통해 상호작용을 받은 경우 화살표가 표시되고 캐러셀이 가장 최근에 터치 기기를 통해 상호작용을 받은 경우 화살표가 표시되지 않습니다. 터치 기기를 처음으로 로드한 경우 첫 상호작용이 있을 때까지 화살표가 표시됩니다.
-   `never`: 화살표가 표시되지 않습니다.

##### defaultSlide

숫자, 기본값은 `0`입니다. 캐러셀에 표시되는 첫 슬라이드를 지정합니다.

##### loop

`true` 또는 `false`, 생략된 경우 기본값은 `false`입니다. true인 경우 사용자는 캐러셀을 통해 첫 번째 항목에서 마지막 항목으로 또는 그 반대로 이동할 수 있습니다. 루핑이 발생하려면 표시된 슬라이드의 `visible-count`가 3회 이상이어야 합니다.

##### orientation

`horizontal` 또는 `vertical`, 기본값은 `horizontal`입니다. `horizontal`인 경우 캐러셀은 사용자가 왼쪽, 오른쪽으로 스와이프할 수 있도록 가로로 배치됩니다. `vertical`인 경우 캐러셀은 사용자가 왼쪽, 오른쪽으로 스와이프할 수 있도록 가로로 배치됩니다.

### 스타일링

`BentoBaseCarousel` 요소 선택자를 사용하여 스타일과 캐러셀을 자유롭게 지정할 수 있습니다.

#### 화살표 버튼 사용자 지정

사용자 지정 마크업을 전달하여 화살표 버튼을 사용자 지정할 수 있습니다. 예를 들어 다음 HTML 및 CSS를 사용하여 기본 스타일을 다시 생성할 수 있습니다.

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```jsx
function CustomPrevButton(props) {
  return <button {...props} className="carousel-prev" />;
}

function CustomNextButton(props) {
  return <button {...props} className="carousel-prev" />;
}

<BentoBaseCarousel
  arrowPrevAs={CustomPrevButton}
  arrowNextAs={CustomNextButton}
>
  <div>first slide</div>
  // …
</BentoBaseCarousel>
```
