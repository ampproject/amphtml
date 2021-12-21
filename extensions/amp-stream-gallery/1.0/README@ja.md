# Bento Stream Gallery

## 使用方法

Bento Stream Gallery は、類似する複数のコンテンツピースを横軸に沿って同時に表示するためのコンポーネントです。よりカスタマイズされた UX を実装するには、[`bento-base-carousel`](../../amp-base-carousel/1.0/README.md) をご覧ください。

Bento Stream Gallery は、ウェブコンポーネント（[`<bento-stream-gallery>`](#web-component)）または Preact/React 関数コンポーネント（[`<BentoStreamGallery>`](#preactreact-component)）として使用します。

### ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下は、`<bento-stream-gallery>` ウェブコンポーネントの使用例を示しています。

#### 例: npm によるインポート

[example preview="top-frame" playground="false"]

npm でインストールします。

```sh
npm install @ampproject/bento-stream-gallery
```

```javascript
import '@ampproject/bento-stream-gallery';
```

[/example]

#### 例: `<script>` によるインクルード

以下の例には、3 つのセクションを含む `bento-stream-gallery` が含まれます。3 番目のセクションの `expanded` 属性は、ページの読み込み時にセクションを展開します。

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

#### インタラクティビティと API の使用

スタンドアロンで使用される Bento 対応のコンポーネントは、API を通じた高いインタラクティブ性があります。`bento-stream-gallery` コンポーネント API にアクセスするには、次のスクリプトタグをドキュメントに含めます。

```javascript
await customElements.whenDefined('bento-stream-gallery');
const api = await streamGallery.getApi();
```

##### アクション

**next()**

カルーセルを表示されているスライドの数で先送りにします。

```js
api.next();
```

**prev()**

カルーセルを表示されているスライドの数で巻き戻します。

```js
api.prev();
```

**goToSlide(index: number)**

`index` 引数で指定されたスライドにカルーセルを移動します。注意: `index` は <code>0</code> 以上スライド数未満の数に正規化されます。

```js
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

##### イベント

Bento Stream Gallery コンポーネントでは、次のイベントを登録し、それに応答することができます。

**slideChange**

このイベントは、カルーセルが表示するインデックスに変更があるとトリガーされます。新しいインデックスは、`event.data.index` を使って使用できます。

```js
streamGallery.addEventListener('slideChange', (e) => console.log(e.data.index))
```

#### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-streamGallery-1.0.css">
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

```html
<style data-bento-boilerplate>
  bento-stream-gallery {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 属性

##### 動作

###### `controls`

`"always"`、`"auto"`、または `"never"` のいずれかで、デフォルトは `"auto"` です。これは、前へまたは次へのナビゲーション矢印を表示するかとそのタイミングを決定します。注意: `outset-arrows` が `true` の場合、矢印は `"always"` で表示されます。

-   `always`: 矢印は常に表示されます。
-   `auto`: 矢印は、カルーセルの直近の操作がマウス操作であった場合に表示され、タッチ操作であった場合に表示されません。タッチデバイスの場合、初回ロード時にには矢印は最初の操作が発生するまで表示されます。
-   `never`: 矢印は絶対に表示されません。

###### `extra-space`

`"around"` または未定義のいずれかです。これは、カルーセル内の計算された可視スライド数を表示した後に追加スペースを割り当てる方法を決定します。`"around"` である場合、`justify-content: center` でカルーセルの周りに空白が均等に配分されます。そうでない場合、LTR ドキュメントの場合はカルーセルの右に、RTL ドキュメントの場合は左に空白が割り当てられます。

###### `loop`

`true` または `false` のいずれかで、デフォルトは `true` です。true の場合、ユーザーが最初のアイテムから最後のアイテム（またはその逆）にカルーセルを移動することができます。ループさせるには、少なくとも 3 つのスライドが存在する必要があります。

###### `outset-arrows`

`true` または `false` のいずれかで、デフォルトは `false` です。true の場合、カルーセルは、スライドの外両側に矢印を表示します。外側に矢印を使用すると、スライドコンテナの有効な長さは、特定のコンテナに割り当てられたスペースよりも 100 ピクセル短くなるため、両側では矢印当たり 50 ピクセル短くなることに注意してください。false の場合、カルーセルはスライドの左端と右端の内側に矢印をオーバーレイ表示します。

###### `peek`

数値で、デフォルトは `0` です。これは、（現在のスライドの片側または両側に）追加スライドをどれくらいユーザーに示すかを決定し、ユーザーにカルーセルがスワイプ可能であることを示します。

##### ギャラリースライドの可視性

###### `min-visible-count`

数値で、デフォルトは `1` です。特定の時間に表示されるスライドの最低数を決定します。追加スライドの一部を可視状態にするには、小数値を使用できます。

###### `max-visible-count`

数値で、デフォルトは [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE) です。特定の時間に表示されるスライドの最大数を決定します。追加スライドの一部を可視状態にするには、小数値を使用できます。

###### `min-item-width`

数値で、デフォルトは `1` です。各アイテムの最小幅を決定し、ギャラリーの全幅内で、一度に表示できる完全なアイテム数を解決するために使用されます。

###### `max-item-width`

数値で、デフォルトは [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE) です。各アイテムの最大幅を決定し、ギャラリーの全幅内で、一度に表示できる完全なアイテム数を解決するために使用されます。

##### スライドのスナップ

###### `slide-align`

`start` または `center` です。start 整列である場合、スライドの先頭（横方向整列の場合は左端のスライド）がカルーセルの開始に整列されます。center 整列である場合、スライドの中央がカルーセルの中央に整列されます。

###### `snap`

`true` または `false` で、デフォルトは `true` です。スクロール中にカルーセルをスライドにスナップするかどうかを決定します。

#### スタイル設定

`bento-stream-gallery` 要素セレクタを使用して、アコーディオンのスタイルを自由に設定することができます。

### Preact/React コンポーネント

以下は、Preact または React ライブラリと使用可能な関数コンポーネントとして、`<BentoStreamGallery>` の使用例を示しています。

#### 例: npm によるインポート

[example preview="top-frame" playground="false"]

npm でインストールします。

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

#### インタラクティビティと API の使用

Bento コンポーネントには、API を通じた高いインタラクティブ性があります。`BentoStreamGallery` コンポーネント API にアクセスするには、`ref` を渡します。

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

##### アクション

`BentoStreamGallery` API では、次のアクションを実行できます。

**next()**

<code>advanceCount</code> スライドずつ、カルーセルを先送りします。

```javascript
ref.current.next();
```

**prev()**

<code>advanceCount</code> スライドずつ、カルーセルを巻き戻します。

```javascript
ref.current.prev();
```

**goToSlide(index: number)**

`index` 引数で指定されたスライドにカルーセルを移動します。注意: `index` は `0` 以上スライド数未満の数に正規化されます。

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

##### イベント

**onSlideChange**

このイベントは、カルーセルが表示するインデックスに変更があるとトリガーされます。

```jsx
<BentoStreamGallery onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoStreamGallery>
```

#### レイアウトとスタイル

**コンテナタイプ**

`BentoStreamGallery` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（<code>width</code>で定義されたもの）を使って、コンポーネントとその直下の子コンポーネントにサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoStreamGallery style={{width: '300px'}}>
  ...
</BentoStreamGallery>
```

または `className` を使用します。

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

#### プロップ

##### 共通プロップ

このコンポーネントは React と Preact コンポーネントの[共通プロップ](../../../docs/spec/bento-common-props.md)をサポートしています。

##### 動作

###### `controls`

`"always"`、`"auto"`、または `"never"` のいずれかで、デフォルトは `"auto"` です。これは、前へまたは次へのナビゲーション矢印を表示するかとそのタイミングを決定します。注意: `outset-arrows` が `true` の場合、矢印は `"always"` で表示されます。

-   `always`: 矢印は常に表示されます。
-   `auto`: 矢印は、カルーセルの直近の操作がマウス操作であった場合に表示され、タッチ操作であった場合に表示されません。タッチデバイスの場合、初回ロード時にには矢印は最初の操作が発生するまで表示されます。
-   `never`: 矢印は絶対に表示されません。

###### `extraSpace`

`"around"` または未定義のいずれかです。これは、カルーセル内の計算された可視スライド数を表示した後に追加スペースを割り当てる方法を決定します。`"around"` である場合、`justify-content: center` でカルーセルの周りに空白が均等に配分されます。そうでない場合、LTR ドキュメントの場合はカルーセルの右に、RTL ドキュメントの場合は左に空白が割り当てられます。

###### `loop`

`true` または `false` のいずれかで、デフォルトは `true` です。true の場合、ユーザーが最初のアイテムから最後のアイテム（またはその逆）にカルーセルを移動することができます。ループさせるには、少なくとも 3 つのスライドが存在する必要があります。

###### `outsetArrows`

`true` または `false` のいずれかで、デフォルトは `false` です。true の場合、カルーセルは、スライドの外両側に矢印を表示します。外側に矢印を使用すると、スライドコンテナの有効な長さは、特定のコンテナに割り当てられたスペースよりも 100 ピクセル短くなるため、両側では矢印当たり 50 ピクセル短くなることに注意してください。false の場合、カルーセルはスライドの左端と右端の内側に矢印をオーバーレイ表示します。

###### `peek`

数値で、デフォルトは `0` です。これは、（現在のスライドの片側または両側に）追加スライドをどれくらいユーザーに示すかを決定し、ユーザーにカルーセルがスワイプ可能であることを示します。

##### ギャラリースライドの可視性

###### `minVisibleCount`

数値で、デフォルトは `1` です。特定の時間に表示されるスライドの最低数を決定します。追加スライドの一部を可視状態にするには、小数値を使用できます。

###### `maxVisibleCount`

数値で、デフォルトは [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE) です。特定の時間に表示されるスライドの最大数を決定します。追加スライドの一部を可視状態にするには、小数値を使用できます。

###### `minItemWidth`

数値で、デフォルトは `1` です。各アイテムの最小幅を決定し、ギャラリーの全幅内で、一度に表示できる完全なアイテム数を解決するために使用されます。

###### `maxItemWidth`

数値で、デフォルトは [`Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE) です。各アイテムの最大幅を決定し、ギャラリーの全幅内で、一度に表示できる完全なアイテム数を解決するために使用されます。

##### スライドのスナップ

###### `slideAlign`

`start` または `center` です。start 整列である場合、スライドの先頭（横方向整列の場合は左端のスライド）がカルーセルの開始に整列されます。center 整列である場合、スライドの中央がカルーセルの中央に整列されます。

###### `snap`

`true` または `false` で、デフォルトは `true` です。スクロール中にカルーセルをスライドにスナップするかどうかを決定します。
