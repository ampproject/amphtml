## Custom transforms for `gulp serve`.

**Main directory:** `build-system/server/new-server/transforms/`

**Structure:** Each subdirectory should contain the following:

- A single `.ts` file that implements a specific transform (`*-transform.ts`)
- A `test/` subdirectory containing one or more pairs of input and output files (`test/*-[input|output].html`)

**Example:**

```
└── transforms
    ├── foo
    │   ├── foo-transform.ts
    │   └── test
    │       ├── testName-input.html
    │       └── testName-output.html
    ├── bar
    │   ├── bar-transform.ts
    │   └── test
    │       ├── testName1-input.html
    │       ├── testName1-output.html
    │       ├── testName2-input.html
    │       └── testName2-output.html
```
