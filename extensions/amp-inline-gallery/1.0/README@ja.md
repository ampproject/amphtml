# Bento Inline Gallery

オプションのページネーションドットとサムネイルとともにスライドを表示します。

この実装では [Bento Base Carousel](https://www.npmjs.com/package/@bentoproject/base-carousel) が使用されます。両コンポーネントは環境に適切にインストールされている必要があります（ウェブコンポーネントと Preact）。

## ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下は、`<bento-inline-gallery>` ウェブコンポーネントの使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### 例: `<script>` によるインクルード

以下の例には、サムネイルとページネーションのインジケーターが付いた 3 つのスライドで構成される `bento-inline-gallery` が含まれています。

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

### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

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

### `<bento-inline-gallery-pagination>` の属性

#### `inset`

デフォルト: `false`

ページネーションインジケーターを内側に表示するかどうか（カルーセルに重ねて表示するかどうか）を指定するブール型の属性です。

### `<bento-inline-gallery-thumbnails>` の属性

#### `aspect-ratio`

オプション

数値: スライドを表示する幅と高さの比率です。

#### `loop`

デフォルト: `false`

サムネイルをループするかどうかを示すブール型の属性です。

### スタイル設定

`bento-inline-gallery`、`bento-inline-gallery-pagination`、`bento-inline-gallery-thumbnails`、および `bento-base-carousel` 要素セレクターを使用して、ページネーションインジケーター、サムネイル、およびカルーセルのスタイルを自由に設定できます。

---

## Preact/React コンポーネント

以下の例は、Preact または React ライブラリと使用可能な関数コンポーネントとして `<BentoInlineGallery>` を使用する方法を示しています。

### 例: npm によるインポート

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

### レイアウトとスタイル

#### コンテナタイプ

`BentoInlineGallery` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`width`で定義されたもの）を使って、コンポーネントとその直下の子コンポーネントにサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

または `className` を使用します。

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

### `BentoInlineGalleryPagination` のプロップ

BentoInlineGalleryPagination は、[共通プロップ](../../../docs/spec/bento-common-props.md)の他に、以下のプロップもサポートしています。

#### `inset`

デフォルト: `false`

ページネーションインジケーターを内側に表示するかどうか（カルーセルに重ねて表示するかどうか）を指定するブール型の属性です。

### `BentoInlineGalleryThumbnails` のプロップ

BentoInlineGalleryPagination は、[共通プロップ](../../../docs/spec/bento-common-props.md)の他に、以下のプロップもサポートしています。

#### `aspectRatio`

オプション

数値: スライドを表示する幅と高さの比率です。

#### `loop`

デフォルト: `false`

サムネイルをループするかどうかを示すブール型の属性です。
