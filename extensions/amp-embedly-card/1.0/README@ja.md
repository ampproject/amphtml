# Bento Embedly Card

[Embedly カード](http://docs.embed.ly/docs/cards)を使用して、レスポンシブ対応の共有可能な埋め込みを提供します。

カードは、Embedly を活用する最も簡単な方法です。カードは任意のメディアに対し、レスポンシブ対応埋め込みとビルトインの埋め込み解析を提供します。

有料プランをご利用の場合は、`<bento-embedly-key>` または `<BentoEmbedlyContext.Provider>` コンポーネントを使用して、API キーを設定します。カードから Embedly のブランディングを取り除くには、ページ当たり 1 つの Bento Embedly キーが必要です。ページ内には、Bento Embedly カードのインスタンスを 1 つ以上含めることができます。

## ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下は、`<bento-embedly-card>` ウェブコンポーネントの使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {defineElement as defineBentoEmbedlyCard} from '@bentoproject/embedly-card';
defineBentoEmbedlyCard();
```

### 例: `<script>` によるインクルード

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

### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css"
/>
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

```html
<style>
  bento-embedly-card {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### コンテナタイプ

`bento-embedly-card` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。

```css
bento-embedly-card {
  height: 100px;
  width: 100%;
}
```

### 属性

#### `data-url`

埋め込み情報を取得する URL です。

#### `data-card-embed`

動画またはリッチメディアへの URL です。カード内に静的ページコンテンツを使用する代わりに、記事などの静的埋め込みで使用すると、カードは動画またはリッチメディアを埋め込みます。

#### `data-card-image`

画像への URL です。`data-url` が記事にポイントしている場合に、記事で使用する画像を指定します。すべての画像 URL がサポートされているわけではないため、画像が読み込まれない場合は、別の画像またはドメインを試してください。

#### `data-card-controls`

シェアアイコンを埋め込みます。

-   `0`: シェアアイコンを無効にします。
-   `1`: シェアアイコンを有効にします。

デフォルトは `1` です。

#### `data-card-align`

カードを整列します。可能な値は、`left`、`center`、および `right` です。デフォルト値は `center` です。

#### `data-card-recommend`

推奨機能がサポートされている場合は、動画とリッチカードの embedly 推奨機能を無効にします。これらは embedly が作成した推奨です。

-   `0`: embedly の推奨を無効にします。
-   `1`: embedly の推奨を有効にします。

デフォルト値は `1` です。

#### `data-card-via`（オプション）

カードのコンテンツの経由を指定します。帰属を表示するための最適な方法です。

#### `data-card-theme`（オプション）

メインのカードコンテナの背景色を変更する `dark` テーマを設定できるようにします。ダークテーマを設定するには、`dark` を使用します。暗い背景を得るにはこれを指定するのが推奨されます。デフォルトは `light` で、メインのカードコンテナの背景色が設定されません。

#### title（オプション）

コンポーネントの基盤である `<iframe>` 要素に伝搬する `title` 属性を定義します。デフォルト値は `"Embedly card"` です。

---

## Preact/React コンポーネント

以下は、Preact または React ライブラリと使用可能な関数コンポーネントとして、`<BentoEmbedlyCard>` の使用例を示しています。

### 例: npm によるインポート

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

### レイアウトとスタイル

#### コンテナタイプ

`BentoEmbedlyCard` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoEmbedlyCard
  style={{width: 300, height: 100}}
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

または `className` を使用します。

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

### プロップ

#### `url`

埋め込み情報を取得する URL です。

#### `cardEmbed`

動画またはリッチメディアへの URL です。カード内に静的ページコンテンツを使用する代わりに、記事などの静的埋め込みで使用すると、カードは動画またはリッチメディアを埋め込みます。

#### `cardImage`

画像への URL です。`data-url` が記事にポイントしている場合に、記事で使用する画像を指定します。すべての画像 URL がサポートされているわけではないため、画像が読み込まれない場合は、別の画像またはドメインを試してください。

#### `cardControls`

シェアアイコンを埋め込みます。

-   `0`: シェアアイコンを無効にします。
-   `1`: シェアアイコンを有効にします。

デフォルトは `1` です。

#### `cardAlign`

カードを整列します。可能な値は、`left`、`center`、および `right` です。デフォルト値は `center` です。

#### `cardRecommend`

推奨機能がサポートされている場合は、動画とリッチカードの embedly 推奨機能を無効にします。これらは embedly が作成した推奨です。

-   `0`: embedly の推奨を無効にします。
-   `1`: embedly の推奨を有効にします。

デフォルト値は `1` です。

#### `cardVia`（オプション）

カードのコンテンツの経由を指定します。帰属を表示するための最適な方法です。

#### `cardTheme`（オプション）

メインのカードコンテナの背景色を変更する `dark` テーマを設定できるようにします。ダークテーマを設定するには、`dark` を使用します。暗い背景を得るにはこれを指定するのが推奨されます。デフォルトは `light` で、メインのカードコンテナの背景色が設定されません。

#### title（オプション）

コンポーネントの基盤である `<iframe>` 要素に伝搬する `title` 属性を定義します。デフォルト値は `"Embedly card"` です。
