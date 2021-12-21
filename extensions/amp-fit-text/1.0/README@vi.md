# Bento làm gọn văn bản

Xác định kích cỡ phông chữ tốt nhất để làm gọn một văn bản được cho trong không gian có sẵn.

Nội dung kỳ vọng cho Bento làm gọn văn bản là văn bản hoặc các nội dung inline khác, nhưng nó cũng có thể chứa các nội dung không inline.

## Thành phần web

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-fit-text>`.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/fit-text
```

```javascript
import {defineElement as defineBentoFitText} from '@bentoproject/fit-text';
defineBentoFitText();
```

### Ví dụ: Bao gồm qua `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-fit-text {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<bento-fit-text id="my-fit-text">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque inermis
  reprehendunt.
</bento-fit-text>
<div class="buttons" style="margin-top: 8px">
  <button id="font-button">Change max-font-size</button>
  <button id="content-button">Change content</button>
</div>

<script>
  (async () => {
    const fitText = document.querySelector('#my-fit-text');
    await customElements.whenDefined('bento-fit-text');

    // set up button actions
    document.querySelector('#font-button').onclick = () =>
      fitText.setAttribute('max-font-size', '40');
    document.querySelector('#content-button').onclick = () =>
      (fitText.textContent = 'new content');
  })();
</script>
```

### Nội dung tràn

Nếu nội dung của `bento-fit-text` tràn ra ngoài không gian có sẵn, kể cả khi đã quy định `min-font-size`, nội dung tràn ra ngoài sẽ bị cắt bớt và bị ẩn. Các trình duyệt WebKit và dựa trên Blink hiển thị dấu ba chấm cho nội dung tràn ra ngoài.

Trong ví dụ sau đây, chúng tôi đã quy định một `min-font-size` là `40`, và bổ sung thêm nội dung trong yếu tố `bento-fit-text`. Điều này khiến các nội dung vượt quá kích cỡ của khối cha cố định, và văn bản đã bị cắt bớt để vừa với hộp chứa.

```html
<div style="width: 300px; height: 300px; background: #005af0; color: #fff">
  <bento-fit-text min-font-size="40">
    Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
    inermis reprehendunt. Lorem ipsum dolor sit amet, has nisl nihil convenire
    et, vim at aeque inermis reprehendunt
  </bento-fit-text>
</div>
```

### Bố cục và phong cách

Mỗi thành phần Bento đều có một thư viện CSS nhỏ mà bạn phải bao gồm để đảm bảo việc tải đúng cách mà không bị [chuyển dịch nội dung](https://web.dev/cls/). Bởi yêu cầu cụ thể về thứ tự, bạn phải đảm bảo các stylesheet được bao gồm một cách thủ công trước mọi phong cách tùy chỉnh có thể có nào.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-fit-text-1.0.css"
/>
```

Hoặc, bạn cũng có thể thiết lập các phong cách nhỏ gọn được nâng cấp từ trước để sử dụng chúng inline:

```html
<style>
  bento-fit-text {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Loại hộp chứa

Thành phần `bento-fit-text` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với  `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác):

```css
bento-fit-text {
  height: 100px;
  width: 100%;
}
```

### Các cân nhắc về hỗ trợ tiếp cận cho nội dung tràn ra ngoài

Tuy nội dung tràn ra ngoài được hiển thị dưới dạng cắt bớt cho vừa hộp chứa, lưu ý rằng nó vẫn tồn tại trong tài liệu. Đừng dựa vào hành vi tràn để "làm gọn" lượng lớn nội dung trong trang của bạn - tùy nó có thể phù hợp về mặt hiển thị, nó có thể khiến trang trở nên quá dài với người dùng các công nghệ hỗ trợ (ví dụ như trình đọc màn hình), bởi đối với những người dùng này, toàn bộ nội dung bị cắt bớt vẫn sẽ được đọc/thông báo đầy đủ.

### Thuộc tính

#### Truy vấn đa phương tiện

Thuộc tính cho `<bento-fit-text>` có thể được cấu hình để sử dụng các tùy chọn khác nhau dựa trên một [truy vấn đa phương tiện](./../../../docs/spec/amp-html-responsive-attributes.md).

#### `min-font-size`

Quy định kích cỡ phông chữ tối thiểu tính theo điểm ảnh như một số nguyên mà  `bento-fit-text` có thể sử dụng.

#### `max-font-size`

Quy định kích cỡ phông chữ tối đa tính theo điểm ảnh như một số nguyên mà `bento-fit-text` có thể sử dụng.

---

## Thành phần Preact/React

Ví dụ dưới đây minh họa cho việc sử dụng `<BentoFitText>` như một thành phần chức năng với các thư viện Preact hoặc React.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/fit-text
```

```javascript
import React from 'react';
import {BentoFitText} from '@bentoproject/fit-text/react';
import '@bentoproject/fit-text/styles.css';

function App() {
  return (
    <BentoFitText>
      Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
      inermis reprehendunt.
    </BentoFitText>
  );
}
```

### Bố cục và phong cách

#### Loại hộp chứa

Thành phần `BentoFitText` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác). Chúng có thể được áp dụng inline:

```jsx
<BentoFitText style={{width: 300, height: 100}}>
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

Hoặc thông qua `className`:

```jsx
<BentoFitText className="custom-styles">
  Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque
  inermis reprehendunt.
</BentoFitText>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Đặc tính

#### `minFontSize`

Quy định kích cỡ phông chữ tối thiểu tính theo điểm ảnh như một số nguyên mà  `bento-fit-text` có thể sử dụng.

#### `maxFontSize`

Quy định kích cỡ phông chữ tối đa tính theo điểm ảnh như một số nguyên mà `bento-fit-text` có thể sử dụng.
