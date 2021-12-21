# Bento Sidebar

提供了一种显示诸如导航、链接、按钮、菜单等用于临时访问的元内容的方法。点按按钮可以显示边栏，同时用户仍能看到下层显示的主要内容。

## 网页组件

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

下面的示例演示了 `<bento-sidebar>` 网页组件的用法。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### 示例：通过 `<script>` 包含

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

### Bento Toolbar

您可以创建在 `<body>` 中显示的 Bento Toolbar 元素，方法是在 `<nav>` 元素（`<bento-sidebar>` 的子元素）上指定包含媒体查询的 `toolbar` 特性和包含元素 ID 的 `toolbar-target` 特性。`toolbar` 会复制 `<nav>` 元素及其子元素，并将该元素附加到 `toolbar-target` 元素。

#### 行为

-   边栏可以通过添加包含 `toolbar` 特性和 `toolbar-target` 特性的导航元素来实现工具栏。
-   导航元素必须是 `<bento-sidebar>` 的子元素并遵循以下格式：`<nav toolbar="(media-query)" toolbar-target="elementID">`。
    -   例如，工具栏的有效用法如下：`<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`。
-   只有在 `toolbar` 特性媒体查询有效时才可应用工具栏行为。此外，网页上必须存在具有 `toolbar-target` 特性 ID 的元素才能应用工具栏。

##### 示例：基本工具栏

在下面的示例中，将在窗口宽度小于或等于 767px 时显示 `toolbar`。`toolbar` 中包含一个搜索输入元素。`toolbar` 元素将被附加到 `<div id="target-element">` 元素。

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

### 互动和 API 用法

启用 Bento 的组件在用作独立网页组件时可通过其 API 实现频繁互动。可以通过在文档中包含以下脚本代码来访问 `bento-sidebar` 组件 API：

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### 操作

`bento-sidebar` API 使您可以执行以下操作：

##### open()

打开边栏。

```javascript
api.open();
```

##### close()

关闭边栏。

```javascript
api.close();
```

##### toggle()

切换边栏的打开状态。

```javascript
api.toggle(0);
```

### 布局和样式

每个 Bento 组件都有一个小型 CSS 库，必须包含该库以确保正确加载而不会发生[内容偏移](https://web.dev/cls/)。由于基于顺序的特性，在使用任何自定义样式之前，您必须手动确保包含样式表。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

或者，您也可以选择以内嵌方式使用轻量级升级前样式：

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### 自定义样式

`bento-sidebar` 组件可以使用标准 CSS 设置样式。

-   可以设置 `bento-sidebar` 的 `width` 来调整宽度，预设值为 45px。
-   如果需要，可以设置 `bento-sidebar` 的 height 来调整边栏高度。如果高度超过 100vw，则边栏将包含一个垂直滚动条。边栏的预设高度为 100vw，可以在 CSS 中替换预设值来将其缩短。
-   当边栏在网页上打开时，边栏的当前状态会通过对 `bento-sidebar` 标记设置的 `open` 特性公开。

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### 用户体验注意事项

使用 `<bento-sidebar>` 时，请记住您的用户经常会在移动设备上查看您的网页，此时标题可能会显示在固定位置。此外，浏览器通常会在网页顶部显示自己的固定标题。在屏幕顶部添加其他固定位置元素会占用大量移动屏幕空间，而这部分空间中的内容无法为用户提供新的信息。

因此，我们建议不要将用于打开边栏的可供性置于固定的全宽标题中。

-   边栏只能位于网页的左侧或右侧。
-   边栏的最大高度为 100vh，如果高度超过 100vh，则会出现垂直滚动条。CSS 中设置的默认高度为 100vh，可在 CSS 中替换该值。
-   可以使用 CSS 设置和调整边栏的宽度。
-   *建议*将 `<bento-sidebar>` 作为 `<body>` 的直接子元素，从而保留逻辑 DOM 顺序以确保可访问性，并避免容器元素改变其行为。请注意，对 `bento-sidebar` 的祖先元素设置 `z-index` 可能会导致边栏在其他元素（例如标题）下方显示，从而破坏其功能。

### 特性

#### side

指示边栏应从网页的哪一侧打开，即 `left` 或 `right`。如果未指定 `side`，则 `side` 值将继承自 `body` 标记的 `dir` 特性（`ltr` =&gt; `left`、`rtl` =&gt; `right`）；如果不存在 `dir`，则 `side` 的默认值为 `left`。

#### open

此特性在边栏打开时出现。

#### toolbar

此特性存在于子 `<nav toolbar="(media-query)" toolbar-target="elementID">` 元素上，接受有关何时显示工具栏的媒体查询。有关使用工具栏的更多信息，请参阅[工具栏](#bento-toolbar)部分。

#### toolbar-target

此特性存在于子 `<nav toolbar="(media-query)" toolbar-target="elementID">` 上，并接受网页上元素的 ID。`toolbar-target` 特性会将工具栏放置到网页上元素的指定 ID 中，无默认的工具栏样式。有关使用工具栏的更多信息，请参阅[工具栏](#bento-toolbar)部分。

---

## Preact/React 组件

下面的示例演示了如何将 `<BentoSidebar>` 用作可与 Preact 或 React 库配合使用的功能组件。

### 示例：通过 npm 导入

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

### Bento Toolbar

您可以创建在 `<body>` 中显示的 Bento Toolbar 元素，方法是在 `<BentoSidebarToolbar>` 组件（`<BentoSidebar>` 的子元素）上指定包含媒体查询的 `toolbar` 属性和包含元素 ID 的 `toolbarTarget` 属性。`toolbar` 会复制 `<BentoSidebarToolbar>` 元素及其子元素，并将该元素附加到 `toolbarTarget` 元素。

#### 行为

-   边栏可以通过添加包含 `toolbar` 属性和 `toolbarTarget` 属性的导航元素来实现工具栏。
-   导航元素必须是 `<BentoSidebar>` 的子元素并遵循以下格式：`<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`。
    -   例如，工具栏的有效用法如下：`<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`。
-   只有在 `toolbar` 属性媒体查询有效时才可应用工具栏行为。此外，网页上必须存在具有 `toolbarTarget` 属性 ID 的元素才能应用工具栏。

##### 示例：基本工具栏

在下面的示例中，将在窗口宽度小于或等于 767px 时显示 `toolbar`。`toolbar` 中包含一个搜索输入元素。`toolbar` 元素将被附加到 `<div id="target-element">` 元素。

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

### 互动和 API 用法

Bento 组件可通过其 API 实现频繁互动。可以通过传递 `ref` 来访问 `BentoSidebar` 组件 API：

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

#### 操作

`BentoSidebar` API 使您可以执行以下操作：

##### open()

打开边栏。

```javascript
ref.current.open();
```

##### close()

关闭边栏。

```javascript
ref.current.close();
```

##### toggle()

切换边栏的打开状态。

```javascript
ref.current.toggle(0);
```

### 布局和样式

`BentoSidebar` 组件可以使用标准 CSS 设置样式。

-   可以设置 `bento-sidebar` 的 `width` 以调整宽度，预设值为 45px。
-   如果需要，可以设置 `bento-sidebar` 的 height 来调整边栏高度。如果高度超过 100vw，则边栏将包含一个垂直滚动条。边栏的预设高度为 100vw，可以在 CSS 中替换预设值来将其缩短。

为确保组件按照您所需的方式呈现，请确保对组件应用大小。这些可以通过内嵌方式应用：

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

或通过 `className` 应用：

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

### 用户体验注意事项

使用 `<bento-sidebar>` 时，请记住您的用户经常会在移动设备上查看您的网页，此时标题可能会显示在固定位置。此外，浏览器通常会在网页顶部显示自己的固定标题。在屏幕顶部添加其他固定位置元素会占用大量移动屏幕空间，而这部分空间中的内容无法为用户提供新的信息。

因此，我们建议不要将用于打开边栏的可供性置于固定的全宽标题中。

-   边栏只能位于网页的左侧或右侧。
-   边栏的最大高度为 100vh，如果高度超过 100vh，则会出现垂直滚动条。CSS 中设置的默认高度为 100vh，可在 CSS 中替换该值。
-   可以使用 CSS 设置和调整边栏的宽度。
-   *建议*将 `<BentoSidebar>` 作为 `<body>` 的直接子元素，从而保留逻辑 DOM 顺序以确保可访问性，并避免容器元素改变其行为。请注意，对 `bento-sidebar` 的祖先元素设置 `z-index` 可能会导致边栏在其他元素（例如标题）下方显示，从而破坏其功能。

### 属性

#### side

指示边栏应从网页的哪一侧打开，即 `left` 或 `right`。如果未指定 `side`，则 `side` 值将继承自 `body` 标记的 `dir` 特性（`ltr` =&gt; `left`、`rtl` =&gt; `right`）；如果不存在 `dir`，则 `side` 的默认值为 `left`。

#### toolbar

此属性存在于子 `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` 元素上，接受有关何时显示工具栏的媒体查询。有关使用工具栏的更多信息，请参阅[工具栏](#bento-toolbar)部分。

#### toolbarTarget

此特性存在于子 `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` 上，并接受网页上元素的 ID。`toolbarTarget` 属性会将工具栏放置到网页上元素的指定 ID 中，无默认的工具栏样式。有关使用工具栏的更多信息，请参阅[工具栏](#bento-toolbar)部分。
