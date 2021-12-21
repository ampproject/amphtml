# Bento Soundcloud

嵌入 [Soundcloud](https://soundcloud.com) 剪辑。

## 网页组件

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

下面的示例演示了 `<bento-soundcloud>` 网页组件的用法。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### 示例：通过 `<script>` 包含

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

### 布局和样式

每个 Bento 组件都有一个小型 CSS 库，必须包含该库以确保正确加载而不会发生[内容偏移](https://web.dev/cls/)。由于基于顺序的特性，在使用任何自定义样式之前，您必须手动确保包含样式表。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

或者，您也可以选择以内嵌方式使用轻量级升级前样式：

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 容器类型

`bento-soundcloud` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小：

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### 特性

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>如果未定义 <code>data-playlistid</code>，则此特性为必选特性。<br>此特性的值为曲目的 ID，是一个整数。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>如果未定义 <code>data-trackid</code>，则此特性为必选特性。此特性的值为播放列表的 ID，是一个整数。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token（可选）</strong></td>
    <td>如果曲目为私享曲目，则为曲目的机密令牌。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual（可选）</strong></td>
    <td>如果设置为 <code>true</code>，则显示全宽“可视化”模式；否则，将显示为“经典”模式。默认值为 <code>false</code>。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color（可选）</strong></td>
    <td>此特性为自定义颜色，可用于替换“经典”模式。在“可视化”模式下会忽略该特性。指定一个十六进制颜色值，无需前导 #（例如，<code>data-color="e540ff"</code>）。</td>
  </tr>
</table>

---

## Preact/React 组件

下面的示例演示了如何将 `<BentoSoundcloud>` 用作可与 Preact 或 React 库配合使用的功能组件。

### 示例：通过 npm 导入

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

### 布局和样式

#### 容器类型

`BentoSoundcloud` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小。可以内嵌应用：

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

或通过 `className` 应用：

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

### 属性

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>如果未定义 <code>data-playlistid</code>，则此特性为必选特性。<br>此特性的值为曲目的 ID，是一个整数。</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>如果未定义 <code>data-trackid</code>，则此特性为必选特性。此特性的值为播放列表的 ID，是一个整数。</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken（可选）</strong></td>
    <td>如果曲目为私享曲目，则为曲目的机密令牌。</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual（可选）</strong></td>
    <td>如果设置为 <code>true</code>，则显示全宽“可视化”模式；否则，将显示为“经典”模式。默认值为 <code>false</code>。</td>
  </tr>
  <tr>
    <td width="40%"><strong>color（可选）</strong></td>
    <td>此特性为可替换“经典”模式的自定义颜色。在“可视化”模式下会忽略该特性。指定一个十六进制颜色值，无需前导 #（例如，<code>data-color="e540ff"</code>）。</td>
  </tr>
</table>
