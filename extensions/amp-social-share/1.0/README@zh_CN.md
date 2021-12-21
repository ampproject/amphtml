# 用法

显示社交平台或系统分享的分享按钮。

目前，Bento Social Share 生成的任何按钮（包括面向预配置提供商的按钮）都没有可向使用辅助技术（例如屏幕阅读区）的用户显示的标签或无障碍名称。请确保包含 `aria-label` 和说明性标签，否则这些控件将仅作为无标签“按钮”元素发布。

## 网页组件

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

下面的示例演示了 `<bento-social-share>` 网页组件的用法。

### 示例：通过 npm 导入

```sh
[example preview="top-frame" playground="false"]
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### 示例：通过 `<script>` 包含

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-social-share {
      display: inline-block;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
      width: 60px;
      height: 44px;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js"
  ></script>
  <style>
    bento-social-share {
      width: 375px;
      height: 472px;
    }
  </style>
</head>

<bento-social-share
  id="my-share"
  type="twitter"
  aria-label="Share on Twitter"
></bento-social-share>

<div class="buttons" style="margin-top: 8px">
  <button id="change-share">Change share button</button>
</div>

<script>
  (async () => {
    const button = document.querySelector('#my-share');
    await customElements.whenDefined('bento-social-share');

    // set up button actions
    document.querySelector('#change-share').onclick = () => {
      twitter.setAttribute('type', 'linkedin');
      twitter.setAttribute('aria-label', 'Share on LinkedIn');
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
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

或者，您也可以选择以内嵌方式使用轻量级升级前样式：

```html
<style>
  bento-social-share {
    display: inline-block;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    width: 60px;
    height: 44px;
  }
</style>
```

#### 容器类型

`bento-social-share` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小：

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### 默认样式

默认情况下，`bento-social-share` 包含一些广受欢迎的预配置提供商。这些提供商的按钮的样式使用其官方颜色和徽标进行设置。默认宽度为 60px，默认高度为 44px。

#### 自定义样式

有时，您希望提供自己的样式。您可以仅替换提供的样式，如下所示：

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

自定义 `bento-social-share` 图标的样式时，请确保自定义图标满足提供商（例如 Twitter、Facebook 等）给出的品牌准则。

### 无障碍功能

#### 指示焦点

`bento-social-share` 元素默认显示蓝色轮廓，作为可见的焦点指示器。此外，该元素还默认设置 `tabindex=0`，让用户在使用 tab 键浏览网页上同时使用的多个 `bento-social-share` 元素时可以轻松切换。

默认焦点指示器使用以下 CSS 规则集来实现。

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

通过为焦点定义 CSS 样式并将其包含在 `style` 标记中，可以覆盖默认焦点指示器。在下面的示例中，第一个 CSS 规则集将 `outline` 属性设置为 `none`，从而移除所有 `bento-social-share` 元素上的焦点指示器。第二个规则集指定红色轮廓（代替默认的蓝色轮廓），同时还为包含 `custom-focus` 类的所有 `bento-social-share` 元素将 `outline-offset` 设置为 `3px`。

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

借助这些 CSS 规则，`bento-social-share` 元素将不显示可见的焦点指示器，除非它们包含 `custom-focus` 类，此时，它们的指示器为红色轮廓。

#### 色彩对比度

请注意，`type` 的值为 `twitter`、`whatsapp` 或 `line` 时，`bento-social-share` 显示的按钮的前景/背景色的比值落在 3:1 的阈值范围内，而该阈值被建议用于 [WCAG 2.1 SC 1.4.11 非文字对比度](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)中定义的非文字内容。

如果对比度不足，内容便难以引人注意，因而也难以辨认。在极端情况下，有色彩感知障碍的人可能根本看不清对比度很低的内容。如果有上述分享按钮，用户可能无法恰当地感知/理解分享控件的内容，也就是与他们相关的服务。

### 预配置提供商

`bento-social-share` 组件提供了一些了解自己的分享端点的[预配置提供商](./social-share-config.js)以及一些默认参数。

<table>
  <tr>
    <th class="col-twenty">提供商</th>
    <th class="col-twenty">类型</th>
    <th>参数</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a>（触发操作系统分享对话框）</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>电子邮件</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>：可选</li>
        <li>
<code>data-param-body</code>：可选</li>
        <li>
<code>data-param-recipient</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>：<strong>必选</strong>，默认值为 none。此参数为 Facebook <code>app_id</code>，是 <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook 分享对话框</a>的必选参数。</li>
        <li>
<code>data-param-href</code>：可选</li>
        <li>
<code>data-param-quote</code>：可选，可用于分享报价或文字。</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>：可选</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>：可选（但强烈建议设置）。要在 Pinterest 上分享的媒体的网址。如果不设置，最终用户将需要通过 Pinterest 上传媒体。</li>
        <li>
<code>data-param-url</code>：可选</li>
        <li>
<code>data-param-description</code>：可选</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>：可选</li>
        <li>
<code>data-param-text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>：可选</li>
        <li>
<code>data-param-text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>：可选</li>
        <li>
<code>data-param-text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>短信</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>：可选</li>
</ul>
    </td>
  </tr>
</table>

### 非配置提供商

除了预配置提供商，您还可以使用非配置提供商，方法是在 `bento-social-share` 组件中指定其他特性。

#### 示例：针对非配置提供商创建分享按钮

下面的示例将 `data-share-endpoint` 特性设置为 Facebook Messenger 自定义协议的相应端点，通过 Facebook Messenger 创建分享按钮。

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

由于这些提供商不是预配置提供商，您需要为提供商创建相应的按钮图片和样式。

### 特性

#### type（必选）

选择提供商类型。预配置提供商和非配置提供商均需要此特性。

#### data-target

指定用于打开目标的目标。对于 iOS 上的电子邮件/短信，此特性设置为 `_top`；在其他所有情况下，此特性的默认值均为 `_blank`。

#### data-share-endpoint

非配置提供商需要此特性。

某些广受欢迎的提供商具有预配置的分享端点。有关详情，请参阅“预配置提供商”部分。对于非配置提供商，您需要指定分享端点。

#### data-param-\*

前缀为 `data-param-*` 的所有特性均会转换为网址参数并传递给分享端点。

#### aria-label

描述按钮无障碍功能。建议采用的标签为“在 &lt;type&gt; 上分享”。

---

## Preact/React 组件

下面的示例演示了如何将 `<BentoSocialShare>` 用作可与 Preact 或 React 库配合使用的功能组件。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/social-share
```

```javascript
import React from 'react';
import {BentoSocialShare} from '@bentoproject/social-share/react';
import '@bentoproject/social-share/styles.css';

function App() {
  return (
    <BentoSocialShare
      type="twitter"
      aria-label="Share on Twitter"
    ></BentoSocialShare>
  );
}
```

### 布局和样式

#### 容器类型

`BentoSocialShare` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小。可以内嵌应用：

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

或通过 `className` 应用：

```jsx
<BentoSocialShare
  className="custom-styles"
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

```css
.custom-styles {
  height: 50px;
  width: 50px;
}
```

### 无障碍功能

#### 指示焦点

`BentoSocialShare` 元素默认显示蓝色轮廓，作为可见的焦点指示器。此外，该元素还默认设置 `tabindex=0`，让用户在使用 tab 键浏览网页上同时使用的多个 `BentoSocialShare` 元素时可以轻松切换。

默认焦点指示器使用以下 CSS 规则集来实现。

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

通过为焦点定义 CSS 样式并将其包含在 `style` 标记中，可以覆盖默认焦点指示器。在下面的示例中，第一个 CSS 规则集将 `outline` 属性设置为 `none`，从而移除所有 `BentoSocialShare` 元素上的焦点指示器。第二个规则集指定红色轮廓（代替默认的蓝色轮廓），同时还为包含 `custom-focus` 类的所有 `BentoSocialShare` 元素将 `outline-offset` 设置为 `3px`。

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

借助这些 CSS 规则，`BentoSocialShare` 元素将不显示可见的焦点指示器，除非它们包含 `custom-focus` 类，此时，它们的指示器为红色轮廓。

#### 色彩对比度

请注意，`type` 的值为 `twitter`、`whatsapp` 或 `line` 时，`BentoSocialShare` 显示的按钮的前景/背景色的比值落在 3:1 的阈值范围内，而该阈值被建议用于 [WCAG 2.1 SC 1.4.11 非文字对比度](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)中定义的非文字内容。

如果对比度不足，内容便难以引人注意，因而也难以辨认。在极端情况下，有色彩感知障碍的人可能根本看不清对比度很低的内容。如果有上述分享按钮，用户可能无法恰当地感知/理解分享控件的内容，也就是与他们相关的服务。

### 预配置提供商

`BentoSocialShare` 组件提供了一些了解自己的分享端点的[预配置提供商](./social-share-config.js)以及一些默认参数。

<table>
  <tr>
    <th class="col-twenty">提供商</th>
    <th class="col-twenty">类型</th>
    <th>通过 <code>param</code> 属性应用的参数</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a>（触发操作系统分享对话框）</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>电子邮件</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>：可选</li>
        <li>
<code>body</code>：可选</li>
        <li>
<code>recipient</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>：<strong>必选</strong>，默认值为 none。此参数为 Facebook <code>app_id</code>，是 <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook 分享对话框</a>的必选参数。</li>
        <li>
<code>href</code>：可选</li>
        <li>
<code>data-param-quote</code>：可选，可用于分享报价或文字。</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>：可选</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>：可选（但强烈建议设置）。要在 Pinterest 上分享的媒体的网址。如果不设置，最终用户将需要通过 Pinterest 上传媒体。</li>
        <li>
<code>url</code>：可选</li>
        <li>
<code>description</code>：可选</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>：可选</li>
        <li>
<code>text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>：可选</li>
        <li>
<code>text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>：可选</li>
        <li>
<code>text</code>：可选</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>短信</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>：可选</li>
</ul>
    </td>
  </tr>
</table>

### 非配置提供商

除了预配置提供商，您还可以使用非配置提供商，方法是在 `BentoSocialShare` 组件中指定其他特性。

#### 示例：针对非配置提供商创建分享按钮

下面的示例将 `data-share-endpoint` 特性设置为 Facebook Messenger 自定义协议的相应端点，通过 Facebook Messenger 创建分享按钮。

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

由于这些提供商不是预配置提供商，您需要为提供商创建相应的按钮图片和样式。

### 属性

#### type（必选）

选择提供商类型。预配置提供商和非配置提供商均需要此特性。

#### background

有时，您希望提供自己的样式。您可以通过指定背景颜色替换提供的样式。

自定义 `BentoSocialShare` 图标的样式时，请确保自定义图标满足提供商（例如 Twitter、Facebook 等）给出的品牌准则。

#### color

有时，您希望提供自己的样式。您可以通过指定填充颜色替换提供的样式。

自定义 `BentoSocialShare` 图标的样式时，请确保自定义图标满足提供商（例如 Twitter、Facebook 等）给出的品牌准则。

#### target

指定用于打开目标的目标。对于 iOS 上的电子邮件/短信，此特性设置为 `_top`；在其他所有情况下，此特性的默认值均为 `_blank`。

#### endpoint

非配置提供商需要此属性。

某些广受欢迎的提供商具有预配置的分享端点。有关详情，请参阅“预配置提供商”部分。对于非配置提供商，您需要指定分享端点。

#### param

所有 `param` 属性均作为网址参数传递给分享端点。

#### aria-label

描述按钮无障碍功能。建议采用的标签为“在 &lt;type&gt; 上分享”。
