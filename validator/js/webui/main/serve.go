// To use this:
// (1) Install the App Engine SDK for Go from
//     https://cloud.google.com/appengine/downloads#Google_App_Engine_SDK_for_Go
// (2) Run build.py (in the parent directory).
// (2) Type 'goapp serve .' in the dist/webui_appengine directory.
// (3) Point your web browser at http://localhost:8080/

package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
)

func handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" ||
		r.Header.Get("X-Requested-By") != "validator webui" {
		http.Error(w, "Bad request.", http.StatusBadRequest)
		return
	}
	param := r.FormValue("url")
	u, err := url.Parse(param)
	if param == "" || err != nil || (u.Scheme != "http" && u.Scheme != "https") {
		http.Error(w, "Bad request.", http.StatusBadRequest)
		return
	}

	client := &http.Client {}
	req, err := http.NewRequest("GET", u.String(), nil)
	if err != nil {
		http.Error(w, fmt.Sprintf("Bad gateway (%v)", err.Error()),
			http.StatusBadGateway)
		return
	}
	req.Header.Add("User-Agent",
		"Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MTC19V) "+
			"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.81 Mobile "+
			"Safari/537.36 (compatible; validator.amp.dev)")
	resp, err := client.Do(req)
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
}

func main() {
	http.HandleFunc("/", handler)

  port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := fmt.Sprintf(":%s", port)
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

