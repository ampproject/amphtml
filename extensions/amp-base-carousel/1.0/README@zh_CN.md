# Bento Carousel

用于沿水平轴或垂直轴显示多个相似内容的通用轮播界面。

组件的每个直接子级都会被视为轮播界面中的一个条目。其中的每个节点也可以具有任意子级。

轮播界面包含任意数量的条目，以及可选的用于向前或向后导航单个条目的导航箭头。

用户滑动或使用可自定义的箭头按钮时，轮播界面会在条目之间前进。

## 网页组件

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

下面的示例演示了 `<bento-base-carousel>` 网页组件的用法。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### 示例：通过 `<script>` 包含

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

### 互动和 API 用法

启用 Bento 的组件在用作独立网页组件时可通过其 API 实现频繁互动。可以通过在文档中包含以下脚本代码来访问 `bento-base-carousel` 组件 API：

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### 操作

`bento-base-carousel` API 使您可以执行以下操作：

##### next()

将轮播界面向前移动 <code>advance-count</code> 张幻灯片。

```javascript
api.next();
```

##### prev()

将轮播界面向后移动 <code>advance-count</code> 张幻灯片。

```javascript
api.prev();
```

##### goToSlide(index: number)

将轮播界面移至 `index` 参数所指定的幻灯片。注：`index` 将被归一化为大于或等于 `0` 且小于给定幻灯片张数的数字。

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### 事件

`bento-base-carousel` API 使您可以注册和响应以下事件：

##### slideChange

当轮播界面显示的索引发生变化时会触发此事件。可以通过 `event.data.index` 获得新索引。

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### 布局和样式

每个 Bento 组件都有一个小型 CSS 库，必须包含该库以确保正确加载而不会发生[内容偏移](https://web.dev/cls/)。由于基于顺序的特性，在使用任何自定义样式之前，您必须手动确保包含样式表。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

或者，您也可以选择以内嵌方式使用轻量级升级前样式：

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 容器类型

`bento-base-carousel` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小：

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### 从右到左变更幻灯片

在从右到左 (RTL) 上下文（例如阿拉伯语、希伯来语网页）中时，需要对 `<bento-base-carousel>` 进行定义。虽然未定义的轮播界面通常可以工作，但可能会存在一些错误。您可以通过以下代码使轮播界面以 `rtl` 方式运行：

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

如果轮播界面位于 RTL 上下文中，但您希望轮播界面以 LTR 方式运行，则可以对轮播界面显式设置 `dir="ltr"`。

### 幻灯片布局

**未**指定 `mixed-lengths` 时，幻灯片会由轮播界面自动调整大小。

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

设置轮播界面布局时，幻灯片具有隐式高度。这可以通过 CSS 轻松更改。指定高度时，幻灯片将在轮播界面内垂直居中对齐。

如果您想水平居中对齐幻灯片内容，您将需要创建一个封装元素，并使用它来居中对齐内容。

### 可见幻灯片张数

使用 `visible-slides` 更改可见幻灯片张数时，为了响应媒体查询，您可能需要更改轮播界面自身的宽高比以匹配新的可见幻灯片数张数。例如，如果您希望以 1:1 的宽高比一次显示三张幻灯片，则您需要将轮界面自身的宽高比设置为 3:1。同样，要一次显示四张幻灯片，您需要将宽高比设置为 4:1。此外，在更改 `visible-slides` 时，您可能需要更改 `advance-count`。

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

### 特性

#### 媒体查询

可以配置 `<bento-base-carousel>` 的特性以使用基于[媒体查询](./../../../docs/spec/amp-html-responsive-attributes.md)的不同选项。

#### 可见幻灯片张数

##### mixed-length

`true` 或 `false`，默认值为 `false`。如果为 true，将使用每张幻灯片的现有宽度（或水平时的高度）。这样，轮播界面就可以使用具有不同宽度的幻灯片。

##### visible-count

数值，默认值为 `1`。用于确定在某一时刻应显示的幻灯片张数。可以使用分数值，使额外 n 张幻灯片部分可见。当 `mixed-length` 为 `true` 时，将忽略此选项。

##### advance-count

数值，默认值为 `1`。用于确定使用前后箭头时轮播界面前进的幻灯片张数。这在指定 `visible-count` 特性时非常实用。

#### 自动前进

##### auto-advance

`true` 或 `false`，默认值为 `false`。使轮播界面能够基于一定延迟自动前进到下一张幻灯片。如果用户手动更改幻灯片，则会停止自动前进。请注意，如果未启用 `loop`，则到达最后一个条目后，自动前进将后退至第一个条目。

##### auto-advance-count

数值，默认值为 `1`。用于确定轮播界面在自动前进模式下前进的幻灯片张数。这在指定 `visible-count` 特性时非常实用。

##### auto-advance-interval

数值，默认值为 `1000`。指定轮播界面后续自动前进之间的时间量，以毫秒为单位。

##### auto-advance-loops

数值，默认值为 `∞`。轮播界面在停止前应播放幻灯片的次数。

#### 贴靠

##### snap

`true` 或 `false`，默认值为 `true`。确定轮播界面在滚动时是否应贴靠在幻灯片上。

##### snap-align

`start` 或 `center`。开头对齐时，幻灯片的开头（例如，水平对齐时为左边缘）与轮播界面的开头对齐。居中对齐时，幻灯片的中心与轮播界面的中心对齐。

##### snap-by

数值，默认值为 `1`。用于确定贴靠的粒度，在使用 `visible-count` 时非常实用。

#### 其他

##### controls

`"always"`、`"auto"` 或 `"never"`，默认值为 `"auto"`。用于确定是否以及何时显示前后导航箭头。注：当 `outset-arrows` 为 `true` 时，将始终 (`"always"`) 显示箭头。

-   `always`：始终显示箭头。
-   `auto`：在轮播界面最近接收到鼠标互动时显示箭头，而在轮播界面最近接收到触控互动时则不显示箭头。在针对触控设备第一次加载时，箭头会一直显示，直到发生首次互动为止。
-   `never`：始终不显示箭头。

##### slide

数值，默认值为 `0`。用于确定轮播界面中显示的初始幻灯片。这可以通过 `Element.setAttribute` 改变以控制当前显示的幻灯片。

##### loop

`true` 或 `false`，缺省时的默认值为 `false`。设为 true 时，轮播界面将允许用户从第一个条目移回最后一个条目，或者从最后一个条目移回第一个条目。幻灯片张数必须至少达到 `visible-count` 的三倍才能发生循环。

##### orientation

`horizontal` 或 `vertical`，默认值为 `horizontal`。设为 `horizontal` 时，轮播界面将水平布局，用户可以左右滑动。设为 `vertical` 时，轮播界面将垂直布局，用户可以上下滑动。

### 样式设置

您可以使用 `bento-base-carousel` 元素选择器来自由设置轮播界面的样式。

#### 自定义箭头按钮

您可以传入自己的自定义标记来自定义箭头按钮。例如，您可以使用以下 HTML 和 CSS 来重新创建默认样式：

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

## Preact/React 组件

下面的示例演示了如何将 `<BentoBaseCarousel>` 用作可与 Preact 或 React 库配合使用的功能组件。

### 示例：通过 npm 导入

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

### 互动和 API 用法

Bento 组件可通过其 API 实现频繁互动。可以通过传递 `ref` 来访问 `BentoBaseCarousel` 组件 API：

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

#### 操作

`BentoBaseCarousel` API 使您可以执行以下操作：

##### next()

将轮播界面向前移动 `advanceCount` 张幻灯片。

```javascript
ref.current.next();
```

##### prev()

将轮播界面向后移动 `advanceCount` 张幻灯片。

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

将轮播界面移至 `index` 参数所指定的幻灯片。注：`index` 将被归一化为大于或等于 `0` 且小于给定幻灯片张数的数字。

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### 事件

`BentoBaseCarousel` API 使您可以注册和响应以下事件：

##### onSlideChange

当轮播界面显示的索引发生变化时会触发此事件。

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### 布局和样式

#### 容器类型

`BentoBaseCarousel` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小。可以内嵌应用：

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

或通过 `className` 应用：

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

### 从右到左变更幻灯片

在从右到左 (RTL) 上下文（例如阿拉伯语、希伯来语网页）中时，需要对 `<BentoBaseCarousel>` 进行定义。虽然未定义的轮播界面通常可以工作，但可能会存在一些错误。您可以通过以下代码使轮播界面以 `rtl` 方式运行：

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

如果轮播界面位于 RTL 上下文中，但您希望轮播界面以 LTR 方式运行，则可以对轮播界面显式设置 `dir="ltr"`。

### 幻灯片布局

**未**指定 `mixedLengths` 时，幻灯片会由轮播界面自动调整大小。

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

设置轮播界面布局时，幻灯片具有隐式高度。这可以通过 CSS 轻松更改。指定高度时，幻灯片将在轮播界面内垂直居中对齐。

如果您想水平居中对齐幻灯片内容，您将需要创建一个封装元素，并使用它来居中对齐内容。

### 可见幻灯片张数

使用 `visibleSlides` 更改可见幻灯片张数时，为了响应媒体查询，您可能需要更改轮播界面自身的宽高比以匹配新的可见幻灯片数张数。例如，如果您希望以 1:1 的宽高比一次显示三张幻灯片，则您需要将轮界面自身的宽高比设置为 3:1。同样，要一次显示四张幻灯片，您需要将宽高比设置为 4:1。此外，在更改 `visibleSlides` 时，您可能需要更改 `advanceCount`。

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

### 属性

#### 可见幻灯片张数

##### mixedLength

`true` 或 `false`，默认值为 `false`。如果为 true，将使用每张幻灯片的现有宽度（或水平时的高度）。这样，轮播界面就可以使用具有不同宽度的幻灯片。

##### visibleCount

数值，默认值为 `1`。用于确定在某一时刻应显示的幻灯片张数。可以使用分数值，使额外 n 张幻灯片部分可见。当 `mixedLength` 为 `true` 时，将忽略此选项。

##### advanceCount

数值，默认值为 `1`。用于确定使用前后箭头时轮播界面前进的幻灯片张数。这在指定 `visibleCount` 特性时非常实用。

#### 自动前进

##### autoAdvance

`true` 或 `false`，默认值为 `false`。使轮播界面能够基于一定延迟自动前进到下一张幻灯片。如果用户手动更改幻灯片，则会停止自动前进。请注意，如果未启用 `loop`，则到达最后一个条目后，自动前进将后退至第一个条目。

##### autoAdvanceCount

数值，默认值为 `1`。用于确定轮播界面在自动前进模式下前进的幻灯片张数。这在指定 `visible-count` 特性时非常实用。

##### autoAdvanceInterval

数值，默认值为 `1000`。指定轮播界面后续自动前进之间的时间量，以毫秒为单位。

##### autoAdvanceLoops

数值，默认值为 `∞`。轮播界面在停止前应播放幻灯片的次数。

#### 贴靠

##### snap

`true` 或 `false`，默认值为 `true`。确定轮播界面在滚动时是否应贴靠在幻灯片上。

##### snapAlign

`start` 或 `center`。开头对齐时，幻灯片的开头（例如，水平对齐时为左边缘）与轮播界面的开头对齐。居中对齐时，幻灯片的中心与轮播界面的中心对齐。

##### snapBy

数值，默认值为 `1`。用于确定贴靠的粒度，在使用 `visible-count` 时非常实用。

#### 其他

##### controls

`"always"`、`"auto"` 或 `"never"`，默认值为 `"auto"`。用于确定是否以及何时显示前后导航箭头。注：当 `outset-arrows` 为 `true` 时，将始终 (`"always"`) 显示箭头。

-   `always`：始终显示箭头。
-   `auto`：在轮播界面最近接收到鼠标互动时显示箭头，而在轮播界面最近接收到触控互动时则不显示箭头。在针对触控设备第一次加载时，箭头会一直显示，直到发生首次互动为止。
-   `never`：始终不显示箭头。

##### defaultSlide

数值，默认值为 `0`。用于确定轮播界面中显示的初始幻灯片。

##### loop

`true` 或 `false`，缺省时的默认值为 `false`。设为 true 时，轮播界面将允许用户从第一个条目移回最后一个条目，或者从最后一个条目移回第一个条目。幻灯片张数必须至少达到 `visible-count` 的三倍才能发生循环。

##### orientation

`horizontal` 或 `vertical`，默认值为 `horizontal`。设为 `horizontal` 时，轮播界面将水平布局，用户可以左右滑动。设为 `vertical` 时，轮播界面将垂直布局，用户可以上下滑动。

### 样式设置

您可以使用 `BentoBaseCarousel` 元素选择器来自由设置轮播界面的样式。

#### 自定义箭头按钮

您可以传入自己的自定义标记来自定义箭头按钮。例如，您可以使用以下 HTML 和 CSS 来重新创建默认样式：

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
