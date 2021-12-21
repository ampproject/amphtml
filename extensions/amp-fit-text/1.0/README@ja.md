# Bento Fit Text

指定されたテキストコンテンツ全体が使用可能なスペースにフィットするために最適なフォントサイズを決定します。

Bento Fit Text に期待されるコンテンツはテキストまたはその他のインラインコンテンツですが、非インラインコンテンツも含めることができます。

## ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下は、`<bento-fit-text>` ウェブコンポーネントの使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/fit-text
```

```javascript
import {defineElement as defineBentoFitText} from '@bentoproject/fit-text';
defineBentoFitText();
```

### 例: `<script>` によるインクルード

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-fit-text {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<bento-fit-text id="my-fit-text">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque inermis
  reprehendunt.
</bento-fit-text>
<div class="buttons" style="margin-top: 8px">
  <button id="font-button">Change max-font-size</button>
  <button id="content-button">Change content</button>
</div>

<script>
  (async () => {
    const fitText = document.querySelector('#my-fit-text');
    await customElements.whenDefined('bento-fit-text');

    // set up button actions
    document.querySelector('#font-button').onclick = () =>
      fitText.setAttribute('max-font-size', '40');
    document.querySelector('#content-button').onclick = () =>
      (fitText.textContent = 'new content');
  })();
</script>
```

### オーバーフローコンテンツ

`bento-fit-text` のコンテンツが、`min-font-size` を指定しても、使用可能な領域からオーバーフローする場合、はみ出たコンテンツは切り捨てられ、非表示になります。WebKit と Blink ベースのブラウザには、オーバーフローコンテンツの省略枠が表示されます。

以下の例では、`min-font-size` の `40` を指定し、`bento-fit-text` 要素にさらに多くのコンテンツを追加しました。このため、コンテンツが親固定ブロックのサイズを超過してしまうため、コンテナにフィットするようにテキストが切り捨てられています。

```html
<div style="width: 300px; height: 300px; background: #005af0; color: #fff">
  <bento-fit-text min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </bento-fit-text>
</div>
```

### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-fit-text-1.0.css"
/>
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

```html
<style>
  bento-fit-text {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### コンテナタイプ

`bento-fit-text` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。

```css
bento-fit-text {
  height: 100px;
  width: 100%;
}
```

### オーバーフローコンテンツのアクセシビリティに関する考慮事項

オーバーフローコンテンツは、コンテナにフィットするように*視覚的に*切り捨てられますが、ドキュメントにはそのまま存在してることに注意してください。オーバーフローの動作を利用して、ただページに大量のコンテンツを「詰め込む」ようなことはしないでください。視覚的に見栄えが良くとも、支援技術（スクリーンリーダーなど）を使用するユーザーの場合は、切り取られたコンテンツも合わせてすべてが読み上げられてしまうため、過度に冗長的なページとなってしまう可能性があります。

### 属性

#### メディアクエリ

`<bento-fit-text>` の属性は、[メディアクエリ](./../../../docs/spec/amp-html-responsive-attributes.md)に基づいて異なるオプションを使用するように構成できます。

#### `min-font-size`

`bento-fit-text` が使用できるピクセル単位の最小フォントサイズを整数で指定します。

#### `max-font-size`

`bento-fit-text` が使用できるピクセル単位の最大フォントサイズを整数で指定します。

---

## Preact/React コンポーネント

以下は、Preact または React ライブラリと使用可能な関数コンポーネントとして、`<BentoFitText>` の使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/fit-text
```

```javascript
import React from 'react';
import {BentoFitText} from '@bentoproject/fit-text/react';
import '@bentoproject/fit-text/styles.css';

function App() {
  return (
    <BentoFitText>
      Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
      inermis reprehendunt.
    </BentoFitText>
  );
}
```

### レイアウトとスタイル

#### コンテナタイプ

`BentoFitText` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoFitText style={{width: 300, height: 100}}>
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

または `className` を使用します。

```jsx
<BentoFitText className="custom-styles">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### プロップ

#### `minFontSize`

`bento-fit-text` が使用できるピクセル単位の最小フォントサイズを整数で指定します。

#### `maxFontSize`

`bento-fit-text` が使用できるピクセル単位の最大フォントサイズを整数で指定します。
