/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"
	"path/filepath"
	"strings"
	"time"
)

var validator_js = flag.String("validator_js", "https://cdn.ampproject.org/"+
	"v0/validator.js", "The Validator Javascript. Latest published version "+
	"by default, or dist/validator_minified.js (built with build.py) for "+
	"development.")

var ext_to_mime = map[string]string{
	".html": "text/html",
	".js":   "text/javascript",
	".css":  "text/css",
	".png":  "image/png",
	".svg":  "image/svg+xml",
}

func handler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		//
		// Handle '/'.
		//
		if r.RequestURI == "/" {
			bytes, err := ioutil.ReadFile("index.html")
			if err != nil {
				http.Error(w, "File not found.", http.StatusNotFound)
				return
			}
			w.Header().Set("Content-type", "text/html")
			if *validator_js != "https://cdn.ampproject.org/v0/validator.js" {
				bytes = []byte(strings.Replace(string(bytes),
					"https://cdn.ampproject.org/v0/validator.js", "/validator.js", -1))
			}
			w.Write(bytes)
			return
		}
		//
		// Handle '/webui.js'
		//
		if r.RequestURI == "/webui.js" {
			bytes, err := ioutil.ReadFile("webui.js")
			if err != nil {
				http.Error(w, "File not found.", http.StatusNotFound)
				return
			}
			w.Header().Set("Content-type", "text/javascript")
			w.Write(bytes)
			return
		}
		//
		// Handle '/validator.js'
		//
		if r.RequestURI == "/validator.js" {
			bytes, err := ioutil.ReadFile(*validator_js)
			if err != nil {
				http.Error(w, "File not found.", http.StatusNotFound)
				return
			}
			w.Header().Set("Content-type", "text/javascript")
			w.Write(bytes)
		}
		// Look up any other resources relative to node_modules or webui.
		relative_path := r.RequestURI[1:] // Strip leading "/".
		roots := []string{".", "node_modules"}
		for i := range roots {
			root := roots[i]
			// Only serve files below the current working directory.
			abs_path, err := filepath.Abs(
				path.Join(".", root, relative_path))
			if err != nil {
				continue
			}
			cwd, err := filepath.Abs(".")
			if err != nil || !strings.HasPrefix(abs_path, cwd) {
				continue
			}
			if mime, ok := ext_to_mime[filepath.Ext(abs_path)]; ok {
				bytes, err := ioutil.ReadFile(abs_path)
				if err != nil {
					continue
				}
				w.Header().Set("Content-type", mime)
				w.Write(bytes)
				return
			}
		}
		http.Error(w, "File not found.", http.StatusNotFound)
		return
	}
	//
	// Handle /fetch?, a request to fetch an arbitrary doc from the
	// internet. It presents the results as JSON.
	//
	if r.Method == "POST" && r.RequestURI == "/fetch" &&
		r.Header.Get("X-Requested-By") == "validator webui" {
		param := r.FormValue("url")
		u, err := url.Parse(param)
		if param == "" || err != nil ||
			(u.Scheme != "http" && u.Scheme != "https") {
			http.Error(w, "Bad request.", http.StatusBadRequest)
			return
		}
		var netClient = &http.Client{
			Timeout: time.Second * 20,
		}
		req, err := http.NewRequest("GET", param, nil)
		if err != nil {
			http.Error(w, fmt.Sprintf("Bad gateway (%v)", err.Error()),
				http.StatusBadGateway)
			return
		}
		req.Header.Add("User-Agent",
			"Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MTC19V) "+
				"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.81 Mobile "+
				"Safari/537.36 (compatible; validator.ampproject.org)")
		resp, err := netClient.Do(req)
		if err != nil {
			http.Error(w, fmt.Sprintf("Bad gateway (%v)", err.Error()),
				http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()
		data, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			http.Error(w, fmt.Sprintf("Bad gateway (%v)", err.Error()),
				http.StatusBadGateway)
			return
		}
		type WebPage struct {
			Contents string
		}
		p := WebPage{Contents: string(data)}
		bytes, err := json.Marshal(p)
		if err != nil {
			http.Error(w, fmt.Sprintf("Problem formatting json (%v)",
				err.Error()),
				http.StatusInternalServerError)
		}
		w.Header().Set("Content-type", "application/json")
		w.Write(bytes)
		return
	}
	http.Error(w, "Bad request.", http.StatusBadRequest)
}

func main() {
	flag.Parse()
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8765", nil)
}
