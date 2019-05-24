You need to recompile `dist/runner.jar` on a Linux machine for any source code
changes made to this dir. Install [Apache Ant](https://ant.apache.org/) and run
the following commands:

```
$ cd build-system/runner/
$ ant clean && ant jar && ant test
```
