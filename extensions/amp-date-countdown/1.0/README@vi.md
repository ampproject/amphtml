# Bento đếm ngược ngày

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## Thành phần Preact/React

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-date-countdown>`.

### Ví dụ: Nhập qua npm

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

### Tương tác và sử dụng API

Thành phần Bento đếm ngược ngày không có một API mệnh lệnh. Tuy nhiên, thành phần Preact/React của Bento đếm ngược ngày có chấp nhận một đặc tính `render` kết xuất khuôn mẫu của khách hàng. Đặc tính `render` này nên là một chức năng mà thành phần Preact/React của Bento đếm ngược ngày có thể sử dụng để kết xuất khuôn mẫu của nó. Chức năng gọi lại `render` sẽ được cung cấp nhiều tham số khác nhau liên quan đến ngày để khách hàng có thể nội suy trong khuôn mẫu được kết xuất. Xem <a href="#render" data-md-type="link">phần Đặc tính `render`</a> để biết thêm thông tin.

### Bố cục và phong cách

Thành phần Preact/React của Bento đếm ngược ngày cho phép khách hàng kết xuất các khuôn mẫu của riêng họ. Các khuôn mẫu này có thể sử dụng phong cách inline, các thẻ `<style>`, các thành phần Preact/React nhập stylesheet của riêng chúng.

### Đặc tính

#### `datetime`

Đặc tính bắt buộc. Quy định ngày và giờ như một Date, String, hoặc Number. Nếu là String, phải là một chuỗi ngày chuẩn ISO 8601 (ví dụ: 2017-08-02T15:05:05.000Z) hoặc chuỗi `now`. Nếu thiết lập thành `now`, nó sẽ sử dụng thời gian mà trang được tải để kết xuất khuôn mẫu của nó. Nếu là Number, phải là một giá trị POSIX epoch tính theo mili giây.

#### `locale`

Một chuỗi ngôn ngữ quốc tế hóa cho mỗi đơn vị thời gian. Giá trị mặc định là `en` (cho tiếng Anh). Đặc tính này hỗ trợ mọi giá trị được hỗ trợ bởi trình duyệt của người dùng.

#### `whenEnded`

Quy định liệu có dừng đồng hồ hẹn giờ khi nó đến 0 giây hay không. Giá trị này có thể được đặt là `stop` (dừng) (mặc định) để biểu thị rằng đồng hồ hẹn giờ sẽ dừng ở 0 giây và không vượt qua ngày cuối cùng hay `continue` (tiếp tục) để biểu thị rằng đồng hồ hẹn giờ nên chạy tiếp sau khi đạt 0 giây.

#### `biggestUnit`

Cho phép thành phần `bento-date-countdown` tính chênh lệch thời gian dựa trên giá trị `biggest-unit` (đơn vị lớn nhất) được quy định. Ví dụ, giả sử còn `50 ngày 10 giờ`, nếu `biggest-unit` được đặt là `hours` (giờ), kết quả sẽ hiển thị là còn `1210 giờ`.

- Các giá trị được hỗ trợ: `days` (ngày), `hours` (giờ), `minutes` (phút), `seconds` (giây)
- Mặc định: `days`

#### `countUp`

Bao gồm đặc tính này để đảo ngược hướng đếm ngược và thay vào đó là đếm xuôi. Chức năng này hữu ích để hiển thị thời gian đã trôi qua kể từ một ngày mục tiêu trong quá khứ. Để tiếp tục đếm ngược khi ngày mục tiêu ở trong quá khứ, hãy nhớ bao gồm đặc tính `when-ended` (khi kết thúc) với giá trị `continue` (tiếp tục). Nếu ngày mục tiêu ở trong tương lai, `bento-date-countdown` sẽ hiển thị một giá trị âm giảm dần (về 0).

#### `render`

Chức năng gọi lại tùy chọn cần kết xuất một khuôn mẫu. Gọi lại sẽ được cung cấp một đối tượng với các đặc tính/giá trị liên quan đến ngày được biểu đạt trong `datetime`. Theo mặc định, thành phần Bento đếm ngược ngày sẽ hiển thị [biểu mẫu `localeString` của Ngày tháng](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) cho địa điểm và localeOption được nhập. Xem [phần Tham số thời gian được trả về](#returned-time-parameters) để biết thêm chi tiết về cách mỗi đặc tính được hiển thị.

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

### Tham số thời gian được trả về

Bảng này liệt kê định dạng mà bạn có thể quy định trong khuôn mẫu Mustache của mình:

Định dạng | Ý nghĩa
--- | ---
d | ngày - 0, 1, 2,..., 12, 13, ..., v.v.
dd | ngày - 00, 01, 02, 03, ..., v.v.
h | giờ - 0, 1, 2,..., 12, 13, ..., v.v.
hh | giờ - 01, 02, 03, ..., v.v.
m | phút - 0, 1, 2,..., 12, 13, ..., v.v.
mm | phút - 01, 02, 03, ..., v.v.
s | giây - 0, 1, 2,..., 12, 13, ..., v.v.
ss | giây - 00, 01, 02, 03, ..., v.v.
days | chuỗi quốc tế hóa cho số ngày
hours | chuỗi quốc tế hóa cho số giờ
minutes | chuỗi quốc tế hóa cho số phút
seconds | chuỗi quốc tế hóa cho số giây

#### Ví dụ về các giá trị được định dạng

Bảng này cung cấp ví dụ về các giá trị được định dạng trong một khuôn mẫu Mustache, và một ví dụ về đầu ra:

Định dạng | Đầu ra ví dụ | Nhận xét
--- | --- | ---
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} và {m} {minutes} và {s} {seconds} | 4 giờ và 1 phút và 45 giây | -
{d} {days} {h}:{mm} | 1 ngày 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 ngày 5 giờ 10 phút | -
{d} {days} {h} {hours} {m} {minutes} | 20 ngày 5 giờ 10 phút | -
{h} {hours} {m} {minutes} | 240 giờ 10 phút | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`
