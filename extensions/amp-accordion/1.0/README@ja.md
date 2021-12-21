# Bento Accordion

折りたたみと展開が可能なコンテンツセクションを表示します。閲覧者がコンテンツの概要を見て任意のセクションに移動する方法を提供するコンポーネントです。効果的に使用すると、モバイルデバイスでのスクロール操作を減らすことができます。

-   Bento Accordion は、直下の子要素として、1 つまたは複数の `<section>` 要素を受け入れます。
-   各 `<section>` には、ちょうど 2 つの直接の子要素が含まれている必要があります。
-   `<section>` の最初の子要素は、Bento Accordion のそのセクションの見出しです。`<h1>-<h6>` または `<header>` などの見出し要素である必要があります。
-   `<section>` の 2 つ目の子要素は、展開と折りたたみが可能なコンテンツです。
    -   [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md) で許可されているタグを使用できます。
-   `<section>` の見出しをクリックまたはタップすると、そのセクションを展開または折りたたみます。
-   定義済みの `id` を持つ Bento Accordion は、ユーザーがドメインにとどまる間、折り畳まれた状態または展開状態を保持します。

## ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下は、`<bento-accordion>` ウェブコンポーネントの使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### 例: `<script>` によるインクルード

以下の例には、3 つのセクションを含む `bento-accordion` が含まれます。3 番目のセクションの `expanded` 属性は、ページの読み込み時にセクションを展開します。

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
  />
</head>
<body>
  <bento-accordion id="my-accordion" disable-session-states>
    <section>
      <h2>Section 1</h2>
      <p>Content in section 1.</p>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>Content in section 2.</div>
    </section>
    <section expanded>
      <h2>Section 3</h2>
      <div>Content in section 3.</div>
    </section>
  </bento-accordion>
  <script>
    (async () => {
      const accordion = document.querySelector('#my-accordion');
      await customElements.whenDefined('bento-accordion');
      const api = await accordion.getApi();

      // programatically expand all sections
      api.expand();
      // programatically collapse all sections
      api.collapse();
    })();
  </script>
</body>
```

### インタラクティビティと API の使用

スタンドアロンで使用される Bento 対応のコンポーネントは、API を通じた高いインタラクティブ性があります。`bento-accordion` コンポーネント API にアクセスするには、次のスクリプトタグをドキュメントに含めます。

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### アクション

##### toggle()

`toggle` アクションは、`bento-accordion` セクションの `expanded` 状態と `collapsed` 状態を切り替えます。引数なしで呼び出されると、アコーディオンのすべてのセクションが切り替えられます。特定のセクションを指定するには、`section` 引数とそれに対応する <code>id</code> を値として追加します。

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.toggle();
    };
    document.querySelector('#button2').onclick = () => {
      api.toggle('section1');
    };
  })();
</script>
```

##### expand()

`expand` アクションは、`bento-accordion` のセクションを展開します。セクションがすでに展開状態である場合は、展開されたままになります。引数なしで呼び出されると、アコーディオンのすべてのセクションが展開されます。特定のセクションを指定するには、`section` 引数を追加し、値にはそれに対応する <code>id</code> を使用します。

```html
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.expand();
    };
    document.querySelector('#button2').onclick = () => {
      api.expand('section1');
    };
  })();
</script>
```

##### collapse()

`collapse` アクションは、`bento-accordion` のセクションを折り畳みます。セクションがすでに折り畳み状態である場合は、折り畳まれたままになります。引数なしで呼び出されると、アコーディオンのすべてのセクションが折り畳まれます。特定のセクションを指定するには、`section` 引数を追加し、値にはそれに対応する <code>id</code> を使用します。

```html
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.collapse();
    };
    document.querySelector('#button2').onclick = () => {
      api.collapse('section1');
    };
  })();
</script>
```

#### イベント

`bento-accordion` API では、次のイベントを登録し、それに応答することができます。

##### expand

このイベントは、アコーディオンセクションが展開されており、その展開済みのセクションから発行されるときにトリガーされます。

以下の例を参照してください。

##### collapse

このイベントは、アコーディオンのセクションが折り畳まれており、その折り畳み済みのセクションから発行されるときにトリガーされます。

以下の例では、`section 1` は `expand` イベントをリスンし、展開されている場合に `section 2` を展開します。`section 2` は `collapse` イベントをリスンし、折り畳まれている場合に `section 1` を折り畳みます。

以下の例を参照してください。

```html
<bento-accordion id="eventsAccordion" animate>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</bento-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => {
      api.expand('section2');
    });
    section2.addEventListener('collapse', () => {
      api.collapse('section1');
    });
  })();
</script>
```

### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

```html
<style>
  bento-accordion {
    display: block;
    contain: layout;
  }

  bento-accordion,
  bento-accordion > section,
  bento-accordion > section > :first-child {
    margin: 0;
  }

  bento-accordion > section > * {
    display: block;
    float: none;
    overflow: hidden; /* clearfix */
    position: relative;
  }

  @media (min-width: 1px) {
    :where(bento-accordion > section) > :first-child {
      cursor: pointer;
      background-color: #efefef;
      padding-right: 20px;
      border: 1px solid #dfdfdf;
    }
  }

  .i-amphtml-accordion-header {
    cursor: pointer;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }

  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating),
  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating)
    * {
    display: none !important;
  }
</style>
```

### 属性

#### animate

`animate` 属性を `<bento-accordion>` に含めると、コンテンツが展開するときに "roll down" アニメーションを追加し、折り畳まれるときに "roll up" アニメーションを追加します。

この属性は、[メディアクエリ](./../../../docs/spec/amp-html-responsive-attributes.md)に基づくように構成できます。

```html
<bento-accordion animate>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Content in section 2.</div>
  </section>
</bento-accordion>
```

#### expanded

`expanded` 属性をネストされた `<section>` に適用すると、そのセクションはページがロードされるときに展開します。

```html
<bento-accordion>
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section3" expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome expanded content</div>
  </section>
</bento-accordion>
```

#### expand-single-section

`expand-single-section` 属性を `<bento-accordion>` 要素に適用すると、1 度に 1 つのセクションのみが展開します。つまり、ユーザーが折り畳まれた状態の `<section>` をタップすると、そのセクションを展開し、ほかの展開済み `<section>` を折り畳みます。

```html
<bento-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <img
      src="https://source.unsplash.com/random/320x256"
      width="320"
      height="256"
    />
  </section>
</bento-accordion>
```

### スタイル設定

`bento-accordion` 要素セレクタを使用して、アコーディオンのスタイルを自由に設定することができます。

amp-accordion のスタイルを設定するには、次のことに注意してください。

-   `bento-accordion` 要素は必ず `display: block` です。
-   `float` は、`<section>`、見出し、またはコンテンツ要素にスタイルを設定できません。
-   展開済みのセクションは、`expanded` 属性を `<section>` 要素に適用します。
-   コンテンツ要素は `overflow: hidden` で clear-fix されているため、スクロールバーを使用できません。
-   `<bento-accordion>`、`<section>`、見出し、およびコンテンツ要素のマージンは `0` に設定されますが、カスタムスタイルでオーバーライドできます。
-   見出しとコンテンツの要素は、`position: relative` です。

---

## Preact/React コンポーネント

以下は、Preact または React ライブラリと使用可能な関数コンポーネントとして、`<BentoAccordion>` の使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/accordion
```

```javascript
import React from 'react';
import {BentoAccordion} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';

function App() {
  return (
    <BentoAccordion>
      <BentoAccordionSection key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

### インタラクティビティと API の使用

Bento コンポーネントには、API を通じた高いインタラクティブ性があります。`BentoAccordion` コンポーネント API にアクセスするには、`ref` を渡します。

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader><h1>Section 1</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader><h1>Section 2</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader><h1>Section 3</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### アクション

`BentoAccordion` API では、次のアクションを実行できます。

##### toggle()

`toggle` アクションは、`bento-accordion` セクションの `expanded` 状態と `collapsed` 状態を切り替えます。引数なしで呼び出されると、アコーディオンのすべてのセクションが切り替えられます。特定のセクションを指定するには、`section` 引数とそれに対応する <code>id</code> を値として追加します。

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

`expand` アクションは、`bento-accordion` のセクションを展開します。セクションがすでに展開状態である場合は、展開されたままになります。引数なしで呼び出されると、アコーディオンのすべてのセクションが展開されます。特定のセクションを指定するには、`section` 引数を追加し、値にはそれに対応する <code>id</code> を使用します。

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

`collapse` アクションは、`bento-accordion` のセクションを折り畳みます。セクションがすでに折り畳み状態である場合は、折り畳まれたままになります。引数なしで呼び出されると、アコーディオンのすべてのセクションが折り畳まれます。特定のセクションを指定するには、`section` 引数を追加し、値にはそれに対応する <code>id</code> を使用します。

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### イベント

Bento Accordion API では、次のイベントに応答することができます。

##### onExpandStateChange

このイベントは、アコーディオンセクションが展開または折り畳まれており、展開済みのセクションから発行される場合にセクションに対してトリガーされます。

以下の例を参照してください。

##### onCollapse

このイベントは、アコーディオンセクションが折り畳まれており、その折り畳み済みのセクションから発行されるときにセクションに対してトリガーされます。

以下の例では、`section 1` は `expand` イベントをリスンし、展開されている場合に `section 2` を展開します。`section 2` は `collapse` イベントをリスンし、折り畳まれている場合に `section 1` を折り畳みます。

以下の例を参照してください。

```jsx
<BentoAccordion ref={ref}>
  <BentoAccordionSection
    id="section1"
    key={1}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section1 expanded' : 'section1 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 1</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 1</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section2"
    key={2}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section2 expanded' : 'section2 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 2</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 2</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section3"
    key={3}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section3 expanded' : 'section3 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 3</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 3</BentoAccordionContent>
  </BentoAccordionSection>
</BentoAccordion>
```

### レイアウトとスタイル

#### コンテナタイプ

`BentoAccordion` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネントにサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

または `className` を使用します。

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### プロップ

#### BentoAccordion

##### animate

true に設定されている場合、各セクションの展開と折りたたみ時に "roll-down" または "roll-up" アニメーションが使用されます。デフォルト: `false`

##### expandSingleSection

true に設定されている場合、展開される 1 つのセクションによって、ほかのすべてのセクションが自動的に折り畳まれます。デフォルト: `false`

#### BentoAccordionSection

##### animate

true に設定されている場合、各セクションの展開と折りたたみ時に "roll-down" または "roll-up" アニメーションが使用されます。デフォルト: `false`

##### expanded

true に設定されている場合、そのセクションが展開されます。デフォルト: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

展開状態の変化をリスンするコールバック。パラメーターにブール値のフラグを取り、セクションが今展開されたかどうかを示します（`false` は折り畳まれた状態であったことを示します）。

#### BentoAccordionHeader

#### 共通プロップ

このコンポーネントは React と Preact コンポーネントの[共通プロップ](../../../docs/spec/bento-common-props.md)をサポートしています。

BentoAccordionHeader はカスタムプロップに未対応です。

#### BentoAccordionContent

#### 共通プロップ

このコンポーネントは React と Preact コンポーネントの[共通プロップ](../../../docs/spec/bento-common-props.md)をサポートしています。

BentoAccordionContent はカスタムプロップに未対応です。
