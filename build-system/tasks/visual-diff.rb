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


# Colorize logs.
def red(text); "\e[31m#{text}\e[0m"; end
def cyan(text); "\e[36m#{text}\e[0m"; end


# Launches a background AMP webserver for unminified js using gulp.
#
# Returns:
# - Process ID of server process.
def launchWebServer()
  webserverCmd =
      "gulp serve --host #{HOST} --port #{PORT} #{ENV['WEBSERVER_QUIET']}"
  spawn(webserverCmd)
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


# Waits up to 15 seconds for the webserver to start up.
#
# Returns:
# - true if webserver is running.
def waitForWebServer()
  tries = 0
  until isWebServerRunning()
    sleep(1)
    tries += 1
    break if tries > 15
  end
  isWebServerRunning()
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


# Loads the list of pages to snapshot from a well-known json config file.
def loadPagesToSnapshotJson()
  jsonFile = File.open(
      File.join(
          File.dirname(__FILE__),
          "../../test/visual-diff/visual-tests.json"),
      "r")
  jsonContent = jsonFile.read
end


# Generates percy snapshots for a set of given webpages.
#
# Args:
# - pagesToSnapshot: JSON object containing details about the pages to snapshot.
def generateSnapshots(pagesToSnapshot)
  Percy.config.default_widths = DEFAULT_WIDTHS
  Capybara.default_max_wait_time = 5
  server = "http://#{HOST}:#{PORT}"
  webpages = pagesToSnapshot["webpages"]
  assets_base_url = pagesToSnapshot["assets_base_url"]
  assets_dir = File.expand_path(
      "../../../#{pagesToSnapshot["assets_dir"]}",
      __FILE__)
  Percy::Capybara::Anywhere.run(
      server, assets_dir, assets_base_url) do |page|
    page.driver.options[:phantomjs] = Phantomjs.path
    page.driver.options[:js_errors] = true
    page.driver.options[:phantomjs_options] =
        ["--debug=#{ENV['PHANTOMJS_DEBUG']}"]
    webpages.each do |webpage|
      url = webpage["url"]
      name = webpage["name"]
      forbidden_css = webpage["forbidden_css"]
      loading_incomplete_css = webpage["loading_incomplete_css"]
      loading_complete_css = webpage["loading_complete_css"]
      page.visit(url)
      verifyCssElements(
          page, forbidden_css, loading_incomplete_css, loading_complete_css)
      Percy::Capybara.snapshot(page, name: name)
    end
  end
end


# Verifies that all CSS elements are as expected before taking a snapshot.
#
# Args:
# - page: Page object used by Percy for snapshotting.
# - forbidden_css:
#       Array of CSS elements that must not be found in the page.
# - loading_incomplete_css:
#       Array of CSS elements that must eventually be removed from the page.
# - loading_complete_css:
#       Array of CSS elements that must eventually appear on the page.
def verifyCssElements(
    page, forbidden_css, loading_incomplete_css, loading_complete_css)
  page.has_no_css?('.i-amphtml-loader-dot')  # Implicitly waits for page load.
  if forbidden_css
    forbidden_css.each do |css|
      if page.has_css?(css)  # No implicit wait.
        puts red("ERROR: ") + "page has CSS element " + cyan("#{css}")
      end
    end
  end
  if loading_incomplete_css
    loading_incomplete_css.each do |css|
      if !page.has_no_css?(css)  # Implicitly waits for element to disappear.
        puts red("ERROR: ") + "page still has CSS element "\
            + cyan("#{css}")
      end
    end
  end
  if loading_complete_css
    loading_complete_css.each do |css|
      if !page.has_css?(css)  # Implicitly waits for element to appear.
        puts red("ERROR: ") + "page does not yet have CSS element "\
            + cyan("#{css}")
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


# Launches a webserver, loads test pages, and generates Percy snapshots.
def main()
  setDebuggingLevel()
  pid = launchWebServer()
  if not waitForWebServer()
    puts red("ERROR: ") + "Failed to start webserver"
    closeWebServer(pid)
    exit(false)
  end
  pagesToSnapshotJson = loadPagesToSnapshotJson()
  pagesToSnapshot = JSON.parse(pagesToSnapshotJson)
  generateSnapshots(pagesToSnapshot)
  closeWebServer(pid)
end


if __FILE__ == $0
  main()
end
