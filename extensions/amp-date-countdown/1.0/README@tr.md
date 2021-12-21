# Bento Date Countdown

Uygun yüklemeyi garanti etmek için ve özel stiller eklemeden önce her Bento bileşeninin gerekli CSS kitaplığını eklemelisiniz. Veya satır içi olarak sunulan hafif ön yükseltme stillerini kullanın. [Yerleşim ve stil](#layout-and-style) konusuna bakın.

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## Preact/React Bileşeni

Aşağıdaki örnekler, `<bento-date-countdown>` web bileşeninin kullanımını göstermektedir.

### Örnek: npm ile içe aktarma

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

### Etkileşim ve API kullanımı

Bento Date Countdown bileşeninin zorunlu bir API'si yoktur. Ancak, Bento Date Countdown Preact/React bileşeni, tüketicinin şablonunu derleyen bir `render` aksesuarı kabul eder. Bu `render` aksesuarı, Bento Date Countdown Preact/React bileşeninin şablonunu oluşturmak için kullanabileceği bir fonksiyon olmalıdır. `render` geri çağrısına, tüketicilerin oluşturulan şablonda enterpolasyon yapması için tarihle ilgili çeşitli parametreler eklenecektir. Daha fazla bilgi için <a href="#render" data-md-type="link">`render` aksesuarı bölümüne bakın.</a>

### Yerleşim ve stil

Bento Date Countdown Preact/React bileşeni, tüketicilerin kendi şablonlarını oluşturmasına olanak tanır. Bu şablonlar, kendi stil sayfalarını içe aktaran satır içi stiller, `<style>` etiketleri, Preact/React bileşenleri kullanabilir.

### Aksesuarlar

#### `datetime`

Gerekli aksesuarlar. Tarih ve saati Tarih (Date), Dize (String) veya Sayı (Number) olarak belirtir. Dize ise, standart bir ISO 8601 tarih dizesi (ör. 2017-08-02T15:05:05.000Z) veya `now` dizesi olmalıdır. `now` ayarlanırsa, şablonunu oluşturmak için sayfanın yüklendiği zamanı kullanır. Sayı ise, milisaniye cinsinden bir POSIX dönem değeri olmalıdır.

#### `locale`

Her zamanlayıcı birimi için bir uluslararasılaştırma dili dizisi. Varsayılan değer `en` (İngilizce için) şeklindedir. Bu aksesuar, kullanıcının tarayıcısı tarafından desteklenen tüm değerleri destekler.

#### `whenEnded`

0 saniyeye ulaştığında zamanlayıcının durdurulup durdurulmayacağını belirtir. Değer, zamanlayıcıya 0. saniyede durması gerektiğini belirtmek için `stop` (varsayılan) edecek şekilde ayarlanabilir ve son tarihi geçmez ya da zamanlayıcıya 0. saniyeye ulaştıktan sonra devam etmesini belirtmek için `continue` kullanılabilir.

#### `biggestUnit`

`bento-date-countdown`'nın `biggest-unit` değerine dayalı olarak zaman farkını hesaplamasına izin verir. Örneğin, `50 days 10 hours` (50 gün 10 saat) kaldığını varsayalım, `biggest-unit` `hours` olarak ayarlandıysa sonuç `1210 hours` kaldığını gösterir.

- Desteklenen değerler: `days`, `hours`, `minutes`, `seconds`
- Varsayılan: `days`

#### `countUp`

Bunun yerine ileri sayım yönünü tersine çevirmek için bu aksesuarı ekleyin. Bu, geçmişteki bir hedef tarihten itibaren geçen süreyi görüntülemek için kullanışlıdır. Hedef tarih geçmişte ise geri sayıma devam etmek için, `continue` değerine `when-ended` aksesuarını ekleyin. Hedef tarih gelecekteyse, `bento-date-countdown`, azalan (0'a doğru) bir negatif değer gösterecektir.

#### `render`

Bir şablon oluşturması gereken isteğe bağlı geri arama. `datetime` ifade edilen tarihle ilgili özelliklere/değerlere sahip bir nesne sağlanacaktır. Varsayılan olarak, Bento Date Countdown bileşeni, verilen yerel ayar ve localeOption için [`localeString` biçimini görüntüler.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) Her bir özelliğin nasıl görüntüleneceği hakkında daha fazla ayrıntı için [Döndürülen Zaman Parametreleri](#returned-time-parameters) bölümüne bakın.

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

Biçim | Anlamı
--- | ---
d | gün - 0, 1, 2,...12, 13..Sonsuz
dd | gün - 00, 01, 02, 03..Sonsuz
h | saat - 0, 1, 2,...12, 13..Sonsuz
hh | saat - 01, 02, 03..Sonsuz
m | dakika - 0, 1, 2,...12, 13..Sonsuz
mm | dakika - 01, 01, 02, 03..Sonsuz
s | saniye - 0, 1, 2,...12, 13..Sonsuz
ss | saniye - 00, 01, 02, 03..Sonsuz
days | gün veya günler için uluslararasılaştırma dizesi
hours | saat veya saat için uluslararasılaştırma dizesi
minutes | dakika veya dakika için uluslararasılaştırma dizesi
seconds | saniye veya saniye için uluslararasılaştırma dizesi

#### Biçimlendirilmiş değer örnekleri

Bu tablo, bir Mustache şablonunda belirtilen biçimlendirilmiş değerlerin örneklerini ve çıktının ne olduğuna dair bir örnek sağlar:

Biçim | Örnek Çıktı | Yorum
--- | --- | ---
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} and {m} {minutes} and {s} {seconds} | 4 hours and 1 minutes and 45 seconds | -
{d} {days} {h}:{mm} | 1 day 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 days 5 hours 10 minutes | -
{d} {days} {h} {hours} {m} {minutes} | 20 days 5 hours 10 minutes | -
{h} {hours} {m} {minutes} | 240 hours 10 minutes | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`
