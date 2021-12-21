# شريط Bento الجانبي

يوفر طريقة لعرض محتوى تعريفي مخصص للوصول المؤقت مثل التنقل والارتباطات والأزرار والقوائم. ويمكن كشف الشريط الجانبي بضغطة زر بينما يظل المحتوى الرئيسي مرئيًا أسفل منه.

## مكون الويب

يجب تضمين كل مكتبة صفحات الأنماط المتتالية (CSS) المطلوبة لمكون Bento لضمان التحميل المناسب وقبل إضافة أنماط مخصصة. أو استخدم أنماط ما قبل الترقية منخفضة المستوى المتوفرة بشكل ضمني. راجع [التخطيط والنمط](#layout-and-style).

توضح الأمثلة أدناه استخدام مكون الويب `<bento-accordion>`.

### مثال: استيراد عبر npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import {defineElement as defineBentoSidebar} from '@bentoproject/sidebar';
defineBentoSidebar();
```

### مثال: تضمين عبر `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-sidebar:not([open]) {
      display: none !important;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-sidebar-1.0.js"
  ></script>
</head>
<body>
  <bento-sidebar id="sidebar1" side="right">
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
  </bento-sidebar>

  <div class="buttons" style="margin-top: 8px">
    <button id="open-sidebar">Open sidebar</button>
  </div>

  <script>
    (async () => {
      const sidebar = document.querySelector('#sidebar1');
      await customElements.whenDefined('bento-sidebar');
      const api = await sidebar.getApi();

      // set up button actions
      document.querySelector('#open-sidebar').onclick = () => api.open();
    })();
  </script>
</body>
```

### شريط أدوات Bento

يمكنك إنشاء عنصر شريط أدوات Bento Toolbar يتم عرضه في `<body>` من خلال تحديد سمة `toolbar` مع استعلام وسائط وسمة `toolbar-target` مع معرف العنصر في عنصر `<nav>` الذي يكون فرعًا في`<bento-sidebar>`. يقوم `toolbar` بتكرار العنصر `<nav>` وفروعه ويقوم بإلحاق العنصر في العنصر `toolbar-target`.

#### السلوك

-   يمكن للشريط الجانبي تنفيذ أشرطة الأدوات من خلال إضافة عناصر التحكم مع السمة `toolbar` والسمة `toolbar-target`.
-   يجب أن يكون عنصر التنقل فرعًا في `<bento-sidebar>` ويتبع هذا التنسيق: `<nav toolbar="(media-query)" toolbar-target="elementID">`.
    -   على سبيل المثال، سيكون ما يلي استخدامًا صالحًا لشريط الأدوات: `<nav toolbar="(max-width: 1024px)" toolbar-target="target-element">`.
-   يتم تطبيق سلوك شريط الأدوات فقط حينما يكون استعلام الوسائط للسمة `toolbar` صالحًا. أيضًا، يجب وجود عنصر بالسمة `toolbar-target` في الصفحة لكي يتم تطبيق شريط الأدوات.

##### مثال: شريط أدوات أساسي

في المثال التالي، نعرض `toolbar` إذا كان عرض النافذة أقل من أو يساوي 767 بكسل. يحتوي `toolbar` على عنصر إدخال بحث. ويتم إلحاق عنصر `toolbar` بالعنصر `<div id="target-element">`.

```html
<bento-sidebar id="sidebar1" side="right">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>

  <nav toolbar="(max-width: 767px)" toolbar-target="target-element">
    <ul>
      <li>
        <input placeholder="Search..." />
      </li>
    </ul>
  </nav>
</bento-sidebar>

<div id="target-element"></div>
```

### التفاعل واستخدام واجهة برمجة التطبيقات (API)

تُعد المكونات الممكّنة من قبل Bento المستخدمة كمكون ويب مستقل تفاعلية للغاية من خلال واجهة برمجة التطبيقات الخاصة بها. ويمكن الوصول إلى واجهة برمجة تطبيقات مكون `bento-sidebar` من خلال تضمين علامة البرنامج النصي التالي في مستندك:

```javascript
await customElements.whenDefined('bento-sidebar');
const api = await carousel.getApi();
```

#### الإجراءات

تسمح لك واجهة برمجة التطبيقات `bento-sidebar` بتنفيذ الإجراءات التالية:

##### open()

يفتح الشريط الجانبي.

```javascript
api.open();
```

##### close()

يغلق الشريط الجانبي.

```javascript
api.close();
```

##### toggle()

يبدل حالة فتح الشريط الجانبي.

```javascript
api.toggle(0);
```

### المخطط والنمط

يحتوي كل مكون Bento على مكتبة CSS صغيرة يجب عليك تضمينها لضمان التحميل الصحيح بدون [تغييرات المحتوى](https://web.dev/cls/). ونظرًا للخصوصية المستندة على الأمر، يجب عليك التأكد يدويًا من تضمين صفحات الأنماط قبل أي أنماط مخصصة.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-sidebar-1.0.css"
/>
```

بدلاً من ذلك، يمكنك أيضًا توفير أنماط ما قبل الترقية منخفضة المستوى بشكل مضمّن:

```html
<style>
  bento-sidebar:not([open]) {
    display: none !important;
  }
</style>
```

#### أنماط مخصصة

يمكن إضافة أنماط لمكون `bento-sidebar` باستخدام مكتبة CSS القياسية.

-   يمكن تعيين `width` لـ `bento-sidebar` لضبط العرض من قيمة 45 بكسل التي تم تعيينها مسبقًا.
-   يمكن تعيين ارتفاع `bento-sidebar` لضبط ارتفاع الشريط الجانبي، حسب الحاجة. وإذا تجاوز العرض 100 نقطة من عرض المنفذ، فسوف يتضمن الشريط الجانبي شريط تمرير رأسي. يكون الارتفاع المعد مسبقًا للشريط الجانبي 100 نقطة من عرض المنفذ ويمكن تجاوزه في CSS لجعله أقصر من ذلك.
-   يجري عرض الحالة الحالية للشريط الجانبي عن طريق السمة `open` التي تم تعيينها في علامة `bento-sidebar` عندما يكون الشريط الجانبي مفتوحًا في الصفحة.

```css
bento-sidebar[open] {
  height: 100%;
  width: 50px;
}
```

### اعتبارات تجربة المستخدم

عند استخدام `<bento-sidebar>`، ضع في اعتبارك أن المستخدمين سوف يعرضون صفحتك عادة على جهاز محمول، والذي قد يعرض عنوانًا ثابت الموضع. بالإضافة إلى ذلك، تعرض المستعرضات عادة العنوان الثابت الخاص بها في أعلى الصفحة. وإضافة عنصر ثابت الموضع آخر في أعلى الشاشة سوف يستهلك مساحة كبيرة من شاشة المحمول مع المحتوى الذي لا يوفر للمستخدم معلومات جديدة.

لهذا السبب نوصي بعدم وضع العناصر الوظيفية لفتح الشريط الجانبي في عنوان ثابت بعرض كامل.

-   يمكن أن يظهر الشريط الجانبي فقط على الجانب الأيسر أو الأيمن للصفحة.
-   أقصى ارتفاع للشريط الجانبي 100 نقطة من ارتفاع عرض المنفذ، وإذا تجاوز الارتفاع 100 نقطة من ارتفاع عرض المنفذ فعندئذ سوف يظهر شريط تمرير رأسي. يتم تعيين الارتفاع الافتراضي على 100 نقطة من ارتفاع عرض المنفذ في مكتبة CSS ويمكن تجاوزه في مكتبة CSS.
-   يمكن تعيين عرض الشريط الجانبي وضبطه باستخدام مكتبة CSS.
-   يوصى بأن يكون `<bento-sidebar>` _فرعًا مباشرًا_ لـ `<body>` للمحافظة على ترتيب DOM المنطقي للوصول بالإضافة إلى تجنب تغيير سلوكه بواسطة عنصر محتوى. لاحظ أن وجود عنصر أصل لـ `bento-sidebar` تم تعيين `z-index` له قد يتسبب في ظهور الشريط الجانبي أسفل العناصر الأخرى (مثل العناوين)، ما قد يعطل وظيفته.

### السمات

#### side

يشير إلى الجانب الذي يجب فتح الشريط الجانبي منه، سواء `left` أو `right`. إذا لم يتم تحديد `side`، سوف تتم وراثة قيمة `side` من علامة `body` السمة`dir` (`ltr` =&gt; `left` , `rtl` =&gt; `right`); في حالة عدم وجود `dir`، يتم تعيين القيمة الافتراضية لـ `side` على `left`.

#### open

تكون هذه السمة موجودة عندما يكون الشريط الجانبي مفتوحًا.

#### toolbar

توجد هذه السمة في عناصر `<nav toolbar="(media-query)" toolbar-target="elementID">` الفرعية، وتقبل استعلام الوسائط الخاص بمتى يتم عرض شريط الأدوات. انظر قسم [شريط الأدوات](#bento-toolbar) لمزيد من المعلومات حول استخدام أشرطة الأدوات.

#### toolbar-target

توجد هذه السمة في عنصر `<nav toolbar="(media-query)" toolbar-target="elementID">` الفرعي، وتقبل معرفًا لعنصر في الصفحة. سوف تضع سمة `toolbar-target` شريط الأدوات في معرف العنصر المحدد على الصفحة، بدون نمط شريط الأدوات الافتراضي. راجع قسم [شريط الأدوات](#bento-toolbar) لمزيد من المعلومات.

---

## مكون Preact/React

توضح الأمثلة أدناه استخدام `<BentoSidebar>` كمكون وظيفي قابل للاستخدام في مكتبات Preact أو React.

### مثال: استيراد عبر npm

```sh
npm install @bentoproject/sidebar
```

```javascript
import React from 'react';
import {BentoSidebar} from '@bentoproject/sidebar/react';
import '@bentoproject/sidebar/styles.css';

function App() {
  return (
    <BentoSidebar>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

### شريط أدوات Bento

يمكنك إنشاء عنصر شريط أدوات Bento Toolbar يتم عرضه في `<body>` من خلال تحديد خاصية `toolbar` مع استعلام وسائط خاصية`toolbar-target` مع معرف العنصر في مكون `<BentoSidebarToolbar>` الذي يكون فرعًا في `<BentoSidebar>`. يقوم `toolbar` بتكرار العنصر `<BentoSidebar>` وفروعه ويقوم بإلحاق العنصر في العنصر `toolbarTarget`.

#### السلوك

-   يمكن للشريط الجانبي تنفيذ أشرطة الأدوات من خلال إضافة عناصر التحكم مع الخاصية `toolbar` والخاصية `toolbarTarget`.
-   يجب أن يكون عنصر التنقل فرعًا في `<BentoSidebar>` ويتبع هذا التنسيق: `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">`.
    -   على سبيل المثال، سيكون ما يلي استخدامًا صالحًا لشريط الأدوات: `<BentoSidebarToolbar toolbar="(max-width: 1024px)" toolbarTarget="target-element">`.
-   يتم تطبيق سلوك شريط الأدوات فقط حينما يكون استعلام الوسائط للخاصية `toolbar` صالحًا. أيضًا، يجب وجود عنصر بالخاصية `toolbar-target` في الصفحة لكي يتم تطبيق شريط الأدوات.

##### مثال: شريط أدوات أساسي

في المثال التالي، نعرض `toolbar` إذا كان عرض النافذة أقل من أو يساوي 767 بكسل. يحتوي `toolbar` على عنصر إدخال بحث. ويتم إلحاق عنصر `toolbar` بالعنصر `<div id="target-element">`.

```jsx
<>
  <BentoSidebar>
    <ul>
      <li>Nav item 1</li>
      <li>Nav item 2</li>
      <li>Nav item 3</li>
      <li>Nav item 4</li>
      <li>Nav item 5</li>
      <li>Nav item 6</li>
    </ul>
    <BentoSidebarToolbar
      toolbar="(max-width: 767px)"
      toolbarTarget="target-element"
    >
      <ul>
        <li>Toolbar Item 1</li>
        <li>Toolbar Item 2</li>
      </ul>
    </BentoSidebarToolbar>
  </BentoSidebar>

  <div id="target-element"></div>
</>
```

### التفاعل واستخدام واجهة برمجة التطبيقات (API)

مكونات Bento تفاعلية للغاية من خلال واجهة برمجة التطبيقات الخاصة بها. ويمكن الوصول إلى واجهة برمجة تطبيقات المكون `BentoSidebar` بتمرير `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoSidebar ref={ref}>
      <ul>
        <li>Nav item 1</li>
        <li>Nav item 2</li>
        <li>Nav item 3</li>
        <li>Nav item 4</li>
        <li>Nav item 5</li>
        <li>Nav item 6</li>
      </ul>
    </BentoSidebar>
  );
}
```

#### الإجراءات

تسمح لك واجهة برمجة التطبيقات `BentoSidebar` بتنفيذ الإجراءات التالية:

##### open()

يفتح الشريط الجانبي.

```javascript
ref.current.open();
```

##### close()

يغلق الشريط الجانبي.

```javascript
ref.current.close();
```

##### toggle()

يبدل حالة فتح الشريط الجانبي.

```javascript
ref.current.toggle(0);
```

### المخطط والنمط

يمكن إضافة أنماط لمكون `BentoSidebar` باستخدام مكتبة CSS القياسية.

-   يمكن تعيين `width` لـ `bento-sidebar` لضبط العرض من قيمة 45 بكسل التي تم تعيينها مسبقًا.
-   يمكن تعيين ارتفاع `bento-sidebar` لضبط ارتفاع الشريط الجانبي، حسب الحاجة. وإذا تجاوز العرض 100 نقطة من عرض المنفذ، فسوف يتضمن الشريط الجانبي شريط تمرير رأسي. يكون الارتفاع المعد مسبقًا للشريط الجانبي 100 نقطة من عرض المنفذ ويمكن تجاوزه في CSS لجعله أقصر من ذلك.

لضمان عرض المكون بالطريقة التي تريدها، تأكد من تطبيق حجم على المكون. ويمكن تطبيق ذلك بشكل مضمن:

```jsx
<BentoSidebar style={{width: 300, height: '100%'}}>
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

أو عبر `className`:

```jsx
<BentoSidebar className="custom-styles">
  <ul>
    <li>Nav item 1</li>
    <li>Nav item 2</li>
    <li>Nav item 3</li>
    <li>Nav item 4</li>
    <li>Nav item 5</li>
    <li>Nav item 6</li>
  </ul>
</BentoSidebar>
```

```css
.custom-styles {
  height: 100%;
  width: 300px;
}
```

### اعتبارات تجربة المستخدم

عند استخدام `<bento-sidebar>`، ضع في اعتبارك أن المستخدمين سوف يعرضون صفحتك عادة على جهاز محمول، والذي قد يعرض عنوانًا ثابت الموضع. بالإضافة إلى ذلك، تعرض المستعرضات عادة العنوان الثابت الخاص بها في أعلى الصفحة. وإضافة عنصر ثابت الموضع آخر في أعلى الشاشة سوف يستهلك مساحة كبيرة من شاشة المحمول مع المحتوى الذي لا يوفر للمستخدم معلومات جديدة.

لهذا السبب نوصي بعدم وضع العناصر الوظيفية لفتح الشريط الجانبي في عنوان ثابت بعرض كامل.

-   يمكن أن يظهر الشريط الجانبي فقط على الجانب الأيسر أو الأيمن للصفحة.
-   أقصى ارتفاع للشريط الجانبي 100 نقطة من ارتفاع عرض المنفذ، وإذا تجاوز الارتفاع 100 نقطة من ارتفاع عرض المنفذ فعندئذ سوف يظهر شريط تمرير رأسي. يتم تعيين الارتفاع الافتراضي على 100 نقطة من ارتفاع عرض المنفذ في مكتبة CSS ويمكن تجاوزه في مكتبة CSS.
-   يمكن تعيين عرض الشريط الجانبي وضبطه باستخدام مكتبة CSS.
-   يوصى بأن يكون `<BentoSidebar>` _فرعًا مباشرًا_ لـ `<body>` للمحافظة على ترتيب DOM المنطقي للوصول بالإضافة إلى تجنب تغيير سلوكه بواسطة عنصر محتوى. لاحظ أن وجود عنصر أصل لـ `bento-sidebar` تم تعيين `z-index` له قد يتسبب في ظهور الشريط الجانبي أسفل العناصر الأخرى (مثل العناوين)، ما قد يعطل وظيفته.

### الخصائص

#### side

يشير إلى الجانب الذي يجب فتح الشريط الجانبي منه، سواء `left` أو `right`. إذا لم يتم تحديد `side`، سوف تتم وراثة قيمة `side` من علامة `body` السمة`dir` (`ltr` =&gt; `left` , `rtl` =&gt; `right`); في حالة عدم وجود `dir`، يتم تعيين القيمة الافتراضية لـ `side` على `left`.

#### toolbar

توجد هذه الخصية في عناصر `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` الفرعية، وتقبل استعلام الوسائط الخاص بمتى يتم عرض شريط الأدوات. انظر قسم [شريط الأدوات](#bento-toolbar) لمزيد من المعلومات حول استخدام أشرطة الأدوات.

#### toolbarTarget

توجد هذه السمة في عنصر `<BentoSidebarToolbar toolbar="(media-query)" toolbarTarget="elementID">` الفرعي، وتقبل معرفًا لعنصر في الصفحة. سوف تضع خاصية `toolbarTarget` شريط الأدوات في معرف العنصر المحدد على الصفحة، بدون نمط شريط الأدوات الافتراضي. راجع قسم [شريط الأدوات](#bento-toolbar) لمزيد من المعلومات.
