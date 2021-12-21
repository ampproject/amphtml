# Bento Soundcloud

Nhúng một đoạn video [Soundcloud](https://soundcloud.com).

## Thành phần web

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-soundcloud>`.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import {defineElement as defineBentoSoundcloud} from '@bentoproject/soundcloud';
defineBentoSoundcloud();
```

### Ví dụ: Bao gồm qua `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-soundcloud {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.js"
  ></script>
  <style>
    bento-soundcloud {
      aspect-ratio: 1;
    }
  </style>
</head>
<bento-soundcloud
  id="my-track"
  data-trackid="243169232"
  data-visual="true"
></bento-soundcloud>
<div class="buttons" style="margin-top: 8px">
  <button id="change-track">Change track</button>
</div>

<script>
  (async () => {
    const soundcloud = document.querySelector('#my-track');
    await customElements.whenDefined('bento-soundcloud');

    // set up button actions
    document.querySelector('#change-track').onclick = () => {
      soundcloud.setAttribute('data-trackid', '243169232');
      soundcloud.setAttribute('data-color', 'ff5500');
      soundcloud.removeAttribute('data-visual');
    };
  })();
</script>
```

### Bố cục và phong cách

Mỗi thành phần Bento đều có một thư viện CSS nhỏ mà bạn phải bao gồm để đảm bảo việc tải đúng cách mà không bị [chuyển dịch nội dung](https://web.dev/cls/). Bởi yêu cầu cụ thể về thứ tự, bạn phải đảm bảo các stylesheet được bao gồm một cách thủ công trước mọi phong cách tùy chỉnh có thể có nào.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-soundcloud-1.0.css"
/>
```

Hoặc, bạn cũng có thể thiết lập các phong cách nhỏ gọn được nâng cấp từ trước để sử dụng chúng inline:

```html
<style>
  bento-soundcloud {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Loại hộp chứa

Thành phần `bento-soundcloud` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với  `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác):

```css
bento-soundcloud {
  height: 100px;
  width: 100%;
}
```

### Thuộc tính

<table>
  <tr>
    <td width="40%"><strong>data-trackid</strong></td>
    <td>Thuộc tính này là bắt buộc nếu <code>data-playlistid</code> không được định nghĩa.<br> Giá trị cho thuộc tính này là ID của một bài nhạc, một số nguyên.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-playlistid</strong></td>
    <td>Thuộc tính này là bắt buộc nếu <code>data-trackid</code> không được định nghĩa. Giá trị cho thuộc tính này là ID của một danh sách phát, một số nguyên.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-secret-token (tùy chọn)</strong></td>
    <td>Token bí mật của bài nhạc, nếu nó là bài nhạc riêng tư.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-visual (tùy chọn)</strong></td>
    <td>Nếu đặt là <code>true</code> (đúng), hiển thị chế độ "Hình ảnh" toàn chiều rộng; nếu không, hiển thị chế độ "Cổ điển". Giá trị mặc định là <code>false</code> (sai).</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-color (tùy chọn)</strong></td>
    <td>Thuộc tính này ghi đè màu tùy chỉnh cho chế độ "Cổ điển". Thuộc tính này bị bỏ qua trong chế độ "Hình ảnh". Quy định một giá trị màu hệ thập lục phân, không có dấu # ở đầu (ví dụ: <code>data-color="e540ff"</code>).</td>
  </tr>
</table>

---

## Thành phần Preact/React

Ví dụ dưới đây minh họa cho việc sử dụng `<BentoSoundcloud>` như một thành phần chức năng với các thư viện Preact hoặc React.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/soundcloud
```

```javascript
import React from 'react';
import {BentoSoundcloud} from '@bentoproject/soundcloud/react';
import '@bentoproject/soundcloud/styles.css';

function App() {
  return <BentoSoundcloud trackId="243169232" visual={true}></BentoSoundcloud>;
}
```

### Bố cục và phong cách

#### Loại hộp chứa

Thành phần `BentoSoundcloud` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác). Chúng có thể được áp dụng inline:

```jsx
<BentoSoundcloud
  style={{width: 300, height: 100}}
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

Hoặc thông qua `className`:

```jsx
<BentoSoundcloud
  className="custom-styles"
  trackId="243169232"
  visual={true}
></BentoSoundcloud>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}
```

### Đặc tính

<table>
  <tr>
    <td width="40%"><strong>trackId</strong></td>
    <td>Thuộc tính này là bắt buộc nếu <code>data-playlistid</code> không được định nghĩa.<br> Giá trị cho thuộc tính này là ID của một bài nhạc, một số nguyên.</td>
  </tr>
  <tr>
    <td width="40%"><strong>playlistId</strong></td>
    <td>Thuộc tính này là bắt buộc nếu <code>data-trackid</code> không được định nghĩa. Giá trị cho thuộc tính này là ID của một danh sách phát, một số nguyên.</td>
  </tr>
  <tr>
    <td width="40%"><strong>secretToken (tùy chọn)</strong></td>
    <td>Token bí mật của bài nhạc, nếu nó là bài nhạc riêng tư.</td>
  </tr>
  <tr>
    <td width="40%"><strong>visual (tùy chọn)</strong></td>
    <td>Nếu đặt là <code>true</code> (đúng), hiển thị chế độ "Hình ảnh" toàn chiều rộng; nếu không, hiển thị chế độ "Cổ điển". Giá trị mặc định là <code>false</code> (sai).</td>
  </tr>
  <tr>
    <td width="40%"><strong>color (tùy chọn)</strong></td>
    <td>Thuộc tính này ghi đè màu tùy chỉnh cho chế độ "Cổ điển". Thuộc tính này bị bỏ qua trong chế độ "Hình ảnh". Quy định một giá trị màu hệ thập lục phân, không có dấu # ở đầu (ví dụ: <code>data-color="e540ff"</code>).</td>
  </tr>
</table>
