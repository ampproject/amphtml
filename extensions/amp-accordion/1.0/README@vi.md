# Bento Accordion

Hiển thị các phần nội dung có thể được thu hẹp và mở rộng Thành phần này cho phép người xem đọc lướt nội dung và nhảy đến bất kỳ phần nào. Việc sử dụng hiệu quả giúp giảm nhu cầu cuộn trên thiết bị di động.

-   Bento Accordion chấp nhận một hoặc nhiều yếu tố `<section>` (phần) làm con trực tiếp của nó.
-   Mỗi `<section>` phải chứa chính xác 2 con trực tiếp.
-   Con đầu tiên trong một `<section>` là tiêu đề cho phần đó của Bento Accordion. Nó phải là một yếu tố tiêu đề như `<h1>-<h6>` hoặc `<header>`.
-   Con thứ hai trong một `<section>` là nội dung mở rộng/thu hẹp được.
    -   Nó có thể là bất kỳ thẻ nào được cho phép trong [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md).
-   Nhấn hoặc chạm vào một tiêu đề `<section>` để mở rộng hoặc thu hẹp phần đó.
-   Một Bento Accordion với một `id` được định nghĩa sẽ duy trì trạng thái thu hẹp hoặc mở rộng của mỗi phần chừng nào người dùng còn ở lại tên miền của bạn.

## Thành phần web

Bạn phải bao gồm thư viện CSS cần thiết cho mỗi thành phần Bento để đảm bảo tải đúng cách và trước khi bổ sung các phong cách tùy chọn. Hoặc sử dụng các phong cách inline nhỏ gọn được nâng cấp từ trước. Xem [Bố cục và phong cách](#layout-and-style).

Ví dụ dưới đây minh họa cho việc sử dụng thành phần web `<bento-soundcloud>`.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### Ví dụ: Bao gồm qua `<script>`

Ví dụ dưới đây chứa một `bento-accordion` với ba phần. Thuộc tính `expanded` trên phần thứ ba sẽ mở rộng nó khi tải trang.

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
  />
</head>
<body>
  <bento-accordion id="my-accordion" disable-session-states>
    <section>
      <h2>Section 1</h2>
      <p>Content in section 1.</p>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>Content in section 2.</div>
    </section>
    <section expanded>
      <h2>Section 3</h2>
      <div>Content in section 3.</div>
    </section>
  </bento-accordion>
  <script>
    (async () => {
      const accordion = document.querySelector('#my-accordion');
      await customElements.whenDefined('bento-accordion');
      const api = await accordion.getApi();

      // programatically expand all sections
      api.expand();
      // programatically collapse all sections
      api.collapse();
    })();
  </script>
</body>
```

### Tương tác và sử dụng API

Các thành phần Bento trong sử dụng độc lập có khả năng tương tác cao thông qua API của chúng. API của thành phần `bento-accordion` có thể được truy cập bằng cách bao gồm thẻ kịch bản sau trong tài liệu của bạn:

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### Hành động

##### toggle()

Hành động `toggle` (bật/tắt) chuyển trạng thái `expanded` (mở rộng) và `collapsed` (thu hẹp) của các phần `bento-accordion`. Khi được gọi mà không có tham số, nó sẽ bật/tắt tất cả các phần của accordion. Để quy định một phần cụ thể, thêm đối số `section` (phần) và sử dụng `id` tương ứng của nó làm giá trị.

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.toggle();
    };
    document.querySelector('#button2').onclick = () => {
      api.toggle('section1');
    };
  })();
</script>
```

##### expand()

Hành động `expand` mở rộng các phần của `bento-accordion`. Nếu một phần đã được mở rộng rồi, nó vẫn sẽ được mở rộng. Khi được gọi mà không có tham số, nó sẽ mở rộng tất cả các phần của accordion. Để quy định một phần cụ thể, thêm đối số `section` (phần) và sử dụng <code>id</code> tương ứng của nó làm giá trị.

```html
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.expand();
    };
    document.querySelector('#button2').onclick = () => {
      api.expand('section1');
    };
  })();
</script>
```

##### collapse()

Hành động `collapse` thu hẹp các phần của `bento-accordion`. Nếu một phần đã được thu hẹp rồi, nó vẫn sẽ được thu hẹp. Khi được gọi mà không có tham số, nó sẽ thu hẹp tất cả các phần của accordion. Để quy định một phần cụ thể, thêm đối số `section` (phần) và sử dụng <code>id</code> tương ứng của nó làm giá trị.

```html
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.collapse();
    };
    document.querySelector('#button2').onclick = () => {
      api.collapse('section1');
    };
  })();
</script>
```

#### Sự kiện

API `bento-accordion` cho phép bạn đăng ký và đáp lại các sự kiện sau:

##### expand

Sự kiện này được kích hoạt khi một phần accordion được mở rộng và được thực hiện từ phần được mở rộng.

Xem ví dụ bên dưới.

##### collapse

Sự kiện này được kích hoạt khi một phần accordion được thu hẹp và được thực hiện từ phần được thu hẹp.

Trong ví dụ dưới đây, `section 1` sẽ chờ sự kiện `expand` và mở rộng `section 2` khi nó được mở rộng. `section 2` chờ sự kiện `collapse` và thu hẹp `section 1` khi nó được thu hẹp.

Xem ví dụ bên dưới.

```html
<bento-accordion id="eventsAccordion" animate>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</bento-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => {
      api.expand('section2');
    });
    section2.addEventListener('collapse', () => {
      api.collapse('section1');
    });
  })();
</script>
```

### Bố cục và phong cách

Mỗi thành phần Bento đều có một thư viện CSS nhỏ mà bạn phải bao gồm để đảm bảo việc tải đúng cách mà không bị [chuyển dịch nội dung](https://web.dev/cls/). Bởi yêu cầu cụ thể về thứ tự, bạn phải đảm bảo các stylesheet được bao gồm một cách thủ công trước mọi phong cách tùy chỉnh có thể có nào.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

Hoặc, bạn cũng có thể thiết lập các phong cách nhỏ gọn được nâng cấp từ trước để sử dụng chúng inline:

```html
<style>
  bento-accordion {
    display: block;
    contain: layout;
  }

  bento-accordion,
  bento-accordion > section,
  bento-accordion > section > :first-child {
    margin: 0;
  }

  bento-accordion > section > * {
    display: block;
    float: none;
    overflow: hidden; /* clearfix */
    position: relative;
  }

  @media (min-width: 1px) {
    :where(bento-accordion > section) > :first-child {
      cursor: pointer;
      background-color: #efefef;
      padding-right: 20px;
      border: 1px solid #dfdfdf;
    }
  }

  .i-amphtml-accordion-header {
    cursor: pointer;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }

  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating),
  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating)
    * {
    display: none !important;
  }
</style>
```

### Thuộc tính

#### animate

Bao gồm thuộc tính `animate` trong `<bento-accordion>` để thêm một hình hoạt họa "lăn xuống" khi nội dung được mở rộng và "lăn lên" khi nó được thu hẹp.

Thuộc tính này có thể được cấu hình để dựa trên một [truy vấn đa phương tiện](./../../../docs/spec/amp-html-responsive-attributes.md).

```html
<bento-accordion animate>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Content in section 2.</div>
  </section>
</bento-accordion>
```

#### expanded

Áp dụng thuộc tính `expanded` cho một `<section>` lồng để mở rộng phần đó khi trang được tải.

```html
<bento-accordion>
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section3" expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome expanded content</div>
  </section>
</bento-accordion>
```

#### expand-single-section

Chỉ cho phép một phần được mở rộng tại một thời điểm bằng cách áp dụng thuộc tính `expand-single-section` cho yếu tố `<bento-accordion>`. Điều này có nghĩa nếu một người dùng chạm vào một `<section>` được thu hẹp, nó sẽ mở rộng và thu hẹp các `<section>` khác.

```html
<bento-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <img
      src="https://source.unsplash.com/random/320x256"
      width="320"
      height="256"
    />
  </section>
</bento-accordion>
```

### Phong cách

Bạn có thể sử dụng bộ chọn yếu tố `bento-accordion` để tùy ý tạo phong cách cho accordion.

Hãy nhớ các điểm sau khi bạn tạo phong cách cho một amp-accordion:

-   Các yếu tố `bento-accordion` luôn có `display: block` (hiển thị: khối).
-   `float` không thể tạo phong cách cho một yếu tố `<section>`, tiêu đề, hay nội dung.
-   Một phần mở rộng sẽ áp dụng thuộc tính `expanded` cho yếu tố `<section>`.
-   Yếu tố nội dung được cố định rõ ràng với `overflow: hidden` và do đó không thể có thanh cuộn.
-   Lề của các yếu tố `<bento-accordion>`, `<section>`, tiêu đề, và nội dung được đặt thành `0`, nhưng có thể được ghi đè trong các phong cách tùy chỉnh.
-   Cả các yếu tố tiêu đề và nội dung đều có `position: relative` (vị trí: tương đối).

---

## Thành phần Preact/React

Ví dụ dưới đây minh họa cho việc sử dụng `<BentoAccordion>` như một thành phần chức năng với các thư viện Preact hoặc React.

### Ví dụ: Nhập qua npm

```sh
npm install @bentoproject/accordion
```

```javascript
import React from 'react';
import {BentoAccordion} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';

function App() {
  return (
    <BentoAccordion>
      <BentoAccordionSection key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

### Tương tác và sử dụng API

Các thành phần Bento có khả năng tương tác cao thông qua API của chúng. API của thành phần `BentoAccordion` có thể được truy cập bằng cách sử dụng một `ref`:

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader><h1>Section 1</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader><h1>Section 2</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader><h1>Section 3</h1></BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### Hành động

API `BentoAccordion` cho phép bạn thực hiện các hành động sau:

##### toggle()

Hành động `toggle` (bật/tắt) chuyển trạng thái `expanded` (mở rộng) và `collapsed` (thu hẹp) của các phần `bento-accordion`. Khi được gọi mà không có tham số, nó sẽ bật/tắt tất cả các phần của accordion. Để quy định một phần cụ thể, thêm đối số `section` (phần) và sử dụng <code>id</code> tương ứng của nó làm giá trị.

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

Hành động `expand` mở rộng các phần của `bento-accordion`. Nếu một phần đã được mở rộng rồi, nó vẫn sẽ được mở rộng. Khi được gọi mà không có tham số, nó sẽ mở rộng tất cả các phần của accordion. Để quy định một phần cụ thể, thêm đối số `section` (phần) và sử dụng <code>id</code> tương ứng của nó làm giá trị.

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

Hành động `collapse` thu hẹp các phần của `bento-accordion`. Nếu một phần đã được thu hẹp rồi, nó vẫn sẽ được thu hẹp. Khi được gọi mà không có tham số, nó sẽ thu hẹp tất cả các phần của accordion. Để quy định một phần cụ thể, thêm đối số `section` (phần) và sử dụng <code>id</code> tương ứng của nó làm giá trị.

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### Sự kiện

API Bento Accordion cho phép bạn đáp lại các sự kiện sau:

##### onExpandStateChange

Sự kiện này được kích hoạt trên một phần khi một phần accordion được mở rộng hoặc thu hẹp và được thực hiện từ phần được mở rộng.

Xem ví dụ bên dưới.

##### onCollapse

Sự kiện này được kích hoạt trên một phần khi một phần accordion được thu hẹp và được thực hiện từ phần được thu hẹp.

Trong ví dụ dưới đây, `section 1` sẽ chờ sự kiện `expand` và mở rộng `section 2` khi nó được mở rộng. `section 2` chờ sự kiện `collapse` và thu hẹp `section 1` khi nó được thu hẹp.

Xem ví dụ bên dưới.

```jsx
<BentoAccordion ref={ref}>
  <BentoAccordionSection
    id="section1"
    key={1}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section1 expanded' : 'section1 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 1</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 1</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section2"
    key={2}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section2 expanded' : 'section2 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 2</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 2</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section3"
    key={3}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section3 expanded' : 'section3 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 3</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 3</BentoAccordionContent>
  </BentoAccordionSection>
</BentoAccordion>
```

### Bố cục và phong cách

#### Loại hộp chứa

Thành phần `BentoAccordion` có một loại kích cỡ bố cục được định nghĩa cụ thể. Để đảm bảo thành phần này kết xuất đúng cách, hãy áp dụng một kích cỡ cho thành phần và các con trực tiếp của nó qua một bố cục CSS mong muốn (ví dụ như một bố cục được định nghĩa với `height` (chiều cao), `width` (chiều rộng), `aspect-ratio` (tỷ lệ khung hình), hoặc các đặc tính khác). Chúng có thể được áp dụng inline:

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

Hoặc thông qua `className`:

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### Đặc tính

#### BentoAccordion

##### animate

Nếu true (đúng), sử dụng hình hoạt họa "lăn xuống" / "lăn lên" trong quá trình mở rộng và thu hẹp mỗi phần, Mặc định: `false` (sai).

##### expandSingleSection

Nếu true (đúng), việc mở rộng 1 phần sẽ tự động thu hẹp tất cả các phần khác: Mặc định: `false` (sai)

#### BentoAccordionSection

##### animate

Nếu true (đúng), sử dụng hình hoạt họa "lăn xuống" / "lăn lên" trong quá trình mở rộng và thu hẹp phần, Mặc định: `false` (sai).

##### expanded

Nếu true (đúng), mở rộng phần. Mặc định: `false` (sai)

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

Gọi lại để chờ các thay đổi về trạng thái mở rộng. Nhận một cờ boolean làm tham số biểu thị là liệu phần này có vừa được mở rộng hay không (false (sai) có nghĩa là nó được thu hẹp)

#### BentoAccordionHeader

#### Các đặc tính thông dụng

Thành phần này hỗ trợ các [đặc tính thông dụng](../../../docs/spec/bento-common-props.md) cho các thành phần React và Preact.

BentoAccordionHeader chưa hỗ trợ bất kỳ đặc tính thông dụng nào

#### BentoAccordionContent

#### Các đặc tính thông dụng

Thành phần này hỗ trợ các [đặc tính thông dụng](../../../docs/spec/bento-common-props.md) cho các thành phần React và Preact.

BentoAccordionContent chưa hỗ trợ bất kỳ đặc tính thông dụng nào
