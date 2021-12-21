# Bento Social Share

يعرض زر مشاركة للمنصات الاجتماعية أو المشاركة عبر نظام.

في الوقت الحالي، لا يوجد أي من الأزرار التي تم إنشاؤها بواسطة Bento Social Share (بما في ذلك الأزرار الخاصة بالمزودين مسبقة التكوين) تحمل تسمية أو اسم يمكن الوصول إليه يتم تعريضه للتقنيات المساعدة (مثل قارئات الشاشة). تأكد من تضمين `aria-label` مع تسمية وصفية، وإلا سيتم الإعلان عن عناصر التحكم هذه كعناصر "زر" بدون تسمية.

## مكون الويب

يجب تضمين كل مكتبة صفحات الأنماط المتتالية (CSS) المطلوبة لمكون Bento لضمان التحميل المناسب وقبل إضافة أنماط مخصصة. أو استخدم أنماط ما قبل الترقية منخفضة المستوى المتوفرة بشكل ضمني. راجع [التخطيط والنمط](#layout-and-style).

توضح الأمثلة أدناه استخدام مكون الويب `<bento-social-share>{/code0.`

### مثال: استيراد عبر npm

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### مثال: تضمين عبر `<script>`

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

### المخطط والنمط

يحتوي كل مكون Bento على مكتبة CSS صغيرة يجب عليك تضمينها لضمان التحميل الصحيح بدون [تغييرات المحتوى](https://web.dev/cls/). ونظرًا للخصوصية المستندة على الأمر، يجب عليك التأكد يدويًا من تضمين صفحات الأنماط قبل أي أنماط مخصصة.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

بدلاً من ذلك، يمكنك أيضًا توفير أنماط ما قبل الترقية منخفضة المستوى بشكل مضمّن:

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

#### نوع الحاوية

يحتوي المكون `bento-social-share` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وعناصره الفرعية المباشرة (الشرائح) من خلال مخطط صفحات الأنماط المتتالية المطلوب (مثل مخطط محدد بـ `height` أو `width` أو `aspect-ratio`، أو خصائص أخرى):

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### الأنماط الافتراضية

بشكل افتراضي، تتضمن `bento-social-share` بعض المزوِّدين الشائعين المكوَّنين مسبقًا. ويتم تصميم الأزرار الخاصة بهؤلاء المزودين باللون والشعار الرسمي للمزود. والعرض الافتراضي هو 60 بكسل، والارتفاع الافتراضي هو 44 بكسل.

#### أنماط مخصصة

أحيانًا تريد تقديم أسلوبك الخاص. يمكنك ببساطة تجاوز الأنماط المقدمة مثل ما يلي:

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

عند تخصيص نمط أيقونة `bento-social-share`، يرجى التأكد من أن الأيقونة المخصصة تلبي إرشادات العلامة التجارية التي حددها المزود (مثل Twitter وFacebook وما إلى ذلك).

### إمكانية الوصول

#### إشارة التركيز

يتم تعيين قيمة العنصر `bento-social-share` افتراضيًا إلى مخطط تفصيلي أزرق كمؤشر تركيز مرئي. كما يعين القيمة الافتراضية لـ `tabindex=0` مما يجعل من السهل على المستخدم المتابعة أثناء قيامه بالتنقل عبر عناصر `bent-social-share` المتعددة المستخدمة معًا في الصفحة.

يتم تحقيق مؤشر التركيز الافتراضي بمجموعة قواعد أوراق الأنماط (CSS) المتتالية التالية.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

يمكن استبدال مؤشر التركيز الافتراضي من خلال تحديد أنماط CSS المتتالية للتركيز وتضمينها في علامة `style`. في المثال أدناه، تزيل مجموعة قواعد CSS الأولى مؤشر التركيز على جميع عناصر `bento-social-share` من خلال إعداد خاصية `outline` على `none`. وتحدد مجموعة القواعد الثانية مخططًا تفصيليًا أحمرًا (بدلاً من الأزرق الافتراضي) وتقوم أيضًا بتعيين `outline-offset` لتصبح `3px` لجميع عناصر `bento-social-share` بالفئة `custom-focus`.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

باستخدام قواعد CSS المتتالية هذه، لن تظهر عناصر `bento-social-share` مؤشر التركيز المرئي ما لم تتضمن الفئة `custom-focus` وفي هذه الحالة سيتشتمل على المؤشر الأحمر المفصل.

#### تباين الألوان

لاحظ أن `bento-social-share` بالقيمة `type` لـ `twitter` أو `whatsapp` أو `line` سيعرض زرًا بمجموعة ألوان المقدمة/الخلفية التي تقل عن الحد 3:1 الموصى به للمحتوى غير النصي المحدد في [تباين غير نصي WCAG 2.1 SC 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

وبدون تباين كاف، قد يكون من الصعب إدراك المحتوى وبالتالي يصعب تحديده. في الحالات القصوى، قد لا يكون المحتوى ذو التباين المنخفض مرئيًا على الإطلاق للأشخاص الذين يعانون من ضعف إدراك الألوان. وفي حالة وجود أزرار المشاركة المذكورة أعلاه، قد لا يكون المستخدمون قادرين على إدراك/فهم ما هي عناصر التحكم في المشاركة بشكل مناسب، وما هي الخدمة التي تتعلق بها.

### المزودون المكونون مسبقًا

يوفر المكون `bent-social-share` [بعض المزوِّدين المكوَّنين مسبقًا](./social-share-config.js) الذين يعرفون نقاط نهاية المشاركة الخاصة بهم بالإضافة إلى بعض المعلمات الافتراضية.

<table>
  <tr>
    <th class="col-twenty">المزود</th>
    <th class="col-twenty">النوع</th>
    <th>المعلمات</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">واجهة برمجة تطبيقات مشاركة الويب</a> (يتم بدء تشغيل مربع حوار مشاركة نظام التشغيل)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>البريد الإلكتروني</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: اختياري</li>
        <li>
<code>data-param-body</code>: اختياري</li>
        <li>
<code>data-param-recipient</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>المطلوب</strong>، يتم تعيينه افتراضيًا إلى: لا شيء. هذه المعلمة هي Facebook <code>app_id</code> المطلوب <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">لحوار مشاركة Facebook</a>.</li>
        <li>
<code>data-param-href</code>: اختياري</li>
        <li>
<code>data-param-quote</code>: اختياري، يمكن استخدامه لمشاركة اقتباس أو نص.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: اختياري (لكن يوصى بتعيينه بشدة). عنوان Url للوسائط المراد مشاركتها على Pinterest. وفي حالة عدم التعيين، سيُطلب من المستخدم النهائي تحميل وسائط بواسطة Pinterest.</li>
        <li>
<code>data-param-url</code>: اختياري</li>
        <li>
<code>data-param-description</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: اختياري</li>
        <li>
<code>data-param-text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: اختياري</li>
        <li>
<code>data-param-text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: اختياري</li>
        <li>
<code>data-param-text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: اختياري</li>
</ul>
    </td>
  </tr>
</table>

### المزودون غير المكوَّنين

بالإضافة إلى المزوِّدين المكوَّنين مسبقًا، يمكنك استخدام مزوِّدين غير مكوَّنين من خلال تحديد سمات إضافية في المكون `bent-social-share`.

#### مثال: إنشاء زر مشاركة لمزوِّد غير مكوَّن

المثال التالي ينشئ زر مشاركة عبر Facebook Messenger من خلال تعيين السمة `data-share-endpoint` إلى نقطة النهاية الصحيحة للبروتوكول المخصص لـ Facebook Messenger.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

ونظرًا لعدم تكوين هؤلاء المزوِّدين مسبقًا، فستحتاج إلى إنشاء صورة الزر وأنماطه المناسبة للمزوِّد.

### السمات

#### type (مطلوب)

تحديد نوع مزوِّد. وهذا مطلوب لكل من المزوِّدين المكوَّنين مسبقًا وغير المكوَّنين.

#### data-target

تحديد الهدف الذي يتم فيه فتح الهدف. والافتراضي هو `_blank` لجميع الحالات بخلاف البريد إلى `_top`.

#### data-share-endpoint

هذه السمة مطلوبة للمزوِّدين غير المكوَّنين.

بعض المزودين الشائعين لديهم نقاط نهاية مشاركة مكونة مسبقًا. وللحصول على التفاصيل، راجع قسم المزوِّدين المكوَّنين مسبقًا. أما المزوِّدين غير المكوَّنين، فستحتاج إلى تحديد نقطة نهاية المشاركة.

#### data-param-*

يتم تحويل جميع السمات البادئة بـ `data-param-*` إلى معلمات عناوين URL ويتم تمريرها إلى نقطة نهاية المشاركة.

#### aria-label

وصف زر إمكانية الوصول. والتسمية الموصى بها هي "مشاركة على &lt;type&gt;".

---

## مكون Preact/React

توضح الأمثلة أدناه استخدام `<BentoSocialShare>` كمكون وظيفي قابل للاستخدام في مكتبات Preact أو React.

### مثال: استيراد عبر npm

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

### المخطط والنمط

#### نوع الحاوية

يحتوي المكون `BentoSocialShare` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وفروعه المباشرة (الشرائح) من خلال مخطط صفحات الأنماط المتتالية المطلوب (مثل مخطط محدد بـ `height` أو `width` أو `aspect-ratio`، أو خصائص أخرى):

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

أو عبر `className`:

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

### إمكانية الوصول

#### إشارة التركيز

يتم تعيين قيمة العنصر `BentoSocialShare` افتراضيًا إلى مخطط تفصيلي أزرق كمؤشر تركيز مرئي. كما يعين القيمة الافتراضية لـ `tabindex=0` مما يجعل من السهل على المستخدم المتابعة أثناء قيامه بالتنقل عبر عناصر `BentoSocialShare` المتعددة المستخدمة معًا في الصفحة.

يتم تحقيق مؤشر التركيز الافتراضي بمجموعة قواعد أوراق الأنماط (CSS) المتتالية التالية.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

يمكن استبدال مؤشر التركيز الافتراضي من خلال تحديد أنماط CSS المتتالية للتركيز وتضمينها في علامة `style`. في المثال أدناه، تزيل مجموعة قواعد CSS الأولى مؤشر التركيز على جميع عناصر `BentoSocialShare` من خلال إعداد خاصية `outline` على `none`. وتحدد مجموعة القواعد الثانية مخططًا تفصيليًا أحمرًا (بدلاً من الأزرق الافتراضي) وتقوم أيضًا بتعيين `outline-offset` لتصبح `3px` لجميع عناصر `BentoSocialShare` بالفئة `custom-focus`.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

باستخدام قواعد CSS المتتالية هذه، لن تظهر عناصر `BentoSocialShare` مؤشر التركيز المرئي ما لم تتضمن الفئة `custom-focus` وفي هذه الحالة سيتشتمل على المؤشر الأحمر المفصل.

#### تباين الألوان

لاحظ أن `bento-social-share` بالقيمة `type` لـ `twitter` أو `whatsapp` أو `line` سيعرض زرًا بمجموعة ألوان المقدمة/الخلفية التي تقل عن الحد 3:1 الموصى به للمحتوى غير النصي المحدد في [تباين غير نصي WCAG 2.1 SC 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

وبدون تباين كاف، قد يكون من الصعب إدراك المحتوى وبالتالي يصعب تحديده. في الحالات القصوى، قد لا يكون المحتوى ذو التباين المنخفض مرئيًا على الإطلاق للأشخاص الذين يعانون من ضعف إدراك الألوان. وفي حالة وجود أزرار المشاركة المذكورة أعلاه، قد لا يكون المستخدمون قادرين على إدراك/فهم ما هي عناصر التحكم في المشاركة بشكل مناسب، وما هي الخدمة التي تتعلق بها.

### المزودون المكونون مسبقًا

يوفر المكون `BentoSocialShare` [بعض المزوِّدين المكوَّنين مسبقًا](./social-share-config.js) الذين يعرفون نقاط نهاية المشاركة الخاصة بهم بالإضافة إلى بعض المعلمات الافتراضية.

<table>
  <tr>
    <th class="col-twenty">المزود</th>
    <th class="col-twenty">النوع</th>
    <th>المعلمات عبر خاصية <code>param</code>
</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">واجهة برمجة تطبيقات مشاركة الويب</a> (يتم بدء تشغيل مربع حوار مشاركة نظام التشغيل)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>البريد الإلكتروني</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: اختياري</li>
        <li>
<code>body</code>: اختياري</li>
        <li>
<code>recipient</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>: <strong>المطلوب</strong>، يتم تعيينه افتراضيًا إلى: لا شيء. هذه المعلمة هي Facebook <code>app_id</code> المطلوب <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">لحوار مشاركة Facebook</a>.</li>
        <li>
<code>href</code>: اختياري</li>
        <li>
<code>quote</code>: اختياري، يمكن استخدامه لمشاركة اقتباس أو نص.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: اختياري (لكن يوصى بتعيينه بشدة). عنوان Url للوسائط المراد مشاركتها على Pinterest. وفي حالة عدم التعيين، سيُطلب من المستخدم النهائي تحميل وسائط بواسطة Pinterest.</li>
        <li>
<code>url</code>: اختياري</li>
        <li>
<code>description</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: اختياري</li>
        <li>
<code>text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: اختياري</li>
        <li>
<code>text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: اختياري</li>
        <li>
<code>text</code>: اختياري</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: اختياري</li>
</ul>
    </td>
  </tr>
</table>

### المزودون غير المكوَّنين

بالإضافة إلى المزوِّدين المكوَّنين مسبقًا، يمكنك استخدام مزوِّدين غير مكوَّنين من خلال تحديد سمات إضافية في المكون `BentoSocialShare`.

#### مثال: إنشاء زر مشاركة لمزوِّد غير مكوَّن

المثال التالي ينشئ زر مشاركة عبر Facebook Messenger من خلال تعيين السمة `data-share-endpoint` إلى نقطة النهاية الصحيحة للبروتوكول المخصص لـ Facebook Messenger.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

ونظرًا لعدم تكوين هؤلاء المزوِّدين مسبقًا، فستحتاج إلى إنشاء صورة الزر وأنماطه المناسبة للمزوِّد.

### الخصائص

#### type (مطلوب)

تحديد نوع مزوِّد. وهذا مطلوب لكل من المزوِّدين المكوَّنين مسبقًا وغير المكوَّنين.

#### background

أحيانًا تريد تقديم أسلوبك الخاص. يمكنك ببساطة تجاوز الأنماط المقدمة عن طريق إعطاء لون للخلفية.

عند تخصيص نمط أيقونة `BentoSocialShare`، يرجى التأكد من أن الأيقونة المخصصة تلبي إرشادات العلامة التجارية التي حددها المزود (مثل Twitter وFacebook وما إلى ذلك).

#### color

أحيانًا تريد تقديم أسلوبك الخاص. يمكنك ببساطة تجاوز الأنماط المقدمة عن طريق إعطاء لون للتعبئة.

عند تخصيص نمط أيقونة `BentoSocialShare`، يرجى التأكد من أن الأيقونة المخصصة تلبي إرشادات العلامة التجارية التي حددها المزود (مثل Twitter وFacebook وما إلى ذلك).

#### target

تحديد الهدف الذي يتم فيه فتح الهدف. والافتراضي هو `_blank` لجميع الحالات بخلاف البريد إلى `_top`.

#### endpoint

هذه الخاصية مطلوبة للمزوِّدين غير المكوَّنين.

بعض المزودين الشائعين لديهم نقاط نهاية مشاركة مكونة مسبقًا. وللحصول على التفاصيل، راجع قسم المزوِّدين المكوَّنين مسبقًا. أما المزوِّدين غير المكوَّنين، فستحتاج إلى تحديد نقطة نهاية المشاركة.

#### params

يتم تحويل جميع خصائص `param` إلى معلمات عناوين URL ويتم تمريرها إلى نقطة نهاية المشاركة.

#### aria-label

وصف زر إمكانية الوصول. والتسمية الموصى بها هي "مشاركة على &lt;type&gt;".
