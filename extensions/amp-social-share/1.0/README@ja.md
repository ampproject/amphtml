# Bento Social Share

ソーシャルプラットフォーム用またはシステム共有用のの共有ボタンを表示します。

現在のところ、Bento Social Share が生成するすべてのボタン（事前構成済みプロバイダー用のボタンを含む）には、支援技術（スクリーンリーダーなど）に公開されたラベルやアクセシブル名はありません。`aria-label` には説明的なラベルを含めるようにしてください。含めない場合、これらのコントロールはラベル無しの「ボタン」要素としてみなされます。

## ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下は、`<bento-social-share>` ウェブコンポーネントの使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### 例: `<script>` によるインクルード

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

### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

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

#### コンテナタイプ

`bento-social-share` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### デフォルトスタイル

デフォルトでは、`bento-social-share` には一部の一般的な事前構成済みプロバイダーが含まれます。これらのプロバイダーのボタンはプロバイダーの公式の色とロゴでスタイル設定されています。デフォルトの幅は 60px、高さは 44px です。

#### カスタムスタイル

独自のスタイルを提供することもあります。その場合は、以下のようにして、提供されたスタイルをオーバーライドすることができます。

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

`bento-social-share` アイコンのスタイルをカスタマイズする際は、カスタマイズされたアイコンがプロバイダー（Twitter、Facebook など）が設けるブランディングガイドラインに適合していることを確認してください。

### アクセシビリティ

#### フォーカスの指定

`bento-social-share` 要素は、デフォルトで青い枠線で可視フォーカスインジケーターを表示します。また、ページ上に同時に使用される複数の `bento-social-share` 要素を簡単にタブ移動できるように、デフォルトで `tabindex=0` に指定されます。

デフォルトのフォーカスインジケーターは、以下の CSS ルールセットを使用して実装されています。

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

このデフォルトのフォーカスインジケーターは、フォーカス用の CSS スタイルを定義して `style` タグ内に含めることで、オーバーライドすることが可能です。以下の例では、最初の CSS ルールセットで `outline` プロパティを `none` に設定することで、すべての `bento-social-share` 要素を取り除いています。2 つ目のルールセットは、（デフォルトの青の代わりに）赤い枠線を指定し、すべての `bento-social-share` の `outline-offset` が `3px` になるように、クラス `custom-focus` で設定しています。

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

上記の CSS ルールを使用すると、`bento-social-share` 要素は可視フォーカスインジケーターを表示しなくなりますが、クラス `custom-focus` がインクルードされると赤い枠線のインジケーターを表示するようになります。

#### 色コントラスト

`bento-social-share` の `type` 値が `twitter`、`whatsapp`、または `line` である場合、[WCAG 2.1 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) に定義されている 3:1 という非テキストコントラストの推奨しきい値を下回る前景色/背景色の組み合わせでボタンが表示されます。

コントラストが十分でない場合、コンテンツが読み取りにくくなり、したがって、識別が困難になる場合があります。極端なケースでは、低コントラストのコンテンツは色覚異常のあるすべてのユーザーが読み取れない可能性もあります。上記のシェアボタンの場合、ユーザーは、シェアボタンが何であるか、どのサービスに関連するのかを適切に理解できなくなってしまいます。

### 事前構成済みプロバイダー

`bento-social-share` コンポーネントには、共有先とデフォルトパラメーターがわかっている[一部の事前構成済みプロバイダー](./social-share-config.js)が用意されています。

<table>
  <tr>
    <th class="col-twenty">プロバイダー</th>
    <th class="col-twenty">タイプ</th>
    <th>パラメーター</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a>（OS の共有ダイアログをトリガーします）</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>メール</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: オプション</li>
        <li>
<code>data-param-body</code>: オプション</li>
        <li>
<code>data-param-recipient</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>必須</strong>。デフォルト: none。このパラメーターは Facebook <code>app_id</code> で、<a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook の共有ダイアログ</a>で必要です。</li>
        <li>
<code>data-param-href</code>: オプション</li>
        <li>
<code>data-param-quote</code>: オプション。引用またはテキストの共有に使用できます。</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: オプション</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: オプション（設定することが強く推奨されます）。Pinterest にシェアされるメディアの Url。設定されていない場合、Pinterest はエンドユーザーにメディアをアップロードするように要求します。</li>
        <li>
<code>data-param-url</code>: オプション</li>
        <li>
<code>data-param-description</code>: オプション</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: オプション</li>
        <li>
<code>data-param-text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: オプション</li>
        <li>
<code>data-param-text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: オプション</li>
        <li>
<code>data-param-text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: オプション</li>
</ul>
    </td>
  </tr>
</table>

### 未構成プロバイダー

`bento-social-share` コンポーネントに追加の属性を指定すると、事前構成済みプロバイダーのほかに未構成プロバイダーも使用できます。

#### 例: 未構成プロバイダーのシェアボタンの作成

以下の例では、`data-share-endpoint` 属性をFacebook Messenger カスタムプロトコルの正しいエンドポイントに設定し、Facebook Messenger を通じてシェアボタンを作成します。

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

これらのプロバイダーは事前構成ではないため、プロバイダーに適切なボタンの画像とスタイルを作成する必要があります。

### 属性

#### type（必須）

プロバイダーのタイプを選択します。これは、事前構成済みと未構成の両方のプロバイダーに必須の属性です。

#### data-target

ターゲットを開くためのターゲットを指定します。iOS のメール/SMS を除くすべてのデフォルトは `_blank` です。iOS のメール/SMS の場合、ターゲットは  `_top` に設定されます。

#### data-share-endpoint

未構成プロバイダーの場合に必須となる属性です。

一部の一般的なプロバイダーには事前に構成された共有エンドポイントがあります。詳細については、「事前構成済みプロバイダー」セクションをご覧ください。未構成プロバイダーの場合は、共有エンドポイントを指定する必要があります。

#### data-param-*

すべての `data-param-*` で開始する属性は URL パラメーターに変換され、共有エンドポイントに渡されます。

#### aria-label

アクセシビリティに使用されるボタンの説明です。推奨されるラベルは「&lt;type&gt; で共有」です。

---

## Preact/React コンポーネント

以下は、Preact または React ライブラリと使用可能な関数コンポーネントとして、`<BentoSocialShare>` の使用例を示しています。

### 例: npm によるインポート

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

### レイアウトとスタイル

#### コンテナタイプ

`BentoSocialShare` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

または `className` を使用します。

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

### アクセシビリティ

#### フォーカスの指定

`BentoSocialShare` 要素は、デフォルトで青い枠線で可視フォーカスインジケーターを表示します。また、ページ上に同時に使用される複数の `BentoSocialShare` 要素を簡単にタブ移動できるように、デフォルトで `tabindex=0` に指定されます。

デフォルトのフォーカスインジケーターは、以下の CSS ルールセットを使用して実装されています。

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

このデフォルトのフォーカスインジケーターは、フォーカス用の CSS スタイルを定義して `style` タグ内に含めることで、オーバーライドすることが可能です。以下の例では、最初の CSS ルールセットで `outline` プロパティを `none` に設定することで、すべての `BentoSocialShare` 要素を取り除いています。2 つ目のルールセットは、（デフォルトの青の代わりに）赤い枠線を指定し、すべての `bento-social-share` の `outline-offset` が `3px` になるように、クラス `custom-focus` で設定しています。

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

上記の CSS ルールを使用すると、`BentoSocialShare` 要素は可視フォーカスインジケーターを表示しなくなりますが、クラス `custom-focus` がインクルードされると赤い枠線のインジケーターを表示するようになります。

#### 色コントラスト

`BentoSocialShare` の `type` 値が `twitter`、`whatsapp`、または `line` である場合、[WCAG 2.1 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) に定義されている 3:1 という非テキストコントラストの推奨しきい値を下回る前景色/背景色の組み合わせでボタンが表示されます。

コントラストが十分でない場合、コンテンツが読み取りにくくなり、したがって、識別が困難になる場合があります。極端なケースでは、低コントラストのコンテンツは色覚異常のあるすべてのユーザーが読み取れない可能性もあります。上記のシェアボタンの場合、ユーザーは、シェアボタンが何であるか、どのサービスに関連するのかを適切に理解できなくなってしまいます。

### 事前構成済みプロバイダー

`BentoSocialShare` コンポーネントには、共有先とデフォルトパラメーターがわかっている[一部の事前構成済みプロバイダー](./social-share-config.js)が用意されています。

<table>
  <tr>
    <th class="col-twenty">プロバイダー</th>
    <th class="col-twenty">タイプ</th>
    <th>
<code>param</code> プロップ経由のパラメーター</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a>（OS の共有ダイアログをトリガーします）</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>メール</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: オプション</li>
        <li>
<code>body</code>: オプション</li>
        <li>
<code>recipient</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>: <strong>必須</strong>。デフォルト: none。このパラメーターは Facebook <code>app_id</code> で、<a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook の共有ダイアログ</a>で必要です。</li>
        <li>
<code>href</code>: オプション</li>
        <li>
<code>quote</code>: オプション。引用またはテキストの共有に使用できます。</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: オプション</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: オプション（設定することが強く推奨されます）。Pinterest にシェアされるメディアの Url。設定されていない場合、Pinterest はエンドユーザーにメディアをアップロードするように要求します。</li>
        <li>
<code>url</code>: オプション</li>
        <li>
<code>description</code>: オプション</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: オプション</li>
        <li>
<code>text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: オプション</li>
        <li>
<code>text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: オプション</li>
        <li>
<code>text</code>: オプション</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: オプション</li>
</ul>
    </td>
  </tr>
</table>

### 未構成プロバイダー

`BentoSocialShare` コンポーネントに追加の属性を指定すると、事前構成済みプロバイダーのほかに未構成プロバイダーも使用できます。

#### 例: 未構成プロバイダーのシェアボタンの作成

以下の例では、`data-share-endpoint` 属性をFacebook Messenger カスタムプロトコルの正しいエンドポイントに設定し、Facebook Messenger を通じてシェアボタンを作成します。

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

これらのプロバイダーは事前構成ではないため、プロバイダーに適切なボタンの画像とスタイルを作成する必要があります。

### プロップ

#### type（必須）

プロバイダーのタイプを選択します。これは、事前構成済みと未構成の両方のプロバイダーに必須の属性です。

#### background

独自のスタイルを提供することもあります。その場合は、背景の色を指定して、提供されたスタイルをオーバーライドすることができます。

`BentoSocialShare` アイコンのスタイルをカスタマイズする際は、カスタマイズされたアイコンがプロバイダー（Twitter、Facebook など）が設けるブランディングガイドラインに適合していることを確認してください。

#### color

独自のスタイルを提供することもあります。その場合は、塗りの色を指定して、提供されたスタイルをオーバーライドすることができます。

`BentoSocialShare` アイコンのスタイルをカスタマイズする際は、カスタマイズされたアイコンがプロバイダー（Twitter、Facebook など）が設けるブランディングガイドラインに適合していることを確認してください。

#### target

ターゲットを開くためのターゲットを指定します。iOS のメール/SMS を除くすべてのデフォルトは `_blank` です。iOS のメール/SMS の場合、ターゲットは  `_top` に設定されます。

#### endpoint

未構成プロバイダーの場合に必須となるプロップです。

一部の一般的なプロバイダーには事前に構成された共有エンドポイントがあります。詳細については、「事前構成済みプロバイダー」セクションをご覧ください。未構成プロバイダーの場合は、共有エンドポイントを指定する必要があります。

#### params

すべての `param` プロパティは URL パラメーターとして渡されて、共有エンドポイントに渡されます。

#### aria-label

アクセシビリティに使用されるボタンの説明です。推奨されるラベルは「&lt;type&gt; で共有」です。
