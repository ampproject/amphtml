# Bento băng chuyền

Một băng chuyền phổ thông để hiển thị nhiều mảnh nội dung giống nhau trên một trục ngang hoặc trục dọc.

Mỗi con trực tiếp của thành phần này đều được coi là một mục trong băng chuyền. Mỗi nút này cũng đều có thể có các con tùy ý.

Băng chuyền bao gồm một số mục tùy ý, cũng như các mũi tên điều hướng tùy chọn để dịch chuyển tiến hay lùi từng mục.

Băng chuyền sẽ chuyển giữa các mục nếu người dùng vuốt hoặc sử dụng các nút mũi tên tùy chỉnh.

## Thành phần web

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-base-carousel>`.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import {defineElement as defineBentoBaseCarousel} from '@bentoproject/base-carousel';
defineBentoBaseCarousel();
```

### Ví dụ: Bao gồm qua `<script>`

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <!-- These styles prevent Cumulative Layout Shift on the unupgraded custom element -->
  <style>
    bento-base-carousel {
      display: block;
      overflow: hidden;
      position: relative;
    }
  </style>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.js"
  ></script>
  <style>
    bento-base-carousel,
    bento-base-carousel > div {
      aspect-ratio: 4/1;
    }
    .red {
      background: darkred;
    }
    .blue {
      background: steelblue;
    }
    .green {
      background: seagreen;
    }
  </style>
</head>
<bento-base-carousel id="my-carousel">
  <div class="red"></div>
  <div class="blue"></div>
  <div class="green"></div>
</bento-base-carousel>
<div class="buttons" style="margin-top: 8px">
  <button id="prev-button">Go to previous slide</button>
  <button id="next-button">Go to next slide</button>
  <button id="go-to-button">Go to slide with green gradient</button>
</div>

<script>
  (async () => {
    const carousel = document.querySelector('#my-carousel');
    await customElements.whenDefined('bento-base-carousel');
    const api = await carousel.getApi();

    // programatically advance to next slide
    api.next();

    // set up button actions
    document.querySelector('#prev-button').onclick = () => api.prev();
    document.querySelector('#next-button').onclick = () => api.next();
    document.querySelector('#go-to-button').onclick = () => api.goToSlide(2);
  })();
</script>
```

### Tương tác và sử dụng API

Các thành phần hỗ trợ Bento được sử dụng như một thành phần web độc lập có khả năng tương tác cao thông qua API của chúng. API của thành phần `bento-base-carousel` có thể được truy cập bằng cách bao gồm thẻ kịch bản sau trong tài liệu của bạn:

```javascript
await customElements.whenDefined('bento-base-carousel');
const api = await carousel.getApi();
```

#### Hành động

API `bento-base-carousel` cho phép bạn thực hiện các hành động sau:

##### next()

Di chuyển băng chuyền về phía trước số slide bằng `advance-count`.

```javascript
api.next();
```

##### prev()

Di chuyển băng chuyền về phía sau số slide bằng `advance-count`.

```javascript
api.prev();
```

##### goToSlide(index: number)

Di chuyển băng chuyền đến slide được quy định bởi đối số `index`. Lưu ý: `index` sẽ được chuẩn hóa thành một số lớn hơn hoặc bằng `0` và nhỏ hơn số slide đã cho.

```javascript
api.goToSlide(0); // Advance to first slide.
api.goToSlide(length - 1); // Advance to last slide.
```

#### Sự kiện

API `bento-base-carousel` cho phép bạn đăng ký và đáp lại các sự kiện sau:

##### slideChange

Sự kiện này được kích hoạt khi mục lục được hiển thị bởi băng chuyền đã thay đổi. Mục lục mới được cung cấp qua `event.data.index`.

```javascript
carousel.addEventListener('slideChange', (e) => console.log(e.data.index));
```

### Bố cục và phong cách

Mỗi thành phần Bento đều có một thư viện CSS nhỏ mà bạn phải bao gồm để đảm bảo việc tải đúng cách mà không bị [chuyển dịch nội dung](https://web.dev/cls/). Bởi yêu cầu cụ thể về thứ tự, bạn phải đảm bảo các stylesheet được bao gồm một cách thủ công trước mọi phong cách tùy chỉnh có thể có nào.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-base-carousel-1.0.css"
/>
```

Hoặc, bạn cũng có thể thiết lập các phong cách nhỏ gọn được nâng cấp từ trước để sử dụng chúng inline:

```html
<style>
  bento-base-carousel {
    display: block;
    overflow: hidden;
    position: relative;
  }
</style>
```

#### Loại hộp chứa

Thành phần `bento-base-carousel` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác):

```css
bento-base-carousel {
  height: 100px;
  width: 100%;
}

bento-base-carousel > * {
  aspect-ratio: 4/1;
}
```

### Thay đổi slide từ phải sang trái

`<bento-base-carousel>` yêu cầu bạn định nghĩa rõ khi nó có ngữ cảnh từ phải sang trái (rtl) (ví dụ: các trang tiếng Ả Rập, Do Thái). Tuy băng chuyền thường sẽ hoạt động mà không cần điều này, nhưng nó có thể dẫn đến một vài lỗi. Bạn có thể cho băng chuyền biết rằng nó cần hoạt động `rtl` (từ phải sang trái) như sau:

```html
<bento-base-carousel dir="rtl" …>
  …
</bento-base-carousel>
```

Nếu băng chuyền đang ở trong một ngữ cảnh từ phải sang trái, và bạn muốn băng chuyền hoạt động từ trái sang phải, bạn có thể định nghĩa rõ ràng `dir="ltr"` trên băng chuyền.

### Bố cục slide

Các slide sẽ được băng chuyền tự động chia kích cỡ khi **không** quy định `mixed-lengths`.

```html
<bento-base-carousel …>
  <img style="height: 100%; width: 100%" src="…" />
</bento-base-carousel>
```

Các slide có chiều cao ngầm định khi băng chuyền được phân bổ. Điều này có thể dễ dàng được thay đổi với CSS. Khi quy định chiều cao, slide sẽ được chỉnh tâm theo chiều dọc trong băng chuyền.

Nếu bạn muốn chỉnh tâm nội dung slide theo chiều ngang, bạn sẽ muốn tạo một yếu tố bọc và sử dụng nó để chỉnh tâm cho nội dung này.

### Số slide được hiển thị

Khi thay đổi số slide được hiển thị bằng `visible-slides` để đáp lại một truy vấn đa phương tiện, bạn sẽ muốn thay đổi tỷ lệ khung hình của chính băng chuyền để khớp với số slide được hiển thị mới. Ví dụ, nếu bạn muốn hiển thị 3 slide cùng lúc với tỷ lệ khung hình 1:1, bạn sẽ muốn một tỷ lệ khung hình là 3:1 cho chính băng chuyền. Tương tự, với 4 slide cùng lúc, bạn sẽ muốn một tỷ lệ khung hình là 4:1. Ngoài ra, khi thay đổi `visible-slides`, bạn sẽ muốn thay đổi `advance-count`.

```html
<!-- Using an aspect ratio of 3:2 for the slides in this example. -->
<bento-base-carousel
  visible-count="(min-width: 600px) 4, 3"
  advance-count="(min-width: 600px) 4, 3"
>
  <img style="height: 100%; width: 100%" src="…" />
  …
</bento-base-carousel>
```

### Thuộc tính

#### Truy vấn đa phương tiện

Thuộc tính cho `<bento-base-carousel>` có thể được cấu hình để sử dụng các tùy chọn khác nhau dựa trên một [truy vấn đa phương tiện](./../../../docs/spec/amp-html-responsive-attributes.md).

#### Số slide được hiển thị

##### mixed-length

`true` (đúng) hay `false` (sai), mặc định là `false`. Nếu là true, sử dụng chiều rộng hiện có (hoặc chiều cao khi xếp theo chiều ngang) cho mỗi slide. Điều này cho phép sử dụng một băng chuyền có các slide có chiều rộng khác nhau.

##### visible-count

Một số, mặc định là `1`. Xác định số slide sẽ được hiển thị ở một thời điểm cụ thể. Các giá trị phân số có thể được sử dụng để hiển thị một phần (các) slide bổ sung. Tùy chọn này bị bỏ qua khi `mixed-length` là `true`.

##### advance-count

Một số, mặc định là `1`. Xác định số slide mà băng chuyền sẽ di tới khi dùng các mũi tên tiến hoặc lùi. Điều này hữu ích khi quy định thuộc tính `visible-count`.

#### Tự động tiến

##### auto-advance

`true` (đúng) hay `false` (sai), mặc định là `false`. Tự động di băng chuyền đến slide tiếp theo sau một thời gian trễ. Nếu người dùng thay đổi slide một cách thủ công, chức năng tự động tiến sẽ dừng lại. Lưu ý rằng nếu `loop` (vòng lặp) không được bật, khi đạt đến mục cuối cùng, chức năng tự động tiến sẽ đi lùi về mục đầu tiên.

##### auto-advance-count

Một số, mặc định là `1`. Xác định số slide mà băng chuyền sẽ di tới khi tự động tiến. Điều này hữu ích khi quy định thuộc tính `visible-count`.

##### auto-advance-interval

Một số, mặc định là `1000`. Quy định lượng thời gian tính theo mili giây giữa các lần tự động tiến băng chuyền.

##### auto-advance-loops

Một số, mặc định là `∞`. Số lần băng chuyền tiến qua các slide trước khi dừng lại.

#### Căn chỉnh

##### snap

`true` (đúng) hay `false` (sai), mặc định là `true`. Xác định liệu băng chuyền có cần căn chỉnh trên slide khi cuộn không.

##### snap-align

`start` (điểm đầu) hoặc `center` (trung tâm). Khi căn chỉnh điểm đầu, điểm đầu của slide (nghĩa là cạnh bên trái, khi xếp theo chiều ngang) sẽ được căn chỉnh với điểm đầu của băng chuyền. Khi căn chỉnh trung tâm, tâm của một slide sẽ được căn chỉnh với tâm của băng chuyền.

##### snap-by

Một số, mặc định là `1`. Số này xác định chi tiết căn chỉnh và hữu ích khi sử dụng `visible-count`.

#### Khác

##### controls

`"always"` (luôn luôn), `"auto"` (tự động), hoặc `"never"` (không bao giờ), mặc định là `"auto"`. Thuộc tính này xác định liệu các mũi tên điều hướng tiến/lùi có được hiển thị hay không, và khi nào. Lưu ý: Khi `outset-arrows` là `true` (đúng), các mũi tên sẽ `"always"` (luôn luôn) được hiển thị.

-   `always`: Các mũi tên luôn luôn được hiển thị.
-   `auto`: Các mũi tên được hiển thị khi băng chuyền được tương tác gần đây bằng chuột, và không được hiển thị khi băng chuyền được tương tác gần đây bằng cảm ứng. Ở lần tải đầu tiên cho các thiết bị cảm ứng, các mũi tên được hiển thị cho đến lần tương tác đầu tiên.
-   `never`: Các mũi tên không bao giờ được hiển thị.

##### slide

Một số, mặc định là `0`. Số này xác định slide đầu tiên được hiển thị trong băng chuyền. Số này có thể được kết hợp với `Element.setAttribute` để kiểm soát slide đang được hiển thị.

##### loop

`true` (đúng) hoặc `false` (sai), mặc định là `false` khi được bỏ trống. Nếu là true, băng chuyền sẽ cho phép người dùng di chuyển từ mục đầu tiên lùi về mục cuối cùng và ngược lại. `visible-count` phải lớn hơn số slide ít nhất 3 lần để có thể tạo vòng lặp.

##### orientation

`horizontal` (chiều ngang) hoặc `vertical` (chiều dọc), mặc định là `horizontal`. Nếu là `horizontal`, băng chuyền sẽ được bố trí theo chiều ngang, và người dùng có thể vuốt sang trái hoặc sang phải. Nếu là `vertical`, băng chuyền sẽ được bố trí theo chiều dọc và người dùng có thể vuốt lên hoặc xuống.

### Phong cách

Bạn có thể sử dụng bộ chọn yếu tố `bento-base-carousel` để tùy ý tạo phong cách cho băng chuyền.

#### Tùy chỉnh nút mũi tên

Các nút mũi tên có thể được tùy biến bằng cách sử dụng các mã đánh dấu tùy chỉnh của bạn. Chẳng hạn, bạn có thể tái tạo phong cách mặc định với các mã HTML và CSS sau:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```html
<bento-base-carousel …>
  <div>first slide</div>
  …
  <button slot="next-arrow" class="carousel-next" aria-label="Next"></button>
  <button
    slot="prev-arrow"
    class="carousel-prev"
    aria-label="Previous"
  ></button>
</bento-base-carousel>
```

---

## Thành phần Preact/React

Ví dụ dưới đây minh họa cho việc sử dụng `<BentoBaseCarousel>` như một thành phần chức năng với các thư viện Preact hoặc React.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/base-carousel
```

```javascript
import React from 'react';
import {BentoBaseCarousel} from '@bentoproject/base-carousel/react';
import '@bentoproject/base-carousel/styles.css';

function App() {
  return (
    <BentoBaseCarousel>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

### Tương tác và sử dụng API

Các thành phần Bento có khả năng tương tác cao thông qua API của chúng. API của thành phần `BentoBaseCarousel` có thể được truy cập bằng cách sử dụng một `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoBaseCarousel ref={ref}>
      <img src="puppies.jpg" />
      <img src="kittens.jpg" />
      <img src="hamsters.jpg" />
    </BentoBaseCarousel>
  );
}
```

#### Hành động

API `BentoBaseCarousel` cho phép bạn thực hiện các hành động sau:

##### next()

Di chuyển băng chuyền về phía trước số slide bằng `advanceCount`.

```javascript
ref.current.next();
```

##### prev()

Di chuyển băng chuyền về phía sau số slide bằng `advanceCount`.

```javascript
ref.current.prev();
```

##### goToSlide(index: number)

Di chuyển băng chuyền đến slide được quy định bởi đối số `index`. Lưu ý: `index` sẽ được chuẩn hóa thành một số lớn hơn hoặc bằng `0` và nhỏ hơn số slide đã cho.

```javascript
ref.current.goToSlide(0); // Advance to first slide.
ref.current.goToSlide(length - 1); // Advance to last slide.
```

#### Sự kiện

API `BentoBaseCarousel` cho phép bạn đăng ký và đáp lại các sự kiện sau:

##### onSlideChange

Sự kiện này được kích hoạt khi mục lục được hiển thị bởi băng chuyền đã thay đổi.

```jsx
<BentoBaseCarousel onSlideChange={(index) => console.log(index)}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

### Bố cục và phong cách

#### Loại hộp chứa

Thành phần `BentoBaseCarousel` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó (các slide) qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác). Chúng có thể được áp dụng inline:

```jsx
<BentoBaseCarousel style={{width: 300, height: 100}}>
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

Hoặc thông qua `className`:

```jsx
<BentoBaseCarousel className="custom-styles">
  <img src="puppies.jpg" />
  <img src="kittens.jpg" />
  <img src="hamsters.jpg" />
</BentoBaseCarousel>
```

```css
.custom-styles {
  height: 100px;
  width: 100%;
}

.custom-styles > * {
  aspect-ratio: 4/1;
}
```

### Thay đổi slide từ phải sang trái

`<BentoBaseCarousel>` yêu cầu bạn định nghĩa rõ khi nó có ngữ cảnh từ phải sang trái (rtl) (ví dụ: các trang tiếng Ả Rập, Do Thái). Tuy băng chuyền thường sẽ hoạt động mà không cần điều này, nhưng nó có thể dẫn đến một vài lỗi. Bạn có thể cho băng chuyền biết rằng nó cần hoạt động `rtl` (từ phải sang trái) như sau:

```jsx
<BentoBaseCarousel dir="rtl">…</BentoBaseCarousel>
```

Nếu băng chuyền đang ở trong một ngữ cảnh từ phải sang trái, và bạn muốn băng chuyền hoạt động từ trái sang phải, bạn có thể định nghĩa rõ ràng `dir="ltr"` trên băng chuyền.

### Bố cục slide

Các slide sẽ được băng chuyền tự động chia kích cỡ khi **không** quy định `mixedLengths`.

```jsx
<BentoBaseCarousel>
  <img style={{height: '100%', width: '100%'}} src="…" />
</BentoBaseCarousel>
```

Các slide có chiều cao ngầm định khi băng chuyền được phân bổ. Điều này có thể dễ dàng được thay đổi với CSS. Khi quy định chiều cao, slide sẽ được chỉnh tâm theo chiều dọc trong băng chuyền.

Nếu bạn muốn chỉnh tâm nội dung slide theo chiều ngang, bạn sẽ muốn tạo một yếu tố bọc và sử dụng nó để chỉnh tâm cho nội dung này.

### Số slide được hiển thị

Khi thay đổi số slide được hiển thị bằng `visibleSlides` để đáp lại một truy vấn đa phương tiện, bạn sẽ muốn thay đổi tỷ lệ khung hình của chính băng chuyền để khớp với số slide được hiển thị mới. Ví dụ, nếu bạn muốn hiển thị 3 slide cùng lúc với tỷ lệ khung hình 1:1, bạn sẽ muốn một tỷ lệ khung hình là 3:1 cho chính băng chuyền. Tương tự, với 4 slide cùng lúc, bạn sẽ muốn một tỷ lệ khung hình là 4:1. Ngoài ra, khi thay đổi `visibleSlides`, bạn sẽ muốn thay đổi `advanceCount`.

```jsx
const count = window.matchMedia('(max-width: 600px)').matches ? 4 : 3;

<BentoBaseCarousel
  visibleCount={count}
  advanceCount={count}
>
  <img style={{height: '100%', width: '100%'}} src="…" />
  …
</BentoBaseCarousel>
```

### Đặc tính

#### Số slide được hiển thị

##### mixedLength

`true` (đúng) hay `false` (sai), mặc định là `false`. Nếu là true, sử dụng chiều rộng hiện có (hoặc chiều cao khi xếp theo chiều ngang) cho mỗi slide. Điều này cho phép sử dụng một băng chuyền có các slide có chiều rộng khác nhau.

##### visibleCount

Một số, mặc định là `1`. Xác định số slide sẽ được hiển thị ở một thời điểm cụ thể. Các giá trị phân số có thể được sử dụng để hiển thị một phần (các) slide bổ sung. Tùy chọn này bị bỏ qua khi `mixedLength` là `true`.

##### advanceCount

Một số, mặc định là `1`. Xác định số slide mà băng chuyền sẽ di tới khi dùng các mũi tên tiến hoặc lùi. Điều này hữu ích khi quy định thuộc tính `visibleCount`.

#### Tự động tiến

##### autoAdvance

`true` (đúng) hay `false` (sai), mặc định là `false`. Tự động di băng chuyền đến slide tiếp theo sau một thời gian trễ. Nếu người dùng thay đổi slide một cách thủ công, chức năng tự động tiến sẽ dừng lại. Lưu ý rằng nếu `loop` (vòng lặp) không được bật, khi đạt đến mục cuối cùng, chức năng tự động tiến sẽ đi lùi về mục đầu tiên.

##### autoAdvanceCount

Một số, mặc định là `1`. Xác định số slide mà băng chuyền sẽ di tới khi tự động tiến. Điều này hữu ích khi quy định thuộc tính `visible-count`.

##### autoAdvanceInterval

Một số, mặc định là `1000`. Quy định lượng thời gian tính theo mili giây giữa các lần tự động tiến băng chuyền.

##### autoAdvanceLoops

Một số, mặc định là `∞`. Số lần băng chuyền tiến qua các slide trước khi dừng lại.

#### Căn chỉnh

##### snap

`true` (đúng) hay `false` (sai), mặc định là `true`. Xác định liệu băng chuyền có cần căn chỉnh trên slide khi cuộn không.

##### snapAlign

`start` (điểm đầu) hoặc `center` (trung tâm). Khi căn chỉnh điểm đầu, điểm đầu của slide (nghĩa là cạnh bên trái, khi xếp theo chiều ngang) sẽ được căn chỉnh với điểm đầu của băng chuyền. Khi căn chỉnh trung tâm, tâm của một slide sẽ được căn chỉnh với tâm của băng chuyền.

##### snapBy

Một số, mặc định là `1`. Số này xác định chi tiết căn chỉnh và hữu ích khi sử dụng `visible-count`.

#### Khác

##### controls

`"always"` (luôn luôn), `"auto"` (tự động), hoặc `"never"` (không bao giờ), mặc định là `"auto"`. Thuộc tính này xác định liệu các mũi tên điều hướng tiến/lùi có được hiển thị hay không, và khi nào. Lưu ý: Khi `outset-arrows` là `true` (đúng), các mũi tên sẽ `"always"` (luôn luôn) được hiển thị.

-   `always`: Các mũi tên luôn luôn được hiển thị.
-   `auto`: Các mũi tên được hiển thị khi băng chuyền được tương tác gần đây bằng chuột, và không được hiển thị khi băng chuyền được tương tác gần đây bằng cảm ứng. Ở lần tải đầu tiên cho các thiết bị cảm ứng, các mũi tên được hiển thị cho đến lần tương tác đầu tiên.
-   `never`: Các mũi tên không bao giờ được hiển thị.

##### defaultSlide

Một số, mặc định là `0`. Số này xác định slide đầu tiên được hiển thị trong băng chuyền.

##### loop

`true` (đúng) hoặc `false` (sai), mặc định là `false` khi được bỏ trống. Nếu là true, băng chuyền sẽ cho phép người dùng di chuyển từ mục đầu tiên lùi về mục cuối cùng và ngược lại. `visible-count` phải lớn hơn số slide ít nhất 3 lần để có thể tạo vòng lặp.

##### orientation

`horizontal` (chiều ngang) hoặc `vertical` (chiều dọc), mặc định là `horizontal`. Nếu là `horizontal`, băng chuyền sẽ được bố trí theo chiều ngang, và người dùng có thể vuốt sang trái hoặc sang phải. Nếu là `vertical` (chiều dọc), băng chuyền sẽ được bố trí theo chiều dọc và người dùng có thể vuốt lên hoặc xuống.

### Phong cách

Bạn có thể sử dụng bộ chọn yếu tố `BentoBaseCarousel` để tùy ý tạo phong cách cho băng chuyền.

#### Tùy chỉnh nút mũi tên

Các nút mũi tên có thể được tùy biến bằng cách sử dụng các mã đánh dấu tùy chỉnh của bạn. Chẳng hạn, bạn có thể tái tạo phong cách mặc định với các mã HTML và CSS sau:

```css
.carousel-prev,
.carousel-next {
  filter: drop-shadow(0px 1px 2px #4a4a4a);
  width: 40px;
  height: 40px;
  padding: 20px;
  background-color: transparent;
  border: none;
  outline: none;
}

.carousel-prev {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M14,7.4 L9.4,12 L14,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}

.carousel-next {
  background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="M10,7.4 L14.6,12 L10,16.6" fill="none" stroke="#fff" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" /></svg>');
}
```

```jsx
function CustomPrevButton(props) {
  return <button {...props} className="carousel-prev" />;
}

function CustomNextButton(props) {
  return <button {...props} className="carousel-prev" />;
}

<BentoBaseCarousel
  arrowPrevAs={CustomPrevButton}
  arrowNextAs={CustomNextButton}
>
  <div>first slide</div>
  // …
</BentoBaseCarousel>
```
