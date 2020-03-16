This is incomplete, but done for research and as a guide for a future implementor.

To execute this 'updated-server':

1. `yarn gulp dist --esm --fortesting`
2. `cd ${AMPHTML_HOME}/build-system/updated-server; yarn build`
3. `cd ${AMPHTML_HOME}; yarn gulp`
4. Change the port of a visited example from `8000` to `8001`.
