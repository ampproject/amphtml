# Bento Date Display

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-display/1.0/README.md
-->

---

## 网页组件

下面的示例演示了 `<bento-date-display>` 网页组件的用法。

### 示例：通过 npm 导入

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

### 交互和 API 用法

Bento Date Display 组件不具备命令式 API。但是，Bento Date Display Preact/React 组件可接受用于渲染使用者模板的 `render` 属性。该 `render` 属性应为可供 Bento Date Display Preact/React 组件用于渲染其模板的函数。将对 `render` 回调提供各种与日期相关的参数，供使用者插入渲染模板。有关更多信息，请参阅 <a href="#render" data-md-type="link">`render` 属性部分</a>。

### 布局和样式

Bento Date Display Preact/React 组件让使用者能够渲染其自己的模板。这些模板可以使用内嵌样式、`<style>` 标记、导入自有样式表的 Preact/React 组件。

### 属性

#### `datetime`

必选属性。将日期和时间以日期、字符串或数字形式表示。如果以字符串形式表示，则必须为标准 ISO 8601 日期字符串（例如 2017-08-02T15:05:05.000Z）或字符串 `now`。如果设置为 `now`，将使用网页加载的时间来呈现其模板。如果以数字形式表示，则必须为以毫秒为单位的 POSIX 时间戳值。

#### `displayIn`

可选属性，可以是 `"utc"` 或 `"local"`，默认为 `"local"`。此属性用于指示显示日期所处的时区。如果设置为值 `"utc"`，则组件会将给定日期转换为 UTC 时间。

#### `locale`

针对每个计时器单元的国际化语言字符串。默认值为 `en`（英语）。此属性支持用户浏览器支持的所有值。

#### `localeOptions`

`localeOptions` 对象支持 [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters) 参数（指定用于 `localeString` 格式的格式样式）下的所有选项。

请注意，如果 `displayIn` 属性被设置为 `utc`，则 `localeOptions.timeZone` 的值将被自动转换为 `UTC`。

#### `render`

应呈现模板的可选回调。将对回调提供一个具有与 `datetime` 中表示的日期相关的属性/值的对象。默认情况下，Bento Date Display 组件将针对给定语言区域和语言区域选项显示 [`localeString` 格式的日期](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString)。有关如何显示每个属性的更多详细信息，请参阅[返回的时间参数](#returned-time-parameters)部分。

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

### 返回的时间参数

下表列出了您可以在 Mustache 模板中指定的格式：

格式 | 含义
--- | ---
day | 1、2…12、13 等
dayName | 字符串
dayNameShort | 字符串
dayPeriod | 字符串
dayTwoDigit | 01、02、03…12、13 等
hour | 0、1、2、3…12、13…22、23
hour12 | 1、2、3…12、1、2…11、12
hour12TwoDigit | 01、02…12、01、02…11、12
hourTwoDigit | 00、01、02…12、13…22、23
iso | 标准 ISO8601 日期字符串，例如 2019-01-23T15:31:21.213Z
localeString | 使用语言敏感表示法的字符串
minute | 0、1、2…58、59
minuteTwoDigit | 00、01、02…58、59
month | 1、2、3…12
monthName | 国际化月份名称字符串
monthNameShort | 国际化缩写月份名称字符串
monthTwoDigit | 01、02…11、12
second | 0、1、2…58、59
secondTwoDigit | 00、01、02…58、59
timeZoneName | 国际化时区，例如 `Pacific Daylight Time`
timeZoneNameShort | 国际化时区（缩写），例如 `PST`
year | 0、1、2…1999、2000、2001 等
yearTwoDigit | 00、01、02…17、18、19…98、99
