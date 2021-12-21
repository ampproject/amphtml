# Bento thiệp Embedly

Cung cấp nội dung nhúng tương thích và chia sẻ được qua các [thiệp Embedly](http://docs.embed.ly/docs/cards)

Thiệp là cách dễ nhất để sử dụng Embedly. Đối với mọi nội dung đa phương tiện, thiệp là một yếu tố nhúng tương thích với trình phân tích nhúng được tích hợp.

Nếu bạn có một gói kế hoạch có trả phí, hãy sử dụng thành phần `<bento-embedly-key>` hoặc `<BentoEmbedlyContext.Provider>` để thiết lập khóa API của mình. Bạn chỉ cần một khóa Bento Embedly trên mỗi trang để xóa nhãn hiệu Embedly từ các thiệp này. Trong trang của bạn, bạn có thể bao gồm một hoặc nhiều trường hợp Bento thiệp Embedly.

## Thành phần web

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-embedly-card>`.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {defineElement as defineBentoEmbedlyCard} from '@bentoproject/embedly-card';
defineBentoEmbedlyCard();
```

### Ví dụ: Bao gồm qua `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-embedly-card {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.js"
  ></script>
  <style>
    bento-embedly-card {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<body>
  <bento-embedly-key value="12af2e3543ee432ca35ac30a4b4f656a">
  </bento-embedly-key>

  <bento-embedly-card
    data-url="https://twitter.com/AMPhtml/status/986750295077040128"
    data-card-theme="dark"
    data-card-controls="0"
  >
  </bento-embedly-card>

  <bento-embedly-card
    id="my-url"
    data-url="https://www.youtube.com/watch?v=LZcKdHinUhE"
  >
  </bento-embedly-card>

  <div class="buttons" style="margin-top: 8px">
    <button id="change-url">Change embed</button>
  </div>

  <script>
    (async () => {
      const embedlyCard = document.querySelector('#my-url');
      await customElements.whenDefined('bento-embedly-card');

      // set up button actions
      document.querySelector('#change-url').onclick = () => {
        embedlyCard.setAttribute(
          'data-url',
          'https://www.youtube.com/watch?v=wcJSHR0US80'
        );
      };
    })();
  </script>
</body>
```

### Bố cục và phong cách

Mỗi thành phần Bento đều có một thư viện CSS nhỏ mà bạn phải bao gồm để đảm bảo việc tải đúng cách mà không bị [chuyển dịch nội dung](https://web.dev/cls/). Bởi yêu cầu cụ thể về thứ tự, bạn phải đảm bảo các stylesheet được bao gồm một cách thủ công trước mọi phong cách tùy chỉnh có thể có nào.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-embedly-card-1.0.css"
/>
```

Hoặc, bạn cũng có thể thiết lập các phong cách nhỏ gọn được nâng cấp từ trước để sử dụng chúng inline:

```html
<style>
  bento-embedly-card {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Loại hộp chứa

Thành phần `bento-embedly-card` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với  `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác):

```css
bento-embedly-card {
  height: 100px;
  width: 100%;
}
```

### Thuộc tính

#### `data-url`

URL để truy xuất thông tin nhúng.

#### `data-card-embed`

URL cho một video hoặc nội dung đa phương tiện phong phú. Sử dụng với các yếu tố nhúng tĩnh như bài viết, thay vì sử dụng nội dung trang tĩnh trong thiệp, tấm thiệp sẽ nhúng video hoặc nội dung đa phương tiện phong phú.

#### `data-card-image`

URL cho một ảnh. Quy định ảnh được sử dụng trong các thiệp bài viết khi `data-url` chỉ đến một bài viết. Không phải URL ảnh nào cũng được hỗ trợ, nếu ảnh không được tải, hãy thử một ảnh hay tên miền khác.

#### `data-card-controls`

Bật biểu tượng chia sẻ.

- `0`: Tắt biểu tượng chia sẻ.
- `1`: Bật biểu tượng chia sẻ.

Số mặc định là `1`.

#### `data-card-align`

Căn chỉnh thiệp. Các giá trị khả dụng là `left` (trái), `center` (trung tâm) và `right` (phải). Giá trị mặc định là `center`.

#### `data-card-recommend`

Khi các khuyến nghị được hỗ trợ, nó sẽ tắt các khuyến nghị của embedly cho video và thiệp phong phú. Đây là các khuyến nghị được tạo bởi embedly.

- `0`: Tắt các khuyến nghị của embedly.
- `1`: Bật các khuyến nghị của embedly.

Giá trị mặc định là `1`.

#### `data-card-via` (tùy chọn)

Quy định nguồn nội dung trong thiệp. Đây là một cách tuyệt vời để ghi nhận nguồn.

#### `data-card-theme` (tùy chọn)

Cho phép thiết lập chủ đề `dark` (tối) để thay đổi màu nền của hộp chứa thiệp chính. Sử dụng `dark` để thiết lập chủ đề này. Đối với các nền tối, tốt nhất là quy định thuộc tính này. Mặc định là `light` (sáng), vốn không quy định màu nền của hộp chứa thiệp chính.

#### title (tùy chọn)

Quy định một thuộc tính `title` cho thành phần để nhân giống đến yếu tố `<iframe>` nền. Giá trị mặc định là `"Embedly card"`.

---

## Thành phần Preact/React

Ví dụ dưới đây minh họa cho việc sử dụng `<BentoEmbedlyCard>` như một thành phần chức năng với các thư viện Preact hoặc React.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/embedly-card
```

```javascript
import {BentoEmbedlyCard} from '@bentoproject/embedly-card/react';
import '@bentoproject/embedly-card/styles.css';

function App() {
  return (
    <BentoEmbedlyContext.Provider
      value={{apiKey: '12af2e3543ee432ca35ac30a4b4f656a'}}
    >
      <BentoEmbedlyCard url="https://www.youtube.com/watch?v=LZcKdHinUhE"></BentoEmbedlyCard>
    </BentoEmbedlyContext.Provider>
  );
}
```

### Bố cục và phong cách

#### Loại hộp chứa

Thành phần `BentoEmbedlyCard` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác). Chúng có thể được áp dụng inline:

```jsx
<BentoEmbedlyCard
  style={{width: 300, height: 100}}
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

Hoặc thông qua `className`:

```jsx
<BentoEmbedlyCard
  className="custom-styles"
  url="https://www.youtube.com/watch?v=LZcKdHinUhE"
></BentoEmbedlyCard>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Đặc tính

#### `url`

URL để truy xuất thông tin nhúng.

#### `cardEmbed`

URL cho một video hoặc nội dung đa phương tiện phong phú. Sử dụng với các yếu tố nhúng tĩnh như bài viết, thay vì sử dụng nội dung trang tĩnh trong thiệp, tấm thiệp sẽ nhúng video hoặc nội dung đa phương tiện phong phú.

#### `cardImage`

URL cho một ảnh. Quy định ảnh được sử dụng trong các thiệp bài viết khi `data-url` chỉ đến một bài viết. Không phải URL ảnh nào cũng được hỗ trợ, nếu ảnh không được tải, hãy thử một ảnh hay tên miền khác.

#### `cardControls`

Bật biểu tượng chia sẻ.

- `0`: Tắt biểu tượng chia sẻ.
- `1`: Bật biểu tượng chia sẻ.

Số mặc định là `1`.

#### `cardAlign`

Căn chỉnh thiệp. Các giá trị khả dụng là `left` (trái), `center` (trung tâm) và `right` (phải). Giá trị mặc định là `center`.

#### `cardRecommend`

Khi các khuyến nghị được hỗ trợ, nó sẽ tắt các khuyến nghị của embedly cho video và thiệp phong phú. Đây là các khuyến nghị được tạo bởi embedly.

- `0`: Tắt các khuyến nghị của embedly.
- `1`: Bật các khuyến nghị của embedly.

Giá trị mặc định là `1`.

#### `cardVia` (tùy chọn)

Quy định nội dung thông qua trong thiệp. Đây là một cách tuyệt vời để ghi nhận nguồn.

#### `cardTheme` (tùy chọn)

Cho phép thiết lập chủ đề `dark` (tối) để thay đổi màu nền của hộp chứa thiệp chính. Sử dụng `dark` để thiết lập chủ đề này. Đối với các nền tối, tốt nhất là quy định thuộc tính này. Mặc định là `light` (sáng), vốn không quy định màu nền của hộp chứa thiệp chính.

#### title (tùy chọn)

Quy định một thuộc tính `title` cho thành phần để nhân giống đến yếu tố `<iframe>` nền. Giá trị mặc định là `"Embedly card"`.
