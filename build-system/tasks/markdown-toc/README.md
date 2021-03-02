# markdown-toc

Ensures that Markdown files in this repository have updated Tables-Of-Content.

```
gulp markdown-toc [--fix]
```

## Header

Markdown files must contain the following comment where they'd like to include the TOC.

```markdown
# Hello

<!--
  (Do not remove or edit this comment.)

  This table-of-contents is automatically generated. To generate it, run:
    gulp markdown-toc --fix
-->

## Section

Content.
```

```diff
  # Hello

  <!--
    (Do not remove or edit this comment.)

    This table-of-contents is automatically generated. To generate it, run:
      gulp markdown-toc --fix
  -->

+ -   [Section](#section)

  ## Section

  Content.
```

## Options

Files may configure how they'd like to create and format their TOCs. They can include a comment after a TOC header including JSON for [`markdown-toc` options](https://github.com/jonschlinkert/markdown-toc#options).

For example, the following options:

```json
{"maxdepth": 1}
```

In this markdown file:

```markdown
# Hello

<!--
  (Do not remove or edit this comment.)

  This table-of-contents is automatically generated. To generate it, run:
    gulp markdown-toc --fix
-->

<!-- {"maxdepth": 1} -->

- [included header one](#included-header-one)
- [included header two](#included-header-two)

## included header one

### this header is not included

because of `{"maxdepth": 1}` above

## included header two
```
