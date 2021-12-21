# Các ngôn ngữ được hỗ trợ

Để xem danh sách các ngôn ngữ được hỗ trợ, xem danh sách các tập tin `*.js` trong [thư mục `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales).

# Ngôn ngữ dự phòng

Ngôn ngữ sẽ lùi về phương ngữ chung hơn, và cuối cùng là về ngôn ngữ `default` (mặc định). Phương ngữ được biểu thị bởi dấu gạch ngang trong mã ngôn ngữ.

Ví dụ, mã ngôn ngữ `en-GB` sẽ kiểm tra các ngôn ngữ sau (theo thứ tự này):

-   `en-GB` (Tiếng Anh-Anh)
-   `en` (Tiếng Anh)
-   `default` (Mặc định)

Mã ngôn ngữ `default` là một phương án dự phòng được sử dụng trong trường hợp mã ngôn ngữ mà nhà phát hành đã quy định không tồn tại. Nó sử dụng một lượng tối thiểu các chuỗi tiếng Anh, để tài liệu có thể được hiển thị chủ yếu bằng ngôn ngữ chính. Mọi nhãn mô tả các biểu tượng quen thuộc hoặc đọc được có thể bị cắt hoàn toàn. Ví dụ, bởi biểu tượng chia sẻ hiển thị logo của mạng lưới chia sẻ (ví dụ: Twitter), chuỗi "Twitter" là thừa và có thể được bỏ ra khỏi ngôn ngữ `default`.

# Xem chuỗi hiện tại

Bạn có thể xem bản dịch được cung cấp cho mỗi ngôn ngữ trong [bảng tính này](https://bit.ly/amp-story-strings). Mọi ô với văn bản `undefined` (không được định nghĩa) có nghĩa chuỗi đó sẽ không được hiển thị trong ngôn ngữ được quy định, và ngôn ngữ dự phòng sẽ được sử dụng thay thế.

# Bổ sung các chuỗi mới (Tiếng Anh)

1. Thêm một ID chuỗi mới trong [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31). Giữ danh sách `LocalizedStringId` theo thứ tự bảng chữ cái, và đảm bảo tên ID của bạn rõ ràng về nội dung mà nó đại diện.
2. Mở [tập tin `en.js`](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)
3. Thêm một khóa đối tượng mới với `LocalizedStringId` làm khóa, và một đối tượng chứa chuỗi và mô tả dưới dạng giá trị của nó. Ví dụ:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. Gửi một yêu cầu kéo với các thay đổi của bạn

# Bổ sung các bản dịch mới (các chuỗi không phải tiếng Anh)

1. Tìm (các) chuỗi còn thiếu bằng cách xem [bảng tính các chuỗi](https://bit.ly/amp-story-strings).
2. Mở tập tin `*.js` từ [thư mục `_locales`](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales) cho ngôn ngữ mà bạn muốn bổ sung một bản dịch.
3. Thêm một khóa đối tượng mới với `LocalizedStringId` làm khóa, và một đối tượng chứa chuỗi dưới dạng giá trị của nó. Ví dụ:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. Gửi một yêu cầu kéo với các thay đổi của bạn.

LƯU Ý: Giữ ID chuỗi theo thứ tự bảng chữ cái, và không bao gồm khóa `description` (mô tả) trong đối tượng chuỗi của bạn cho các ngôn ngữ ngoài tiếng Anh.
