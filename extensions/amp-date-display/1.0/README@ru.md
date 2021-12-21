# Bento Date Display

Чтобы гарантировать правильную загрузку, вы должны подключить необходимые CSS-библиотеки всех компонентов Bento (это нужно сделать перед добавлением пользовательских стилей). Как вариант, вы можете использовать встраиваемые облегченные стили от предыдущей версии компонента. См. [Макет и стиль](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-display/1.0/README.md
-->

---

## Веб-компонент

Представленные ниже примеры демонстрируют использование веб-компонента `<bento-date-display>`.

### Пример: импорт через npm

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

### Интерактивность и использование API

Компонент Bento Date Display не имеет императивного API, однако Bento Date Display для Preact/React принимает prop `render`, используемый для рендеринга шаблона потребителя. Prop `render` должен быть функцией, которую компонент Bento Date Display для Preact/React может использовать для рендеринга своего шаблона. Обратный вызов `render` снабжается различными связанными с датой параметрами, которые подставляются потребителями в отображаемый шаблон при помощи интерполяции. Дополнительную информацию см. в <a href="#render" data-md-type="link">разделе о `render`</a>.

### Макет и стиль

Компонент Bento Date Display для Preact/React позволяет потребителям создавать собственные шаблоны. Эти шаблоны могут использовать встроенные стили, теги `<style>` и компоненты Preact/React, которые импортируют собственные таблицы стилей.

### Props

#### `datetime`

Обязательный prop. Содержит дату и время в формате Date, String или Number. При использовании String это должна быть стандартная строка даты ISO 8601 (например, 2017-08-02T15:05:05.000Z) или строка `now`. Если установлено значение `now`, для рендеринга своего шаблона компонент будет использовать время на момент загрузки страницы. Если используется Number, число должно быть представлением времени по стандарту POSIX в миллисекундах.

#### `displayIn`

Опциональный prop, который может иметь значение либо `"utc"`, либо `"local"`, по умолчанию — `"local"`. Этот prop указывает, в каком часовом поясе следует отображать дату. Если установлено значение `"utc"`, компонент преобразует заданную дату в UTC.

#### `locale`

Язык локализации единиц, используемых таймером. По умолчанию — `en` (английский). Этот prop поддерживает все значения, поддерживаемые браузером пользователя.

#### `localeOptions`

Объект `localeOptions` поддерживает все значения параметра [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters), который указывает стиль форматирования, используемый для формата `localeString`.

Обратите внимание, что если `displayIn` имеет значение `utc`, значение `localeOptions.timeZone` будет автоматически преобразовано в `UTC`.

#### `render`

Опциональный обратный вызов, который выполняет рендеринг шаблона. Обратному вызову предоставляется объект со свойствами/значениями даты, выраженной в `datetime`. По умолчанию компонент Bento Date Display будет отображать дату в формате, соответствующем [`localeString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) для заданных значений locale и localeOption. См. раздел [Возвращаемые параметры времени](#returned-time-parameters) для получения более подробной информации о том, как будет отображаться каждое из свойств.

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

### Возвращаемые параметры времени

В таблице ниже приводятся форматы для шаблона Mustache.

| Формат            | Значение                                                                           |
| ----------------- | ---------------------------------------------------------------------------------- |
| day               | 1, 2, ...12, 13 и т. д.                                                            |
| dayName           | строка,                                                                            |
| dayNameShort      | строка,                                                                            |
| dayPeriod         | строка,                                                                            |
| dayTwoDigit       | 01, 02, 03, ..., 12, 13 и т. д.                                                    |
| hour              | 0, 1, 2, 3, ..., 12, 13, ..., 22, 23                                               |
| hour12            | 1, 2, 3, ..., 12, 1, 2, ..., 11, 12                                                |
| hour12TwoDigit    | 01, 02, ..., 12, 01, 02, ..., 11, 12                                               |
| hourTwoDigit      | 00, 01, 02, ..., 12, 13, ..., 22, 23                                               |
| iso               | Стандартная строка даты ISO8601, например: 2019-01-23T15:31:21.213Z,               |
| localeString      | Строка с языкозависимым представлением даты.                                       |
| minute            | 0, 1, 2, ..., 58, 59                                                               |
| minuteTwoDigit    | 00, 01, 02, ..., 58, 59                                                            |
| month             | 1, 2, 3, ..., 12                                                                   |
| monthName         | Строка с локализованным названием месяца.                                          |
| monthNameShort    | Строка с сокращенным локализованным названием месяца.                              |
| monthTwoDigit     | 01, 02, ..., 11, 12                                                                |
| second            | 0, 1, 2, ..., 58, 59                                                               |
| secondTwoDigit    | 00, 01, 02, ..., 58, 59                                                            |
| timeZoneName      | Локализованное наименование часового пояса, например: `Тихоокеанское летнее время` |
| timeZoneNameShort | Локализованное наименование часового пояса, сокращенная версия, например: `PST`    |
| year              | 0, 1, 2, ..., 1999, 2000, 2001 и т. д.                                             |
| yearTwoDigit      | 00, 01, 02, ..., 17, 18, 19, ..., 98, 99                                           |
