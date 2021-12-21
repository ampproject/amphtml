# Bento Date Display

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-display/1.0/README.md
-->

---

## Web Bileşeni

Aşağıdaki örnekler, `<bento-date-display>` web bileşeninin kullanımını göstermektedir.

### Örnek: npm ile içe aktarma

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

### Etkileşim ve API kullanımı

Bento Date Display bileşeninin zorunlu bir API'si yoktur. Ancak, Bento Date Display Preact/React bileşeni, tüketicinin şablonunu derleyen bir `render` aksesuarı kabul eder. Bu `render` aksesuarı, Bento Date Display Preact/React bileşeninin şablonunu oluşturmak için kullanabileceği bir fonksiyon olmalıdır. `render` geri çağrısına, tüketicilerin oluşturulan şablonda enterpolasyon yapması için tarihle ilgili çeşitli parametreler eklenecektir. Daha fazla bilgi için <a href="#render" data-md-type="link">`render` aksesuarı bölümüne bakın.</a>

### Yerleşim ve stil

Bento Date Display Preact/React bileşeni, tüketicilerin kendi şablonlarını oluşturmasına olanak tanır. Bu şablonlar, kendi stil sayfalarını içe aktaran satır içi stiller, `<style>` etiketleri, Preact/React bileşenleri kullanabilir.

### Aksesuarlar

#### `datetime`

Gerekli aksesuarlar. Tarih ve saati Tarih (Date), Dize (String) veya Sayı (Number) olarak belirtir. Dize ise, standart bir ISO 8601 tarih dizesi (ör. 2017-08-02T15:05:05.000Z) veya `now` dizesi olmalıdır. `now` ayarlanırsa, şablonunu oluşturmak için sayfanın yüklendiği zamanı kullanır. Sayı ise, milisaniye cinsinden bir POSIX dönem değeri olmalıdır.

#### `displayIn`

`"utc"` veya `"local"` olabilen ve varsayılan olarak `"local"` olan isteğe bağlı aksesuar. Bu destek, tarihin hangi saat diliminde görüntüleneceğini belirtir. `"utc"` değerine ayarlanırsa, bileşen verilen tarihi UTC'ye dönüştürür.

#### `locale`

Her zamanlayıcı birimi için bir uluslararasılaştırma dili dizisi. Varsayılan değer `en` (İngilizce için) şeklindedir. Bu aksesuar, kullanıcının tarayıcısı tarafından desteklenen tüm değerleri destekler.

#### `localeOptions`

`localeOptions` <code>localeString</code> biçimi için kullanılacak biçimlendirme stilini belirten <a>Intl.DateTimeFormat.options</a> parametresi altındaki tüm seçenekleri destekler.

`displayIn` `utc` olarak ayarlanırsa, `localeOptions.timeZone` değerinin otomatik olarak `UTC` dönüştürüleceğini unutmayın.

#### `render`

Bir şablon oluşturması gereken isteğe bağlı geri arama. `datetime` ifade edilen tarihle ilgili özelliklere/değerlere sahip bir nesne sağlanacaktır. Varsayılan olarak, Bento Date Display bileşeni, verilen yerel ayar ve localeOption için [`localeString` biçimini görüntüler.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) Her bir özelliğin nasıl görüntüleneceği hakkında daha fazla ayrıntı için [Döndürülen Zaman Parametreleri](#returned-time-parameters) bölümüne bakın.

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

### Döndürülen Zaman Parametreleri

Bu tablo, Mustache şablonunuzda belirtebileceğiniz biçimi listeler:

| Biçim             | Anlamı                                                           |
| ----------------- | ---------------------------------------------------------------- |
| day               | 1, 2, ...12, 13 vb.                                              |
| dayName           | dize,                                                            |
| dayNameShort      | dize,                                                            |
| dayPeriod         | dize,                                                            |
| dayTwoDigit       | 01, 02, 03, ..., 12, 13 vb.                                      |
| hour              | 0, 1, 2, 3, ..., 12, 13, ..., 22, 23                             |
| hour12            | 1, 2, 3, ..., 12, 1, 2, ..., 11, 12                              |
| hour12TwoDigit    | 01, 02, ..., 12, 01, 02, ..., 11, 12                             |
| hourTwoDigit      | 00, 01, 02, ..., 12, 13, ..., 22, 23                             |
| iso               | Standart bir ISO8601 tarih dizesi ör. 2019-01-23T15:31:21.213Z,  |
| localeString      | Dile duyarlı temsili olan bir dize.                              |
| minute            | 0, 1, 2, ..., 58, 59                                             |
| minuteTwoDigit    | 00, 01, 02, ..., 58, 59                                          |
| month             | 1, 2, 3, ..., 12                                                 |
| monthName         | Uluslararasılaştırılmış ay adı dizesi.                           |
| monthNameShort    | Uluslararasılaştırılmış kısaltılmış ay adı dizesi.,              |
| monthTwoDigit     | 01, 02, ..., 11, 12                                              |
| second            | 0, 1, 2, ..., 58, 59                                             |
| secondTwoDigit    | 00, 01, 02, ..., 58, 59                                          |
| timeZoneName      | `Pacific Daylight Time` gibi uluslararasılaştırılmış saat dilimi |
| timeZoneNameShort | Uluslararasılaştırılmış saat dilimi, kısaltılmış, `PST`          |
| year              | 0, 1, 2, ..., 1999, 2000, 2001 vb.                               |
| yearTwoDigit      | 00, 01, 02, ..., 17, 18, 19, ..., 98, 99                         |
