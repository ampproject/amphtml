<!--
Copyright 2018 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# <a name="`amp-json-schema`"></a> `amp-json-schema`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>This extension allows the user to  specify a JSON schema and validate it using AJV(Another JSON VAlidator).</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-json-schema-0.1.js">&lt;/script></code></td>
  </tr>
  <tr>
    <td width="40%"><strong>Example</strong></td>
    <td>
      <script id="premutate-schema" type="application/schema+json">
        {
          "type": "object",
          "properties": {
            "numTickets": {
              "type": "integer",
            },
          },
          "required": ["numTickets"],
          "additionalProperties": false
        }
      </script>
    </td>
  </tr>
</table>

## Overview
This extension was created primarily to allow other extensions to validate JSON
data when given a schema

A [JSON Schema](https://json-schema.org/) defines what form the state you pass in
must look like. You can specify which fields are allowed, and which fields are
required.

You can think of it as a way to forcefully constrain the initial state of the app.
If schema validation fails, the page will not load, showing an error instead.

For example, if amp-bind wanted to use schema validation for premutating amp-state
upon page load, a premutate schema with the id='premutate-schema' can be defined 
(like the code block above), and then amp-bind would then call 
jsonSchemaService.validate('premutate-schema', data), where jsonSchemaService is an
instance of AmpJsonSchema.

## Validation
See [amp-json-schema rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-json-schema/validator-amp-json-schema.protoascii) in the AMP validator specification.
