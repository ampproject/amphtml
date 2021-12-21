# Bento Date Display

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-display/1.0/README.md
-->

---

## Komponen Web

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-date-display>`.

### Contoh: Impor melalui npm

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

### Interaktivitas dan penggunaan API

Komponen Bento Date Display tidak memiliki API imperatif. Namun, komponen Preact/React Bento Date Display menerima prop `render` yang merender templat konsumen. Prop `render` ini harus berupa fungsi yang dapat digunakan oleh komponen Preact/React Bento Date Display untuk merender templatnya. Callback `render` akan diberikan berbagai parameter terkait tanggal bagi konsumen, untuk diinterpolasi dalam templat yang dirender. Lihat <a href="#render" data-md-type="link">bagian prop `render`</a> untuk mendapatkan informasi lebih lanjut.

### Tata letak dan gaya

Komponen Preact/React Bento Date Display memungkinkan konsumen untuk merender templat mereka sendiri. Templat ini dapat menggunakan gaya inline, tag `<style>`, komponen Preact/React yang mengimpor lembar gaya mereka sendiri.

### Prop

#### `datetime`

Diperlukan prop. Menunjukkan tanggal dan waktu sebagai Tanggal, Untai, atau Angka. Jika Untai, harus berupa untai tanggal ISO 8601 standar (cth.: 2017-08-02T15:05:05.000Z) atau untai `now`. Jika ditetapkan ke `now`, itu akan menggunakan waktu saat halaman dimuat untuk merender templatnya. Jika Angka, harus berupa nilai kurun POSIX dalam milidetik.

#### `displayIn`

Prop opsional yang dapat berupa `"utc"` atau `"local"` dan default ke `"local"`. Prop ini menunjukkan zona waktu untuk menampilkan tanggal. Jika ditetapkan ke nilai `"utc"`, komponen akan mengonversi tanggal yang diberikan ke UTC.

#### `locale`

Untai bahasa internasionalisasi untuk setiap unit pengatur waktu. Nilai default atau standarnya adalah `en` (untuk bahasa Inggris). Prop ini mendukung semua nilai yang didukung oleh browser pengguna.

#### `localeOptions`

Objek `localeOptions` mendukung semua opsi di bawah parameter [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters) yang menentukan gaya pemformatan yang akan digunakan untuk format `localeString`.

Harap ketahui bahwa jika prop `displayIn` ditetapkan ke `utc`, nilai `localeOptions.timeZone` akan secara otomatis dikonversi ke `UTC`.

#### `render`

Callback opsional yang harus merender templat. Callback atau panggil balik akan diberi objek dengan properti/nilai yang terkait dengan tanggal yang dinyatakan dalam `datetime`. Secara default, komponen Bento Date Display akan menampilkan [bentuk Tanggal`localeString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) untuk lokal dan localeOption yang diberikan. Lihat bagian [Parameter Waktu yang Dikembalikan](#returned-time-parameters) untuk mengetahui lebih lanjut tentang bagaimana setiap properti akan ditampilkan.

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

### Parameter Waktu yang Dikembalikan

Tabel ini mencantumkan format yang dapat Anda tentukan di templat Misai Anda:

| Format            | Arti                                                                |
| ----------------- | ------------------------------------------------------------------- |
| day               | 1, 2, ...12, 13, dll.                                               |
| dayName           | untai,                                                              |
| dayNameShort      | untai,                                                              |
| dayPeriod         | untai,                                                              |
| dayTwoDigit       | 01, 02, 03, ..., 12, 13, dll.                                       |
| hour              | 0, 1, 2, 3, ..., 12, 13, ..., 22, 23                                |
| hour12            | 1, 2, 3, ..., 12, 1, 2, ..., 11, 12                                 |
| hour12TwoDigit    | 01, 02, ..., 12, 01, 02, ..., 11, 12                                |
| hourTwoDigit      | 00, 01, 02, ..., 12, 13, ..., 22, 23                                |
| iso               | Untai tanggal ISO8601 standar, cth.: 23-01-2019T15:31:21.213Z,      |
| localeString      | Untai dengan representasi sensitif bahasa.                          |
| minute            | 0, 1, 2, ..., 58, 59                                                |
| minuteTwoDigit    | 00, 01, 02, ..., 58, 59                                             |
| month             | 1, 2, 3, ..., 12                                                    |
| monthName         | Untai nama bulan yang diinternasionalkan.                           |
| monthNameShort    | Untai singkatan nama bulan yang dinternasionalkan.,                 |
| monthTwoDigit     | 01, 02, ..., 11, 12                                                 |
| second            | 0, 1, 2, ..., 58, 59                                                |
| secondTwoDigit    | 00, 01, 02, ..., 58, 59                                             |
| timeZoneName      | Zona waktu yang diinternasionalkan, seperti `Pacific Daylight Time` |
| timeZoneNameShort | Singkatan zona waktu yang diinternasionalkan, seperti `PST`         |
| year              | 0, 1, 2, ..., 1999, 2000, 2001, dll.                                |
| yearTwoDigit      | 00, 01, 02, ..., 17, 18, 19, ..., 98, 99                            |
