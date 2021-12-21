# المكون Bento Soundcloud

يقوم بتضمين مقطع [Soundcloud](https://soundcloud.com).

## مكون الويب

يجب تضمين كل مكتبة صفحات الأنماط المتتالية (CSS) المطلوبة لمكون Bento لضمان التحميل المناسب وقبل إضافة أنماط مخصصة. أو استخدم أنماط ما قبل الترقية منخفضة المستوى المتوفرة بشكل ضمني. راجع [التخطيط والنمط](#layout-and-style).

توضح الأمثلة أدناه استخدام مكون الويب `<bento-soundcloud>`.

### مثال: استيراد عبر npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### مثال: تضمين عبر `<script>`

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

### المخطط والنمط

يحتوي كل مكون Bento على مكتبة CSS صغيرة يجب عليك تضمينها لضمان التحميل الصحيح بدون [تغييرات المحتوى](https://web.dev/cls/). ونظرًا للخصوصية المستندة على الأمر، يجب عليك التأكد يدويًا من تضمين صفحات الأنماط قبل أي أنماط مخصصة.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

بدلاً من ذلك، يمكنك أيضًا توفير أنماط ما قبل الترقية منخفضة المستوى بشكل مضمّن:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### نوع الحاوية

يحتوي المكون `bento-soundcloud` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وفروعه المباشرة (الشرائح) من خلال مخطط صفحات الأنماط المتتالية المطلوب (مثل مخطط محدد بـ `height` أو `width` أو `aspect-ratio`، أو خصائص أخرى):

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### السمات

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>هذه السمة مطلوبة إذا لم يتم تحديد <code>data-playlistid</code>.<br> قيمة هذه السمة هي معرف تتبع، وهي عدد صحيح.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>هذه السمة مطلوبة إذا لم يتم تحديد <code>data-trackid</code>. قيمة هذه السمة هي معرف قائمة تشغيل، وهي عدد صحيح.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (اختياري)</strong></td>
    <td>الرمز المميز السري للتتبع، إذا كان خاصًا.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (اختياري)</strong></td>
    <td>في حالة التعيين إلى <code>true</code>، يعرض الوضع "مرئي" كامل العرض؛ بخلاف ذلك، يتم عرضه كوضع "كلاسيكي". القيمة الافتراضية هي <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (اختياري)</strong></td>
    <td>هذه السمة هي تجاوز لون مخصص للوضع "كلاسيكي". تم تجاهل السمة بالوضع "مرئي". حدد قيمة لون ست عشرية بدون البادئة # (على سبيل المثال، <code>data color="e540ff"</code>).</td>
  </tr>
</table>

---

## مكون Preact/React

توضح الأمثلة أدناه استخدام `<BentoSoundcloud>` كمكون وظيفي قابل للاستخدام في مكتبات Preact أو React.

### مثال: استيراد عبر npm

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

### المخطط والنمط

#### نوع الحاوية

يحتوي المكون `BentoSoundcloud` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وفروعه المباشرة (الشرائح) من خلال مخطط صفحات الأنماط المتتالية المطلوب (مثل مخطط محدد بـ `height` أو `width` أو `aspect-ratio`، أو خصائص أخرى):

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

أو عبر `className`:

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

### الخصائص

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>هذه السمة مطلوبة إذا لم يتم تحديد <code>data-playlistid</code>.<br> قيمة هذه السمة هي معرف تتبع، وهي عدد صحيح.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>هذه السمة مطلوبة إذا لم يتم تحديد <code>data-trackid</code>. قيمة هذه السمة هي معرف قائمة تشغيل، وهي عدد صحيح.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (اختياري)</strong></td>
    <td>الرمز المميز السري للتتبع، إذا كان خاصًا.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (اختياري)</strong></td>
    <td>في حالة التعيين إلى <code>true</code>، يعرض الوضع "مرئي" كامل العرض؛ بخلاف ذلك، يتم عرضه كوضع "كلاسيكي". القيمة الافتراضية هي <code>false</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (اختياري)</strong></td>
    <td>هذه السمة هي تجاوز لون مخصص للوضع "كلاسيكي". تم تجاهل السمة بالوضع "مرئي". حدد قيمة لون ست عشرية بدون البادئة # (على سبيل المثال، <code>data color="e540ff"</code>).</td>
  </tr>
</table>
