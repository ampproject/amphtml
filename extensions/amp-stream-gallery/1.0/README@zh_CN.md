# Bento Stream Gallery

## 用法

Bento Stream Gallery 用于沿水平轴一次性显示多段类似的内容。要实现自定义程度更高的用户体验，请参阅 [`bento-base-carousel`](../../amp-base-carousel/1.0/README.md)。

可以将 Bento Stream Gallery 用作网页组件 ([`<bento-stream-gallery>`](#web-component))，或用作 Preact/React 功能组件 ([`<BentoStreamGallery>`](#preactreact-component))。

### 网页组件

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

下面的示例演示了 `<bento-stream-gallery>` 网页组件的用法。

#### 示例：通过 npm 导入

[example preview="top-frame" playground="false"]

通过 npm 安装：

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import '@ampproject/bento-stream-gallery';
```

[/example]

#### 示例：通过 `<script>` 包含

下面的示例包含具有三段代码的 `bento-stream-gallery`。第三段代码中的 `expanded` 特性可在网页加载时展开该组件。

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

#### 互动和 API 用法

启用 Bento 的组件在独立使用时可通过其 API 实现频繁互动。可以通过在文档中包含以下脚本代码来访问 `bento-stream-gallery` 组件 API：

```javascript
await customElements.whenDefined('bento-stream-gallery');
const api = await streamGallery.getApi();
```

##### 操作

**next()**

将轮播界面向前移动可见的幻灯片张数。

```js
api.next();
```

**prev()**

将轮播界面向后移动可见的幻灯片张数。

```js
api.prev();
```

**goToSlide(index: number)**

将轮播界面移至 `index` 参数所指定的幻灯片。注：`index` 将被归一化为大于或等于 <code>0</code> 且小于给定幻灯片张数的数字。

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### 事件

借助 Bento Stream Gallery 组件，您可以注册和响应以下事件：

**slideChange**

当轮播界面显示的索引发生变化时会触发此事件。可以通过 `event.data.index` 获得新索引。

```js
streamGallery.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### 布局和样式

每个 Bento 组件都有一个小型 CSS 库，必须包含该库以确保正确加载而不会发生[内容偏移](https://web.dev/cls/)。由于基于顺序的特性，在使用任何自定义样式之前，您必须手动确保包含样式表。

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">
```

或者，您也可以选择以内嵌方式使用轻量级升级前样式：

```html
<style data-bento-boilerplate>
  bento-stream-gallery {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 特性

##### 行为

###### `controls`

`"always"`、`"auto"` 或 `"never"`，默认值为 `"auto"`。用于确定是否以及何时显示前后导航箭头。注：当 `outset-arrows` 为 `true` 时，将始终 (`"always"`) 显示箭头。

-   `always`：始终显示箭头。
-   `auto`：在轮播界面最近接收到鼠标互动时显示箭头，而在轮播界面最近接收到触控互动时则不显示箭头。在针对触控设备第一次加载时，箭头会一直显示，直到发生首次互动为止。
-   `never`：始终不显示箭头。

###### `extra-space`

`"around"` 或未定义。用于确定在轮播界面中显示计算出的可见幻灯片张数后额外分配多少空间。如果设置为 `"around"`，则按照 `justify-content: center` 在轮播界面中平均分配空白空间；否则，将空间分配到轮播界面右侧供 LTR 文档使用，以及分配到左侧供 RTL 文档使用。

###### `loop`

`true` 或 `false`，默认值为 `true`。设为 true 时，轮播界面将允许用户从第一个条目移回最后一个条目，或者从最后一个条目移回第一个条目。幻灯片张数必须至少达到三张时才能发生循环。

###### `outset-arrows`

`true` 或 `false`，默认值为 `false`。设置为 true 时，轮播界面将在幻灯片的任一侧外部显示箭头。请注意，在外部显示箭头时，幻灯片容器的有效长度将比为给定容器分配的空间短 100px，因为每一侧的箭头各占用 50px 的长度。设置为 false 时，轮播界面将在幻灯片内部显示箭头，并叠加在幻灯片左右边缘的上面。

###### `peek`

数值，默认值为 `0`。用于确定将另一张幻灯片额外显示多大面积（在当前幻灯片的一侧或两侧），才能让用户明白该轮播界面可以滑动。

##### 图库幻灯片可见性

###### `min-visible-count`

数值，默认值为 `1`。用于确定在某一时刻至少应显示的幻灯片张数。可以使用分数值，使额外 n 张幻灯片部分可见。

###### `max-visible-count`

数值，默认值为 [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE)。用于确定在某一时刻最多应显示的幻灯片张数。可以使用分数值，使额外 n 张幻灯片部分可见。

###### `min-item-width`

数值，默认值为 `1`。确定每个条目的最小宽度，用于解析在整个图库宽度范围内一次可以显示多少个完整条目。

###### `max-item-width`

数值，默认值为 <code>Number.MAX_VALUE</code>。确定每个条目的最大宽度，用于解析在整个图库宽度范围内一次可以显示多少个完整条目。

##### 幻灯片辅助线

###### `slide-align`

`start` 或 `center`。开头对齐时，幻灯片的开头（例如，水平对齐时为左边缘）与轮播组件的开头对齐。居中对齐时，幻灯片的中心与轮播组件的中心对齐。

###### `snap`

`true` 或 `false`，默认值为 `true`。确定轮播界面在滚动时是否应贴靠在幻灯片上。

#### 样式设置

您可以使用 `bento-stream-gallery` 元素选择器来自由设置 streamGallery 组件的样式。

### Preact/React 组件

下面的示例演示了如何将 `<BentoStreamGallery>` 用作可与 Preact 或 React 库配合使用的功能组件。

#### 示例：通过 npm 导入

[example preview="top-frame" playground="false"]

通过 npm 安装：

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

#### 互动和 API 用法

Bento 组件可通过其 API 实现频繁互动。可以通过传递 `ref` 来访问 `BentoStreamGallery` 组件 API：

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

##### 操作

`BentoStreamGallery` API 使您可以执行以下操作：

**next()**

将轮播界面向前移动 `advanceCount` 张幻灯片。

```javascript
ref.current.next();
```

**prev()**

将轮播界面向后移动 `advanceCount` 张幻灯片。

```javascript
ref.current.prev();
```

**goToSlide(index: number)**

将轮播界面移至 `index` 参数所指定的幻灯片。注：`index` 将被归一化为大于或等于 `0` 且小于给定幻灯片张数的数字。

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

##### 事件

**onSlideChange**

当轮播界面显示的索引发生变化时会触发此事件。

```jsx
<BentoStreamGallery onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoStreamGallery>
```

#### 布局和样式

**容器类型**

`BentoStreamGallery` 组件具有定义的布局大小类型。为确保正确呈现组件，请务必通过所需的 CSS 布局（例如使用 `width` 定义的布局）为组件及其直接子级应用大小。可以内嵌应用：

```jsx
<BentoStreamGallery style={{width: '300px'}}>
  ...
</BentoStreamGallery>
```

或通过 `className` 应用：

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

#### 属性

##### 通用属性

此组件支持 React 和 Preact 组件的[通用属性](../../../docs/spec/bento-common-props.md)。

##### 行为

###### `controls`

`"always"`、`"auto"` 或 `"never"`，默认值为 `"auto"`。用于确定是否以及何时显示前后导航箭头。注：当 `outset-arrows` 为 `true` 时，将始终 (`"always"`) 显示箭头。

-   `always`：始终显示箭头。
-   `auto`：在轮播界面最近接收到鼠标互动时显示箭头，而在轮播界面最近接收到触控互动时则不显示箭头。在针对触控设备第一次加载时，箭头会一直显示，直到发生首次互动为止。
-   `never`：始终不显示箭头。

###### `extraSpace`

`"around"` 或未定义。用于确定在轮播界面中显示计算出的可见幻灯片张数后额外分配多少空间。如果设置为 `"around"`，则按照 `justify-content: center` 在轮播界面中平均分配空白空间；否则，将空间分配到轮播界面右侧供 LTR 文档使用，以及分配到左侧供 RTL 文档使用。

###### `loop`

`true` 或 `false`，默认值为 `true`。设为 true 时，轮播界面将允许用户从第一个条目移回最后一个条目，或者从最后一个条目移回第一个条目。幻灯片张数必须至少达到三张时才能发生循环。

###### `outsetArrows`

`true` 或 `false`，默认值为 `false`。设置为 true 时，轮播界面将在幻灯片的任一侧外部显示箭头。请注意，在外部显示箭头时，幻灯片容器的有效长度将比为给定容器分配的空间短 100px，因为每一侧的箭头各占用 50px 的长度。设置为 false 时，轮播界面将在幻灯片内部显示箭头，并叠加在幻灯片左右边缘的上面。

###### `peek`

数值，默认值为 `0`。用于确定将另一张幻灯片额外显示多大面积（在当前幻灯片的一侧或两侧），才能让用户明白该轮播界面可以滑动。

##### 图库幻灯片可见性

###### `minVisibleCount`

数值，默认值为 `1`。用于确定在某一时刻至少应显示的幻灯片张数。可以使用分数值，使额外 n 张幻灯片部分可见。

###### `maxVisibleCount`

数值，默认值为 [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE)。用于确定在某一时刻最多应显示的幻灯片张数。可以使用分数值，使额外 n 张幻灯片部分可见。

###### `minItemWidth`

数值，默认值为 `1`。确定每个条目的最小宽度，用于解析在整个图库宽度范围内一次可以显示多少个完整条目。

###### `maxItemWidth`

数值，默认值为 <code>Number.MAX_VALUE</code>。确定每个条目的最大宽度，用于解析在整个图库宽度范围内一次可以显示多少个完整条目。

##### 幻灯片辅助线

###### `slideAlign`

`start` 或 `center`。开头对齐时，幻灯片的开头（例如，水平对齐时为左边缘）与轮播组件的开头对齐。居中对齐时，幻灯片的中心与轮播组件的中心对齐。

###### `snap`

`true` 或 `false`，默认值为 `true`。确定轮播界面在滚动时是否应贴靠在幻灯片上。
