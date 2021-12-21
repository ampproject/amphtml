# المكون Bento Accordion

يعرض أقسام المحتوى التي يمكن طيها وتوسيعها. ويوفر هذا المكون وسيلة للعارضين للإلقاء نظرة سريعة على مخطط المحتوى والانتقال إلى أي قسم. ويقلل الاستخدام الفعال من احتياجات التمرير في الأجهزة المحمولة.

-   يقبل Bento Accordion عنصرًا فرعيًا واحدًا أو أكثر من عناصر `<section>` كعنصر فرعي مباشر له.
-   يجب أن يحتوي كل `<section>` على عنصرين فرعيين مباشرين بالضبط.
-   العنصر الفرعي الأول في `<section>` هو عنوان ذلك القسم من Bento Accordion. ويجب أن يكون عنصر عنوان مثل `<h1>-<h6>` أو `<header>`.
-   العنصر الفرعي الثاني في `<section>` هو المحتوى القابل للتوسيع/للطي.
    -   يمكن أن يكون أي علامة مسموح بها في [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
-   تؤدي أي نقرة أو ضغطة على عنوان `<section>` إلى توسيع القسم أو طيه.
-   يحافظ Bento Accorddion ذو `id` المحدد على الحالة المطوية أو الموسعة لكل قسم أثناء بقاء المستخدم في مجالك.

## مكون الويب

يجب تضمين كل مكتبة صفحات الأنماط المتتالية (CSS) المطلوبة لمكون Bento لضمان التحميل المناسب وقبل إضافة أنماط مخصصة. أو استخدم أنماط ما قبل الترقية منخفضة المستوى المتوفرة بشكل ضمني. راجع [التخطيط والنمط](#layout-and-style).

توضح الأمثلة أدناه استخدام مكون الويب `<bento-accordion>`.

### مثال: استيراد عبر npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### مثال: تضمين عبر `<script>`

يحتوي المثال أدناه على `bento-accordion` بثلاثة أقسام. وتعمل سمة `موسعة` في القسم الثالث على توسيعها عند تحميل الصفحة.

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

### التفاعل واستخدام واجهة برمجة التطبيقات (API)

تُعد المكونات الممكّنة من قبل Bento في الاستخدام المستقل تفاعلية للغاية من خلال واجهة برمجة التطبيقات الخاصة بها. ويمكن الوصول إلى واجهة برمجة تطبيقات مكون `bento-accordion` من خلال تضمين علامة البرنامج النصي التالي في مستندك:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### الإجراءات

##### toggle()

يقوم الإجراء `toggle` بتبديل الحالتين `expanded` و`collapsed` لـ `bent-accordion`. وعند استدعائه بدون أي وسيطات، فإنه يبدل جميع أقسام الأكورديون. ولتحديد قسم محدد، أضف وسيطة `section` واستخدم <code>id</code> المقابل لها كقيمة.

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

يقوم الإجراء `expand` بتوسيع أقسام `bent-accordion`. وإذا تم توسيع قسم بالفعل، فسيبظل موسعًا. وعند استدعائه بدون وسيطات، فإنه يوسع جميع أقسام الأكورديون. ولتحديد قسم، أضف وسيطة `section`، واستخدم <code>id</code> المقابل لها كقيمة.

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

يطوي الإجراء `collapse` أقسام `bent-accordion`. وإذا انطوى قسم بالفعل، فيظل منطويًا. وعند استدعائه بدون وسيطات، فإنه يطوي جميع أقسام الأكورديون. ولتحديد قسم، أضف وسيطة `section`، واستخدم <code>id</code> المقابل لها كقيمة.

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

#### الأحداث

تسمح لك واجهة برمجة التطبيقات `bento-accordion` بالتسجيل والاستجابة للأحداث التالية:

##### expand

يتم بدء تشغيل هذا الحدث عند توسيع قسم أكورديون وإرساله من القسم الموسَّع.

انظر أدناه على سبيل المثال.

##### collapse

يتم بدء تشغيل هذا الحدث عند طي قسم أكورديون وإرساله من القسم المطوي.

في المثال أدناه، ينصت `section 1` للحدث `expand` ويقوم بتوسيع `section 2` عند توسيعه. وينصت `section 2` للحدث `collapse` ويقوم بطي `section 1` عند طيِّه.

انظر أدناه على سبيل المثال.

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

### المخطط والنمط

يحتوي كل مكون Bento على مكتبة CSS صغيرة يجب عليك تضمينها لضمان التحميل الصحيح بدون [تغييرات المحتوى](https://web.dev/cls/). ونظرًا للخصوصية المستندة على الأمر، يجب عليك التأكد يدويًا من تضمين صفحات الأنماط قبل أي أنماط مخصصة.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

بدلاً من ذلك، يمكنك أيضًا توفير أنماط ما قبل الترقية منخفضة المستوى بشكل مضمّن:

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

### السمات

#### إضافة حركة

قم بتضمين السمة `animate` في `<bento-accordion>` لإضافة رسم متحرك "للتوسيع" عند توسيع المحتوى ورسوم متحرك "للطي" عند الطي.

يمكن تكوين هذه السمة للاستناد على [استعلام الوسائط](./../../../docs/spec/amp-html-responsive-attributes.md).

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

#### موسَّع

قم بتطبيق السمة `expanded` على `<section>` متداخل لتوسيع هذا القسم عند تحميل الصفحة.

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

#### توسيع قسم واحد

السماح بتوسيع قسم واحد فقط في كل مرة من خلال تطبيق السمة `expand-single-section` على العنصر `<bent-accordion>`. وهذا يعني أنه إذا قام مستخدم بالتنقل في `<section>` مطوي، فسيقوم بتوسيع وطي `<section>` الأخرى الموسَّعة.

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

### التصميم

يمكنك استخدام محدِّد العناصر `bento-accordion` لتصميم الأكورديون بحرية.

ضع النقاط التالية في الاعتبار عند تصميم amp-accordion:

-   تكون عناصر `bento-accordion` دائمًا `display: block`.
-   `float` لا يمكنه تصميم `<section>` ولا العنوان ولا عناصر المحتوى.
-   يطبق القسم الموسَّع السمة `expanded` على العنصر `<section>`.
-   عنصر المحتوى ثابت بوضوح مع `overflow: hidden` وبالتالي لا يمكن أن يحتوي على أشرطة تمرير.
-   تم تعيين هوامش `<bento-acordion>`، و`<section>`، والعنوان، وعناصر المحتوى إلى `0`، ولكن يمكن تجاوزها بالأنماط المخصصة.
-   عنصرا المقدمة والمحتوى `position: relative`.

---

## مكون Preact/React

توضح الأمثلة أدناه استخدام `<BentoAccordion>` كمكون وظيفي قابل للاستخدام في مكتبات Preact أو React.

### مثال: استيراد عبر npm

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

### التفاعل واستخدام واجهة برمجة التطبيقات (API)

مكونات Bento تفاعلية للغاية من خلال واجهة برمجة التطبيقات الخاصة بها. ويمكن الوصول إلى واجهة برمجة تطبيقات المكون `BentoAccordion` بتمرير `ref`:

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

#### الإجراءات

تسمح لك واجهة برمجة التطبيقات `BentoAccordion` بتنفيذ الإجراءات التالية:

##### toggle()

يقوم الإجراء `toggle` بتبديل الحالتين `expanded` و`collapsed` لـ `bent-accordion`. وعند استدعائه بدون أي وسيطات، فإنه يبدل جميع أقسام الأكورديون. ولتحديد قسم محدد، أضف وسيطة `section` واستخدم <code>id</code> المقابل لها كقيمة.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

يقوم الإجراء `expand` بتوسيع أقسام `bent-accordion`. وإذا تم توسيع قسم بالفعل، فسيبظل موسعًا. وعند استدعائه بدون وسيطات، فإنه يوسع جميع أقسام الأكورديون. ولتحديد قسم، أضف وسيطة `section`، واستخدم <code>id</code> المقابل لها كقيمة.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

يطوي الإجراء `collapse` أقسام `bent-accordion`. وإذا انطوى قسم بالفعل، فيظل منطويًا. وعند استدعائه بدون وسيطات، فإنه يطوي جميع أقسام الأكورديون. ولتحديد قسم، أضف وسيطة `section`، واستخدم <code>id</code> المقابل لها كقيمة.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### الأحداث

تسمح لك واجهة برمجة التطبيقات Bento Accordion بالاستجابة للأحداث التالية:

##### onExpandStateChange

يتم بدء تشغيل هذا الحدث عند توسيع قسم أكورديون أو طيه وإرساله من القسم الموسَّع.

انظر أدناه على سبيل المثال.

##### onCollapse

يتم بدء تشغيل هذا الحدث عند طي قسم أكورديون وإرساله من القسم المطوي.

في المثال أدناه، ينصت `section 1` للحدث `expand` ويقوم بتوسيع `section 2` عند توسيعه. وينصت `section 2` للحدث `collapse` ويقوم بطي `section 1` عند طيِّه.

انظر أدناه على سبيل المثال.

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

### المخطط والنمط

#### نوع الحاوية

يحتوي المكون `BentoAccordion` على نوع حجم مخطط محدد. ولضمان عرض المكون بشكل صحيح، تأكد من تطبيق حجم على المكون وعناصره الفرعية المباشرة من خلال مخطط CSS المطلوب (مثل مخطط محدد بـ `height` أو `width` أو `aspect-ratio`، أو خصائص أخرى):

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

أو عبر `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### الخصائص

#### BentoAccordion

##### إضافة حركة

إذا تم التعيين إلى صحيح، فعليك استخدام الرسوم المتحركة "توسيع" / "طي" أثناء توسيع كل قسم وطيه، الافتراضي: `false`

##### expandSingleSection

إذا تم التعيين إلى صحيح، فسيؤدي توسيع قسم واحد إلى طي جميع الأقسام الأخرى تلقائيًا: الافتراضي: `false`

#### BentoAccordionSection

##### إضافة حركة

إذا تم التعيين إلى صحيح، فعليك استخدام الرسوم المتحركة "توسيع" / "طي" أثناء توسيع القسم وطيه، الافتراضي: `false`

##### موسَّع

إذا تم التعيين إلى صحيح، يتم توسيع القسم. الافتراضي: `false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

استدعاء للانصات إلى تغييرات حالة التوسيع. وضع إشارة منطقية كمعلمة تشير إلى ما إذا كان قد تم توسيع القسم للتو (يشير `false` إلى أنه قد تم طيه)

#### BentoAccordionHeader

#### الخصائص الشائعة

يدعم هذا المكون [الخصائص الشائعة](../../../docs/spec/bento-common-props.md) لمكونات React وPreact.

لا تدعم BentoAccordionHeader أي خصائص مخصصة حتى الآن

#### BentoAccordionContent

#### الخصائص الشائعة

يدعم هذا المكون [الخصائص الشائعة](../../../docs/spec/bento-common-props.md) لمكونات React وPreact.

لا يدعم BentoAccordionContent أي خصائص مخصصة حتى الآن
