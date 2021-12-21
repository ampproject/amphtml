# Bento Date Countdown

Anda harus menyertakan perpustakaan CSS yang diperlukan setiap komponen Bento untuk menjamin pemuatan yang tepat dan sebelum menambahkan gaya khusus. Atau gunakan gaya pra-peningkatan ringan yang tersedia inline. Lihat [Tata Letak dan gaya](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## Komponen Preact/React

Contoh di bawah ini menunjukkan penggunaan komponen web `<bento-date-countdown>`.

### Contoh: Impor melalui npm

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

### Interaktivitas dan penggunaan API

Komponen Bento Date Countdown tidak memiliki API imperatif. Namun, komponen Preact/React Bento Date Countdown menerima prop `render` yang merender templat konsumen. Prop `render` ini harus berupa fungsi yang dapat digunakan oleh komponen Preact/React Bento Date Countdown untuk merender templatnya. Callback atau panggil balik `render` akan diberikan berbagai parameter terkait tanggal bagi konsumen, untuk diinterpolasi dalam templat yang dirender. Lihat <a href="#render" data-md-type="link">bagian prop `render`</a> untuk mendapatkan informasi lebih lanjut.

### Tata letak dan gaya

Komponen Preact/React Bento Date Countdown memungkinkan konsumen untuk merender templat mereka sendiri. Templat ini dapat menggunakan gaya inline, tag `<style>`, komponen Preact/React yang mengimpor lembar gaya mereka sendiri.

### Prop

#### `datetime`

Diperlukan prop. Menunjukkan tanggal dan waktu sebagai Tanggal, Untai, atau Angka. Jika Untai, harus berupa untai tanggal ISO 8601 standar (cth.: 2017-08-02T15:05:05.000Z) atau untai `now`. Jika ditetapkan ke `now`, itu akan menggunakan waktu saat halaman dimuat untuk merender templatnya. Jika Angka, harus berupa nilai kurun POSIX dalam milidetik.

#### `locale`

Untai bahasa internasionalisasi untuk setiap unit pengatur waktu. Nilai default atau standarnya adalah `en` (untuk bahasa Inggris). Prop ini mendukung semua nilai yang didukung oleh browser pengguna.

#### `whenEnded`

Menentukan apakah akan menghentikan pengatur waktu saat mencapai 0 detik. Nilai tersebut dapat ditetapkan ke `stop` (default) untuk mengindikasikan bahwa pengatur waktu berhenti pada 0 detik dan tidak akan melewati tanggal akhir atau `continue` menunjukkan pengatur waktu harus terus setelah mencapai 0 detik.

#### `biggestUnit`

Memungkinkan `bento-date-countdown` untuk menghitung perbedaan waktu berdasarkan nilai `biggest-unit` yang ditentukan. Misalnya, asumsikan ada `50 days 10 hours` tersisa, jika unit `biggest-unit` ditetapkan ke `hours`, hasilnya menampilkan `1210 hours` tersisa.

- Nilai yang didukung: `days`, `hours`, `minutes`, `seconds`
- Default: `days`

#### `countUp`

Sertakan prop ini untuk membalikkan arah hitung mundur untuk menghitung mundur. Ini berguna untuk menampilkan waktu yang telah berlalu sejak tanggal target di masa lalu. Untuk melanjutkan hitungan mundur saat tanggal target sudah lewat, pastikan untuk menyertakan prop `when-ended` dengan nilai `continue`. Jika tanggal target di masa mendatang, `bento-date-countdown` akan menampilkan nilai negatif yang menurun (menuju 0).

#### `render`

Callback opsional yang harus merender templat. Callback atau panggilan balik akan diberi objek dengan properti/nilai yang terkait dengan tanggal yang dinyatakan dalam `datetime`. Secara default, komponen Bento Date Countdown akan menampilkan [bentuk Tanggal `localeString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) untuk lokal dan localeOption yang diberikan. Lihat bagian [Parameter Waktu yang Dikembalikan](#returned-time-parameters) untuk mengetahui lebih lanjut tentang bagaimana setiap properti akan ditampilkan.

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

Format | Arti
--- | ---
d | hari - 0, 1, 2,...12, 13... Tak Hingga
dd | hari - 00, 01, 02, 03... Tak Hingga
h | jam - 0, 1, 2,...12, 13... Tak Hingga
hh | jam - 01, 02, 03... Tak Hingga
m | menit - 0, 1, 2,...12, 13... Tak Hingga
mm | menit - 01, 01, 02, 03... Tak Hingga
s | detik - 0, 1, 2,...12, 13... Tak Hingga
ss | detik - 00, 01, 02, 03... Tak Hingga
days | untai internasionalisasi untuk hari atau hari-hari
hours | untai internasionalisasi untuk jam atau jam-jam
minutes | untai internasionalisasi untuk menit atau menit-menit
seconds | untai internasionalisasi untuk detik atau detik-detik

#### Sampel nilai yang diformat

Tabel ini memberikan sampel nilai yang diformat yang ditentukan dalam templat Misai, dan sampel hasilnya:

Format | Sampel Hasil | Komentar
--- | --- | ---
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} and {m} {minutes} and {s} {seconds} | 4 jam 1 menit 45 detik | -
{d} {days} {h}:{mm} | 1 hari 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 hari 5 jam 10 menit | -
{d} {days} {h} {hours} {m} {minutes} | 20 hari 5 jam 10 menit | -
{h} {hours} {m} {minutes} | 240 jam 10 menit | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`
