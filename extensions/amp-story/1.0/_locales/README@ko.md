# 지원되는 언어

지원되는 언어 목록은 [`_locales` 디렉토리](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales)의 `*.js` 파일 값을 참조하세요.

# 폴백 언어

언어는 더 일반적인 옵션으로 대체되며, 궁극적으로는 `default` 언어로 대체됩니다. 옵션은 언어 코드에서 하이픈으로 표시됩니다.

예를 들어, 언어 코드 `en-GB`의 경우 다음 언어에 대조됩니다(다음 순서대로):

- `en-GB`(영어, 영국)
- `en`(영어)
- `default`(기본)

`default` 언어 코드는 게시자가 지정한 언어 코드가 존재하지 않는 경우에 사용되는 대체 언어입니다. 기본 언어는 문서의 대부분이 기본 언어로 표시될 수 있도록 최소한의 영어 문자열을 사용합니다. 친숙하거나 이해하기 쉬운 시각적 이미지를 설명하는 모든 라벨은 완전히 제거할 수 있습니다. 예를 들어, 공유 아이콘에는 공유 네트워크 로고(예: Twitter 로고)가 표시되므로 "Twitter" 문자열은 중복이며, `default` 언어에서 제외할 수 있습니다.

# 현재 문자열 보기

[이 스프레드 시트](https://bit.ly/amp-story-strings)에서 언어별로 제공되는 번역을 확인할 수 있습니다. `undefined` 텍스트가 포함된 셀은 문자열이 지정된 언어로 표시되지 않고 대체 언어가 사용된다는 의미합니다.

# 새 문자열 추가(영어)

1. [`LocalizedStringId`](https://github.com/ampproject/amphtml/blob/main/src/localized-strings.js#L31)에 새 문자열 Id를 추가합니다. `LocalizedStringId` 목록을 알파벳 순서에 따라 유지하고 ID 이름이 의미상 표시하는 바를 명확히 해야 합니다.
2. [`en.js` 파일](https://github.com/ampproject/amphtml/blob/main/extensions/amp-story/1.0/_locales/en.js)을 엽니다
3. `LocalizedStringId`를 키로 사용하여 새 객체 키를 추가하고 문자열을 값으로 포함하는 객체를 추가합니다. 예시:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
  description: 'This is a description of my string, explaining what it means and/or how it is used.',
},

/* ... */
```

1. 변경 사항의 pull 요청을 전송합니다.

# 새 번역 추가(영어 외 문자열)

1. [문자열 스프레드 시트](https://bit.ly/amp-story-strings)를 보고 누락된 문자열을 찾습니다.
2. 번역을 추가할 언어의 `*.js` 파일을 [`_locales` 디렉토리](https://github.com/ampproject/amphtml/tree/main/extensions/amp-story/1.0/_locales)에서 엽니다.
3. `LocalizedStringId`를 키로 사용하여 새 객체 키를 추가하고 문자열을 값으로 포함하는 객체를 추가합니다. 예시:

```javascript
/* ... */

[LocalizedStringId.MY_LOCALIZED_STRING_ID]: {
  string: 'My string',
},

/* ... */
```

1. 변경 사항의 pull 요청을 전송합니다.

참고: 문자열 ID를 알파벳 순서로 유지하고 영어 외 언어에 대한 문자열 객체에 `description` 키를 삽입하지 않습니다.
