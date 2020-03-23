## Custom transforms for `gulp serve`.

**Parent directory:** `build-system/server/new-server/transforms/`

**Structure:** Each subdirectory should contain the following:

- A single `.ts` file that implements a specific transform (`*-transform.ts`)
- One or more pairs of input and output files for the transform (`test-*-[input|output].html`)

**Example:**

```
└── transforms
    ├── foo
    │   ├── foo-transform.ts
    │   ├── test-name-input.html
    │   └── test-name-output.html
    ├── bar
    │   ├── bar-transform.ts
    │   ├── test-name1-input.html
    │   ├── test-name1-output.html
    │   ├── test-name2-input.html
    │   └── test-name2-output.html
```
