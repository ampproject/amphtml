# Bento Inline Gallery

显示幻灯片，其中带有可选的分页点和缩略图。

它的实现使用 [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel)。必须为环境正确安装这两个组件（网页组件与 Preact）。

## 网页组件

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

下面的示例演示了 `<bento-inline-gallery>` 网页组件的用法。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### 示例：通过 `<script>` 包含

下面的示例包含一个 `bento-inline-gallery`，它由三张包含缩略图和分页指示器的幻灯片组成。

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>

  <script async src="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.js"></script>
  <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css">

  <script async src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"></script>
  <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css">
<body>
  <bento-inline-gallery id="inline-gallery">
    <bento-inline-gallery-thumbnails style="height: 100px;" loop></bento-inline-gallery-thumbnails>

    <bento-base-carousel style="height: 200px;" snap-align="center" visible-count="3" loop>
      <img src="img1.jpeg" data-thumbnail-src="img1-thumbnail.jpeg" />
      <img src="img2.jpeg" data-thumbnail-src="img2-thumbnail.jpeg" />
      <img src="img3.jpeg" data-thumbnail-src="img3-thumbnail.jpeg" />
      <img src="img4.jpeg" data-thumbnail-src="img4-thumbnail.jpeg" />
      <img src="img5.jpeg" data-thumbnail-src="img5-thumbnail.jpeg" />
      <img src="img6.jpeg" data-thumbnail-src="img6-thumbnail.jpeg" />
    </bento-base-carousel>

    <bento-inline-gallery-pagination style="height: 20px;"></bento-inline-gallery-pagination>
  </bento-inline-gallery>
</body>
```

### 布局和样式

每个 Bento 组件都有一个小型 CSS 库，必须包含该库以确保正确加载而不会发生[内容偏移](https://web.dev/cls/)。由于基于顺序的特性，在使用任何自定义样式之前，您必须手动确保包含样式表。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

或者，您也可以选择以内嵌方式使用轻量级升级前样式：

```html
<style>
  bento-inline-gallery,
  bento-inline-gallery-pagination,
  bento-inline-gallery-thumbnails {
    display: block;
  }
  bento-inline-gallery {
    contain: layout;
  }
  bento-inline-gallery-pagination,
  bento-inline-gallery-thumbnails {
    overflow: hidden;
    position: relative;
  }
</style>
```

### `<bento-inline-gallery-pagination>` 的特性

#### `inset`

默认：`false`

布尔特性，指示是否以插图形式显示分页指示器（覆盖轮播界面本身）

### `<bento-inline-gallery-thumbnails>` 的特性

#### `aspect-ratio`

可选

数字：幻灯片应显示的宽高比率。

#### `loop`

Default: `false`

布尔特性，指示缩略图是否应循环。

### 样式设置

您可以使用 `bento-inline-gallery`、`bento-inline-gallery-pagination`、`bento-inline-gallery-thumbnails` 和 `bento-base-carousel` 元素选择器来自由设置分页指示器、缩略图和轮播界面的样式。

---

## Preact/React 组件

下面的示例演示了如何将 `<BentoInlineGallery>` 用作可与 Preact 或 React 库配合使用的功能组件。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import React from 'react';
import {BentoInlineGallery} from '@bentoproject/inline-gallery/react';
import '@bentoproject/inline-gallery/styles.css';

function App() {
  return (
    <BentoInlineGallery id="inline-gallery">
      <BentoInlineGalleryThumbnails aspect-ratio="1.5" loop />
      <BentoBaseCarousel snap-align="center" visible-count="1.2" loop>
        <img src="server.com/static/inline-examples/images/image1.jpg" />
        <img src="server.com/static/inline-examples/images/image2.jpg" />
        <img src="server.com/static/inline-examples/images/image3.jpg" />
      </BentoBaseCarousel>
      <BentoInlineGalleryPagination inset />
    </BentoInlineGallery>
  );
}
```

### 布局和样式

#### 容器类型

`BentoInlineGallery` 组件具有定义的布局大小类型。为确保正确呈现组件，请务必通过所需的 CSS 布局（例如使用 `width` 定义的布局）为组件及其直接子级应用大小。可以内嵌应用：

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

或通过 `className` 应用：

```jsx
<BentoInlineGallery className="custom-styles">...</BentoInlineGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

<!-- TODO(wg-bento): This section was empty, fix it.
### Props for `BentoInlineGallery`
-->

### `BentoInlineGalleryPagination` 的属性

除了[常见属性](../../../docs/spec/bento-common-props.md)，BentoInlineGalleryPagination 还支持以下属性：

#### `inset`

默认：`false`

布尔特性，指示是否以插图形式显示分页指示器（覆盖轮播界面本身）

### `BentoInlineGalleryThumbnails` 的属性

除了[常见属性](../../../docs/spec/bento-common-props.md)，BentoInlineGalleryThumbnails 还支持以下属性：

#### `aspectRatio`

可选

数字：幻灯片应显示的宽高比率。

#### `loop`

默认：`false`

布尔特性，指示缩略图是否应循环。
