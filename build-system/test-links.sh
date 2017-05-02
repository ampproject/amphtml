#!/bin/bash

# This script tests an AMP doc file for broken links using an npm command line
# tool called "markdown-link-check".
#
# We check all links except those pointing to http://localhost:8000 because they
# aren't available during Travis runs. This needs to be done by first stripping
# localhost links from the doc file and then checking links, as there's no way
# to whitelist a link or domain while running markdown-link-check.

cat $1 \
| sed 's/http:\/\/localhost:8000\///g\' \
>> $1_without_localhost_links \
&& markdown-link-check $1_without_localhost_links
