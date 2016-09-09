#!/bin/bash

cat templates/before.installer node_modules/document-register-element/build/document-register-element.max.js templates/after.installer > node_modules/document-register-element/build/document-register-element-installer.max.js
