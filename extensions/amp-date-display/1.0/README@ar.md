# المكون Bento Date Display

يجب تضمين كل مكتبة صفحات الأنماط المتتالية (CSS) المطلوبة لمكون Bento لضمان التحميل المناسب وقبل إضافة أنماط مخصصة. أو استخدم أنماط ما قبل الترقية منخفضة المستوى المتوفرة بشكل ضمني. راجع [التخطيط والنمط](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-display/1.0/README.md
-->

---

## مكون الويب

توضح الأمثلة أدناه استخدام مكون الويب `<bent-date-display>`.

### مثال: استيراد عبر npm

```sh
npm install @bentoproject/date-display
```

```javascript
import React from 'react';
import {BentoDateDisplay} from '@bentoproject/date-display/react';
import '@bentoproject/date-display/styles.css';

function App() {
  return (
    <BentoDateDisplay
      datetime={dateTime}
      displayIn={displayIn}
      locale={locale}
      render={(date) => (
        <div>{`ISO: ${date.iso}; locale: ${date.localeString}`}</div>
      )}
    />
  );
}
```

### التفاعل واستخدام واجهة برمجة التطبيقات (API)

لا يحتوي المكون Bento Date Display component على واجهة برمجة تطبيقات إلزامية. ومع ذلك، فإن مكون Bento Date Display Preact/React يقبل خاصية `dreding` التي تعرض نموذج المستهلك. ويجب أن تكون خاصية `render` هذه دالة يمكن للمكون Bento Date Display Preact/React استخدامها لعرض نموذجه. وسيتم توفير معامِلات متنوعة مرتبطة بالتاريخ لإعادة الاستدعاء `render` للمستهلكين للاستكمال في النموذج المعروض. راجع <a href="#render" data-md-type="link">قسم خاصية `render`{/a3 لمزيد من المعلومات.</a>

### المخطط والنمط

يسمح المكون Bento Date Display Preact/React للمستهلكين بعرض النماذج الخاصة بهم. وقد تستخدم هذه النماذج أنماط ضمنية، والعلامة `<style>`، ومكونات Preact/React التي تستورد صفحات الأنماط الخاصة بها.

### الخصائص

#### `datetime`

الخاصية المطلوبة. تشير إلى التاريخ والوقت كتاريخ أو سلسلة أو رقم جديد. فإذا كان التاريخ والوقت سلسلة، يجب أن تكون سلسلة تواريخ ISO 8601 قياسية (على سبيل المثال، 2017-08-02T15:05:05.000Z) أو السلسلة `now`. وإذا تم تعيينها إلى `now`، فسيستخدم الوقت الذي تم تحميل الصفحة فيه لعرض نموذجها. وإذا كان التاريخ والوقت رقمًا، يجب أن يكون قيمة فترة POSIX بالمللي ثانية.

#### `displayIn`

خاصية اختيارية يمكن أن تكون إما `"utc"` أو `"local"` وتكون افتراضية على `"local"`. وتشير هذه الخاصية إلى المنطقة الزمنية المطلوب عرض التاريخ بها. وإذا تم تعيينها إلى القيمة `"utc"`، فسيقوم المكون بتحويل التاريخ المحدد إلى توقيت UTC.

#### `locale`

سلسلة لغة تدويل لكل وحدة مؤقِّت. والقيمة الافتراضية هي `en` (للغة الإنجليزية). وتدعم هذه الخاصية جميع القيم التي يدعمها مستعرض المستخدم.

#### `localeOptions`

يدعم الكائن `localeOptions` جميع الخيارات ضمن المعلمة [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters) التي تحدد نمط التنسيق المطلوب استخدامه لتنسيق `localeString`.

لاحظ أنه إذا تم تعيين `displayIn` إلى `utc`، فسيتم تحويل قيمة `localeOptions.timeZone` تلقائيًا إلى `UTC`.

#### `render`

استدعاء اختياري يجب أن يعرض نموذجًا. سيقدم الاستدعاء كائنًا بخصائص/قيم مرتبطة بالتاريخ الموضح في `datetime`. وبشكل افتراضي، سيعرض المكون Bento Date Display [النموذج `localeString` للتاريخ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) للإعدادات المحلية المحددة وخيار الإعدادات المحلية. راجع [قسم معلمات الوقت المرتجعة](#returned-time-parameters) لمزيد من التفاصيل حول كيفية عرض كل خاصية.

```typescript
(dateParams: DateParams) => JSXInternal.Element
interface DateParams {
  day: number;
  dayName: string;
  dayNameShort: string;
  dayPeriod: string;
  dayTwoDigit: string;
  hour: number;
  hour12: number;
  hour12TwoDigit: string;
  hourTwoDigit: string;
  iso: string;
  localeString: string;
  minute: number;
  minuteTwoDigit: string;
  month: number;
  monthName: string;
  monthNameShort: string;
  monthTwoDigit: string;
  second: number;
  secondTwoDigit: string;
  timeZoneName: string;
  timeZoneNameShort: string;
  year: number;
  yearTwoDi: string;
}
```

### معلمات الوقت المرتجعة

يسرد هذا الجدول التنسيق الذي يمكنك تحديده في نموذج Mustache لديك:

التنسيق | المعنى
--- | ---
day | 1، 2، ...12، 13، إلخ.
dayName | سلسلة،
dayNameShort | سلسلة،
dayPeriod | سلسلة،
dayTwoDigit | 01، 02، 03، ...، 12، 13، إلخ.
hour | 0، 1، 2، 3، ...، 12، 13، ...، 22، 23
hour12 | 1، 2، 3، ...، 12، 1، 2، ...، 11، 12
hour12TwoDigit | 01، 02، ...، 12، 01، 02، ...، 11، 12
hourTwoDigit | 00، 01، 02، ...، 12، 13، ...، 22، 23
iso | سلسلة تواريخ ISO8601 قياسية مثل 2019-01-23T15:31:21.213Z،
localeString | سلسلة ذات تمثيل حساس للغة.
minute | 0، 1، 2، ...، 58، 59
minuteTwoDigit | 00، 01، 02، ...، 58، 59
month | 1، 2، 3، ...، 12
monthName | سلسلة اسم الشهر العالمي.
monthNameShort | سلسلة اسم الشهر المختصر العالمي.،
monthTwoDigit | 01، 02، ...، 11، 12
second | 0، 1، 2، ...، 58، 59
secondTwoDigit | 00، 01، 02، ...، 58، 59
timeZoneName | المنطقة الزمنية الدولية، مثل `Pacific Daylight Time`
timeZoneNameShort | المنطقة الزمنية الدولية، مختصرة، مثل `PST`
year | 0، 1، 2، ...، 1999، 2000، 2001، إلخ.
yearTwoDigit | 00، 01، 02، ...، 17، 18، 19، ...، 98، 99
