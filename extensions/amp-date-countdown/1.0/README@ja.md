# Bento Date Countdown

適切な読み込みを保証するには、Bento コンポーネントの必須 CSS ライブラリをカスタムスタイルを追加する前にインクルードする必要があります。または、インラインで使用可能な軽量のアップグレード前のスタイルを使用することも可能です。[レイアウトとスタイル](#layout-and-style)を参照してください。

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## Preact/React コンポーネント

以下は、`<bento-date-countdown>` ウェブコンポーネントの使用例を示しています。

### 例: npm によるインポート

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

### インタラクティビティと API の使用

Bento Date Countdown コンポーネントには命令型 API がありませんが、Bento Date Countdown Preact/React コンポーネントは消費者のテンプレートをレンダリングする `render` プロップを受け入れます。この `render` プロップは、Bento Date Countdown Preact/React コンポーネントがテンプレートをレンダリングするために使用できる関数である必要があります。`render` コールバックには、消費者がレンダリングされるテンプレートを補完するための日付関連のパラメーターが提供されます。詳細については、<a href="#render" data-md-type="link">`render` プロップのセクション</a>を参照してください。

### レイアウトとスタイル

Bento Date Countdown Preact/React コンポーネントでは、消費者が独自のテンプレートをレンダリングすることができます。これらのテンプレートは、独自のスタイルシートをインポートする Preact/React コンポーネントであるインラインスタイルの `<style>` タグを使用できます。

### プロップ

#### `datetime`

必須プロップ。日付と時刻を日付型、文字列型、または数値型として示します。文字列である場合、標準のISO 8601 日付型文字列（例: 2017-08-02T15:05:05.000Z）か、文字列 `now` である必要があります。`now` に設定した場合、ページがテンプレートをレンダリングするためにロードされた時間が使用されます。数値である場合、ミリ秒単位の POSIX エポック値である必要があります。

#### `locale`

各タイマーの単位に使用される国際化対応言語文字列。デフォルト値は `en`（英語）です。このプロップは、ユーザーのブラウザがサポートしているすべての値をサポートします。

#### `whenEnded`

タイマーが 0 秒に達したときに、そのタイマーを停止するかどうかを指定します。値は、`stop`（デフォルト）に設定すると、0 秒でタイマーを停止して最終の日付を超えることはありません。`continue` に設定すると、0 秒に達した後もタイマーは続行します。

#### `biggestUnit`

`bento-date-countdown` コンポーネントが指定された `biggest-unit` 値に基づいて時刻の差を計算できるようにします。たとえば、残り時間が `50 日 10 時間`であるとすると、`biggest-unit` が `hours` に設定されている場合、残り時間は `1210 hours` として表示されます。

- サポートされている値: `days`、`hours`、`minutes`、`seconds`
- デフォルト: `days`

#### `countUp`

このプロップを含めると、カウントダウンの方向が反転し、カウントアップされます。これは、過去のターゲット日付からの経過時間を表示する際に役立ちます。ターゲット日付が過去となった時にカウントダウンを続行するには、`when-ended` プロップを使用し、`continue` 値を指定するようにしてください。ターゲット日付が未来の日付である場合、`bento-date-countdown` は 0 に向けて減分する負の値を表示します。

#### `render`

テンプレートをレンダリングするオプションのコールバックです。このコールバックには、`datetime` で表現される日付に関連するプロパティ/値を持つプロジェクトが指定されます。デフォルトでは、Bento Date Countdown コンポーネントは、特定のロケールと localeOption に対し、[日付型の `localeString` 形式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString)を表示します。各プロパティがどのように表示されるかについての詳細は、[返される時間パラメーターのセクション](#returned-time-parameters)を参照してください。

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

### 返される時間パラメーター

以下の表は、Mustach テンプレートに指定できるフォーマットを記載しています。

フォーマット | 意味
--- | ---
d | 日数 - 0、1、2、...12、13..無限
dd | 日数 - 00、01、02、03..無限
h | 時間数 - 0、1、2、...12、13..無限
hh | 時間数 - 01、02、03..無限
m | 分数 - 0、1、2、...12、13..無限
mm | 分数 - 01、01、02、03..無限
s | 秒数 - 0、1、2、...12、13..無限
ss | 秒数 - 00、01、02、03..無限
days | 日数の国際化対応文字列
hours | 時間数の国際化対応文字列
minutes | 分数の国際化対応文字列
seconds | 秒数の国際化対応文字列

#### フォーマット付き値の例

以下の表は、Mustache テンプレートに指定されたフォーマット付き値の例とその出力例を記載しています。

フォーマット | 出力例 | 注記
--- | --- | ---
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} and {m} {minutes} and {s} {seconds} | 4 hours and 1 minutes and 45 seconds | -
{d} {days} {h}:{mm} | 1 day 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 days 5 hours 10 minutes | -
{d} {days} {h} {hours} {m} {minutes} | 20 days 5 hours 10 minutes | -
{h} {hours} {m} {minutes} | 240 hours 10 minutes | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`
