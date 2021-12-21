# Bento Soundcloud

[Soundcloud](https://soundcloud.com) クリップを埋め込みます。

## ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下は、`<bento-soundcloud>` ウェブコンポーネントの使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### 例: `<script>` によるインクルード

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

### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### コンテナタイプ

`bento-soundcloud` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネントにサイズを必ず適用してください。

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### 属性

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>この属性は、<code>data-playlistid</code> が定義されていない場合に必須です。<br> この属性の値は、トラックの整数の ID です。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>この属性は、<code>data-trackid</code> が定義されていない場合に必須です。この属性の値は、プレイリストの整数の ID です。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token（オプション）</strong></td>
    <td>プライベートの場合、トラックのシークレットトークンです。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual（オプション）</strong></td>
    <td>
<code>true</code> にされている場合、全幅の "Visual" モードを表示します。そうでない場合は "Classic" モードで表示されます。デフォルト値は <code>false</code> です。</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color（オプション）</strong></td>
    <td>この属性は、"Classic" モードをカスタムカラーでオーバーライドします。"Visual" モードの場合、属性が無視されます。先頭の # を除く 16 進数の色値を指定します（例: <code>data-color="e540ff"</code>）。</td>
  </tr>
</table>

---

## Preact/React コンポーネント

以下は、Preact または React ライブラリと使用可能な関数コンポーネントとして、`<BentoSoundcloud>` の使用例を示しています。

### 例: npm によるインポート

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

### レイアウトとスタイル

#### コンテナタイプ

{code0BentoSoundcloud コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネントにサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

または `className` を使用します。

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

### プロップ

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>この属性は、<code>data-playlistid</code> が定義されていない場合に必須です。<br> この属性の値は、トラックの整数の ID です。</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>この属性は、<code>data-trackid</code> が定義されていない場合に必須です。この属性の値は、プレイリストの整数の ID です。</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken（オプション）</strong></td>
    <td>プライベートの場合、トラックのシークレットトークンです。</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual（オプション）</strong></td>
    <td>
<code>true</code> にされている場合、全幅の "Visual" モードを表示します。そうでない場合は "Classic" モードで表示されます。デフォルト値は <code>false</code> です。</td>
  </tr>
  <tr>
    <td width="40%"><strong>color（オプション）</strong></td>
    <td>この属性は、"Classic" モードをカスタムカラーでオーバーライドします。"Visual" モードの場合、属性が無視されます。先頭の # を除く 16 進数の色値を指定します（例: <code>data-color="e540ff"</code>）。</td>
  </tr>
</table>
