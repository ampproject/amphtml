#!/bin/bash

# Check all links except those pointing to http://localhost:8000.
# This needs to be done by first stripping localhost links from the
# doc file and then checking links, as there's no way to whitelist
# a link or domain while checking links.
cat $1 \
| sed 's/http:\/\/localhost:8000\///g\' \
>> $1_without_localhost_links \
&& markdown-link-check $1_without_localhost_links
