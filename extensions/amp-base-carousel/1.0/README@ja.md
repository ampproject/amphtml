# Bento Carousel

似たようなコンテンツピースを縦軸または横軸に沿って表示するための汎用カルーセルです。

各コンポーネントの直下の子要素は、カルーセルの項目としてみなされます。各項目ノードには、任意の子要素を指定することもできます。

カルーセルは任意の数のアイテムと、アイテムを 1 つずつ先送りまたは巻き戻しするためのオプションのナビゲーション矢印で構成されます。

カルーセルは、ユーザーがスワイプしたり、カスタマイズ可能な矢印ボタンを使用したりすると、アイテムから次のアイテムに進みます。

## ウェブコンポーネント

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

以下は、`<bento-base-carousel>` ウェブコンポーネントの使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### 例: `<script>` によるインクルード

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-base-carousel {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
  ></script>
  <style>
    bento-base-carousel,
    bento-base-carousel > div {
      aspect-ratio: 4/1;
    }
    .red {
      background: darkred;
    }
    .blue {
      background: steelblue;
    }
    .green {
      background: seagreen;
    }
  </style>
</head>
<bento-base-carousel id="my-carousel">
  <div class="red"></div>
  <div class="blue"></div>
  <div class="green"></div>
</bento-base-carousel>
<div class="buttons" style="margin-top: 8px">
  <button id="prev-button">Go to previous slide</button>
  <button id="next-button">Go to next slide</button>
  <button id="go-to-button">Go to slide with green gradient</button>
</div>

<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('bento-base-carousel');
    const api = await carousel.getApi();

    // programatically advance to next slide
    api.next();

    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

### インタラクティビティと API の使用

スタンドアロンのウェブコンポーネントとして使用される Bento 対応のコンポーネントには、API を通じた高いインタラクティブ性があります。`bento-base-carousel` コンポーネント API にアクセスするには、次のスクリプトタグをドキュメントに含めます。

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### アクション

`bento-base-carousel` API では、次のアクションを実行できます。

##### next()

`advance-count` スライドずつ、カルーセルを先送りします。

```javascript
api.next();
```

##### prev()

`advance-count` スライドずつ、カルーセルを巻き戻します。

```javascript
api.prev();
```

##### goToSlide(index: number)

`index` 引数で指定されたスライドにカルーセルを移動します。注意: `index` は `0` 以上スライド数未満の数に正規化されます。

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### イベント

`bento-base-carousel` API では、次のイベントを登録し、それに応答することができます。

##### slideChange

このイベントは、カルーセルが表示するインデックスに変更があるとトリガーされます。新しいインデックスは、`event.data.index` を使って使用できます。

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### レイアウトとスタイル

各 Bento コンポーネントには、[コンテンツシフト](https://web.dev/cls/)を発生させずに適切に読み込まれることを保証するために含める必要のある小さな CSS ライブラリがあります。読み取り順が重要であるため、カスタムスタイルの前にスタイルシートがインクルードされていることを手動で確認する必要があります。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

または、軽量のアップグレード前のスタイルをインラインで使用可能にすることもできます。

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### コンテナタイプ

`bento-base-carousel` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### 右から左へのスライドの変更

`<bento-base-carousel>` は、右から左書き（rtl）コンテキスト（アラビア語、ヘブライ語など）の場合にそれを定義する必要があります。カルーセルは通常、これが定義されていなくても機能しますが、いくつかのバグが生じる可能性があります。カルーセルに `rtl` で動作するように指示するには、次のように行います。

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

カルーセルが RTL コンテキストであるにもかかわらず、LTR として動作する必要がある場合は、カルーセルに明示的に `dir="ltr"` を設定できます。

### スライドのレイアウト

スライドのサイズは、`mixed-lengths` を**指定しない**場合に、カルーセルによって自動的に設定されます。

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

スライドには、カルーセルがレイアウトされた場合に暗示的な高さがあります。これは、CSS を使うと簡単に変更できます。高さを指定する際、スライドはカルーセル内で縦方向中央に整列されます。

スライドのコンテンツを横方向中央に整列する場合は、ラッピングする要素を作成し、それを使用してコンテンツを中央揃えにしてください。

### 表示スライドの数

`visible-slides` を使って表示スライド数を変更する場合、メディアクエリに応答して、カルーセル自体のアスペクト比を新しい表示スライド数に一致するように変更します。たとえば、1:1 のアスペクト比で一度に 3 つのスライドを表示する場合、カルーセル自体には 3:1 のアスペクト比を指定する必要があります。同様に、1:1 のアスペクト比で一度に 4 つのスライドを表示する場合は、4:1 のアスペクト比を指定する必要があります。また、`visible-slides` を変更する場合は、`advance-count` を変更します。

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<bento-base-carousel
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <img style="height: 100%; width: 100%" src="…" />
  …
</bento-base-carousel>
```

### 属性

#### メディアクエリ

`<bento-base-carousel>` の属性は、[メディアクエリ](./../../../docs/spec/amp-html-responsive-attributes.md)に基づいて異なるオプションを使用するように構成できます。

#### 表示スライドの数

##### mixed-length

`true` または `false` で、デフォルトは `false` です。true の場合、各スライドに対して既存の幅（または水平の場合は高さ）を使用します。このため、幅の異なるスライドを使用するカルーセルを使用することができます。

##### visible-count

数値で、デフォルトは `1` です。指定された回数でいくつのスライドが表示されるかを決定します。余分なスライドの一部が表示されるようにするには、小数値を使用できます。このオプションは、`mixed-length` が `true` である場合に無視されます。

##### advance-count

数値で、デフォルトは `1` です。前へまたは次へ矢印を使用してカルーセルが先送りされるときに、先送りされるスライドの数を決定します。これは、`visible-count` 属性を指定するときに役立ちます。

#### 自動先送り

##### auto-advance

`true` または `false` で、デフォルトは `false` です。遅延に基づいて、カルーセルを次のスライドに自動的に先送りします。ユーザーが手動でスライドを変更すると、自動先送りは停止します。`loop` が有効でない場合、最後のアイテムに到達すると、自動先送りによって最初のアイテムに戻されます。

##### auto-advance-count

数値で、デフォルトは `1` です。自動的に先送りするときの、先送りされるスライドの数を決定します。これは、`visible-count` 属性を指定するときに役立ちます。

##### auto-advance-interval

数値で、デフォルトは `1000` です。カルーセルが自動的に先送りする時間間隔をミリ秒で指定します。

##### auto-advance-loops

数値で、デフォルトは `∞` です。カルーセルが停止するまでに先送りする回数です。

#### スナップ

##### snap

`true` または `false` で、デフォルトは `true` です。スクロール中にカルーセルをスライドにスナップするかどうかを決定します。

##### snap-align

`start` または `center` です。start 整列である場合、スライドの先頭（横方向整列の場合は左端のスライド）がカルーセルの開始に整列されます。center 整列である場合、スライドの中央がカルーセルの中央に整列されます。

##### snap-by

数値で、デフォルトは `1` です。これは、スナップの精度を決定し、`visible-count` を使用する際に役立ちます。

#### その他

##### controls

`"always"`、`"auto"`、または `"never"` のいずれかで、デフォルトは `"auto"` です。これは、前へまたは次へのナビゲーション矢印を表示するかとそのタイミングを決定します。注意: `outset-arrows` が `true` の場合、矢印は `"always"` で表示されます。

-   `always`: 矢印は常に表示されます。
-   `auto`: 矢印は、カルーセルの直近の操作がマウス操作であった場合に表示され、タッチ操作であった場合に表示されません。タッチデバイスの場合、初回ロード時にには矢印は最初の操作が発生するまで表示されます。
-   `never`: 矢印は絶対に表示されません。

##### slide

数値で、デフォルトは `0` です。これは、カルーセルに最初に表示されるスライドを決定します。これは、`Element.setAttribute` を使って、どのスライドが現在表示されているかを制御するように変更されることがあります。

##### loop

`true` または `false` のいずれかで、省略された場合のデフォルトは `false` です。true の場合、ユーザーが最初のアイテムから最後のアイテム（またはその逆）にカルーセルを移動することができます。ループさせるには、少なくとも `visible-count` のスライド数の 3 倍の数のスライドが存在する必要があります。

##### orientation

`horizontal` または `vertical` のいずれかで、デフォルトは `horizontal` です。`horizontal` の場合、カルーセルは水平に配置され、ユーザーは左右にスワイプすることができます。`vertical` の場合、カルーセルは縦方向に配置され、ユーザーは上下にスワイプすることができます。

### スタイル設定

`bento-base-carousel` 要素セレクタを使用して、カルーセルのスタイルを自由に設定することができます。

#### 矢印ボタンのカスタマイズ

矢印ボタンは、独自のカスタムマークアップを渡してカスタマイズできます。たとえば、次の HTML と CSS を使って、デフォルトのスタイルを作り直すことができます。

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<bento-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</bento-base-carousel>
```

---

## Preact/React コンポーネント

以下は、Preact または React ライブラリと使用可能な関数コンポーネントとして、`<BentoBaseCarousel>` の使用例を示しています。

### 例: npm によるインポート

```sh
npm install @bentoproject/base-carousel
```

```javascript
import React from 'react';
import {BentoBaseCarousel} from '@bentoproject/base-carousel/react';
import '@bentoproject/base-carousel/styles.css';

function App() {
  return (
    <BentoBaseCarousel>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

### インタラクティビティと API の使用

Bento コンポーネントには、API を通じた高いインタラクティブ性があります。`BentoBaseCarousel` コンポーネント API にアクセスするには、`ref` を渡します。

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoBaseCarousel ref={ref}>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

#### アクション

`BentoBaseCarousel` API では、次のアクションを実行できます。

##### next()

`advanceCount` スライドずつ、カルーセルを先送りします。

```javascript
ref.current.next();
```

##### prev()

`advanceCount` スライドずつ、カルーセルを巻き戻します。

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

`index` 引数で指定されたスライドにカルーセルを移動します。注意: `index` は `0` 以上スライド数未満の数に正規化されます。

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### イベント

`BentoBaseCarousel` API では、次のイベントを登録し、それに応答することができます。

##### onSlideChange

このイベントは、カルーセルが表示するインデックスに変更があるとトリガーされます。

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### レイアウトとスタイル

#### コンテナタイプ

`BentoBaseCarousel` コンポーネントには、定義済みのレイアウトサイズタイプがあります。コンポーネントが正しくレンダリングされるようにするには、目的の CSS レイアウト（`height`、`width`、`aspect-ratio`、またはその他の該当するプロパティで定義されたもの）を使って、コンポーネントとその直下の子コンポーネント（スライド）にサイズを必ず適用してください。これらはインラインで適用できます。

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

または `className` を使用します。

```jsx
<BentoBaseCarousel className="custom-styles">
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}

.custom-styles > * {
  aspect-ratio: 4/1;
}
```

### 右から左へのスライドの変更

`BentoBaseCarousel` は、右から左書き（rtl）コンテキスト（アラビア語、ヘブライ語など）の場合にそれを定義する必要があります。カルーセルは通常、これが定義されていなくても機能しますが、いくつかのバグが生じる可能性があります。カルーセルに `rtl` で動作するように指示するには、次のように行います。

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

カルーセルが RTL コンテキストであるにもかかわらず、LTR として動作する必要がある場合は、カルーセルに明示的に `dir="ltr"` を設定できます。

### スライドのレイアウト

スライドのサイズは、<code>mixedLengths</code> を<strong>指定しない</strong>場合に、カルーセルによって自動的に設定されます。

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

スライドには、カルーセルがレイアウトされた場合に暗示的な高さがあります。これは、CSS を使うと簡単に変更できます。高さを指定する際、スライドはカルーセル内で縦方向中央に整列されます。

スライドのコンテンツを横方向中央に整列する場合は、ラッピングする要素を作成し、それを使用してコンテンツを中央揃えにしてください。

### 表示スライドの数

`visibleSlides` を使って表示スライド数を変更する場合、メディアクエリに応答して、カルーセル自体のアスペクト比を新しい表示スライド数に一致するように変更します。たとえば、1:1 のアスペクト比で一度に 3 つのスライドを表示する場合、カルーセル自体には 3:1 のアスペクト比を指定する必要があります。同様に、1:1 のアスペクト比で一度に 4 つのスライドを表示する場合は、4:1 のアスペクト比を指定する必要があります。また、`visible-slides` を変更する場合は、`advance-count` を変更します。

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel
  visibleCount={count}
  advanceCount={count}
>
  <img style={{height: '100%', width: '100%'}} src="…" />
  …
</BentoBaseCarousel>
```

### プロップ

#### 表示スライドの数

##### mixedLength

`true` または `false` で、デフォルトは `false` です。true の場合、各スライドに対して既存の幅（または水平の場合は高さ）を使用します。このため、幅の異なるスライドを使用するカルーセルを使用することができます。

##### visibleCount

数値で、デフォルトは `1` です。指定された回数でいくつのスライドが表示されるかを決定します。余分なスライドの一部が表示されるようにするには、小数値を使用できます。このオプションは、`mixedLength` が `true` である場合に無視されます。

##### advanceCount

数値で、デフォルトは `1` です。前へまたは次へ矢印を使用してカルーセルが先送りされるときに、先送りされるスライドの数を決定します。これは、`visibleCount` 属性を指定するときに役立ちます。

#### 自動先送り

##### autoAdvance

`true` または `false` で、デフォルトは `false` です。遅延に基づいて、カルーセルを次のスライドに自動的に先送りします。ユーザーが手動でスライドを変更すると、自動先送りは停止します。`loop` が有効でない場合、最後のアイテムに到達すると、自動先送りによって最初のアイテムに戻されます。

##### autoAdvanceCount

数値で、デフォルトは `1` です。自動的に先送りするときの、先送りされるスライドの数を決定します。これは、`visible-count` 属性を指定するときに役立ちます。

##### autoAdvanceInterval

数値で、デフォルトは `1000` です。カルーセルが自動的に先送りする時間間隔をミリ秒で指定します。

##### autoAdvanceLoops

数値で、デフォルトは `∞` です。カルーセルが停止するまでに先送りする回数です。

#### スナップ

##### snap

`true` または `false` で、デフォルトは `true` です。スクロール中にカルーセルをスライドにスナップするかどうかを決定します。

##### snapAlign

`start` または `center` です。start 整列である場合、スライドの先頭（横方向整列の場合は左端のスライド）がカルーセルの開始に整列されます。center 整列である場合、スライドの中央がカルーセルの中央に整列されます。

##### snapBy

数値で、デフォルトは `1` です。これは、スナップの精度を決定し、`visible-count` を使用する際に役立ちます。

#### その他

##### controls

`"always"`、`"auto"`、または `"never"` のいずれかで、デフォルトは `"auto"` です。これは、前へまたは次へのナビゲーション矢印を表示するかとそのタイミングを決定します。注意: `outset-arrows` が `true` の場合、矢印は `"always"` で表示されます。

-   `always`: 矢印は常に表示されます。
-   `auto`: 矢印は、カルーセルの直近の操作がマウス操作であった場合に表示され、タッチ操作であった場合に表示されません。タッチデバイスの場合、初回ロード時にには矢印は最初の操作が発生するまで表示されます。
-   `never`: 矢印は絶対に表示されません。

##### defaultSlide

数字で、デフォルトは `0` です。これは、カルーセルに表示される最初のスライドを決定します。

##### loop

`true` または `false` のいずれかで、省略された場合のデフォルトは `false` です。true の場合、ユーザーが最初のアイテムから最後のアイテム（またはその逆）にカルーセルを移動することができます。ループさせるには、少なくとも `visible-count` のスライド数の 3 倍の数のスライドが存在する必要があります。

##### orientation

`horizontal` または `vertical` のいずれかで、デフォルトは `horizontal` です。`horizontal` の場合、カルーセルは水平に配置され、ユーザーは左右にスワイプすることができます。`vertical` の場合、カルーセルは縦方向に配置され、ユーザーは上下にスワイプすることができます。

### スタイル設定

`BentoBaseCarousel` 要素セレクタを使用して、カルーセルのスタイルを自由に設定することができます。

#### 矢印ボタンのカスタマイズ

矢印ボタンは、独自のカスタムマークアップを渡してカスタマイズできます。たとえば、次の HTML と CSS を使って、デフォルトのスタイルを作り直すことができます。

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```jsx
function CustomPrevButton(props) {
  return <button {...props} className="carousel-prev" />;
}

function CustomNextButton(props) {
  return <button {...props} className="carousel-prev" />;
}

<BentoBaseCarousel
  arrowPrevAs={CustomPrevButton}
  arrowNextAs={CustomNextButton}
>
  <div>first slide</div>
  // …
</BentoBaseCarousel>
```
