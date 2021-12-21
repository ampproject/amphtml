# Bento chia sẻ xã hội

Hiển thị một nút chia sẻ cho các nền tảng xã hội hoặc chia sẻ hệ thống.

Hiện tại, không có nút nào được tạo bởi Bento chia sẻ xã hội (bao gồm những nút cho những nhà cung cấp đã được cấu hình sẵn) có một nhãn hay tên hỗ trợ tiếp cận cho các công nghệ hỗ trợ (ví dụ như trình đọc màn hình). Hãy đảm bảo bạn bao gồm một `aria-label` với một nhãn mô tả, nếu không, các nút điều khiển này sẽ chỉ được đọc như các yếu tố "nút" không nhãn.

## Thành phần web

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-social-share>`.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/social-share
```

```javascript
import {defineElement as defineBentoSocialShare} from '@bentoproject/social-share';
defineBentoSocialShare();
```

### Ví dụ: Bao gồm qua `<script>`

```html
<head>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-social-share {
      display: inline-block;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
      width: 60px;
      height: 44px;
    }
  </style>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-twitter-1.0.js"
  ></script>
  <style>
    bento-social-share {
      width: 375px;
      height: 472px;
    }
  </style>
</head>

<bento-social-share
  id="my-share"
  type="twitter"
  aria-label="Share on Twitter"
></bento-social-share>

<div class="buttons" style="margin-top: 8px">
  <button id="change-share">Change share button</button>
</div>

<script>
  (async () => {
    const button = document.querySelector('#my-share');
    await customElements.whenDefined('bento-social-share');

    // set up button actions
    document.querySelector('#change-share').onclick = () => {
      twitter.setAttribute('type', 'linkedin');
      twitter.setAttribute('aria-label', 'Share on LinkedIn');
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
  href="https://cdn.ampproject.org/v0/bento-social-share-1.0.css"
/>
```

Hoặc, bạn cũng có thể thiết lập các phong cách nhỏ gọn được nâng cấp từ trước để sử dụng chúng inline:

```html
<style>
  bento-social-share {
    display: inline-block;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    width: 60px;
    height: 44px;
  }
</style>
```

#### Loại hộp chứa

Thành phần `bento-social-share` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với  `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác):

```css
bento-social-share {
  height: 100px;
  width: 100px;
}
```

#### Phong cách mặc định

Theo mặc định, `bento-social-share` bao gồm các nhà cung cấp phổ biến được cấu hình sẵn. Nút cho các nhà cung cấp này được tạo phong cách bằng màu và logo chính thức của họ. Chiều rộng mặc định là 60px, và chiều cao mặc định là 44px.

#### Phong cách tùy chỉnh

Đôi khi, bạn có thể muốn cung cấp phong cách của riêng mình. Bạn có thể ghi đè cho các phong cách được cung cấp một cách đơn giản như sau:

```css
bento-social-share[type='twitter'] {
  color: blue;
  background: red;
}
```

Khi tùy chỉnh phong cách của một biểu tượng `bento-social-share`, vui lòng đảm bảo rằng biểu tượng được tùy chỉnh đáp ứng hướng dẫn nhãn hiệu mà nhà cung cấp đã quy định (ví dụ: Twitter, Facebook, v.v.)

### Hỗ trợ tiếp cận

#### Chỉ báo tập trung

Yếu tố `bento-social-share` có chỉ báo tập trung nhìn thấy mặc định là một viền xanh dương. `tabindex=0` cũng là một thuộc tính mặc định khác, khiến người dùng có thể dễ dàng theo dõi khi họ chuyển qua các yếu tố  `bento-social-share` được sử dụng cùng nhau trên một trang.

Chỉ báo tập trung mặc định có được với bộ quy tắc RSS sau.

```css
bento-social-share:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Chỉ báo tập trung mặc định có thể được ghi đè bằng cách quy định phong cách CSS cho hành động tập trung và bao gồm chúng trong một thẻ `style`. Trong ví dụ dưới đây, bộ quy tắc CSS đầu tiên sẽ xóa chỉ báo tập trung trên tất cả các yếu tố `bento-social-share` bằng cách đặt đặc tính `outline` là `none`. Bộ quy tắc thứ hai quy định một viền đỏ (thay cho màu xanh dương mặc định) và cũng thiết lập `outline-offset` thành `3px` cho tất cả yếu tố `bento-social-share` với lớp `custom-focus`.

```css
bento-social-share:focus{
  outline: none;
}

bento-social-share.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Với các quy tắc CSS này, các yếu tố `bento-social-share` sẽ không hiển thị chỉ báo tập trung nhìn thấy trừ khi chúng có bao gồm lớp `custom-focus`, trong trường hợp đó, chúng sẽ có chỉ báo viền màu đỏ.

#### Tương phản màu sắc

Lưu ý rằng `bento-social-share` với một giá trị  `type` `twitter`, `whatsapp`, hoặc `line` sẽ hiển thị một nút với một tổ hợp màu nền trước/nền sau xuống dưới ngưỡng 3:1 được khuyến nghị cho nội dung phi văn bản được quy định trong [WCAG 2.1 SC 1.4.11 Tương phản cho nội dung phi văn bản](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Nếu không có đủ độ tương phản, các nội dung có thể khó đọc và do đó khó xác định. Trong các trường hợp ngoại lệ, nội dung có độ tương phản thấp có thể hoàn toàn không được hiển thị cho những người có khiếm khuyết về cảm nhận màu sắc. Trong trường hợp nút chia sẻ ở trên, người dùng có thể không nhận biết/hiểu đúng chức năng của các nút điều khiển chia sẻ và dịch vụ liên quan đến chúng.

### Các nhà cung cấp được cấu hình sẵn

Thành phần `bento-social-share` có  [một số nhà cung cấp được cấu hình sẵn ](./social-share-config.js) biết rõ điểm cuối chia sẻ của họ cũng như các tham số mặc định.

<table>
  <tr>
    <th class="col-twenty">Nhà cung cấp</th>
    <th class="col-twenty">Loại</th>
    <th>Tham số</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">API chia sẻ web</a> (kích hoạt hộp thoại chia sẻ của HĐH)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Email</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>data-param-subject</code>: tùy chọn</li>
        <li>
<code>data-param-body</code>: tùy chọn</li>
        <li>
<code>data-param-recipient</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>data-param-app_id</code>: <strong>bắt buộc</strong>, mặc định là: none. Tham số này là <code>app_id</code> của Facebook, vốn là bắt buộc cho <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">hộp thoại chia sẻ lên Facebook</a>.</li>
        <li>
<code>data-param-href</code>: tùy chọn</li>
        <li>
<code>data-param-quote</code>: tùy chọn, có thể được sử dụng để chia sẻ một trích dẫn hoặc văn bản.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>data-param-media</code>: tùy chọn (nhưng rất nên được thiết lập). URL cho nội dung đa phương tiện được chia sẻ lên Pinterest. Nếu không thiết lập, người dùng cuối có thể được Pinterest yêu cầu tải lên một nội dung đa phương tiện.</li>
        <li>
<code>data-param-url</code>: tùy chọn</li>
        <li>
<code>data-param-description</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: tùy chọn</li>
        <li>
<code>data-param-text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: tùy chọn</li>
        <li>
<code>data-param-text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>data-param-text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>data-param-url</code>: tùy chọn</li>
        <li>
<code>data-param-text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>data-param-body</code>: tùy chọn</li>
</ul>
    </td>
  </tr>
</table>

### Các nhà cung cấp không được cấu hình

Ngoài các nhà cung cấp được cấu hình sẵn, bạn có thể sử dụng các nhà cung cấp không được cấu hình bằng cách quy định các thuộc tính bổ sung trong thành phần `bento-social-share`.

#### Ví dụ: Tạo một nút chia sẻ cho một nhà cung cấp không được cấu hình

Ví dụ sau đây tạo một nút chia sẻ thông qua Facebook Messenger bằng cách thiết lập thuộc tính `data-share-endpoint` thành điểm cuối chính xác cho giao thức tùy chỉnh Facebook Messenger.

```html
<bento-social-share
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</bento-social-share>
```

Bởi các nhà cung cấp này không được cấu hình sẵn, bạn sẽ cần tạo một ảnh và phong cách nút phù hợp cho họ.

### Thuộc tính

#### type (bắt buộc)

Chọn một loại nhà cung cấp. Điều này là bắt buộc cho cả các nhà cung cấp được cấu hình sẵn lẫn không được cấu hình.

#### data-target

Quy định mục tiêu trong đó để mở mục tiêu. Mặc định là  `_blank` cho tất cả các trường hợp ngoại trừ email/SMS trên iOS, trong trường hợp đó target (mục tiêu) sẽ được đặt thành `_top`.

#### data-share-endpoint

Thuộc tính này là bắt buộc cho các nhà cung cấp không được cấu hình.

Một số nhà cung cấp phổ biến có các điểm cuối chia sẻ được cấu hình sẵn. Để biết thêm chi tiết, hãy xem phần Các nhà cung cấp được cấu hình sẵn. Đối với các nhà cung cấp không được cấu hình, bạn sẽ cần quy định điểm cuối chia sẻ.

#### data-param-*

Tất cả các thuộc tính có tiền tố `data-param-*` đều được biến thành các tham số URL và chuyển đến điểm cuối chia sẻ.

#### aria-label

Mô tả của nút cho hỗ trợ tiếp cận. Nhãn được khuyến nghị là "Chia sẻ trên &lt;type&gt;".

---

## Thành phần Preact/React

Ví dụ dưới đây minh họa cho việc sử dụng `<BentoSocialShare>` như một thành phần chức năng với các thư viện Preact hoặc React.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/social-share
```

```javascript
import React from 'react';
import {BentoSocialShare} from '@bentoproject/social-share/react';
import '@bentoproject/social-share/styles.css';

function App() {
  return (
    <BentoSocialShare
      type="twitter"
      aria-label="Share on Twitter"
    ></BentoSocialShare>
  );
}
```

### Bố cục và phong cách

#### Loại hộp chứa

Thành phần `BentoSocialShare` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác). Chúng có thể được áp dụng inline:

```jsx
<BentoSocialShare
  style={{width: 50, height: 50}}
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

Hoặc thông qua `className`:

```jsx
<BentoSocialShare
  className="custom-styles"
  type="twitter"
  aria-label="Share on Twitter"
></BentoSocialShare>
```

```css
.custom-styles {
  height: 50px;
  width: 50px;
}
```

### Hỗ trợ tiếp cận

#### Chỉ báo tập trung

Yếu tố `BentoSocialShare` có chỉ báo tập trung nhìn thấy mặc định là một viền xanh dương. `tabindex=0` cũng là một thuộc tính mặc định khác, khiến người dùng có thể dễ dàng theo dõi khi họ chuyển qua các yếu tố `BentoSocialShare` được sử dụng cùng nhau trên một trang.

Chỉ báo tập trung mặc định có được với bộ quy tắc RSS sau.

```css
BentoSocialShare:focus {
  outline: #0389ff solid 2px;
  outline-offset: 2px;
}
```

Chỉ báo tập trung mặc định có thể được ghi đè bằng cách quy định phong cách CSS cho hành động tập trung và bao gồm chúng trong một thẻ `style`. Trong ví dụ dưới đây, bộ quy tắc CSS đầu tiên sẽ xóa chỉ báo tập trung trên tất cả các yếu tố `BentoSocialShare` bằng cách đặt đặc tính `outline` là `none`. Bộ quy tắc thứ hai quy định một viền đỏ (thay cho màu xanh dương mặc định) và cũng thiết lập `outline-offset` thành `3px` cho tất cả yếu tố `BentoSocialShare` với lớp `custom-focus`.

```css
BentoSocialShare:focus{
  outline: none;
}

BentoSocialShare.custom-focus:focus {
  outline: red solid 2px;
  outline-offset: 3px;
}
```

Với các quy tắc CSS này, các yếu tố `BentoSocialShare` sẽ không hiển thị chỉ báo tập trung nhìn thấy trừ khi chúng có bao gồm lớp `custom-focus`, trong trường hợp đó, chúng sẽ có chỉ báo viền màu đỏ.

#### Tương phản màu sắc

Lưu ý rằng `BentoSocialShare` với một giá trị  `type` `twitter`, `whatsapp`, hoặc `line` sẽ hiển thị một nút với một tổ hợp màu nền trước/nền sau xuống dưới ngưỡng 3:1 được khuyến nghị cho nội dung phi văn bản được quy định trong [WCAG 2.1 SC 1.4.11 Tương phản cho nội dung phi văn bản](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html).

Nếu không có đủ độ tương phản, các nội dung có thể khó đọc và do đó khó xác định. Trong các trường hợp ngoại lệ, nội dung có độ tương phản thấp có thể hoàn toàn không được hiển thị cho những người có khiếm khuyết về cảm nhận màu sắc. Trong trường hợp nút chia sẻ ở trên, người dùng có thể không nhận biết/hiểu đúng chức năng của các nút điều khiển chia sẻ và dịch vụ liên quan đến chúng.

### Các nhà cung cấp được cấu hình sẵn

Thành phần `BentoSocialShare` có [một số nhà cung cấp được cấu hình sẵn ](./social-share-config.js) biết rõ điểm cuối chia sẻ của họ cũng như các tham số mặc định.

<table>
  <tr>
    <th class="col-twenty">Nhà cung cấp</th>
    <th class="col-twenty">Loại</th>
    <th>Các tham số qua đặc tính  <code>param</code>
</th>
  </tr>
  <tr>
    <td>
<a href="https://developers.google.com/web/updates/2016/10/navigator-share">API chia sẻ web</a> (kích hoạt hộp thoại chia sẻ của HĐH)</td>
    <td><code>system</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Email</td>
    <td><code>email</code></td>
    <td>
      <ul>
        <li>
<code>subject</code>: tùy chọn</li>
        <li>
<code>body</code>: tùy chọn</li>
        <li>
<code>recipient</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Facebook</td>
    <td><code>facebook</code></td>
    <td>
      <ul>
       <li>
<code>app_id</code>: 	<strong>bắt buộc</strong>, mặc định là: none. Tham số này là <code>app_id</code> của Facebook, vốn là bắt buộc cho <a href="https://developers.facebook.com/docs/sharing/reference/share-dialog">hộp thoại chia sẻ lên Facebook</a>.</li>
        <li>
<code>href</code>: tùy chọn</li>
        <li>
<code>quote</code>: tùy chọn, có thể được sử dụng để chia sẻ một trích dẫn hoặc văn bản.</li>
        </ul>
    </td>
  </tr>
  <tr>
    <td>LinkedIn</td>
    <td><code>linkedin</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Pinterest</td>
    <td><code>pinterest</code></td>
    <td>
      <ul>
        <li>
<code>media</code>: tùy chọn (nhưng rất nên được thiết lập). URL cho nội dung đa phương tiện được chia sẻ lên Pinterest. Nếu không thiết lập, người dùng cuối có thể được Pinterest yêu cầu tải lên một nội dung đa phương tiện.</li>
        <li>
<code>url</code>: tùy chọn</li>
        <li>
<code>description</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td>Tumblr</td>
    <td><code>tumblr</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: tùy chọn</li>
        <li>
<code>text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Twitter</td>
    <td><code>twitter</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: tùy chọn</li>
        <li>
<code>text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Whatsapp</td>
    <td><code>whatsapp</code></td>
    <td>
      <ul>
        <li>
<code>text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>LINE</td>
    <td><code>line</code></td>
    <td>
      <ul>
        <li>
<code>url</code>: tùy chọn</li>
        <li>
<code>text</code>: tùy chọn</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>SMS</td>
    <td><code>sms</code></td>
    <td>
      <ul>
        <li>
<code>body</code>: tùy chọn</li>
</ul>
    </td>
  </tr>
</table>

### Các nhà cung cấp không được cấu hình

Ngoài các nhà cung cấp được cấu hình sẵn, bạn có thể sử dụng các nhà cung cấp không được cấu hình bằng cách quy định các thuộc tính bổ sung trong thành phần `BentoSocialShare`.

#### Ví dụ: Tạo một nút chia sẻ cho một nhà cung cấp không được cấu hình

Ví dụ sau đây tạo một nút chia sẻ thông qua Facebook Messenger bằng cách thiết lập thuộc tính `data-share-endpoint` thành điểm cuối chính xác cho giao thức tùy chỉnh Facebook Messenger.

```html
<BentoSocialShare
  type="facebookmessenger"
  data-share-endpoint="fb-messenger://share"
  data-param-text="Check out this article: TITLE - CANONICAL_URL"
  aria-label="Share on Facebook Messenger"
>
</BentoSocialShare>
```

Bởi các nhà cung cấp này không được cấu hình sẵn, bạn sẽ cần tạo một ảnh và phong cách nút phù hợp cho họ.

### Đặc tính

#### type (bắt buộc)

Chọn một loại nhà cung cấp. Điều này là bắt buộc cho cả các nhà cung cấp được cấu hình sẵn lẫn không được cấu hình.

#### background

Đôi khi, bạn có thể muốn cung cấp phong cách của riêng mình. Bạn có thể ghi đè cho các phong cách được cung cấp bằng cách quy định một màu cho nền sau.

Khi tùy chỉnh phong cách của một biểu tượng `BentoSocialShare`, vui lòng đảm bảo rằng biểu tượng được tùy chỉnh đáp ứng hướng dẫn nhãn hiệu mà nhà cung cấp đã quy định (ví dụ: Twitter, Facebook, v.v.)

#### color

Đôi khi, bạn có thể muốn cung cấp phong cách của riêng mình. Bạn có thể ghi đè cho các phong cách được cung cấp bằng cách quy định một màu cho nền.

Khi tùy chỉnh phong cách của một biểu tượng `BentoSocialShare`, vui lòng đảm bảo rằng biểu tượng được tùy chỉnh đáp ứng hướng dẫn nhãn hiệu mà nhà cung cấp đã quy định (ví dụ: Twitter, Facebook, v.v.)

#### target

Quy định mục tiêu trong đó để mở mục tiêu. Mặc định là  `_blank` cho tất cả các trường hợp ngoại trừ email/SMS trên iOS, trong trường hợp đó target (mục tiêu) sẽ được đặt thành `_top`.

#### endpoint

Đặc tính này là bắt buộc cho các nhà cung cấp không được cấu hình.

Một số nhà cung cấp phổ biến có các điểm cuối chia sẻ được cấu hình sẵn. Để biết thêm chi tiết, hãy xem phần Các nhà cung cấp được cấu hình sẵn. Đối với các nhà cung cấp không được cấu hình, bạn sẽ cần quy định điểm cuối chia sẻ.

#### params

Tất cả các đặc tính `param` đều được phân tích như các tham số URL và chuyển đến điểm cuối chia sẻ.

#### aria-label

Mô tả của nút cho hỗ trợ tiếp cận. Nhãn được khuyến nghị là "Chia sẻ trên &lt;type&gt;".
