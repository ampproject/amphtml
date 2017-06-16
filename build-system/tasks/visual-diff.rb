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


require 'percy/capybara/anywhere'
require 'capybara/poltergeist'
require 'phantomjs'
require 'json'
require "net/http"


ENV['PERCY_DEBUG'] = '1'  # Enable debugging output.
DEFAULT_WIDTHS = [375, 411]  # CSS widths: iPhone: 375, Pixel: 411.
HOST = 'localhost'
PORT = '8000'


def up?(server, port)
  http = Net::HTTP.start(server, port, {open_timeout: 5, read_timeout: 5})
  response = http.head("/")
  response.code == "200"
rescue SystemCallError
  false
end


def launchWebServer()
  webserverCmd = 'gulp serve --host ' + HOST + ' --port ' + PORT
  webserverUrl = 'http://' + HOST + ':' + PORT
  puts 'Starting webserver at ' + webserverUrl + '...'
  webserver = fork do
    exec webserverCmd
  end
  until up?(HOST, PORT)
    sleep(1)
  end
end


def loadConfigJson()
  jsonFile = File.open(
    File.join(
      File.dirname(__FILE__),
      '../../test/visual-diff/visual-tests.json'),
    "r")
  jsonContent = jsonFile.read
end


def generateSnapshot(server, assets_dir, assets_base_url, url, name)
  puts 'Generating snapshot...'
  Percy::Capybara::Anywhere.run(
      server, assets_dir, assets_base_url) do |page|
    page.driver.options[:phantomjs] = Phantomjs.path
    page.driver.options[:js_errors] = false
    page.visit(url)
    Percy.config.default_widths = DEFAULT_WIDTHS
    Percy::Capybara.snapshot(page, name: name)
 end
end


def main()
  launchWebServer()
  configJson = loadConfigJson()
  config = JSON.parse(configJson)
  server = 'http://' + HOST + ':' + PORT
  webpages = config["webpages"]
  webpages.each do |webpage|
    assets_base_url = webpage["assets_base_url"]
    assets_dir = File.expand_path(
        '../../../' + webpage["assets_dir"],
        __FILE__)
    url = webpage["url"]
    name = webpage["name"]
    generateSnapshot(server, assets_dir, assets_base_url, url, name)
  end
end


main
