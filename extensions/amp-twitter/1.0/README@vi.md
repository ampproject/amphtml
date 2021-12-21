# Bento Twitter

## Hành vi

Thành phần Bento Twitter cho phép bạn nhúng một Tweet hoặc Khoảnh khắc. Dùng nó như một thành phần web [`<bento-twitter>`](#web-component), hoặc một thành phần chức năng Preact/React [`<BentoTwitter>`](#preactreact-component).

### Thành phần web

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-twitter>`.

#### Ví dụ: Nhập qua npm

[example preview="top-frame" playground="false"]

Cài đặt qua npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import '@ampproject/bento-twitter';
```

[/example]

#### Ví dụ: Bao gồm qua `<script>`

[example preview="top-frame" playground="false"]

```html
<head>
  <script src="https://cdn.ampproject.org/custom-elements-polyfill.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style data-bento-boilerplate>
    bento-twitter {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <!-- TODO(wg-bento): Once available, change src to bento-twitter.js -->
  <script async src="https://cdn.ampproject.org/v0/amp-twitter-1.0.js"></script>
  <style>
    bento-twitter {
      width: 375px;
      height: 472px;
    }
  </style>
</head>
<bento-twitter id="my-tweet" data-tweetid="885634330868850689">
</bento-twitter>
<div class="buttons" style="margin-top: 8px;">
  <button id="change-tweet">
    Change tweet
  </button>
</div>

<script>
  (async () => {
    const twitter = document.querySelector('#my-tweet');
    await customElements.whenDefined('bento-twitter');

    // set up button actions
    document.querySelector('#change-tweet').onclick = () => {
      twitter.setAttribute('data-tweetid', '495719809695621121')
    }
  })();
</script>
```

[/example]

#### Bố cục và phong cách

Mỗi thành phần Bento đều có một thư viện CSS nhỏ mà bạn phải bao gồm để đảm bảo việc tải đúng cách mà không bị [chuyển dịch nội dung](https://web.dev/cls/). Bởi yêu cầu cụ thể về thứ tự, bạn phải đảm bảo các stylesheet được bao gồm một cách thủ công trước mọi phong cách tùy chỉnh có thể có nào.

```html
<link rel="stylesheet" type="text/css" href="https://cdn.ampproject.org/v0/amp-twitter-1.0.css">
```

Hoặc, bạn cũng có thể thiết lập các phong cách nhỏ gọn được nâng cấp từ trước để sử dụng chúng inline:

```html
<style data-bento-boilerplate>
  bento-twitter {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

**Loại hộp chứa**

Thành phần `bento-twitter` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với  `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác):

```css
bento-twitter {
  height: 100px;
  width: 100%;
}
```

#### Thuộc tính

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (bắt buộc)</strong></td>
    <td>ID của Tweet hoặc Khoảnh khắc, hoặc loại nguồn nếu một Dòng thời gian cần được hiển thị. Trong một URL như https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> là ID Tweet. Trong một URL như https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> là ID Khoảnh khắc. Các loại nguồn dòng thời gian hợp lệ bao gồm <code>profile</code>(hồ sơ), <code>likes</code> (lượt thích), <code>list</code> (danh sách), <code>collection</code> (bộ sưu tập), <code>url</code>, và <code>widget</code> (tiện ích).</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (tùy chọn)</strong></td>
    <td>Khi hiển thị một dòng thời gian, cần cung cấp các đối số bổ sung ngoài <code>timeline-source-type</code>. Ví dụ, <code>data-timeline-screen-name="amphtml"</code> kết hợp với <code>data-timeline-source-type="profile"</code> sẽ hiển thị một dòng thời gian cho tài khoản AMP Twitter. Để biết thêm chi tiết về các đối số khả dụng, hãy xem phần "Dòng thời gian" trong <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">Hướng dẫn về các chức năng nhà máy JavaScript của Twitter</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (tùy chọn)</strong></td>
    <td>Bạn có thể quy định các tùy chọn cho giao diện của Tweet, Khoảnh khắc, hoặc Dòng thời gian bằng cách thiết lập các thuộc tính <code>data-</code>. Ví dụ, <code>data-cards="hidden"</code> sẽ bỏ kích hoạt các thiệp Twitter. Để biết thêm chi tiết về các tùy chọn khả dụng, hãy xem tài liệu của Twitter <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">cho tweet</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">cho khoảnh khắc</a> và <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">cho dòng thời gian</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (tùy chọn)</strong></td>
    <td>Quy định một thuộc tính <code>title</code> (tiêu đề) cho thành phần. Mặc định là <code>Twitter</code>.</td>
  </tr>
</table>

### Thành phần Preact/React

Ví dụ dưới đây minh họa cho việc sử dụng `<BentoTwitter>` như một thành phần chức năng với các thư viện Preact hoặc React.

#### Ví dụ: Nhập qua npm

[example preview="top-frame" playground="false"]

Cài đặt qua npm:

```sh
npm install @ampproject/bento-twitter
```

```javascript
import React from 'react';
import { BentoTwitter } from '@ampproject/bento-twitter/react';
import '@ampproject/bento-twitter/styles.css';

function App() {
  return (
    <BentoTwitter tweetid="1356304203044499462">
    </BentoTwitter>
  );
}
```

[/example]

#### Bố cục và phong cách

**Loại hộp chứa**

Thành phần `BentoTwitter` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác). Chúng có thể được áp dụng inline:

```jsx
<BentoTwitter style={{width: '300px', height: '100px'}}  tweetid="1356304203044499462">
</BentoTwitter>
```

Hoặc thông qua `className`:

```jsx
<BentoTwitter className='custom-styles'  tweetid="1356304203044499462">
</BentoTwitter>
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
    <td width="40%"><strong>tweetid / momentid / timelineSourceType (bắt buộc)</strong></td>
    <td>ID của Tweet hoặc Khoảnh khắc, hoặc loại nguồn nếu một Dòng thời gian cần được hiển thị. Trong một URL như https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> là ID Tweet. Trong một URL như https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> là ID Khoảnh khắc. Các loại nguồn dòng thời gian hợp lệ bao gồm <code>profile</code>(hồ sơ), <code>likes</code> (lượt thích), <code>list</code> (danh sách), <code>collection</code> (bộ sưu tập), <code>url</code>, và <code>widget</code> (tiện ích).</td>
  </tr>
  <tr>
    <td width="40%"><strong>card / conversations (tùy chọn)</strong></td>
    <td>Khi hiển thị một tweet, có thể cung cấp các đối số bổ sung ngoài <code>tweetid</code>. Ví dụ, <code>cards="hidden"</code> kết hợp với <code>conversation="none"</code> sẽ hiển thị một tweet mà không có hình thu nhỏ hay bình luận bổ sung.</td>
  </tr>
  <tr>
    <td width="40%"><strong>limit (tùy chọn)</strong></td>
    <td>Khi hiển thị một khoảnh khắc, có thể cung cấp các đối số bổ sung ngoài <code>moment</code>. Ví dụ, <code>limit="5"</code> sẽ hiển thị một khoảnh khắc nhúng với tối đa 5 thiệp.</td>
  </tr>
  <tr>
    <td width="40%"><strong>timelineScreenName / timelineUserId (tùy chọn)</strong></td>
    <td>Khi hiển thị một dòng thời gian, có thể cung cấp các đối số bổ sung ngoài <code>timelineSourceType</code>. Ví dụ, <code>timelineScreenName="amphtml"</code> kết hợp với  <code>timelineSourceType="profile"</code> sẽ hiển thị một dòng thời gian cho tài khoản AMP Twitter.</td>
  </tr>
  <tr>
    <td width="40%"><strong>options (tùy chọn)</strong></td>
    <td>Bạn có thể quy định các tùy chọn cho giao diện của Tweet, Khoảnh khắc, hoặc Dòng thời gian bằng cách chuyển một đối tượng đến đặc tính <code>options</code>. Để biết thêm chi tiết về các tùy chọn khả dụng, hãy xem tài liệu của Twitter <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">cho tweet</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">cho khoảnh khắc</a> và <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">cho dòng thời gian</a>. Lưu ý: Khi chuyển đặc tính `options`, hãy nhớ tối ưu hoặc ghi nhớ đối tượng: <code> const TWITTER_OPTIONS = { // nhớ định nghĩa cái này một lần trên toàn cục! }; function MyComponent() { // v.v. return ( &lt;Twitter optionsProps={TWITTER_OPTIONS} /&gt; ); }</code>
</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (tùy chọn)</strong></td>
    <td>Quy định <code>title</code> (tiêu đề) cho iframe thành phần. Mặc định là <code>Twitter</code>.</td>
  </tr>
</table>
