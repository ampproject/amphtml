# Bento Embedly Card

使用 [Embedly 卡片](http://docs.embed.ly/docs/cards)提供自适应和可分享的嵌入内容

要使用 Embedly，最方便的方法是采用卡片。对于任何媒体，卡片都可以为自适应嵌入内容提供内置嵌入内容分析。

如果您用的是付费方案，可以使用 `<bento-embedly-key>` 或 `<BentoEmbedlyContext.Provider>` 组件来设置 API 密钥。每个网页只需要一个 Bento Embedly 密钥即可从卡片中移除 Embedly 的品牌信息。在网页中，可以加入一个或多个 Bento Embedly Card 实例。

## 行为

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

下面的示例演示了 `<bento-embedly-card>` 网页组件的用法。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {defineElement as defineBentoEmbedlyCard} from '@bentoproject/embedly-card';
defineBentoEmbedlyCard();
```

### 示例：通过 `<script>` 包含

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-embedly-card {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.js"
  ></script>
  <style>
    bento-embedly-card {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<body>
  <bento-embedly-key value="12af2e3543ee432ca35ac30a4b4f656a">
  </bento-embedly-key>

  <bento-embedly-card
    data-url="https://twitter.com/AMPhtml/status/986750295077040128"
    data-card-theme="dark"
    data-card-controls="0"
  >
  </bento-embedly-card>

  <bento-embedly-card
    id="my-url"
    data-url="https://www.youtube.com/watch?v=LZcKdHinUhE"
  >
  </bento-embedly-card>

  <div class="buttons" style="margin-top: 8px">
    <button id="change-url">Change embed</button>
  </div>

  <script>
    (async () => {
      const embedlyCard = document.querySelector('#my-url');
      await customElements.whenDefined('bento-embedly-card');

      // set up button actions
      document.querySelector('#change-url').onclick = () => {
        embedlyCard.setAttribute(
          'data-url',
          'https://www.youtube.com/watch?v=wcJSHR0US80'
        );
      };
    })();
  </script>
</body>
```

### 布局和样式

每个 Bento 组件都有一个小型 CSS 库，必须包含该库以确保正确加载而不会发生[内容偏移](https://web.dev/cls/)。由于基于顺序的特性，在使用任何自定义样式之前，您必须手动确保包含样式表。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css"
/>
```

或者，您也可以选择以内嵌方式使用轻量级升级前样式：

```html
<style>
  bento-embedly-card {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 容器类型

`bento-embedly-card` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小：

```css
bento-embedly-card {
  height: 100px;
  width: 100%;
}
```

### 特性

#### `data-url`

用于检索嵌入信息的网址。

#### `data-card-embed`

视频或富媒体的网址。与文章等静态嵌入内容配合使用，卡片将嵌入视频或富媒体，而不是在卡片中使用静态网页内容。

#### `data-card-image`

图片的网址。指定在 `data-url` 指向某个文章时要在文章卡片中使用哪个图片。仅支持部分图片网址，如果图片未加载，请尝试其他图片或网域。

#### `data-card-controls`

启用分享按钮。

- `0`：禁用分享按钮。
- `1`：启用分享按钮。

默认值为 `1`。

#### `data-card-align`

对齐卡片。可以使用的值包括 `left`、`center` 和 `right`。默认值为 `center`。

#### `data-card-recommend`

如果支持建议，该特性会禁用视频和富媒体卡片上的 Embedly 建议。这些建议由 Embedly 创建。

- `0`：禁用 Embedly 建议。
- `1`：启用 Embedly 建议。

默认值为 `1`。

#### `data-card-via`（可选）

指定卡片中的通过内容。通过这种方式可以很好地进行归因。

#### `data-card-theme`（可选）

允许设置 `dark` 主题，此主题会改变主卡容器的背景颜色。使用 `dark` 设置此主题。需要深色背景时，最好指定此特性。默认值为 `light`，此时，主卡容器没有背景颜色。

#### title（可选）

为该组件定义 `title` 特性，以便传播到基本 `<iframe>` 元素。默认值为 `"Embedly card"`。

---

## Preact/React 组件

下面的示例演示了如何将 `<BentoEmbedlyCard>` 用作可与 Preact 或 React 库配合使用的功能组件。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {BentoEmbedlyCard} from '@bentoproject/embedly-card/react';
import '@bentoproject/embedly-card/styles.css';

function App() {
  return (
    <BentoEmbedlyContext.Provider
      value={{apiKey: '12af2e3543ee432ca35ac30a4b4f656a'}}
    >
      <BentoEmbedlyCard url="https://www.youtube.com/watch?v=LZcKdHinUhE"></BentoEmbedlyCard>
    </BentoEmbedlyContext.Provider>
  );
}
```

### 布局和样式

#### 容器类型

`BentoEmbedlyCard` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小。可以内嵌应用：

```jsx
<BentoEmbedlyCard
  style={{width: 300, height: 100}}
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

或通过 `className` 应用：

```jsx
<BentoEmbedlyCard
  className="custom-styles"
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### 属性

#### `url`

用于检索嵌入信息的网址。

#### `cardEmbed`

视频或富媒体的网址。与文章等静态嵌入内容配合使用，卡片将嵌入视频或富媒体，而不是在卡片中使用静态网页内容。

#### `cardImage`

图片的网址。指定在 `data-url` 指向某个文章时要在文章卡片中使用哪个图片。仅支持部分图片网址，如果图片未加载，请尝试其他图片或网域。

#### `cardControls`

启用共享按钮。

- `0`：禁用分享按钮。
- `1`：启用分享按钮。

默认值为 `1`。

#### `cardAlign`

对齐卡片。可以使用的值包括 `left`、`center` 和 `right`。默认值为 `center`。

#### `cardRecommend`

如果支持建议，该特性会禁用视频和富媒体卡片上的 Embedly 建议。这些建议由 Embedly 创建。

- `0`：禁用 Embedly 建议。
- `1`：启用 Embedly 建议。

默认值为 `1`。

#### `cardVia`（可选）

指定卡片中的通过内容。通过这种方式可以很好地进行归因。

#### `cardTheme`（可选）

允许设置 `dark` 主题，此主题会改变主卡容器的背景颜色。使用 `dark` 设置此特性。需要深色背景时，最好指定这个值。默认值为 `light`，此时，主卡容器没有背景颜色。

#### title（可选）

为该组件定义 `title` 特性，以便传播到底层 `<iframe>` 元素。默认值为 `"Embedly card"`。
