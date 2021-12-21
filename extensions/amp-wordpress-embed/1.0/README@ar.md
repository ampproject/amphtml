# المكون Bento WordPress Embed

## الاستخدام

نوافذ أطر مدمجة (iframe) تعرض [مقتبسًا](https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/) من صفحة أو منشور WordPress. استخدم Bento WordPress Embed كمكون ويب [`<bento-wordpress-embed>`](#web-component)، أو مكون وظيفي Preact/React [`<BentoWordPressed Embed>`](#preactreact-component).

### مكون الويب

يجب تضمين كل مكتبة صفحات الأنماط المتتالية (CSS) المطلوبة لمكون Bento لضمان التحميل المناسب وقبل إضافة أنماط مخصصة. أو استخدم أنماط ما قبل الترقية منخفضة المستوى المتوفرة بشكل ضمني. راجع [التخطيط والنمط](#layout-and-style).

توضح الأمثلة أدناه استخدام مكون الويب `<bento-wordpress-embed>`.

#### مثال: استيراد عبر npm

[مثال: معاينة= "إطار علوي" مساحة العمل= "خطأ"]

تثبيت عبر npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```javascript
import '@ampproject/bento-wordpress-embed';
```

[/مثال]

#### مثال: تضمين عبر `<script>`

[مثال: معاينة= "إطار علوي" مساحة العمل= "خطأ"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-wordpress-embed {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script async src="https://cdn.ampproject.org/v0/bento-wordpress-embed-1.0.js"></script>
</head>
<bento-wordpress-embed id="my-embed"
  data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></bento-wordpress-embed>
<div class="buttons" style="margin-top: 8px;">
  <button id="switch-button">Switch embed</button>
</div>

<script>
  (async () => {
    const embed = document.querySelector('#my-embed');
    await customElements.whenDefined('bento-wordpress-embed');

    // set up button actions
    document.querySelector('#switch-button').onclick = () => embed.setAttribute('data-url', 'https://make.wordpress.org/core/2021/09/09/core-editor-improvement-cascading-impact-of-improvements-to-featured-images/');
  })();
</script>
```

[/مثال]

#### المخطط والنمط

يحتوي كل مكون Bento على مكتبة CSS صغيرة يجب عليك تضمينها لضمان التحميل الصحيح بدون [تغييرات المحتوى](https://web.dev/cls/). ونظرًا للخصوصية المستندة على الأمر، يجب عليك التأكد يدويًا من تضمين صفحات الأنماط قبل أي أنماط مخصصة.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-wordpress-embed-1.0.css">
```

بدلاً من ذلك، يمكنك أيضًا توفير أنماط ما قبل الترقية منخفضة المستوى بشكل مضمّن:

```html
<style data-bento-boilerplate>
  bento-wordpress-embed {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**نوع الحاوية**

يحتوي المكون `bento-wordpress-embed` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وفروعه المباشرة (الشرائح) من خلال مخطط صفحات الأنماط المتتالية المطلوب (مثل مخطط محدد بـ `height` أو `width` أو `aspect-ratio`، أو خصائص أخرى):

```css
bento-wordpress-embed {
  height: 100px;
  width: 100%;
}
```

#### السمات

##### عنوان url للبيانات (مطلوب)

عنوان URL للنشر المطلوب تضمينه.

### مكون Preact/React

توضح الأمثلة أدناه استخدام `<BentoWordPressEmbed>` كمكون وظيفي قابل للاستخدام في مكتبات Preact أو React.

#### مثال: استيراد عبر npm

[مثال: معاينة= "إطار علوي" مساحة العمل= "خطأ"]

تثبيت عبر npm:

```sh
npm install @ampproject/bento-wordpress-embed
```

```jsx
import React from 'react';
import {BentoWordPressEmbed} from '@ampproject/bento-wordpress-embed/react';

function App() {
  return (
    <BentoWordPressEmbed
      url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
    ></BentoWordPressEmbed>
  );
}
```

[/مثال]

#### المخطط والنمط

**نوع الحاوية**

يحتوي المكون `BentoWordPressEmbed` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وفروعه المباشرة (الشرائح) من خلال مخطط صفحات الأنماط المتتالية المطلوب (مثل مخطط محدد بـ `height` أو `width` أو `aspect-ratio`، أو خصائص أخرى):

```jsx
<BentoWordPressEmbed style={{width: '100%', height: '100px'}}
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

أو عبر `className`:

```jsx
<BentoWordPressEmbed className="custom-styles"
  url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
></BentoWordPressEmbed>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

#### الخصائص

##### عنوان url (مطلوب)

عنوان URL للنشر المطلوب تضمينه.
