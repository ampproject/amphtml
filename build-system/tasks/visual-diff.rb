#!/usr/bin/ruby
#
# Copyright 2017 The AMP HTML Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#
# Visual diff generator for AMP webpages using Percy.
#
# Note: This is done in ruby to use Percy's API for snapshotting pages served by
# a localhost server. See https://percy.io/docs/clients/ruby/percy-anywhere.


require 'capybara/poltergeist'
require 'json'
require 'net/http'
require 'percy/capybara/anywhere'
require 'phantomjs'


ENV['PERCY_DEBUG'] = '0'
ENV['PHANTOMJS_DEBUG'] = 'false'
ENV['WEBSERVER_QUIET'] = '--quiet'
# CSS widths: iPhone: 375, Pixel: 411, Macbook Pro 15": 1440.
DEFAULT_WIDTHS = [375, 411, 1440]
HOST = 'localhost'
PORT = '8000'
WEBSERVER_TIMEOUT_SECS = 15
CONFIGS = ['canary', 'prod']
AMP_RUNTIME_FILE = 'dist/amp.js'
BUILD_STATUS_URL = 'https://amphtml-percy-status-checker.appspot.com/status'
BUILD_PROCESSING_POLLING_INTERVAL_SECS = 5
BUILD_PROCESSING_TIMEOUT_SECS = 60
PERCY_BUILD_URL = 'https://percy.io/ampproject/amphtml/builds'
OUT = ENV['TRAVIS'] ? '/dev/null' : :out


# Colorize logs.
def red(text); "\e[31m#{text}\e[0m"; end
def cyan(text); "\e[36m#{text}\e[0m"; end
def green(text); "\e[32m#{text}\e[0m"; end
def yellow(text); "\e[33m#{text}\e[0m"; end


# Logs a message to the console.
#
# Args:
# - mode: 'verbose', 'info', 'warning', or 'error'.
# - message: Message to print on the console.
def log(mode, message)
  if mode == 'verbose' and not ENV['TRAVIS']
    puts green('VERBOSE: ') + message
  end
  if mode == 'info'
    puts green('INFO: ') + message
  end
  if mode == 'warning'
    puts yellow('WARNING: ') + message
  end
  if mode == 'error'
    puts red('ERROR: ') + message
  end
end


# Launches a background AMP webserver for unminified js using gulp.
#
# Returns:
# - Process ID of server process.
def launchWebServer()
  webserverCmd =
      "gulp serve --host #{HOST} --port #{PORT} #{ENV['WEBSERVER_QUIET']}"
  spawn(webserverCmd, :out=>OUT)
end


# Checks if a webserver is up and running.
#
# Returns:
# - true if the server returns an OK (200) response code.
def isWebServerRunning()
  http = Net::HTTP.start(HOST, PORT)
  response = http.head("/")
  response.code == "200"
rescue SystemCallError
  false
end


# Waits for the webserver to start up.
#
# Returns:
# - true if webserver is running.
def waitForWebServer()
  tries = 0
  until isWebServerRunning()
    sleep(1)
    tries += 1
    break if tries > WEBSERVER_TIMEOUT_SECS
  end
  isWebServerRunning()
end


# Checks the current status of a Percy build.
#
# Args:
# - buildId: ID of the ongoing Percy build.
# Returns:
# - The full response from the build status server.
def getBuildStatus(buildId)
  statusUri = URI("#{BUILD_STATUS_URL}?build_id=#{buildId}")
  Net::HTTP.start(statusUri.host, statusUri.port, use_ssl: true) do |https|
    request = Net::HTTP::Get.new(statusUri)
    response = https.request(request)
    if response.code == "200"
      buildStatus = JSON.parse(response.body)
    end
  end
rescue SystemCallError
  # Fail gracefully, and wait for the next attempt.
  return
end


# Waits for Percy to finish processing a build.
#
# Args:
# - buildId: ID of the ongoing Percy build.
# Returns:
# - The eventual status of the Percy build.
def waitForBuildCompletion(buildId)
  log('info',
      'Waiting for Percy build ' + cyan("#{buildId}") + ' to be processed...')
  tries = 0
  until ['finished', 'failed'].include?(
      (status = getBuildStatus(buildId))['state'])
    sleep(BUILD_PROCESSING_POLLING_INTERVAL_SECS)
    tries += 1
    break if tries > (
        BUILD_PROCESSING_TIMEOUT_SECS / BUILD_PROCESSING_POLLING_INTERVAL_SECS)
  end
  status
end


# Verifies that a Percy build succeeded and didn't contain any visual diffs.
#
# Args:
# - status: The eventual status of the Percy build.
# - buildId: ID of the Percy build.
def verifyBuildStatus(status, buildId)
  if status['state'] == 'failed'
    raise "Percy build failed: #{status['failure_reason']}"
  end
  if ['pending', 'processing'].include?(status['state'])
    raise "Percy build not processed after #{BUILD_PROCESSING_TIMEOUT_SECS}s"
  end
  if status['total_comparisons_diff'] != 0
    branches = ['master', 'release', 'canary', 'amp-release']
    if branches.any? { |branch| status['branch'].include? branch }
      # If there are visual diffs on master or a release branch, fail Travis.
      # For master, print instructions for how to approve new visual changes.
      if status['branch'] === 'master'
        log('error',
            'Found visual diffs. If the changes are intentional, you must ' +
            'approve the build at ' + cyan("#{PERCY_BUILD_URL}/#{buildId}") +
            ' in order to update the baseline snapshots.')
      end
      raise "Found visual diffs on branch #{status['branch']}."
    else
      # For PR branches, just print a warning since the diff may be intentional,
      # with instructions for how to approve the new snapshots so they are used
      # as the baseline for future visual diff builds.
      log('warning',
          'Percy build ' + cyan("#{buildId}") + ' contains visual diffs.')
      log('warning',
          'If they are intentional, you must first approve the build at ' +
          cyan("#{PERCY_BUILD_URL}/#{buildId}") +
          ' to allow your PR to be merged.')
      log('warning',
          'You must then wait for your merged PR to be tested on master, and ' +
          'approve the next "master" build at ' + cyan("#{PERCY_BUILD_URL}") +
          ' in order to update the visual diff baseline snapshots.')
    end
  else
    log('info',
        'Percy build ' + cyan("#{buildId}") + ' contains no visual diffs.')
  end
end


# Closes the webserver process with the given process ID.
#
# Args:
# - pid: Process ID of the webserver.
def closeWebServer(pid)
  Process.kill("INT", pid)
  Process.wait(pid, Process::WNOHANG)
  sleep(0.1)  # The child node process has an asynchronous stdout. See #10409.
end


# Loads all the visual tests from a well-known json config file.
def loadVisualTestsConfigJson()
  jsonFile = File.open(
      File.join(
          File.dirname(__FILE__),
          "../../test/visual-diff/visual-tests.json"),
      "r")
  jsonContent = jsonFile.read
end


# Runs the visual tests.
#
# Args:
# - visualTestsConfig: JSON object containing the config for the visual tests.
def runVisualTests(visualTestsConfig)
  Percy.config.default_widths = DEFAULT_WIDTHS
  Capybara.default_max_wait_time = 5
  Capybara.run_server = false
  Capybara.app_host = "http://#{HOST}:#{PORT}"
  assets_base_url = visualTestsConfig["assets_base_url"]
  assets_dir = File.expand_path(
      "../../../#{visualTestsConfig["assets_dir"]}",
      __FILE__)
  Percy::Capybara.use_loader(
      :filesystem, assets_dir: assets_dir, base_url: assets_base_url)
  page = Capybara::Session.new(:poltergeist)
  build = Percy::Capybara.initialize_build
  buildId = build['data']['id']
  File.write('PERCY_BUILD_ID', buildId)
  log('info', 'Started Percy build ' + cyan("#{buildId}") + '...')
  page.driver.options[:phantomjs] = Phantomjs.path
  page.driver.options[:js_errors] = true
  page.driver.options[:phantomjs_options] =
      ["--debug=#{ENV['PHANTOMJS_DEBUG']}"]
  page.driver.options[:phantomjs_logger] = ENV['TRAVIS'] ? '/dev/null' : STDOUT
  generateSnapshots(page, visualTestsConfig['webpages'])
  result = Percy::Capybara.finalize_build
  if (result['success'])
    log('info',
        'Build ' + cyan("#{buildId}") + ' is now being processed by Percy.')
  else
    log('error', 'Percy build ' + cyan("#{buildId}") + ' failed!')
    raise 'Build failure'
  end
end


# Generates percy snapshots for a set of given webpages.
#
# Args:
# - page: Page object used by Percy for snapshotting.
# - webpages: JSON object containing details about the pages to snapshot.
def generateSnapshots(page, webpages)
  # Include a blank snapshot on master, to allow for PR builds to be skipped.
  if ARGV.include? '--master'
    Percy::Capybara.snapshot(page, name: 'Blank page')
  end
  log('verbose', 'Cleaning up existing AMP config')
  removeCmd = "gulp prepend-global --target #{AMP_RUNTIME_FILE} --remove"
  system(removeCmd, :out=>OUT)
  for config in CONFIGS
    log('verbose', 'Switching to the ' + cyan("#{config}") + ' AMP config')
    configCmd = "gulp prepend-global --target #{AMP_RUNTIME_FILE} --#{config}"
    system(configCmd, :out=>OUT)
    log('verbose',
        'Generating snapshots using the ' + cyan("#{config}") + ' AMP config')
    webpages.each do |webpage|
      url = webpage["url"]
      name = "#{webpage["name"]} (#{config})"
      forbidden_css = webpage["forbidden_css"]
      loading_incomplete_css = webpage["loading_incomplete_css"]
      loading_complete_css = webpage["loading_complete_css"]
      page.visit(url)
      verifyCssElements(page, url,
          forbidden_css, loading_incomplete_css, loading_complete_css)
      Percy::Capybara.snapshot(page, name: name)
    end
  end
end


# Verifies that all CSS elements are as expected before taking a snapshot.
#
# Args:
# - page: Page object used by Percy for snapshotting.
# - url: URL to be snapshotted.
# - forbidden_css:
#       Array of CSS elements that must not be found in the page.
# - loading_incomplete_css:
#       Array of CSS elements that must eventually be removed from the page.
# - loading_complete_css:
#       Array of CSS elements that must eventually appear on the page.
def verifyCssElements(
    page, url, forbidden_css, loading_incomplete_css, loading_complete_css)
  page.has_no_css?('.i-amphtml-loader-dot')  # Implicitly waits for page load.
  if forbidden_css
    forbidden_css.each do |css|
      if page.has_css?(css)  # No implicit wait.
        log('error', cyan("#{url}") + ' has CSS element ' + cyan("#{css}"))
        raise 'Invalid CSS element'
      end
    end
  end
  if loading_incomplete_css
    loading_incomplete_css.each do |css|
      if !page.has_no_css?(css)  # Implicitly waits for element to disappear.
        log('error',
            cyan("#{url}") + ' still has CSS element ' + cyan("#{css}"))
        raise 'Invalid CSS element'
      end
    end
  end
  if loading_complete_css
    loading_complete_css.each do |css|
      if !page.has_css?(css)  # Implicitly waits for element to appear.
        log('error',
            cyan("#{url}") + ' does not yet have CSS element ' + cyan("#{css}"))
        raise 'Missing CSS element'
      end
    end
  end
end


# Enables debugging if requested via command line.
def setDebuggingLevel()
  if ARGV.include? '--debug'
    ENV['PERCY_DEBUG'] = '1'
    ENV['PHANTOMJS_DEBUG'] = 'true'
    ENV['WEBSERVER_QUIET'] = ''
  end
  if ARGV.include? '--percy_debug'
    ENV['PERCY_DEBUG'] = '1'
  end
  if ARGV.include? '--phantomjs_debug'
    ENV['PHANTOMJS_DEBUG'] = 'true'
  end
  if ARGV.include? '--webserver_debug'
    ENV['WEBSERVER_QUIET'] = ''
  end
end


# Enables us to require percy checks on GitHub, and yet, not have to do a full
# build for every PR.
def createEmptyBuild()
  log('info',
      'Skipping visual diff tests and generating a blank Percy build...')
  Percy.config.default_widths = [375]
  server = 'http://localhost'  # Not actually used.
  blank_assets_dir = File.expand_path(
      "../../../examples/visual-tests/blank-page",
      __FILE__)
  Percy::Capybara::Anywhere.run(server, blank_assets_dir, '') do |page|
    page.driver.options[:phantomjs] = Phantomjs.path
    Percy::Capybara.snapshot(page, name: 'Blank page')
  end
end


# Launches a webserver, loads test pages, and generates Percy snapshots.
def main()
  if ARGV.include? '--verify'
    buildId = File.open('PERCY_BUILD_ID', "r").read
    status = waitForBuildCompletion(buildId)
    verifyBuildStatus(status, buildId)
    exit
  end
  if ARGV.include? '--skip'
    createEmptyBuild()
    exit
  end
  unless ENV['PERCY_PROJECT'] && ENV['PERCY_TOKEN']
    log('error', 'Could not find ' + cyan('PERCY_PROJECT') + ' and ' +
        cyan('PERCY_TOKEN') + ' environment variables.')
    raise 'Missing environment variables'
  end
  begin
    setDebuggingLevel()
    pid = launchWebServer()
    if not waitForWebServer()
      log('error', 'Failed to start webserver')
      raise 'Webserver launch failure'
    end
    visualTestsConfigJson = loadVisualTestsConfigJson()
    visualTestsConfig = JSON.parse(visualTestsConfigJson)
    runVisualTests(visualTestsConfig)
  ensure
    closeWebServer(pid)
  end
end


if __FILE__ == $0
  main()
end
