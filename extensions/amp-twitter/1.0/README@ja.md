# Bento Twitter

## 動作

Bento Twitter コンポーネントを使用して、ツイートまたはモーメントを埋め込むことができます。このコンポーネントは、ウェブコンポーネント [`<bento-twitter>`](#web-component) として、または Preact/React 関数コンポーネント [`<BentoTwitter>`](#preactreact-component) として使用します。

### ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下は、`<bento-twitter>` ウェブコンポーネントの使用例を示しています。

#### 例: npm によるインポート

[example preview="top-frame" playground="false"]

npm でインストールします。

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### 例: `<script>` によるインクルード

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

#### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**コンテナタイプ**

`bento-twitter` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### 属性

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type（必須）</strong></td>
    <td>ツイートまたはモーメントの ID、またはタイムラインを表示する場合はソースタイプ。https://twitter.com/joemccann/status/640300967154597888 のような URL がある場合、<code>640300967154597888</code> がツイート ID です。https://twitter.com/i/moments/1009149991452135424 のような URL の場合は、<code>1009149991452135424</code> がモーメント ID となります。有効なタイムラインのソースタイプには、<code>profile</code>、<code>likes</code>、<code>list</code>、<code>collection</code>、<code>url</code>、<code>widget</code> が含まれます。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-*（オプション）</strong></td>
    <td>タイムラインを表示する場合、<code>timeline-source-type</code> の他にも引数を指定する必要があります。たとえば、<code>data-timeline-screen-name="amphtml"</code> は、<code>data-timeline-source-type="profile"</code> と合わせると、AMP Twitter アカウントのタイムラインを表示します。使用可能な引数の詳細については、<a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">Twitter's JavaScript Factory Functions Guide</a> の「Timelines」セクションをご覧ください。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-*（オプション）</strong></td>
    <td>
<code>data-</code> 属性を設定して、ツイート、モーメント、またはタイムラインの外観に関するオプションを指定できます。たとえば、<code>data-cards="hidden"</code> はツイッターカードを無効にします。使用可能なオプションの詳細については、Twitter ドキュメントの「<a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">for tweets</a>」、「<a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">for moments</a>」、および「<a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">for timelines</a>」をご覧ください。</td>
  </tr>
   <tr>
    <td width="40%"><strong>title（オプション）</strong></td>
    <td>コンポーネントの <code>title</code> 属性を定義します。デフォルトは <code>Twitter</code> です。</td>
  </tr>
</table>

### Preact/React コンポーネント

以下は、Preact または React ライブラリと使用可能な関数コンポーネントとして、`<BentoTwitter>` の使用例を示しています。

#### 例: npm によるインポート

[example preview="top-frame" playground="false"]

npm でインストールします。

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

#### レイアウトとスタイル

**コンテナタイプ**

`BentoTwitter` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

または `className` を使用します。

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

### プロップ

<table>
  <tr>
    <td width="40%"><strong>tweetid / momentid / timelineSourceType（必須）</strong></td>
    <td>ツイートまたはモーメントの ID、またはタイムラインを表示する場合はソースタイプ。https://twitter.com/joemccann/status/640300967154597888 のような URL がある場合、<code>640300967154597888</code> がツイート ID です。https://twitter.com/i/moments/1009149991452135424 のような URL の場合は、<code>1009149991452135424</code> がモーメント ID となります。有効なタイムラインのソースタイプには、<code>profile</code>、<code>likes</code>、<code>list</code>、<code>collection</code>、<code>url</code>、<code>widget</code> が含まれます。</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations（オプション）</strong></td>
    <td>ツイートを表示する場合、<code>tweetid</code> の他にも引数を指定する必要があります。たとえば、<code>cards="hidden"</code> は、<code>conversation="none"</code> と合わせると、追加のサムネイルやコメントを含めずにツイートを表示します。</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit（オプション）</strong></td>
    <td>モーメントを表示する場合、<code>moment</code> の他にも引数を指定する必要があります。たとえば、<code>limit="5"</code> は埋め込みモーメントに最大 5 つのカードを表示します。</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId（オプション）</strong></td>
    <td>タイムラインを表示する場合、<code>timelineSourceType</code> の他にも引数を指定する必要があります。たとえば、<code>timelineScreenName="amphtml"</code> は、<code>timelineSourceType="profile"</code> と合わせると、AMP Twitter アカウントのタイムラインを表示します。</td>
  </tr>
  <tr>
    <td width="40%"><strong>options（オプション）</strong></td>
    <td>
<code>options</code> プロップにオブジェクトを渡して、ツイート、モーメント、またはタイムラインの外観のオプションを指定できます。使用可能なオプションの詳細については、Twitter のドキュメントの「<a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">for tweets</a>」、「<a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">for moments</a>’、および「<a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">for timelines</a>」をご覧ください。注意: `options` プロップに渡す際は、オブジェクトを最適化するか記憶するようにしてください。<code> const TWITTER_OPTIONS = {   // make sure to define these once globally! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title（オプション）</strong></td>
    <td>コンポーネント iframe の <code>title</code> 属性を定義します。デフォルトは <code>Twitter</code> です。</td>
  </tr>
</table>
