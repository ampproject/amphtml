# AMP HTML ⚡ Validator

AMP HTML Validator takes input of HTML text and parses the text tag by tag, running the ruleset against every tag. Resultant from this process is validity of the input text and the errors generated while parsing.

## Table of Contents

- [Background](#Background)
- [Install](#Install)
- [Usage](#Usage)
- [Issues](#Issues)
- [Contribute](#Contribute)
- [License](#License)
- [Attribution](#Attribution)

## Background

@nhant01 and @GeorgeLuo own development and maintenance responsibility of the project. As such they will serve as the points of contact surrounding changes and modifications. The team will allocate resources to align the business with the implementations provided under the amphtml repo. With that in mind, should supporting this project become infeasible, we will publish a version of the codebase marked for deprecation and prepare for its removal from public repositories (every effort will be made to not have this happen).

### Install

#### Maven

AMP HTML Validator uses maven as tool for building and managing project. Add following snippet to your pom.xml and hit "mvn" to build your project.

```
<dependency>
  <groupId>amp.validator</groupId>
  <artifactId>amphtml-validator</artifactId>
  <version>1.0</version>
</dependency>
```

Here are the instructions to setup maven environment.
https://maven.apache.org/what-is-maven.html
https://maven.apache.org/guides/introduction/introduction-to-the-pom.html

#### Bazel

The Bazel BUILD file provides the instructions to construct a useable jar. There are two jars necessary to use the amp-validator, found in the bazel-bin, the bazel-bin/libamphtml_validator_lib.jar (validator business logic) and the bazel-bin/libamphtml_validator_proto_lib-speed.jar (the compiled proto objects). Run,

```
bazel clean
bazel run //:fetchAMPResources
bazel build //:amphtml_validator_java_proto_lib
bazel run //:copyValidatorJavaSource
bazel build //:amphtml_validator_lib
```

To run the suite of tests against this repo, run,

```
bazel run //:amphtml_validator_test
```

## Usage

Initialize the validator using

```
final AMPHtmlParser ampHtmlParser = new AMPHtmlParser();
final ValidationResult validationResult = ampHtmlParser.parse(inputHtml, htmlFormat, condition, maxNodes);
```

The parser can be used beyond the first document, to truncate initialization time. The maxNode condition is the maximum number of tags reviewed by the validator before forcing exit on exception. The condition is an enumeration of type ExitCondition, either exit on first error or a full parsing attempt. The htmlFormat is an enumeration for the format of AMP to be validated against.

## Issues

The are several known bugs in the validation output.

- the DOCTYPE tag is assumed to exist. Documents without the tag will fail to return an error.
- Observance of afterbody mode is not implemented. Tags that appear following a body closing tag should be interpreted as within the body tag. Specs that mandate relationships between tags and ancestors related to the body tag will not account for this behavior and will return unexpected errors.
- Attributes are de-duped by the internal html parser (the last value assigned to an attribute is the one returned to the handler). This leads to discrepancies in attribute validation to do with validation of the uniqueness of attributes and unexpected behavior in value validation.
- Attributes are sanitized for disallowed characters. This affects operators with contextual meaning such as '{' or '['. This will affect amp-mustache tag validation.
- Validation of URLs found within the HTML document may not return the same errors as the Node.js implementation. This stems from the fact that the internal URL library is lenient in terms of validating hostnames and characters used within the URL.
- The parser obfuscates Unicode values, this is grievous as the amp symbol is never discovered (⚡), this package only handles the literal "amp4email."
  Importantly, this validator prioritizes amp4email html content, enforcement of validator logic for other formats is not guaranteed.
- CSS validation does not yet configure for a max nodes value

## Contribute

Please refer to the [Contribute.md](Contribute.md) file for information about how to get involved. We welcome issues, questions, and pull requests. Pull Requests are welcome.

## License

This project is licensed under the terms of the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt) open source license. Please refer to [LICENSE](LICENSE) for the full terms.

## Attribution
