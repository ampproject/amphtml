/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var argv = require('minimist')(process.argv.slice(2));
var dirname = require('path').dirname;
var exec = require('child_process').exec;
var fs = require('fs-extra');
var gulp = require('gulp');
// imageDiff is currently a bad dependency as it has a fixed node 0.8 engine
// requirement.
var imageDiff = require('gulp-image-diff');
var util = require('gulp-util');


/**
 * Use phantomjs to take a screenshot of a page at the given url and save it
 * to the output path.
 *
 * @param {string} host hostname
 * @param {string} path url path for page to screenshot (minus hostname)
 * @param {string} output output file path
 * @param {string} device device type e.g. 'iPhone6+' for screenshot
 * @param {boolean} verbose use verbose logging
 * @param {function} cb callback
 */
function doScreenshot(host, path, output, device, verbose, cb) {
  fs.mkdirpSync(dirname(output));
  if (verbose) {
    util.log('Output to: ', output);
  }
  exec('phantomjs --ssl-protocol=any --ignore-ssl-errors=true ' +
       '--load-images=true ' +
      'testing/screenshots/make-screenshot.js ' +
      '"' + host + '" ' +
      '"' + path + '" ' +
      '"' + output + '" ' +
      '"' + device + '" ',
      function(err, stdout, stderr) {
        if (verbose) {
          util.log(util.colors.gray('stdout: ', stdout));
          if (stderr.length) {
            util.log(util.colors.red('stderr: ', stderr));
          }
        }
        if (err != null) {
          util.log(util.colors.red('exec error: ', err));
        }
        cb();
      });
}


/**
 * Make a golden image of the url.
 * Ex:
 * `gulp make-golden --path=examples/everything.amp.max.html \
 *     --host=http://localhost:8000`
 *  @param {function} cb callback function
 */
function makeGolden(cb) {
  var path = argv.path;
  var host = argv.host || 'http://localhost:8000';
  var output = argv.output;
  var device = argv.device || 'iPhone6+';
  var verbose = (argv.verbose || argv.v);

  if (!output) {
    output = 'screenshots' + (path && path[0] != '/' ? '/' : '') +
        path + '.png';
  }

  doScreenshot(host, path, output, device, verbose, cb);
}


/**
 * Test if screenshots match the golden images, and generate a report to
 * compare the differences
 * Ex:
 * `gulp diff-screenshots --host=http://localhost:8000`
 * @param {function} cb callback function
 */
function testScreenshots(cb) {
  var host = argv.host || 'http://localhost:8000';
  var name = argv.name || 'screenshots';
  var dir = 'build/' + name;
  var verbose = (argv.verbose || argv.v);

  fs.mkdirpSync(dir);
  fs.emptyDirSync(dir);

  var reportFile = dir + '/report.html';
  reportPreambule(reportFile);
  var errorCount = 0;

  /**
   * Check if file ends with suffix specified
   * @param {string} s string to check
   * @param {string} suffix suffix to look for
   * @return {boolean} true if suffix matches, false otherwise
   */
  function endsWith(s, suffix) {
    return s.indexOf(suffix, s.length - suffix.length) != -1;
  }

  var goldenFiles = [];

  /**
   * Recursively scan a directory for png files collecting the
   * names of them. Add the resulting filenames to the
   * goldenFiles collection.
   * @param {string} dir path to directory
   */
  function scanDir(dir) {
    fs.readdirSync(dir).forEach(function(file) {
      var path = dir + '/' + file;
      if (endsWith(file, '.png')) {
        goldenFiles.push(path.replace('screenshots/', ''));
      } else if (fs.statSync(path).isDirectory()) {
        scanDir(path);
      }
    });
  }
  scanDir('screenshots');

  var todo = goldenFiles.length;
  if (verbose) {
    util.log('Diffs to be done: ', todo, goldenFiles);
  }
  goldenFiles.forEach(function(file) {
    diffScreenshot_(file, dir, host, verbose, function(res) {
      reportRecord(reportFile, file, dir, res);
      if (res.error || res.disparity > 0) {
        errorCount++;
        util.log(util.colors.red('Screenshot diff failed: ', file,
            JSON.stringify(res)));
      } else if (verbose) {
        util.log(util.colors.green('Screenshot diff successful: ', file));
      }

      todo--;
      if (todo == 0) {
        reportPostambule(reportFile);
        if (errorCount == 0) {
          util.log(util.colors.green('Screenshots tests successful'));
        } else {
          util.log(util.colors.red('Screenshots tests failed: ', errorCount,
              reportFile));
          process.exit(1);
        }
        cb();
      }
    });
  });
}

/**
 * Take a screenshot of the page and diff the result against the golden image.
 *
 * @param {string} file filename for file to test
 * @param {string} dir directory path to test images
 * @param {string} host hostname
 * @param {boolean} verbose use verbose logging
 * @param {function} cb callback function
 */
function diffScreenshot_(file, dir, host, verbose, cb) {
  if (verbose) {
    util.log('Screenshot diff for ', file);
  }

  var goldenFile = 'screenshots/' + file;
  var goldenCopyFile = dir + '/' + file;
  var htmlPath = file.replace('.png', '');
  var tmpFile = dir + '/' + file.replace('.png', '.tmp.png');
  var diffFile = dir + '/' + file.replace('.png', '.diff.png');

  fs.copySync(goldenFile, goldenCopyFile, {clobber: true});

  doScreenshot(host, htmlPath, tmpFile, 'iPhone6+', verbose, function() {
    // TODO: pixelColorTolerance: 0.10
    gulp.src([tmpFile])
        .pipe(imageDiff({
          referenceImage: goldenCopyFile,
          differenceMapImage: diffFile,
          logProgress: verbose
        }))
        .pipe(imageDiff.jsonReporter())
        .pipe(gulp.dest(diffFile + '.json'))
        .on('error', function(error) {
          util.log(util.colors.red('Screenshot diff failed: ', file, error));
          cb({error});
        })
        .on('end', function(res) {
          var contents = fs.readFileSync(diffFile + '.json', 'utf8');
          var json = JSON.parse(contents);
          cb(json[0]);
        });
  });
}

/**
 * Write preambule html into the report file
 * @param {string} reportFile filepath to report file
 */
function reportPreambule(reportFile) {
  fs.writeFileSync(reportFile,
      '<html>' +
      '<head><style>' +
          ' table {border-collapse: collapse}' +
          ' tr {border-bottom: 1px solid gray}' +
          ' td {padding: 8px 0}' +
          ' .thumb{display: block; width: 100px; height: 100px}' +
          ' .thumb img{display: block; width: auto; height: auto;' +
              'margin: auto; max-width: 100%; max-height: 100%}' +
          ' .result {text-align: center}' +
          ' .error {background: red} .success {background: green}' +
      '</style></head>' +
      '<body><h1>Screenshot Diffs</h1><table width=100%>' +
      '<thead><tr>' +
      '<th>Path</th>' +
      '<th>Result</th>' +
      '<th>Golden</th>' +
      '<th>Work</th>' +
      '<th>Diff</th>' +
      '</tr></thead>' +
      '<tbody>',
      'utf8');
}

/**
 * Append the postambule html to the report file
 * @param {string} reportFile filepath to report file
 */
function reportPostambule(reportFile) {
  fs.appendFileSync(reportFile,
      '</tbody></table></body></html>',
      'utf8');
}

/**
 * Create an html report record for an image diff and add it to the report file
 * @param {string} reportFile report file path
 * @param {string} file screenshot file path
 * @param {string} dir screenshot directory path
 * @param {!Object} record screenshot diff results record
 */
function reportRecord(reportFile, file, dir, record) {

  /**
   * Create html for a thumbnail link
   * @param {string} file file path to a thumbnail image
   * @return {string} html anchor tag string
   */
  function thumb(file) {
    file = file.replace(dir + '/', '');
    return '<a class=thumb target=_blank href="' + file + '">' +
        '<img src="' + file + '">' +
        '</a>';
  }

  fs.appendFileSync(reportFile,
      '<tr>' +
      '<td>' + file + '</td>' +
      '<td><div class="result ' +
          (record.disparity > 0 ? 'error' : 'success') + '">' +
          record.disparity + '</div></td>' +
      '<td align=center>' + thumb(record.referenceImage) + '</td>' +
      '<td align=center>' + thumb(record.compareImage) + '</td>' +
      '<td align=center>' + thumb(record.differenceMap) + '</td>' +
      '</tr>',
      'utf8');
}


gulp.task('make-golden', 'Creates a "golden" screenshot', makeGolden, {
  options: {
    'host': '  The host. Defaults to "http://localhost:8000".',
    'path': '  The path of the page URL on the host.' +
        ' E.g. "/test/manual/amp-img.amp.html"',
    'output': '  The file where to output the screenshot.' +
        ' Defaults to "screenshots/{path}.png"',
    'device': '  The name of the device which parameters to be used for' +
        ' screenshotting. Defaults to "iPhone6+".',
    'verbose': '  Verbose logging. Default is false. Shorthand is "-v"'
  }
});

gulp.task('test-screenshots', 'Tests screenshots against "golden" images',
    testScreenshots, {
  options: {
    'host': '  The host. Defaults to "http://localhost:8000".',
    'name': '  The name of the run. Defaults to "screenshots".' +
        ' The run files are placed in the "build/{name}" dir.',
    'verbose': '  Verbose logging. Default is false. Shorthand is "-v"'
  }
});
