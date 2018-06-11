(self._S = self._S || []).push((function() {
    (self.AMP = self.AMP || []).push(function() {
        var Lh = {
            title: "",
            artist: "",
            album: "",
            artwork: [{
                    src: ""
                }
            ]
        };

        function Mh(a, b, c, d) {
            var e = a.navigator;
            "mediaSession" in e && a.MediaMetadata && (e.mediaSession.metadata = new a.MediaMetadata(Lh), Nh(b), e.mediaSession.metadata = new a.MediaMetadata(b), e.mediaSession.setActionHandler("play", c), e.mediaSession.setActionHandler("pause", d))
        }

        function Oh(a) {
            var b = a.querySelector('script[type="application/ld+json"]');
            if (b) {
                var c = Kh(b.textContent);
                if (c && c.image) {
                    if ("string" === typeof c.image) return c.image;
                    if (c.image["@list"] && "string" === typeof c.image["@list"][0]) return c.image["@list"][0];
                    if ("string" === typeof c.image.url) return c.image.url;
                    if ("string" === typeof c.image[0]) return c.image[0]
                }
            }
        }

        function Ph(a) {
            var b = a.querySelector('meta[property="og:image"]');
            if (b) return b.getAttribute("content")
        }

        function Qh(a) {
            var b = a.querySelector('link[rel="shortcut icon"]') || a.querySelector('link[rel="icon"]');
            if (b) return b.getAttribute("href")
        }

        function Nh(a) {
            a && a.artwork && ($b(a.artwork), a.artwork.forEach(function(a) {
                if (a) {
                    var b = bc(a) ? a.src : a;
                    z().assert(Fg(b))
                }
            }))
        };
        var Rh = {}, Sh = "amp-audio",
            Th = function(a) {
                a = self.AMP.BaseElement.call(this, a) || this;
                a.pa = null;
                a.gg = Lh;
                a.isPlaying = !1;
                return a
            };
        n(Th, self.AMP.BaseElement);
        Th.prototype.isLayoutSupported = function(a) {
            return a == Rg || a == Sg
        };
        Th.prototype.buildCallback = function() {
            this.registerAction("play", this.li.bind(this));
            this.registerAction("pause", this.Be.bind(this))
        };
        Th.prototype.layoutCallback = function() {
            var a = this,
                b = this.element.ownerDocument.createElement("audio");
            if (!b.play) return this.toggleFallback(!0), Promise.resolve();
            b.controls = !0;
            var c = Uh(this, "src");
            c && Ag(c, this.element);
            this.propagateAttributes("src preload autoplay muted loop aria-label aria-describedby aria-labelledby controlsList".split(" "), b);
            this.applyFillContent(b);
            this.getRealChildNodes().forEach(function(a) {
                a.getAttribute && a.getAttribute("src") && Ag(a.getAttribute("src"), a);
                b.appendChild(a)
            });
            this.element.appendChild(b);
            this.pa = b;
            var d = this.getAmpDoc().win.document,
                e = Uh(this, "artist") || "",
                c = Uh(this, "title") || Uh(this, "aria-label") || d.title || "",
                f = Uh(this, "album") || "",
                d = Uh(this, "artwork") || Oh(d) || Ph(d) || Qh(d) || "";
            this.gg = {
                title: c,
                artist: e,
                album: f,
                artwork: [{
                        src: d
                    }
                ]
            };
            Nc(this.pa, "playing", function() {
                return Vh(a)
            });
            return this.loadPromise(b)
        };
        var Uh = function(a, b) {
            return a.element.getAttribute(b)
        };
        Th.prototype.pauseCallback = function() {
            this.pa && (this.pa.pause(), Wh(this, !1))
        };
        var Yh = function(a) {
            return a.pa ? Xh(a) ? (z().warn(Sh, "<amp-story> elements do not support actions on <amp-audio> elements"), !1) : !0 : !1
        };
        Th.prototype.Be = function() {
            Yh(this) && (this.pa.pause(), Wh(this, !1))
        };
        Th.prototype.li = function() {
            Yh(this) && (this.pa.play(), Wh(this, !0))
        };
        var Wh = function(a, b) {}, Xh = function(a) {
                return ue(a.element, "AMP-STORY")
            }, Vh = function(a) {
                Mh(a.getAmpDoc().win, a.gg, function() {
                    a.pa.play();
                    Wh(a, !0)
                }, function() {
                    a.pa.pause();
                    Wh(a, !1)
                })
            };
        (function(a) {
            a.registerElement(Sh, Th)
        })(self.AMP);
        Rh.AmpAudio = Th;
        (self._S = self._S || [])["//extensions/amp-audio/0.1/amp-audio.js"] = Rh;
    })
}));
//# sourceMappingURL=extensions-amp-audio-0.1-amp-audio.js.map
