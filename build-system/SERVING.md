<!---
Copyright 2016 The AMP HTML Authors. All Rights Reserved.

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

# How AMP HTML is deployed

## Requirements
- git
- node 6+
- yarn 1.0.2+ (see https://yarnpkg.com/)
- gulp (installed globally)
- java 8

## Steps
```bash
git clone https://github.com/ampproject/amphtml.git
cd amphtml
# Checkout a tag
git checkout 123456789
yarn
gulp clean
# We only need to build the css files, no need to generate `max` files
gulp build --css-only
gulp dist --version 123456789 --type prod --hostname cdn.myowncdn.org --hostname3p 3p.myowncdn.net
mkdir -p /path/to/cdn/production/
mkdir -p /path/to/cdn/3p/
# this would be the files hosted on www.ampproject.org/
cp -R dist/* /path/to/cdn/production/
# this would be the files hosted on 3p.ampproject.net/
cp -R dist.3p/* /path/to/cdn/3p

# Unfortunately we need these replace lines to compensate for the transition
# to the new code. We should be able to remove this in the next couple of weeks
# as we no longer prefix the global AMP_CONFIG during `gulp dist` in the latest
# code in master. We use -i.bak for cross compatibility on GNU and BSD/Mac.
sed -i.bak "s#^.*\/\*AMP_CONFIG\*\/##" /path/to/cdn/production/v0.js
rm /path/to/cdn/production/v0.js.bak
sed -i.bak "s#^.*\/\*AMP_CONFIG\*\/##" /path/to/cdn/production/alp.js
rm /path/to/cdn/production/alp.js.bak

# make sure and prepend the global production config to main binaries
gulp prepend-global --target /path/to/cdn/production/v0.js --prod
gulp prepend-global --target /path/to/cdn/production/alp.js --prod
gulp prepend-global --target /path/to/3p/cdn/production/f.js --prod

# The following commands below are optional if you want to host a similar
# experiments page like https://cdn.ampproject.org/experiments.html
cp dist.tools/experiments/experiments.cdn.html /path/to/cdn/production/experiments.html
cp dist.tools/experiments/{experiments.js,experiments.js.map} /path/to/cdn/production/v0/
```
