#Building a command-line AMP Validator: Mac OS X

## Purpose

This documents how to build the official AMP-HTML command-line AMP Validator on Mac OS X. Once built in this fashion it can then be executed from a OS X terminal session to validate candidate HTML files over the local file system or the web as follows:

No HTML file passed to the program:

```
$ node validate
usage: validate <file.html or url>
```

Valid HTML file passed to the program:

```
$ node validate testdata/feature_tests/minimum_valid_amp.html
PASS
```

Invalid HTML file passed to the program:

```
$ node validate testdata/feature_tests/empty.html
FAIL
empty.html:1:0 The mandatory tag 'html ⚡ for top-level html' is missing or incorrect. (see [https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#ampd])
```

## References
- Development on AMP HTML 
    - [https://github.com/ampproject/amphtml/blob/master/DEVELOPING.md](https://github.com/ampproject/amphtml/blob/master/DEVELOPING.md) 
- AMP HTML ⚡ Validator 
    - [https://github.com/ampproject/amphtml/blob/master/validator/README.md](https://github.com/ampproject/amphtml/blob/master/validator/README.md) 
- Validating outside the browser - command line tool #937 
    - [https://github.com/ampproject/amphtml/issues/937](https://github.com/ampproject/amphtml/issues/937) 

## Dependencies and configuration

### Homebrew

#### Installing Homebrew

See: [http://brew.sh/](http://brew.sh/)

```
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

#### Maintaining your Homebrew environment

See GitHub Gist: [pietergreyling/mybrew.sh](https://gist.github.com/pietergreyling/43b00966f0a775a84ac8)
  
```
#!/bin/bash
#- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
#-- desc: To clean up and verify your Homebrew setup. 
#-- exec: In a terminal session run: $ ./mybrew.sh
clear
echo "-- Updating your Homebrew installation at: " && brew --prefix
sudo chown -R $(whoami):admin /usr/local
brew update && brew upgrade
echo "-- \$HOMEBREW_INSTALL: $HOMEBREW_INSTALL"
brew prune
brew doctor
#- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

### Node JS

```
$ brew install node
```

### Edit /etc/hosts

Not strictly initially necessary for the validator, but good not to forget:
  
```
127.0.0.1               ads.localhost iframe.localhost
```

### Google Protocol Buffers

```
$ brew tap homebrew/versions
$ brew install protobuf --c++11
$ brew link protobuf
$ protoc --version
libprotoc 2.6.1
$ python
Python 2.7.11 (default, Dec  5 2015, 14:44:53)
>> import google.protobuf
. . . exit if import worked . . .
```

### Getting a local working copy of the AMP repository source

```
$ cd my_amp_repo_work_directory
$ git clone [https://github.com/ampproject/amphtml.git](https://github.com/ampproject/amphtml.git)
$ cd amphtml
$ npm install
```

### Updating an existing AMP repository source copy

```
$ cd my_amp_repo_work_directory/amphtml
$ git pull origin master
$ npm install
```

## Building the validator

```
$ cd validator
$ npm install
$ sudo python ./build.py
[[build.py getNodeJsCmd]] - entering ...
[[build.py getNodeJsCmd]] - ... done
[[build.py CheckPrereqs]] - entering ...
[[build.py CheckPrereqs]] - ... done
[[build.py InstallNodeDependencies]] - entering ...
amp_validator@0.1.0 .../amphtml/validator
├── google-closure-compiler@20151015.0.0
├── google-closure-library@20151015.0.0
└─┬ jasmine@2.3.2
  ├── exit@0.1.2
  ├─┬ glob@3.2.11
  │ ├── inherits@2.0.1
  │ └─┬ minimatch@0.3.0
  │   ├── lru-cache@2.7.3
  │   └── sigmund@1.0.1
  └── jasmine-core@2.3.4
  
[[build.py InstallNodeDependencies]] - ... done
[[build.py SetupOutDir]] - entering ...
[[build.py SetupOutDir]] - ... done
[[build.py GenValidatorPb2Py]] - entering ...
[[build.py GenValidatorPb2Py]] - ... done
[[build.py GenValidatorGeneratedJs]] - entering ...
[[build.py GenValidatorGeneratedJs]] - ... done
[[build.py CompileValidatorMinified]] - entering ...
[[build.py CompileValidatorMinified]] - ... done
[[build.py GenerateValidateBin]] - entering ...
[[build.py GenerateValidateBin]] - ... done
[[build.py RunSmokeTest]] - entering ...
[[build.py RunSmokeTest]] - ... done
[[build.py CompileValidatorTestMinified]] - entering ...
[[build.py CompileValidatorTestMinified]] - ... success
[[build.py CompileHtmlparserTestMinified]] - entering ...
[[build.py CompileHtmlparserTestMinified]] - ... success
[[build.py CompileParseCssTestMinified]] - entering ...
[[build.py CompileParseCssTestMinified]] - ... success
[[build.py GenerateTestRunner]] - entering ...
[[build.py GenerateTestRunner]] - ... success
[[build.py RunTests]] - entering ...
Started
...................................................................................
83 specs, 0 failures
Finished in 0.394 seconds
[[build.py RunTests]] - ... success
```

## Running the validator (dist/validate)

```
$ ls -alG dist/validate
-rwxr-x---  1  245040 Jan 21 14:47 dist/validate
 
$ node dist/validate
usage: validate <file.html or url>;
 
$ node dist/validate testdata/feature_tests/minimum_valid_amp.html
PASS
  
$ node dist/validate testdata/feature_tests/empty.html
FAIL
empty.html:1:0 The mandatory tag 'html ⚡ for top-level html' is missing or incorrect. (see [https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md#ampd])
. . .
```
