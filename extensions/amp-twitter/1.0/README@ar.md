# Bento Twitter

## السلوك

يسمح لك مكون Bento Twitter بتضمين تغريدة أو لحظة. استخدمه كمكون ويب [`<bento-twitter>`](#web-component)، أو مكون Preact/React وظيفي [`<BentoTwitter>`](#preactreact-component).

### مكون الويب

يجب تضمين كل مكتبة صفحات الأنماط المتتالية (CSS) المطلوبة لمكون Bento لضمان التحميل المناسب وقبل إضافة أنماط مخصصة. أو استخدم أنماط ما قبل الترقية منخفضة المستوى المتوفرة بشكل ضمني. راجع [التخطيط والنمط](#layout-and-style).

توضح الأمثلة أدناه استخدام مكون الويب `<bento-twitter>`.

#### مثال: استيراد عبر npm

[مثال preview="top-frame" playground="false"]

تثبيت عبر npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/مثال]

#### مثال: تضمين عبر `<script>`

[مثال preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-twitter {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <!-- TODO(wg-bento): Once available, change src to bento-twitter.js -->
  <script async src="https://cdn.ampproject.org/v0/amp-twitter-1.0.js"></script>
  <style>
    bento-twitter {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<bento-twitter id="my-tweet" data-tweetid="885634330868850689">
</bento-twitter>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-tweet">
    Change tweet
  </button>
</div>

<script>
  (async () => {
    const twitter = document.querySelector('#my-tweet');
    await customElements.whenDefined('bento-twitter');

    // set up button actions
    document.querySelector('#change-tweet').onclick = () => {
      twitter.setAttribute('data-tweetid', '495719809695621121')
    }
  })();
</script>
```

[/مثال]

#### المخطط والنمط

يحتوي كل مكون Bento على مكتبة CSS صغيرة يجب عليك تضمينها لضمان التحميل الصحيح بدون [تغييرات المحتوى](https://web.dev/cls/). ونظرًا للخصوصية المستندة على الأمر، يجب عليك التأكد يدويًا من تضمين صفحات الأنماط قبل أي أنماط مخصصة.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

بدلاً من ذلك، يمكنك أيضًا توفير أنماط ما قبل الترقية منخفضة المستوى بشكل مضمّن:

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**نوع الحاوية**

يحتوي المكون `bento-twitter` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وعناصره الفرعية المباشرة (الشرائح) من خلال مخطط صفحات الأنماط المتتالية المطلوب (مثل مخطط محدد بـ `height` أو `width` أو `aspect-ratio`، أو خصائص أخرى):

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### السمات

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (مطلوبة)</strong></td>
    <td>معرف التغريدة أو اللحظة، أو نوع المصدر إذا كان ينبغي عرض المخطط الزمني. في عنوان URL مثل https://twitter.com/joemccann/status/640300967154597888، يكون <code>640300967154597888</code> هو معرف التغريدة. في عنوان URL مثل https://twitter.com/i/moments/1009149991452135424، يكون <code>1009149991452135424</code> هو معرف اللحظة. وتشمل أنواع مصدر المخطط الزمني الصالحة <code>profile</code> و <code>likes</code> و<code>list</code> و <code>collection</code> و<code>url</code> و<code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (اختيارية)</strong></td>
    <td>عند عرض المخطط الزمني، يلزم توفير وسيطات أخرى بالإضافة إلى <code>timeline-source-type</code>. على سبيل المثال، سوف يعرض <code>data-timeline-screen-name="amphtml"</code> مع <code>data-timeline-source-type="profile"</code> المخطط الزمني لحساب AMP Twitter. لمعرفة التفاصيل حول الوسيطات المتوفرة، راجع قسم "المخططات الزمنية" في <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">دليل وظائف مصنع JavaScript الخاصة بـ Twitter</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (اختيارية)</strong></td>
    <td>يمكنك تحديد خيارات لمظهر التغريدة أو اللحظة أو المخطط الزمني من خلال تعييين سمات <code>data-</code>. على سبيل المثال، يقوم <code>data-cards="hidden"</code> بإلغاء تنشيط  بطاقات Twitter. لمعرفة التفاصيل حول الخيارات المتوفرة، راجع وثائق Twitter بشأن <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">التغريدات</a> و<a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">اللحظات</a> و<a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">المخططات الزمنية</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (اختياري)</strong></td>
    <td>حدد سمة <code>title</code> للمكون. السمة الافتراضية <code>Twitter</code>.</td>
  </tr>
</table>

### مكون Preact/React

توضح الأمثلة أدناه استخدام `<BentoTwitter>` كمكون وظيفي قابل للاستخدام في مكتبات Preact أو React.

#### مثال: استيراد عبر npm

[مثال preview="top-frame" playground="false"]

تثبيت عبر npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import React from 'react';
import { BentoTwitter } from '@ampproject/bento-twitter/react';
import '@ampproject/bento-twitter/styles.css';

function App() {
  return (
    <BentoTwitter tweetid="1356304203044499462">
    </BentoTwitter>
  );
}
```

[/مثال]

#### المخطط والنمط

**نوع الحاوية**

يحتوي المكون `BentoTwitter` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وفروعه المباشرة (الشرائح) من خلال مخطط صفحات الأنماط المتتالية المطلوب (مثل مخطط محدد بـ `height` أو `width` أو `aspect-ratio`، أو خصائص أخرى):

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

أو عبر `className`:

```jsx
<BentoTwitter className='custom-styles'  tweetid="1356304203044499462">
</BentoTwitter>
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
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (مطلوبة)</strong></td>
    <td>معرف التغريدة أو اللحظة، أو نوع المصدر إذا كان ينبغي عرض المخطط الزمني. في عنوان URL مثل https://twitter.com/joemccann/status/640300967154597888، يكون <code>640300967154597888</code> هو معرف التغريدة. في عنوان URL مثل https://twitter.com/i/moments/1009149991452135424، يكون <code>1009149991452135424</code> هو معرف اللحظة. وتشمل أنواع مصدر المخطط الزمني الصالحة <code>profile</code> و <code>likes</code> و<code>list</code> و <code>collection</code> و<code>url</code> و<code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations (اختيارية)</strong></td>
    <td>عند عرض تغريدة، يمكن توفير وسيطات إضافية بالإضافة إلى <code>tweetid</code>. على سبيل المثال، سوف يعرض <code>cards="hidden"</code> مع <code>conversation="none"</code> تغريدة بدون أي صور مصغرة أو تعليقات إضافية.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (اختيارية)</strong></td>
    <td>عند عرض لحظة، يمكن توفير وسيطات إضافية بالإضافة إلى <code>moment</code>. على سبيل المثال، سوف يعرض  <code>limit="5"</code> لحظة مضمنة مع حتى خمس بطاقات.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (اختيارية)</strong></td>
    <td>عند عرض مخطط زمني، يمكن توفير وسيطات إضافية بالإضافة إلى <code>timelineSourceType</code>. على سبيل المثال، سوف تعرض <code>timelineScreenName="amphtml"</code> مع <code>timelineSourceType="profile"</code> مخططًا زمنيًا لحسابAMP Twitter.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (اختيارية)</strong></td>
    <td>يمكنك تحديد خيارات لمظهر التغريدة أو اللحظة أو المخطط الزمني من خلال تمريرها في كائن إلى خاصية <code>options</code>. لمعرفة التفاصيل حول الخيارات المتوفرة، راجع وثائق Twitter بشأن <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">التغريدات</a> و<a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">اللحظات</a> و<a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">المخططات الزمنية</a>. ملاحظة: عند التمرير في الخاصية `options`، تأكد من تحسين أو حفظ الكائن: <code> const TWITTER_OPTIONS = {   // make sure to define these once globally! }; function MyComponent() { // etc return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (اختياري)</strong></td>
    <td>حدد <code>title</code> لمكون iframe. السمة الافتراضية <code>Twitter</code>.</td>
  </tr>
</table>
