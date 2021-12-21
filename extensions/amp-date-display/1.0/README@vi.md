# Bento hiển thị ngày

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-display/1.0/README.md
-->

---

## Thành phần web

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-date-display>`.

### Ví dụ: Nhập qua npm

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

### Tương tác và sử dụng API

Thành phần Bento hiển thị ngày không có một API mệnh lệnh. Tuy nhiên, thành phần Preact/React của Bento hiển thị ngày có chấp nhận một đặc tính `render` kết xuất khuôn mẫu của khách hàng. Đặc tính `render` này nên là một chức năng mà thành phần Preact/React của Bento hiển thị ngày có thể sử dụng để kết xuất khuôn mẫu của nó. Chức năng gọi lại `render` sẽ được cung cấp nhiều tham số khác nhau liên quan đến ngày để khách hàng có thể nội suy trong khuôn mẫu được kết xuất. Xem <a href="#render" data-md-type="link">phần đặc tính `render`</a> để biết thêm thông tin.

### Bố cục và phong cách

Thành phần Preact/React của Bento hiển thị ngày cho phép khách hàng kết xuất các khuôn mẫu của riêng họ. Các khuôn mẫu này có thể sử dụng phong cách inline, các thẻ `<style>`, các thành phần Preact/React nhập stylesheet của riêng chúng.

### Đặc tính

#### `datetime`

Đặc tính bắt buộc. Quy định ngày và giờ như một Date, String, hoặc Number. Nếu là String, phải là một chuỗi ngày chuẩn ISO 8601 (ví dụ: 2017-08-02T15:05:05.000Z) hoặc chuỗi `now`. Nếu thiết lập thành `now`, nó sẽ sử dụng thời gian mà trang được tải để kết xuất khuôn mẫu của nó. Nếu là Number, phải là một giá trị POSIX epoch tính theo mili giây.

#### `displayIn`

Đặc tính tùy chọn có thể là `"utc"` hoặc `"local"` và có giá trị mặc định là `"local"`. Đặc tính này cho thấy múi giờ để hiển thị ngày tháng. Nếu đặt thành giá trị `"utc"`, thành phần này sẽ chuyển đổi ngày được nhập sang dạng UTC.

#### `locale`

Một chuỗi ngôn ngữ quốc tế hóa cho mỗi đơn vị thời gian. Giá trị mặc định là `en` (cho tiếng Anh). Đặc tính này hỗ trợ mọi giá trị được hỗ trợ bởi trình duyệt của người dùng.

#### `localeOptions`

Đối tượng `localeOptions` hỗ trợ tất cả các tùy chọn trong tham số [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters) quy định phong cách định dạng để sử dụng cho định dạng `localeString`.

Lưu ý rằng nếu đặc tính `displayIn` được đặt thành `utc`, giá trị của `localeOptions.timeZone` sẽ tự động được chuyển thành `UTC`.

#### `render`

Chức năng gọi lại tùy chọn cần kết xuất một khuôn mẫu. Gọi lại sẽ được cung cấp một đối tượng với các đặc tính/giá trị liên quan đến ngày được biểu đạt trong `datetime`. Theo mặc định, thành phần Bento hiển thị ngày sẽ hiển thị [biểu mẫu `localeString` của Ngày tháng](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) cho địa điểm và localeOption được nhập. Xem [phần Tham số thời gian được trả về](#returned-time-parameters) để biết thêm chi tiết về cách mỗi đặc tính được hiển thị.

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

| Định dạng         | Ý nghĩa                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| day               | 1, 2, ..., 12, 13, v.v.                                                                          |
| dayName           | chuỗi,                                                                                           |
| dayNameShort      | chuỗi,                                                                                           |
| dayPeriod         | chuỗi,                                                                                           |
| dayTwoDigit       | 01, 02, 03, ..., 12, 13, v.v.                                                                    |
| hour              | 0, 1, 2, 3, ..., 12, 13, ..., 22, 23                                                             |
| hour12            | 1, 2, 3, ..., 12, 1, 2, ..., 11, 12                                                              |
| hour12TwoDigit    | 01, 02, ..., 12, 01, 02, ..., 11, 12                                                             |
| hourTwoDigit      | 00, 01, 02, ..., 12, 13, ..., 22, 23                                                             |
| iso               | Một chuỗi ngày chuẩn ISO8601, ví dụ: 2019-01-23T15:31:21.213Z,                                   |
| localeString      | Một chuỗi hiển thị nhạy cảm với ngôn ngữ.                                                        |
| minute            | 0, 1, 2, ..., 58, 59                                                                             |
| minuteTwoDigit    | 00, 01, 02, ..., 58, 59                                                                          |
| month             | 1, 2, 3, ..., 12                                                                                 |
| monthName         | Chuỗi tên tháng được quốc tế hóa.                                                                |
| monthNameShort    | Chuỗi tên tháng viết tắt được quốc tế hóa.                                                       |
| monthTwoDigit     | 01, 02, ..., 11, 12                                                                              |
| second            | 0, 1, 2, ..., 58, 59                                                                             |
| secondTwoDigit    | 00, 01, 02, ..., 58, 59                                                                          |
| timeZoneName      | Múi giờ được quốc tế hóa, ví dụ: `Pacific Daylight Time` (Giờ ánh sáng ban ngày Thái Bình Dương) |
| timeZoneNameShort | Múi giờ được quốc tế hóa và viết tắt, ví dụ: `PST`                                               |
| year              | 0, 1, 2, ..., 1999, 2000, 2001, v.v.                                                             |
| yearTwoDigit      | 00, 01, 02, ..., 17, 18, 19, ..., 98, 99                                                         |
