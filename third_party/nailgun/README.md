# Nailgun runner for AMP's custom closure compiler

The AMP Project uses a custom version of closure compiler available at [build-system/runner/dist/runner.jar](../dist/runner.jar). The compiler binary is launched several dozen times during the default multi-pass minification process (`gulp dist`). In order to speed this up, we use `nailgun` (https://github.com/facebook/nailgun) to launch a reusable instance of closure compiler.

## Files in this directory (copied from `nailgun` version [1.0.0](https://github.com/facebook/nailgun/releases/tag/nailgun-all-v1.0.0)):
- [`nailgun-server-1.0.0-SNAPSHOT.jar`](https://github.com/facebook/nailgun/releases/download/nailgun-all-v1.0.0/nailgun-server-1.0.0-SNAPSHOT.jar) copied to `nailgun-server.jar`
- [`ng.py`](https://github.com/facebook/nailgun/releases/download/nailgun-all-v1.0.0/ng.py) copied to `nailgun-runner`
