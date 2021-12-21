# Bento MathML

Kết xuất một công thức MathML trong một iframe.

## Thành phần web

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-mathml>`.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/mathml
```

```javascript
import {defineElement as defineBentoMathml} from '@bentoproject/mathml';
defineBentoMathml();
```

### Ví dụ: Bao gồm qua `<script>`

Ví dụ dưới đây chứa một `bento-mathml` với ba phần. Thuộc tính `expanded` trên phần thứ ba sẽ mở rộng nó khi tải trang.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-mathml-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-mathml-1.0.css"
  />
</head>
<body>
  <h2>Phương trình bậc hai</h2>
  <bento-mathml
    style="height: 40px"
    data-formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"
  ></bento-mathml>

  <h2>Công thức tích phân Cauchy</h2>
  <bento-mathml
    style="height: 41px"
    data-formula="\[f(a) = \frac{1}{2\pi i} \oint\frac{f(z)}{z-a}dz\]"
  ></bento-mathml>

  <h2>Công thức lượng giác</h2>
  <bento-mathml
    style="height: 19px"
    data-formula="\[cos(θ+φ)=\cos(θ)\cos(φ)−\sin(θ)\sin(φ)\]"
  ></bento-mathml>

  <h2>Công thức inline</h2>
  <p>
    Đây là ví dụ về một công thức
    <bento-mathml
      style="height: 11px; width: 8px"
      inline
      data-formula="`x`"
    ></bento-mathml
    >,
    <bento-mathml
      style="height: 40px; width: 147px"
      inline
      data-formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"
    ></bento-mathml>
    được đặt inline trong khối văn bản.
    <bento-mathml
      style="height: 19px; width: 72px"
      inline
      data-formula="\( \cos(θ+φ) \)"
    ></bento-mathml>
    Ví dụ này cho thấy cách công thức sẽ được đặt trong một khối văn bản và có thể được tạo phong cách
    bằng CSS.
  </p>
</body>
```

### Bố cục và phong cách

Mỗi thành phần Bento đều có một thư viện CSS nhỏ mà bạn phải bao gồm để đảm bảo việc tải đúng cách mà không bị [chuyển dịch nội dung](https://web.dev/cls/). Bởi yêu cầu cụ thể về thứ tự, bạn phải đảm bảo các stylesheet được bao gồm một cách thủ công trước mọi phong cách tùy chỉnh có thể có nào.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-mathml-1.0.css"
/>
```

Hoặc, bạn cũng có thể thiết lập các phong cách nhỏ gọn được nâng cấp từ trước để sử dụng chúng inline:

```html
<style>
  bento-mathml {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

### Thuộc tính

#### `data-formula` (bắt buộc)

Quy định công thức để kết xuất.

#### `inline` (tùy chọn)

Nếu được quy định, thành phần này sẽ kết xuất inline (`inline-block` trong CSS).

#### `title` (tùy chọn)

Quy định một thuộc tính `title` cho thành phần để nhân giống đến yếu tố `<iframe>` nền. Giá trị mặc định là `"MathML formula"`.

### Phong cách

Bạn có thể sử dụng bộ chọn yếu tố `bento-mathml` để tùy ý tạo phong cách cho accordion.

---

## Thành phần Preact/React

Ví dụ dưới đây minh họa cho việc sử dụng `<BentoMathml>` như một thành phần chức năng với các thư viện Preact hoặc React.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/mathml
```

```javascript
import React from 'react';
import {BentoMathml} from '@bentoproject/mathml/react';
import '@bentoproject/mathml/styles.css';

function App() {
  return (
    <>
      <h2>Phương trình bậc hai</h2>
      <BentoMathml
        style={{height: 40}}
        formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"
      ></BentoMathml>

      <h2>Công thức tích phân Cauchy</h2>
      <BentoMathml
        style={{height: 41}}
        formula="\[f(a) = \frac{1}{2\pi i} \oint\frac{f(z)}{z-a}dz\]"
      ></BentoMathml>

      <h2>Công thức lượng giác</h2>
      <BentoMathml
        style={{height: 19}}
        formula="\[cos(θ+φ)=\cos(θ)\cos(φ)−\sin(θ)\sin(φ)\]"
      ></BentoMathml>

      <h2>Công thức inline</h2>
      <p>
        Đây là ví dụ về một công thức {' '}
        <BentoMathml
          style={{height: 11, width: 8}}
          inline
          formula="`x`"
        ></BentoMathml>
        ,{' '}
        <BentoMathml
          style={{height: 40, width: 147}}
          inline
          formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"
        ></BentoMathml>{' '}
        được đặt inline trong khối văn bản.{' '}
        <BentoMathml
          style={{height: 19, width: 72}}
          inline
          formula="\( \cos(θ+φ) \)"
        ></BentoMathml>{' '}
        Ví dụ này cho thấy cách công thức sẽ được đặt trong một khối văn bản và có thể được
        tạo phong cách bằng CSS.
      </p>
    </>
  );
}
```

### Bố cục và phong cách

#### Loại hộp chứa

Thành phần `BentoMathml` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác). Chúng có thể được áp dụng inline:

```jsx
<BentoMathml style={{width: 300, height: 100}}>...</BentoMathml>
```

Hoặc thông qua `className`:

```jsx
<BentoMathml className="custom-styles">...</BentoMathml>
```

```css
.custom-styles {
  background-color: red;
  height: 40px;
  width: 147px;
}
```

### Đặc tính

#### `formula` (bắt buộc)

Quy định công thức để kết xuất.

#### `inline` (tùy chọn)

Nếu được quy định, thành phần này sẽ kết xuất inline (`inline-block` trong CSS).

#### `title` (tùy chọn)

Quy định một thuộc tính `title` cho thành phần để nhân giống đến yếu tố `<iframe>` nền. Giá trị mặc định là `"MathML formula"`.
