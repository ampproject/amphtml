#!/bin/sh

# In Ubuntu Trusty (and possibly other systems), the Node.js
# interpreter is called 'nodejs', not 'node'
# (http://stackoverflow.com/questions/18130164/nodejs-vs-node-on-ubuntu-12-04)
# so we probe which command it is.
for CMD in node nodejs; do
  if [ "42" = "$(${CMD} --eval 'console.log("42")' 2>/dev/null)" ]; then
    exec "$CMD" index.js "$@"
  fi
done
echo "No working Node.js binary found (tried 'node', 'nodejs')." > /dev/stderr
exit 1
