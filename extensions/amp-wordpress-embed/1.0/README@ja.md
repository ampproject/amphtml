# Bento WordPress Embed

## 使用方法

WordPress 記事またはページの[抜粋](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/)を表示する iframe です。Bento WordPress Embed をウェブコンポーネント [`<bento-wordpress-embed>`](#web-component)、または Preact/React 関数コンポーネント [`<BentoWordPressEmbed>`](#preactreact-component) として使用します。

### ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下の例は、`<bento-wordpress-embed>` ウェブコンポーネントの使用を示しています。

#### 例: npm によるインポート

[example preview="top-frame" playground="false"]

npm でインストールします。

```sh
npm install @ampproject/bento-wordpress-embed
```

```javascript
import '@ampproject/bento-wordpress-embed';
```

[/example]

#### 例: `<script>` によるインクルード

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-wordpress-embed {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script async src="https://cdn.ampproject.org/v0/bento-wordpress-embed-1.0.js"></script>
</head>
<bento-wordpress-embed id="my-embed"
  data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></bento-wordpress-embed>
<div class="buttons" style="margin-top: 8px;">
  <button id="switch-button">Switch embed</button>
</div>

<script>
  (async () => {
    const embed = document.querySelector('#my-embed');
    await customElements.whenDefined('bento-wordpress-embed');

    // set up button actions
    document.querySelector('#switch-button').onclick = () => embed.setAttribute('data-url', 'https://make.wordpress.org/core/2021/09/09/core-editor-improvement-cascading-impact-of-improvements-to-featured-images/');
  })();
</script>
```

[/example]

#### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-wordpress-embed-1.0.css">
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

```html
<style data-bento-boilerplate>
  bento-wordpress-embed {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**コンテナタイプ**

`bento-wordpress-embed` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネントにサイズを必ず適用してください。

```css
bento-wordpress-embed {
  height: 100px;
  width: 100%;
}
```

#### 属性

##### data-url（必須）

埋め込む記事の URL です。

### Preact/React コンポーネント

以下の例は、Preact または React ライブラリと使用可能な関数コンポーネントとして `<BentoWordPressEmbed>` を使用する方法を示しています。

#### 例: npm によるインポート

[example preview="top-frame" playground="false"]

npm でインストールします。

```sh
npm install @ampproject/bento-wordpress-embed
```

```jsx
import React from 'react';
import {BentoWordPressEmbed} from '@ampproject/bento-wordpress-embed/react';

function App() {
  return (
    <BentoWordPressEmbed
      url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
    ></BentoWordPressEmbed>
  );
}
```

[/example]

#### レイアウトとスタイル

**コンテナタイプ**

`BentoWordPressEmbed` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネントにサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoWordPressEmbed style={{width: '100%', height: '100px'}}
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

または `className` を使用します。

```jsx
<BentoWordPressEmbed className="custom-styles"
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

#### プロップ

##### url（必須）

埋め込む記事の URL です。
