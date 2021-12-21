# Bento Twitter

## 行为

Bento Twitter 组件可用于嵌入推文或时刻。可以将它用作网页组件 [`<bento-twitter>`](#web-component)，或 Preact/React 功能组件 [`<BentoTwitter>`](#preactreact-component)。

### 网页组件

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

下面的示例演示了 `<bento-twitter>` 网页组件的用法。

#### 示例：通过 npm 导入

[example preview="top-frame" playground="false"]

通过 npm 安装：

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### 示例：通过 `<script>` 包含

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-twitter {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <!-- TODO(wg-bento): Once available, change src to bento-twitter.js -->
  <script async src="https://cdn.ampproject.org/v0/amp-twitter-1.0.js"></script>
  <style>
    bento-twitter {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<bento-twitter id="my-tweet" data-tweetid="885634330868850689">
</bento-twitter>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-tweet">
    Change tweet
  </button>
</div>

<script>
  (async () => {
    const twitter = document.querySelector('#my-tweet');
    await customElements.whenDefined('bento-twitter');

    // set up button actions
    document.querySelector('#change-tweet').onclick = () => {
      twitter.setAttribute('data-tweetid', '495719809695621121')
    }
  })();
</script>
```

[/example]

#### 布局和样式

每个 Bento 组件都有一个小型 CSS 库，必须包含该库以确保正确加载而不会发生[内容偏移](https://web.dev/cls/)。由于基于顺序的特性，在使用任何自定义样式之前，您必须手动确保包含样式表。

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

或者，您也可以选择以内嵌方式使用轻量级升级前样式：

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**容器类型**

`bento-twitter` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小：

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### 特性

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type（必选）</strong></td>
    <td>推文或时刻的 ID，如果应显示时间线，则为源类型。在诸如 https://twitter.com/joemccann/status/640300967154597888 的网址中，640300967154597888 为推文 ID。在诸如 https://twitter.com/i/moments/1009149991452135424 的网址中，1009149991452135424 为时刻 ID。有效的时间线源类型包括 <code>profile</code>、<code>likes</code>、<code>list</code>、<code>collection</code>、<code>url</code> 和 <code>widget</code>。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-*（可选）</strong></td>
    <td>显示时间线时，除了 timeline-source-type 之外，还需要提供更多参数。例如，将 <code>data-timeline-screen-name="amphtml"</code> 与 <code>data-timeline-source-type="profile"</code> 结合使用将显示 AMP Twitter 账号的时间线。有关可用参数的详细信息，请参阅 <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">Twitter 的 JavaScript 工厂函数指南</a>中的“时间线”部分。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-*（可选）</strong></td>
    <td>您可以通过设置 <code>data-</code> 特性来指定推文、时刻或时间线的外观选项。例如，<code>data-cards="hidden"</code> 可停用 Twitter 卡片。有关可用选项的详细信息，请参阅 Twitter 的<a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">推文</a>、<a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">时刻</a>和<a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">时间线</a>文档。</td>
  </tr>
   <tr>
    <td width="40%"><strong>title（可选）</strong></td>
    <td>为组件定义 <code>title</code> 特性。 默认值为 <code>Twitter</code>。</td>
  </tr>
</table>

### Preact/React 组件

下面的示例演示了如何将 `<BentoTwitter>` 用作可与 Preact 或 React 库配合使用的功能组件。

#### 示例：通过 npm 导入

[example preview="top-frame" playground="false"]

通过 npm 安装：

```sh
npm install @ampproject/bento-twitter
```

```javascript
import React from 'react';
import { BentoTwitter } from '@ampproject/bento-twitter/react';
import '@ampproject/bento-twitter/styles.css';

function App() {
  return (
    <BentoTwitter tweetid="1356304203044499462">
    </BentoTwitter>
  );
}
```

[/example]

#### 布局和样式

**容器类型**

`BentoTwitter` 组件具有定义的布局大小类型。为确保组件正确呈现，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级（幻灯片）应用大小。可以内嵌应用：

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

或通过 `className` 应用：

```jsx
<BentoTwitter className='custom-styles'  tweetid="1356304203044499462">
</BentoTwitter>
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
    <td width="40%"><strong>tweetid / momentid / timelineSourceType（必选）</strong></td>
    <td>推文或时刻的 ID，如果应显示时间线，则为源类型。在诸如 https://twitter.com/joemccann/status/640300967154597888 的网址中，640300967154597888 为推文 ID。在诸如 https://twitter.com/i/moments/1009149991452135424 的网址中，1009149991452135424 为时刻 ID。有效的时间线源类型包括 <code>profile</code>、<code>likes</code>、<code>list</code>、<code>collection</code>、<code>url</code> 和 <code>widget</code>。</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations（可选）</strong></td>
    <td>显示推文时，除了 <code>tweetid</code> 之外，还可以提供更多参数。例如，<code>cards="hidden"</code> 与 <code>conversation="none"</code> 结合使用将显示一条推文，而没有额外的缩略图或评论。</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit（可选）</strong></td>
    <td>显示时刻时，除了 <code>moment</code> 之外，还可以提供更多参数。例如，<code>limit="5"</code> 将显示最多包含五张卡片的嵌入时刻。</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId（可选）</strong></td>
    <td>显示时间线时，除了 <code>timelineSourceType</code> 之外，还可以提供更多参数。例如，将  <code>timelineScreenName="amphtml"</code> 与 <code>timelineSourceType="profile"</code> 结合使用将显示 AMP Twitter 账号的时间线。</td>
  </tr>
  <tr>
    <td width="40%"><strong>options（可选）</strong></td>
    <td>您可以在对象中将推文、时刻或时间线的外观选项传递给 <code>options</code> 属性来指定相应外观。有关可用选项的详细信息，请参阅 Twitter 的<a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">推文</a>、<a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">时刻</a>和<a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">时间线</a>文档。注：在传入 `options` 属性时，请确保优化或缓存对象：<code> const TWITTER_OPTIONS = { // make sure to define these once globally! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title（可选）</strong></td>
    <td>为 iframe 组件定义 <code>title</code>。默认值为 <code>Twitter</code>。</td>
  </tr>
</table>
