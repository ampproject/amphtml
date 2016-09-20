#!/bin/sh

# In Ubuntu Trusty (and possibly other systems), the Node.js
# interpreter is called 'nodejs', not 'node'
# (http://stackoverflow.com/questions/18130164/nodejs-vs-node-on-ubuntu-12-04)
# so we probe which command it is.
for CMD in node nodejs; do
  if [ "42" = "$(${CMD} --eval 'console.log("42")' 2>/dev/null)" ]; then

    # Compute the absolute path for the directory that index.sh is installed in.
    # Since readlink -f isn't supported on Mac out of the box, we use Node.js
    # to do the equivalent of $(dirname $(readlink -f $0)).
    DIR="$($CMD --eval "console.log(require('path').dirname(require('fs').realpathSync(\"$0\")))")"

    # If index.js is also in this directory, use it; otherwise we're probably
    # in a bin directory in the NPM directory structure, so we look up the
    # amphtml-validator module in the lib directory.
    if [ -f "${DIR}/index.js" ]; then
      MOD="${DIR}/index.js"
    else
      MOD="${DIR}/../lib/node_modules/amphtml-validator/index.js"
    fi

    exec "$CMD" "$MOD" "$@"
  fi
done
echo "No working Node.js binary found (tried 'node', 'nodejs')." > /dev/stderr
exit 1
