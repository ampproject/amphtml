# 支持的语言

要查看支持的语言列表，请参阅 [`_locales` 目录](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales)中的 `*.js` 文件列表。

# 语言后备

语言将回退到更通用的变体，并最终回退到 `default` 语言。变体在语言代码中使用连字符指示。

例如，语言代码 `en-GB` 将（按下列顺序）检查以下语言：

- `en-GB`（英国英语）
- `en`（英语）
- `default`（默认）

`default` 语言代码是在没有发布商指定的语言代码时使用的后备。它使用最少的英语字符串，因此，文档几乎全部以主要语言显示。对熟悉或易于理解的图标加以说明的任何标签均可被完全删除。例如，由于分享图标会显示分享网络的徽标（例如，Twitter 徽标），“Twitter”字符串就是多余的，`default` 语言可以将其忽略。

# 查看当前字符串

您可以在[此电子表格](https://bit.ly/amp-story-strings)中查看每种语言对应的译文。包含 `undefined` 文字的单元格表示该字符串不会以指定的语言显示，而是改用后备语言显示。

# 添加新字符串（英语）

1. 在 [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31) 中添加新字符串 ID。让 `LocalizedStringId` 列表按字母顺序排列，确保您 ID 的名称清楚表达它的语义。
2. 打开 [`en.js` 文件](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)。
3. 添加一个以 `LocalizedStringId` 作为键的新对象键，以及一个以字符串和说明作为值的对象。例如：

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. 发送包含您的变更的拉取请求。

# 添加新译文（非英语字符串）

1. 对照[字符串电子表格](https://bit.ly/amp-story-strings)，查找缺失的字符串。
2. 在要添加译文的相应语言的 [`_locales` 目录](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales)中，打开 `*.js` 文件。
3. 添加一个以 `LocalizedStringId` 作为键的新对象键，以及一个以字符串作为值的对象。例如：

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. 发送包含您的变更的拉取请求。

注：让字符串 ID 按字母顺序排列，对于英语以外的语言，不要在字符串对象中包含 `description` 键。
