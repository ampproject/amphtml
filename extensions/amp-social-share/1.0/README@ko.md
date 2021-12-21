# Bento 소셜 공유

Bento Social Share 컴포넌트를 활용하면 소셜 플랫폼용 소셜 공유 버튼이 표시됩니다.

현재 Bento Social Share을 통해 생성된 버튼(사전 구성된 공급업체용 버튼 포함)은 장애 보조 기술(예: 스크린 리더)에 표시되는 라벨이나 접근 가능 이름(accessible name)이 없습니다. 설명 라벨이 있는 `aria-label`을 삽입해야 하며, 해당 라벨이 없을 경우 조작 요소가 라벨이 없는 ‘버튼’ 요소로 표시됩니다.

## 웹 컴포넌트

적절한 로딩을 보장하고 사용자 지정 스타일을 추가하기 전에 각 Bento 컴포넌트의 필수 CSS 라이브러리를 삽입해야 합니다. 또는 인라인으로 지원되는 경량의 사전 업그레이드 스타일을 사용해 보세요. [레이아웃 및 스타일](#layout-and-style)을 참조하시길 바랍니다.

`<bento-social-share>` 웹 컴포넌트의 활용 사례는 아래 예시에서 확인할 수 있습니다.

### 예시: npm을 통해 가져오기

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### 예시: `<script>`를 통해 삽입하기

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

### 레이아웃 및 스타일

Bento 컴포넌트에는 [콘텐츠 이동](https://web.dev/cls/) 없이 적절한 로드를 보장하는 데 필요한 작은 CSS 라이브러리가 있습니다. 순서 기반의 특수성으로 인해 사용자 지정 스타일보다 스타일시트가 먼저 삽입되어 있는지 수동으로 확인해야 합니다.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

또는 경량의 사전 업그레이드 스타일을 인라인으로 활용할 수도 있습니다.

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

#### 컨테이너 유형

`bento-social-share` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### 기본 스타일

기본적으로 `bento-social-share`에는 자주 사용되는 사전 구성된 일부 공급업체가 포함되어 있습니다. 해당 공급업체 버튼은 공급업체의 공식 색상 및 로고에 기반하여 스타일이 지정됩니다. 기본 너비는 60픽셀이고 기본 높이는 44픽셀입니다.

#### 사용자 지정 스타일

나만의 사용자 지정 스타일을 제공하고 싶은 경우엔 다음과 같이 제공된 스타일을 간편하게 재정의할 수 있습니다.

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

`bento-social-share`아이콘 스타일을 사용자 지정할 경우 사용자 지정된 아이콘이 공급업체(예: Twitter, Facebook 등)에서 설정한 브랜드 지침을 충족하는지 확인하세요.

### 접근성

#### 포커스 영역 표시

`bento-social-share` 요소에서 기본적으로 포커스 영역을 표시하는 방식은 파란색 윤곽선입니다. 또한 사용자가 페이지에서 함께 사용된 여러 개의 `bento-social-share` 요소를 누를 경우 쉽게 따라갈 수 있도록 기본값은 `tabindex=0`으로 설정됩니다.

기본 포커스 영역 표시는 다음 CSS 규칙 집합으로 설정할 수 있습니다.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

기본 포커스 영역 표시는 `style`태그 안에서 CSS 스타일을 정의하고 이를 포함하여 수 덮어쓸 수 있습니다. 아래 예시의 경우 첫 번째 CSS 규칙 집합은 `outline`프로퍼티를 `none`으로 설정하여 모든 `bento-social-share` 요소에서 포커스 영역 표시를 제거합니다. 두 번째 규칙 집합은 기본 파란색 대신 빨간색 윤곽선을 지정하고 `custom-focus` 클래스가 포함된 모든 `bento-social-share`의 `outline-offset`을 `3px`로 설정합니다.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

이러한 CSS 규칙을 사용하면 빨간색으로 윤곽선이 표시되도록 사용자 지정한 `custom-focus`가 `bento-social-share` 요소에 포함되지 않는 한 포커스 영역이 표시되지 않습니다.

#### 색상 대비

`type` 값이 `twitter`, `whatsapp` 또는 `line`인 `bento-social-share`는 포그라운드/백그라운드 색상 조합이 [WCAG 2.1 SC 1.4.11 텍스트가 아닌 경우 대비](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)에 명시된 내용에 따라 텍스트가 아닌 콘텐츠에 권장되는 3:1 경계값 미만인 버튼을 표시합니다.

대비가 충분하지 않으면 콘텐츠 인식이 쉽지 않아 식별하기 어려울 수 있습니다. 극단적인 경우 색상 인식 장애가 있는 사용자에게 대비가 낮은 콘텐츠가 전혀 보이지 않을 수도 있습니다. 상기 공유 버튼 예시의 경우 사용자가 공유 조작 요소가 무엇인지, 어떤 서비스와 관련이 있는지를 적절히 인식/이해하지 못할 수 있습니다.

### 사전 구성된 공급업체

`bento-social-share` 컴포넌트는 공유 엔드포인트 및 일부 기본 매개변수를 알고 있는 [사전 구성된 공급업체](./social-share-config.js)를 제공합니다.

<table>
  <tr>
    <th class="col-twenty">공급업체</th>
    <th class="col-twenty">유형</th>
    <th>매개변수</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a>(OS 공유 대화상자 트리거)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>이메일</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: 선택 사항</li>
        <li>
<code>data-param-body</code>: 선택 사항</li>
        <li>
<code>data-param-recipient</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>필수</strong>, 기본값: none. 이 매개변수는 <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">Facebook 공유 대화상자에</a> 필요한 Facebook <code>app_id</code>입니다.</li>
        <li>
<code>data-param-href</code>: 선택 사항</li>
        <li>
<code>data-param-quote</code>: 선택 사항, 인용문이나 텍스트 공유 시 사용할 수 있습니다.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: 선택 사항(단, 설정하는 것이 좋습니다). Pinterest에서 공유할 미디어의 URL입니다. 설정되지 않을 경우 Pinterest에서 최종 사용자에게 미디어 업로드를 요청합니다.</li>
        <li>
<code>data-param-url</code>: 선택 사항</li>
        <li>
<code>data-param-description</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: 선택 사항</li>
        <li>
<code>data-param-text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: 선택 사항</li>
        <li>
<code>data-param-text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: 선택 사항</li>
        <li>
<code>data-param-text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: 선택 사항</li>
</ul>
    </td>
  </tr>
</table>

### 사전 구성되지 않은 공급업체

사전 구성된 공급업체 외에도 `bento-social-share` 컴포넌트의 추가 속성을 지정하여 구성되지 않은 공급업체를 사용할 수 있습니다.

#### 예시: 구성되지 않은 공급업체용 공유 버튼 생성하기

다음 예시의 경우 `data-share-endpoint` 사용자 지정 프로토콜의 적절한 엔드포인트로 설정하여 Facebook Messenger를 통해 공유 버튼을 생성합니다.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

이러한 공급업체는 사전 구성되어 있지 않으므로 해당 공급업체에 적합한 버튼 이미지 및 스타일을 생성해야 합니다.

### 속성

#### type(필수)

공급업체 유형을 선택합니다. 이는 사전 구성된 공급업체 및 구성되지 않은 공급업체 모두에 필요합니다.

#### data-target

대상을 열기 위한 target 속성을 지정합니다. iOS 이메일/SMS를 제외한 모든 경우 기본값은`_blank`이나 iOS 이메일/SMS의 경우 대상이 `_top`으로 설정됩니다.

#### data-share-endpoint

이 속성은 구성되지 않은 공급업체에 필요합니다.

자주 사용되는 일부 공급업체의 경우 사전 구성된 공유 엔드포인트가 있습니다. 자세한 내용은 사전 구성된 공급업체 섹션을 참조하세요. 구성되지 않은 공급업체의 경우 공유 엔드포인트를 지정해야 합니다.

#### data-param-\*

`data-param-*` 접두어가 붙은 모든 속성은 URL 매개변수로 변경되며, 공유 엔드포인트로 전달됩니다.

#### aria-label

접근성을 위한 버튼 설명입니다. 권장 라벨은 "&lt;type&gt;에 공유"입니다.

---

## Preact/React 컴포넌트

아래의 예시는 Preact 또는 React 라이브러리와 함께 사용할 수 있는 함수형 컴포넌트로 `<BentoSocialShare>`가 활용된 방식을 보여줍니다.

### 예시: npm을 통해 가져오기

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

### 레이아웃 및 스타일

#### 컨테이너 유형

`BentoSocialShare` 컴포넌트의 경우 레이아웃 크기 유형이 정의되어 있습니다. 컴포넌트가 적절히 렌더링되려면 CSS 레이아웃(`height`, `width`, `aspect-ratio` 또는 기타 유사한 프로퍼티로 정의된 레이아웃)을 통해 컴포넌트와 직접 하위 요소(슬라이드)에 크기를 적용해야 합니다.

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

또는 `className`을 통해 적용 가능합니다.

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

### 접근성

#### 포커스 영역 표시

`BentoSocialShare` 요소에서 기본적으로 포커스 영역을 표시하는 방식은 파란색 윤곽선입니다. 또한 사용자가 페이지에서 함께 사용된 여러 개의 `BentoSocialShare` 요소를 누를 경우 쉽게 따라갈 수 있도록 기본값은 `tabindex=0`으로 설정됩니다.

기본 포커스 영역 표시는 다음 CSS 규칙 집합으로 설정할 수 있습니다.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

기본 포커스 영역 표시는 `style`태그 안에서 CSS 스타일을 정의하고 이를 포함하여 수 덮어쓸 수 있습니다. 아래 예시의 경우 첫 번째 CSS 규칙 집합은 `outline`프로퍼티를 `none`으로 설정하여 모든 `BentoSocialShare` 요소에서 포커스 영역 표시를 제거합니다. 두 번째 규칙 집합은 기본 파란색 대신 빨간색 윤곽선을 지정하고 `custom-focus` 클래스가 포함된 모든 `bento-social-share`의 `outline-offset`을 `3px`로 설정합니다.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

이러한 CSS 규칙을 사용하면 빨간색으로 윤곽선이 표시되도록 사용자 지정한 `custom-focus`가 `BentoSocialShare` 요소에 포함되지 않는 한 포커스 영역이 표시되지 않습니다.

#### 색상 대비

`type` 값이 `twitter`, `whatsapp` 또는 `line`인 `BentoSocialShare`는 포그라운드/백그라운드 색상 조합이 [WCAG 2.1 SC 1.4.11 텍스트가 아닌 경우 대비](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)에 명시된 내용에 따라 텍스트가 아닌 콘텐츠에 권장되는 3:1 경계값 미만인 버튼을 표시합니다.

대비가 충분하지 않으면 콘텐츠 인식이 쉽지 않아 식별하기 어려울 수 있습니다. 극단적인 경우 색상 인식 장애가 있는 사용자에게 대비가 낮은 콘텐츠가 전혀 보이지 않을 수도 있습니다. 상기 공유 버튼 예시의 경우 사용자가 공유 조작 요소가 무엇인지, 어떤 서비스와 관련이 있는지를 적절히 인식/이해하지 못할 수 있습니다.

### 사전 구성된 공급업체

`BentoSocialShare` 컴포넌트는 공유 엔드포인트 및 일부 기본 매개변수를 알고 있는 [사전 구성된 공급업체](./social-share-config.js)를 제공합니다.

<table>
  <tr>
    <th class="col-twenty">공급업체</th>
    <th class="col-twenty">유형</th>
    <th>
<code>param</code> 프로퍼티를 통한 매개변수</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">Web Share API</a>(OS 공유 대화상자 트리거)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>이메일</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: 선택 사항</li>
        <li>
<code>body</code>: 선택 사항</li>
        <li>
<code>recipient</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>: <strong>필수</strong>, 기본값: none. 이 매개변수는 <a>Facebook 공유 대화상자에</a> 필요한 Facebook <code>app_id</code>입니다.</li>
        <li>
<code>href</code>: 선택 사항</li>
        <li>
<code>quote</code>: 선택 사항, 인용문이나 텍스트 공유 시 사용할 수 있습니다.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: 선택 사항(단, 설정하는 것이 좋습니다). Pinterest에서 공유할 미디어의 URL입니다. 설정되지 않을 경우 Pinterest에서 최종 사용자에게 미디어 업로드를 요청합니다.</li>
        <li>
<code>url</code>: 선택 사항</li>
        <li>
<code>description</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: 선택 사항</li>
        <li>
<code>text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: 선택 사항</li>
        <li>
<code>text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: 선택 사항</li>
        <li>
<code>text</code>: 선택 사항</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: 선택 사항</li>
</ul>
    </td>
  </tr>
</table>

### 사전 구성되지 않은 공급업체

사전 구성된 공급업체 외에도 `BentoSocialShare` 컴포넌트의 추가 속성을 지정하여 구성되지 않은 공급업체를 사용할 수 있습니다.

#### 예시: 구성되지 않은 공급업체용 공유 버튼 생성하기

다음 예시의 경우 `data-share-endpoint` 사용자 지정 프로토콜의 적절한 엔드포인트로 설정하여 Facebook Messenger를 통해 공유 버튼을 생성합니다.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

이러한 공급업체는 사전 구성되어 있지 않으므로 해당 공급업체에 적합한 버튼 이미지 및 스타일을 생성해야 합니다.

### 프로퍼티

#### type(필수)

공급업체 유형을 선택합니다. 이는 사전 구성된 공급업체 및 구성되지 않은 공급업체 모두에 필요합니다.

#### background

나만의 사용자 지정 스타일을 제공하고 싶은 경우엔 백그라운드 색상을 설정하여 제공된 스타일을 간편하게 재정의할 수 있습니다.

`BentoSocialShare`아이콘 스타일을 사용자 지정할 경우 사용자 지정된 아이콘이 공급업체(예: Twitter, Facebook 등)에서 설정한 브랜드 지침을 충족하는지 확인하세요.

#### color

나만의 사용자 지정 스타일을 제공하고 싶은 경우엔 채울 색상을 설정하여 제공된 스타일을 간편하게 재정의할 수 있습니다.

`BentoSocialShare`아이콘 스타일을 사용자 지정할 경우 사용자 지정된 아이콘이 공급업체(예: Twitter, Facebook 등)에서 설정한 브랜드 지침을 충족하는지 확인하세요.

#### target

대상을 열기 위한 target 속성을 지정합니다. iOS 이메일/SMS를 제외한 모든 경우 기본값은`_blank`이나 iOS 이메일/SMS의 경우 대상이 `_top`으로 설정됩니다.

#### endpoint

이 프로퍼티는 구성되지 않은 공급업체에 필요합니다.

자주 사용되는 일부 공급업체의 경우 사전 구성된 공유 엔드포인트가 있습니다. 자세한 내용은 사전 구성된 공급업체 섹션을 참조하세요. 구성되지 않은 공급업체의 경우 공유 엔드포인트를 지정해야 합니다.

#### params

모든 `param` 프로퍼티는 URL 매개변수로 간주되고, 공유 엔드포인트에 전달됩니다.

#### aria-label

접근성을 위한 버튼 설명입니다. 권장 라벨은 "&lt;type&gt;에 공유"입니다.
