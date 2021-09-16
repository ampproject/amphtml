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
# CSS widths: iPhone: 375, Pixel: 411, Macbook Pro 15": 1440.
DEFAULT_WIDTHS = [375, 411, 1440]
HOST = 'localhost'
PORT = '8000'


# Launches a background AMP webserver for unminified js using gulp.
#
# Returns:
# - Process ID of server process.
def launchWebServer()
  webserverCmd = "gulp serve --host #{HOST} --port #{PORT}"
  webserverUrl = "http://#{HOST}:#{PORT}"
  @pid = fork do
    Signal.trap("INT") { exit }
    exec webserverCmd
  end
  Process.detach(@pid)
  @pid
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
      generateSnapshot(page, url, name)
    end
  end
end


# Generates a percy snapshot for a given webpage.
#
# Args:
# - page: Page object used by Percy for snapshotting.
# - url: Relative URL of page to be snapshotted.
# - name: Name of snapshot on Percy.
def generateSnapshot(page, url, name)
  page.visit(url)
  page.has_no_css?('.i-amphtml-loader-dot')  # Implicitly waits for page load.
  Percy::Capybara.snapshot(page, name: name)
end


# Enables debugging if requested via command line.
def setDebuggingLevel()
  if ARGV.include? '--debug'
    ENV['PERCY_DEBUG'] = '1'
    ENV['PHANTOMJS_DEBUG'] = 'true'
  end
  if ARGV.include? '--percy_debug'
    ENV['PERCY_DEBUG'] = '1'
  end
  if ARGV.include? '--phantomjs_debug'
    ENV['PHANTOMJS_DEBUG'] = 'true'
  end
end


# Launches a webserver, loads test pages, and generates Percy snapshots.
def main()
  setDebuggingLevel()
  pid = launchWebServer()
  if not waitForWebServer()
    puts "Failed to start webserver"
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
