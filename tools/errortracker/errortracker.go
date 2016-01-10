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

// Forwards client-side errors to Cloud Error Reporting.

package errortracker

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"golang.org/x/net/context"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/appengine"
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/urlfetch"
	"google.golang.org/cloud"
	"google.golang.org/cloud/logging"
)

// Magic fields documented here
// https://cloud.google.com/error-reporting/#error_message_fields
type ErrorRequestMeta struct {
	HTTPReferrer  string `json:"http_referrer,omitempty"`
	HTTPUserAgent string `json:"http_user_agent,omitempty"`
}

type ErrorRequest struct {
	URL    string            `json:"url,omitempty"`
	Method string            `json:"method,omitempty"`
	Meta   *ErrorRequestMeta `json:"meta,omitempty"`
}

type ErrorEvent struct {
	Application string `json:"application,omitempty"`
	AppID       string `json:"app_id,omitempty"`
	Environment string `json:"environment,omitempty"`
	Version     string `json:"version,omitempty"`

	Message   string `json:"message,omitempty"`
	Exception string `json:"exception,omitempty"`

	Request *ErrorRequest `json:"request,omitempty"`

	Filename  string `json:"filename,omitempty"`
	Line      int32  `json:"line,omitempty"`
	Classname string `json:"classname,omitempty"`
	Function  string `json:"function,omitempty"`
}

func init() {
	http.HandleFunc("/r", handle)
}

// Get an auth context for logging RPC.
func cloudAuthContext(r *http.Request) (context.Context, error) {
	c := appengine.NewContext(r)

	hc := &http.Client{
		Transport: &oauth2.Transport{
			Source: google.AppEngineTokenSource(c, logging.Scope),
			Base:   &urlfetch.Transport{Context: c},
		},
	}
	return cloud.WithContext(c, appengine.AppID(c), hc), nil
}

func handle(w http.ResponseWriter, r *http.Request) {
	c, _ := cloudAuthContext(r)
	logc, err := logging.NewClient(c, appengine.AppID(c), "javascript.errors")
	if err != nil {
		http.Error(w, "Cannot connect to Google Cloud Logging",
			http.StatusInternalServerError)
		log.Errorf(c, "Cannot connect to Google Cloud Logging: %v", err)
		return
	}

	// Note: Error Reporting currently ignores non-GCE and non-AWS logs.
	logc.ServiceName = "compute.googleapis.com"
	logc.CommonLabels = map[string]string{
		"compute.googleapis.com/resource_type": "logger",
		"compute.googleapis.com/resource_id":   "errors"}

	// Fill query params into JSON struct.
	line, _ := strconv.Atoi(r.URL.Query().Get("l"))
	errorType := "default"
	if r.URL.Query().Get("a") == "1" {
		errorType = "assert"
	}

	event := &ErrorEvent{
		Message:     r.URL.Query().Get("m"),
		Exception:   r.URL.Query().Get("s"),
		Version:     r.URL.Query().Get("v"),
		Environment: "prod",
		Application: errorType,
		AppID:       appengine.AppID(c),
		Filename:    r.URL.Query().Get("f"),
		Line:        int32(line),
		Classname:   r.URL.Query().Get("el"),
	}

	if event.Message == "" && event.Exception == "" {
		http.Error(w, "One of 'message' or 'exception' must be present.",
			http.StatusBadRequest)
		log.Errorf(c, "Malformed request: %v", event)
		return
	}

	// Don't log testing traffic in production
	if event.Version == "$internalRuntimeVersion$" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	event.Request = &ErrorRequest{
		URL: r.Referer(),
	}
	event.Request.Meta = &ErrorRequestMeta{
		HTTPReferrer:  r.Referer(),
		HTTPUserAgent: r.UserAgent(),
		// Intentionally not logged.
		// RemoteIP:   r.RemoteAddr,
	}

	err = logc.LogSync(logging.Entry{
		Time:    time.Now().UTC(),
		Payload: event,
	})

	if err != nil {
		http.Error(w, "Cannot write to Google Cloud Logging",
			http.StatusInternalServerError)
		log.Errorf(c, "Cannot write to Google Cloud Logging: %v", err)
		return
	}

	// When debug param is present, return a document. This is nicer because
	// browsers otherwise revert the URL during manual testing.
	if r.URL.Query().Get("debug") == "1" {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "OK")
	} else {
		w.WriteHeader(http.StatusNoContent)
	}
}
