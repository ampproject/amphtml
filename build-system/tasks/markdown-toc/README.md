# markdown-toc

Ensures that Markdown files in this repository have updated Tables-Of-Content.

```
amp markdown-toc [--fix]
```

## Usage

Files must contain the following header comment:

```markdown
<!--
  (Do not remove or edit this comment.)

  This table-of-contents is automatically generated. To generate it, run:
    amp markdown-toc --fix
-->
```

Running the mentioned command inserts the TOC after the comment if necessary:

```diff
  # Hello

  <!--
    (Do not remove or edit this comment.)

    This table-of-contents is automatically generated. To generate it, run:
      amp markdown-toc --fix
  -->

+ -   [Section](#section)

  ## Section

  Content.
```

These files are checked during Continuous Integration so they will stay up-to-date.

## Options

You may configure how you'd like to create and format a TOC by including a second comment including a JSON object. This object contains [`markdown-toc` options](https://github.com/jonschlinkert/markdown-toc#options).

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
    amp markdown-toc --fix
-->

<!-- {"maxdepth": 1} -->

- [included header one](#included-header-one)
- [included header two](#included-header-two)

## included header one

### this header is not included

because of `{"maxdepth": 1}` above

## included header two
```
