# معرض Bento المضمن

يعرض الشرائح مع نقاط تقسيم الصفحات وصور مصغرة اختيارية.

الاستخدام

## مكون الويب

يجب تضمين كل مكتبة صفحات الأنماط المتتالية (CSS) المطلوبة لمكون Bento لضمان التحميل المناسب وقبل إضافة أنماط مخصصة. أو استخدم أنماط ما قبل الترقية منخفضة المستوى المتوفرة بشكل ضمني. راجع [التخطيط والنمط](#layout-and-style).

توضح الأمثلة أدناه استخدام مكون الويب `<bento-inline-gallery>`.

### مثال: استيراد عبر npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import {defineElement as defineBentoInlineGallery} from '@bentoproject/inline-gallery';
defineBentoInlineGallery();
```

### مثال: تضمين عبر `<script>`

يحتوي المثال التالي على `bento-inline-gallery` يتألف من ثلاث شرائح مع صور مصغرة ومؤشر صفحات.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>

  <script async src="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.js"></script>
  <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css">

  <script async src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"></script>
  <link rel="stylesheet" href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css">
<body>
  <bento-inline-gallery id="inline-gallery">
    <bento-inline-gallery-thumbnails style="height: 100px;" loop></bento-inline-gallery-thumbnails>

    <bento-base-carousel style="height: 200px;" snap-align="center" visible-count="3" loop>
      <img src="img1.jpeg" data-thumbnail-src="img1-thumbnail.jpeg" />
      <img src="img2.jpeg" data-thumbnail-src="img2-thumbnail.jpeg" />
      <img src="img3.jpeg" data-thumbnail-src="img3-thumbnail.jpeg" />
      <img src="img4.jpeg" data-thumbnail-src="img4-thumbnail.jpeg" />
      <img src="img5.jpeg" data-thumbnail-src="img5-thumbnail.jpeg" />
      <img src="img6.jpeg" data-thumbnail-src="img6-thumbnail.jpeg" />
    </bento-base-carousel>

    <bento-inline-gallery-pagination style="height: 20px;"></bento-inline-gallery-pagination>
  </bento-inline-gallery>
</body>
```

### المخطط والنمط

يحتوي كل مكون Bento على مكتبة CSS صغيرة يجب عليك تضمينها لضمان التحميل الصحيح بدون [تغييرات المحتوى](https://web.dev/cls/). ونظرًا للخصوصية المستندة على الأمر، يجب عليك التأكد يدويًا من تضمين صفحات الأنماط قبل أي أنماط مخصصة.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-inline-gallery-1.0.css"
/>
```

بدلاً من ذلك، يمكنك أيضًا توفير أنماط ما قبل الترقية منخفضة المستوى بشكل مضمّن:

```html
<style>
  bento-inline-gallery,
  bento-inline-gallery-pagination,
  bento-inline-gallery-thumbnails {
    display: block;
  }
  bento-inline-gallery {
    contain: layout;
  }
  bento-inline-gallery-pagination,
  bento-inline-gallery-thumbnails {
    overflow: hidden;
    position: relative;
  }
</style>
```

### السمات في `<bento-inline-gallery-pagination>`

#### `inset`

الافتراضي: `false`

سمة قيمة منطقية تشير إلى ما إذا كان يلزم عرض مؤشر حدود الصفحات كمجموعة داخلية أم لا (يغطي العرض الدوار نفسه)

### السمات في `<bento-inline-gallery-thumbnails>`

#### `aspect-ratio`

اختياري

رقم: نسبة العرض إلى الارتفاع الذي يجب عرض الشرائح من خلالها.

#### `loop`

الافتراضي: `false`

سمة قيمة منطقية تشير إلى ما إذا كان ينبغي أن تدور الصور المصغرة أم لا.

### التصميم

يمكنك استخدام محددات العناصر `bento-inline-gallery` و `bento-inline-gallery-pagination` و`bento-inline-gallery-thumbnails` و`bento-base-carousel` لتصميم مؤشر حدود الصفحات والعرض الدوار بحرية.

---

## مكون Preact/React

توضح الأمثلة أدناه استخدام `<BentoInlineGallery>` كمكون وظيفي قابل للاستخدام في مكتبات Preact أو React.

### مثال: استيراد عبر npm

```sh
npm install @bentoproject/inline-gallery
```

```javascript
import React from 'react';
import {BentoInlineGallery} from '@bentoproject/inline-gallery/react';
import '@bentoproject/inline-gallery/styles.css';

function App() {
  return (
    <BentoInlineGallery id="inline-gallery">
      <BentoInlineGalleryThumbnails aspect-ratio="1.5" loop />
      <BentoBaseCarousel snap-align="center" visible-count="1.2" loop>
        <img src="server.com/static/inline-examples/images/image1.jpg" />
        <img src="server.com/static/inline-examples/images/image2.jpg" />
        <img src="server.com/static/inline-examples/images/image3.jpg" />
      </BentoBaseCarousel>
      <BentoInlineGalleryPagination inset />
    </BentoInlineGallery>
  );
}
```

### المخطط والنمط

#### نوع الحاوية

يحتوي المكون `BentoInlineGallery` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وعناصره الفرعية المباشرة من خلال مخطط CSS المطلوب (مثل مخطط محدد بـ `width`). يمكن تطبيق هذه الخطوات ضمنيًا:

```jsx
<BentoInlineGallery style={{width: 300}}>...</BentoInlineGallery>
```

أو عبر `className`:

```jsx
<BentoInlineGallery className="custom-styles">...</BentoInlineGallery>
```

```css
.custom-styles {
  background-color: red;
}
```

<!-- TODO(wg-bento): This section was empty, fix it.
### Props for `BentoInlineGallery`
-->

### الخواص لـ `BentoInlineGalleryPagination`

بالإضافة إلى [الخصائص العامة](../../../docs/spec/bento-common-props.md)، يدعم BentoInlineGalleryPagination الخصائص التالية:

#### `inset`

الافتراضي: `false`

سمة قيمة منطقية تشير إلى ما إذا كان يلزم عرض مؤشر حدود الصفحات كمجموعة داخلية أم لا (يغطي العرض الدوار نفسه)

### الخواص لـ `BentoInlineGalleryThumbnails`

بالإضافة إلى [الخصائص العامة](../../../docs/spec/bento-common-props.md)، يدعم BentoInlineGalleryThumbnails الخصائص التالية:

#### `aspectRatio`

اختياري

رقم: نسبة العرض إلى الارتفاع التي يجب عرض الشرائح من خلالها.

#### `loop`

الافتراضي: `false`

سمة قيمة منطقية تشير إلى ما إذا كان ينبغي أن تدور الصور المصغرة أم لا.
