# المكون Bento Date Countdown

يجب تضمين كل مكتبة صفحات الأنماط المتتالية (CSS) المطلوبة لمكون Bento لضمان التحميل المناسب وقبل إضافة أنماط مخصصة. أو استخدم أنماط ما قبل الترقية منخفضة المستوى المتوفرة بشكل ضمني. راجع [التخطيط والنمط](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## مكون Preact/React

توضح الأمثلة أدناه استخدام مكون الويب `<bento-date-countdown>`.

### مثال: استيراد عبر npm

```sh
npm install @bentoproject/date-countdown
```

```javascript
import React from 'react';
import {BentoDateCountdown} from '@bentoproject/date-countdown/react';
import '@bentoproject/date-countdown/styles.css';

function App() {
  return (
    <BentoDateCountdown
      datetime={200000000}
      biggestUnit={'HOURS'}
      render={(data) => (
        <div>
          <span>{`${data.days} ${data.dd} ${data.d}`}</span>
          <br />
          <span>{`${data.hours} ${data.hh} ${data.h}`}</span>
          <br />
          <span>{`${data.minutes} ${data.mm} ${data.m}`}</span>
          <br />
          <span>{`${data.seconds} ${data.ss} ${data.s}`}</span>
        </div>
      )}
    />
  );
}
```

### التفاعل واستخدام واجهة برمجة التطبيقات (API)

لا يحتوي المكون Bento Date Countdown على واجهة برمجة تطبيقات إلزامية. ومع ذلك، فإن مكون Bento Date Countdown Preact/React يقبل خاصية `dreding` التي تعرض نموذج المستهلك. ويجب أن تكون خاصية `render` هذه دالة يمكن للمكون Bento Date Countdown Preact/React استخدامها لعرض نموذجه. وسيتم توفير معامِلات متنوعة مرتبطة بالتاريخ لإعادة الاستدعاء `render` للمستهلكين للاستكمال في النموذج المعروض. راجع <a href="#render" data-md-type="link">قسم خاصية `render`{/a3 لمزيد من المعلومات.</a>

### المخطط والنمط

يسمح المكون Bento Date Countdown Preact/React للمستهلكين بعرض النماذج الخاصة بهم. وقد تستخدم هذه النماذج أنماط ضمنية، والعلامة `<style>`، ومكونات Preact/React التي تستورد صفحات الأنماط الخاصة بها.

### الخصائص

#### `datetime`

الخاصية المطلوبة. تشير إلى التاريخ والوقت كتاريخ أو سلسلة أو رقم جديد. فإذا كان التاريخ والوقت سلسلة، يجب أن تكون سلسلة تواريخ ISO 8601 قياسية (على سبيل المثال، 2017-08-02T15:05:05.000Z) أو السلسلة `now`. وإذا تم تعيينها إلى `now`، فسيستخدم الوقت الذي تم تحميل الصفحة فيه لعرض نموذجها. وإذا كان التاريخ والوقت رقمًا، يجب أن يكون قيمة فترة POSIX بالمللي ثانية.

#### `locale`

سلسلة لغة تدويل لكل وحدة مؤقِّت. والقيمة الافتراضية هي `en` (للغة الإنجليزية). وتدعم هذه الخاصية جميع القيم التي يدعمها مستعرض المستخدم.

#### `whenEnded`

تحديد ما إذا كان سيتم إيقاف المؤقِّت عندما يصل إلى 0 ثانية. ويمكن تعيين القيمة إلى `stop` (افتراضي) للإشارة إلى توقف المؤقِّت عند 0 ثانية ولن يجتاز التاريخ النهائي، أو `continue` للإشارة إلى أن المؤقِّت يجب أن يستمر بعد الوصول إلى 0 ثانية.

#### `biggestUnit`

يسمح للمكون `bent-date-countdown` بحساب فرق الوقت على أساس قيمة `biggest-unit` المحددة. على سبيل المثال، افتراض وجود `50 days 10 hours` متبقية، إذا تم تعيين `biggest-unit` إلى `hours`، فستعرض النتيجة `1210 hours` متبقية.

- القيم المدعومة: `days`، `hours`، `minutes`، `seconds`
- القيمة الافتراضية: `days`

#### `countUp`

يمكن تضمين هذه الخاصية لعكس اتجاه العد التنازلي للعد للأعلى بدلاً من ذلك. ومن المفيد عرض الوقت المنقضي منذ تاريخ مستهدف في الماضي. ولمتابعة العد التنازلي عندما يقع التاريخ المستهدف في الماضي، تأكد من تضمين الخاصية `whentamp` بالقيمة `continue`. وإذا كان التاريخ المستهدف في المستقبل، فسيعرض `bento-date-countdown` قيمة سالبة (نحو 0).

#### `render`

استدعاء اختياري يجب أن يعرض نموذجًا. سيقدم الاستدعاء كائنًا بخصائص/قيم مرتبطة بالتاريخ الموضح في `datetime`. وبشكل افتراضي، سيعرض المكون Bento Date Countdown [النموذج `localeString` للتاريخ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) للإعدادات المحلية المحددة وخيار الإعدادات المحلية. راجع [قسم معلمات الوقت المرتجعة](#returned-time-parameters) لمزيد من التفاصيل حول كيفية عرض كل خاصية.

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
d | يوم - 0، 1، 2،...12، 13..ما لا نهاية
dd | يوم - 00، 01، 02، 03..ما لا نهاية
h | ساعة - 0، 1، 2،...12، 13..ما لا نهاية
hh | ساعة - 01، 02، 03..ما لا نهاية
m | دقيقة - 0, 1, 2,...12, 13..ما لا نهاية
mm | دقيقة - 01، 01، 02، 03..ما لا نهاية
s | ثانية - 0، 1، 2،...12، 13..ما لا نهاية
ss | ثانية - 00، 01، 02، 03..ما لا نهاية
days | سلسلة التدويل لليوم أو الأيام
hours | سلسلة التدويل للساعة أو الساعات
minutes | سلسلة التدويل للدقيقة أو الدقائق
seconds | سلسلة التدويل للثانية أو الثواني

#### عينات القيم المنسقة

يقدم هذا الجدول أمثلة على القيم المنسقة المحددة في نموذج Mustache، وعينة للإخراج:

التنسيق | عينة الإخراج | ملاحظات
--- | --- | ---
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} and {m} {minutes} and {s} {seconds} | 4 ساعات ودقيقة و45 ثانية | -
{d} {days} {h}:{mm} | يوم واحد 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | ٥٠ يومًا و٥ ساعات و١٠ دقائق | -
{d} {days} {h} {hours} {m} {minutes} | ٢٠ يومًا و٥ ساعات و١٠ دقائق | -
{h} {hours} {m} {minutes} | 10 دقائق 240 ساعة | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`
