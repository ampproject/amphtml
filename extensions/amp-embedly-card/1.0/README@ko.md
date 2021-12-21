# Bento Embedly 카드

[Embedly 카드](http://docs.embed.ly/docs/cards)를 사용하여 통해 반응형의 공유 가능한 임베드를 제공합니다.

카드는 Embedly를 활용하는 가장 간편한 방법입니다. 카드는 모든 미디어에 반응형 임베드와 함께 기본 임베드 분석을 제공합니다.

유료 요금제를 이용 중이라면 `<bento-embedly-key>` 또는 `<BentoEmbedlyContext.Provider>` 컴포넌트를 통해 API 키를 설정하세요. 페이지당 하나의 Bento Embedly 키를 보유하면 카드에서 Embedly 브랜드를 제거할 수 있습니다. 페이지에 하나 또는 여러 개의 Bento Embedly Card 인스턴스를 삽입할 수 있습니다.

## 웹 컴포넌트

적절한 로딩을 보장하고 사용자 지정 스타일을 추가하기 전에 각 Bento 컴포넌트의 필수 CSS 라이브러리를 삽입해야 합니다. 또는 인라인으로 지원되는 경량의 사전 업그레이드 스타일을 사용해 보세요. [레이아웃 및 스타일](#layout-and-style)을 참조하시길 바랍니다.

`<bento-embedly-card>` 웹 컴포넌트의 활용 사례는 아래 예시에서 확인할 수 있습니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {defineElement as defineBentoEmbedlyCard} from '@bentoproject/embedly-card';
defineBentoEmbedlyCard();
```

### 예시: `<script>`를 통해 삽입하기

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

### 레이아웃 및 스타일

Bento 컴포넌트에는 [콘텐츠 이동](https://web.dev/cls/) 없이 적절한 로드를 보장하는 데 필요한 작은 CSS 라이브러리가 있습니다. 순서 기반의 특수성으로 인해 사용자 지정 스타일보다 스타일시트가 먼저 삽입되어 있는지 수동으로 확인해야 합니다.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css"
/>
```

또는 경량의 사전 업그레이드 스타일을 인라인으로 활용할 수도 있습니다.

```html
<style>
  bento-embedly-card {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### 컨테이너 유형

`bento-embedly-card` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```css
bento-embedly-card {
  height: 100px;
  width: 100%;
}
```

### 속성

#### `data-url`

임베딩 정보를 불러오는 URL입니다.

#### `data-card-embed`

동영상 또는 리치 미디어의 URL입니다. 카드의 정적 페이지 콘텐츠 대신 기사 등의 정적 임베드와 함께 사용하면 카드를 통해 동영상 또는 리치 미디어를 삽입할 수 있습니다.

#### `data-card-image`

이미지에 대한 URL입니다. `data-url`이 기사를 가리킬 경우 기사 카드에 사용할 이미지를 지정합니다. 모든 이미지 URL이 지원되지는 않습니다. 이미지가 로드되지 않은 경우 다른 이미지나 도메인을 사용해 보세요.

#### `data-card-controls`

공유 아이콘을 활성화합니다.

-   `0`: 공유 아이콘을 비활성화합니다
-   `1`: 공유 아이콘을 활성화합니다

기본값은 `1`입니다.

#### `data-card-align`

카드를 정렬합니다. 가능한 값은 `left`, `center` 및 `right`이며 기본값은 `center`입니다.

#### `data-card-recommend`

추천 기능이 지원될 경우 동영상 및 리치 카드에 대한 Embedly 추천 기능을 비활성화합니다. Embedly에서 생성된 추천 기능입니다.

-   `0`: Embedly 추천 기능을 비활성화합니다.
-   `1`: 추천 기능을 활성화합니다.

기본값은 `1`입니다.

#### `data-card-via`(선택 사항)

카드의 via 콘텐츠를 지정합니다. 이는 어트리뷰션을 수행하는 좋은 방법입니다.

#### `data-card-theme`(선택 사항)

메인 카드 컨테이너의 배경색을 변경하는 `dark` 테마를 설정할 수 있습니다. `dark`를 사용하여 이 테마를 설정하세요. 어두운 배경의 경우 이 속성을 지정하는 것이 좋습니다. 기본값은 `light`로, 메인 카드 컨테이너의 배경색을 설정하지 않습니다.

#### title(선택 사항)

기본 `<iframe>` 요소에 전달할 컴포넌트의 `title` 속성을 정의합니다. 기본값은 `"Embedly card"`입니다.

---

## Preact/React 컴포넌트

아래의 예시는 Preact 또는 React 라이브러리와 함께 사용할 수 있는 함수형 컴포넌트로 `<BentoEmbedlyCard>`가 활용된 방식을 보여줍니다.

### 예시: npm을 통해 가져오기

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

### 레이아웃 및 스타일

#### 컨테이너 유형

`BentoEmbedlyCard` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```jsx
<BentoEmbedlyCard
  style={{width: 300, height: 100}}
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

또는 `className`을 통해 적용 가능합니다.

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

### 프로퍼티

#### `url`

임베딩 정보를 불러오는 URL입니다.

#### `cardEmbed`

동영상 또는 리치 미디어의 URL입니다. 카드의 정적 페이지 콘텐츠 대신 기사 등의 정적 임베드와 함께 사용하면 카드를 통해 동영상 또는 리치 미디어를 삽입할 수 있습니다.

#### `cardImage`

이미지에 대한 URL입니다. `data-url`이 기사를 가리킬 경우 기사 카드에 사용할 이미지를 지정합니다. 모든 이미지 URL이 지원되지는 않습니다. 이미지가 로드되지 않은 경우 다른 이미지나 도메인을 사용해 보세요.

#### `cardControls`

공유 아이콘을 활성화합니다.

-   `0`: 공유 아이콘을 비활성화합니다
-   `1`: 공유 아이콘을 활성화합니다

기본값은 `1`입니다.

#### `cardAlign`

카드를 정렬합니다. 가능한 값은 `left`, `center` 및 `right`이며 기본값은 `center`입니다.

#### `cardRecommend`

추천 기능이 지원될 경우 동영상 및 리치 카드에 대한 Embedly 추천 기능을 비활성화합니다. Embedly에서 생성된 추천 기능입니다.

-   `0`: Embedly 추천 기능을 비활성화합니다.
-   `1`: 추천 기능을 활성화합니다.

기본값은 `1`입니다.

#### `cardVia`(선택 사항)

카드의 via 콘텐츠를 지정합니다. 이는 어트리뷰션을 수행하는 좋은 방법입니다.

#### `cardTheme`(선택 사항)

메인 카드 컨테이너의 배경색을 변경하는 `dark` 테마를 설정할 수 있습니다. `dark`를 사용하여 이 테마를 설정하세요. 어두운 배경의 경우 이 속성을 지정하는 것이 좋습니다. 기본값은 `light`로, 메인 카드 컨테이너의 배경색을 설정하지 않습니다.

#### title(선택 사항)

기본 `<iframe>` 요소에 전달할 컴포넌트의 `title` 속성을 정의합니다. 기본값은 `"Embedly card"`입니다.
