# Bento Date Countdown

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## Preact/React 组件

下面的示例演示了 `<bento-date-countdown>` 网页组件的用法。

### 示例：通过 npm 导入

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

### 互动和 API 用法

Bento Date Countdown 组件不具备命令式 API。但是，Bento Date Countdown Preact/React 组件可接受用于呈现使用者模板的 `render` 属性。此 `render` 属性应为可供 Bento Date Countdown Preact/React 组件用于呈现其模板的函数。将对 `render` 回调提供各种与日期相关的参数，供使用者插入呈现模板。请参阅 <a href="#render" data-md-type="link">`render` 属性</a>部分，了解更多信息。

### 布局和样式

Bento Date Countdown Preact/React 组件让使用者能够呈现其自己的模板。这些模板可以使用内嵌样式、`<style>` 标记、导入自有样式表的 Preact/React 组件。

### 属性

#### `datetime`

必选属性。将日期和时间以日期、字符串或数字形式表示。如果以字符串形式表示，则必须为标准 ISO 8601 日期字符串（例如 2017-08-02T15:05:05.000Z）或字符串 `now`。如果设置为 `now`，将使用网页加载的时间来呈现其模板。如果以数字形式表示，则必须为以毫秒为单位的 POSIX 时间戳值。

#### `locale`

针对每个计时器单元的国际化语言字符串。默认值为 `en`（英语）。此属性支持用户浏览器支持的所有值。

#### `whenEnded`

指定到达 0 秒时是否停止计时器。该值可以设置为 `stop`（默认）以指示计时器在 0 秒时停止并且不会超过最终日期，或者设置为 `continue` 以指示计时器应在到达 0 秒后继续计时。

#### `biggestUnit`

使 `bento-date-countdown` 组件可以基于指定的 `biggest-unit` 值计算时间差。例如，假设剩余 `50 days 10 hours`，如果 `biggest-unit` 设置为 `hours`，结果将显示剩余  `1210 hours`。

- 支持的值：`days`、`hours`、`minutes`、`seconds`
- 默认值：`days`

#### `countUp`

包含此属性可反转倒计时的方向，使其改为正计时。如需显示自过去的目标日期以来经过的时间，该属性将非常实用。要在目标日期已过的情况下继续倒计时，请确保包含 `when-ended` 属性和 `continue` 值。如果目标日期在未来，`bento-date-countdown` 将显示递减（向 0）的负值。

#### `render`

应呈现模板的可选回调。将对回调提供一个具有与 `datetime` 中表示的日期相关的属性/值的对象。默认情况下，Bento Date Countdown 组件将针对给定语言区域和语言区域选项显示 [`localeString` 格式的日期](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString)。有关如何显示每个属性的更多详细信息，请参阅[返回的时间参数](#returned-time-parameters)部分。

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
d | 天 - 0、1、2…12、13…无穷大
dd | 天 - 00、01、02、03…无穷大
h | 小时 - 0、1、2…12、13…无穷大
hh | 小时 - 01、02、03…无穷大
m | 分钟 - 0、1、2…12、13…无穷大
mm | 分钟 - 01、02、03…无穷大
s | 秒钟 - 0、1、2…12、13…无穷大
ss | 秒钟 - 00、01、02、03…无穷大
days | 天的国际化字符串
hours | 小时的国际化字符串
minutes | 分钟的国际化字符串
seconds | 秒钟的国际化字符串

#### 格式化值示例

下表提供了在 Mustache 模板中指定的格式化值的示例，以及输出结果示例：

格式 | 输出结果示例 | 备注
--- | --- | ---
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} and {m} {minutes} and {s} {seconds} | 4 hours and 1 minutes and 45 seconds | -
{d} {days} {h}:{mm} | 1 day 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 days 5 hours 10 minutes | -
{d} {days} {h} {hours} {m} {minutes} | 20 days 5 hours 10 minutes | -
{h} {hours} {m} {minutes} | 240 hours 10 minutes | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`
