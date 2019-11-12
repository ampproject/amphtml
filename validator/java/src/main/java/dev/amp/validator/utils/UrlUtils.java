/*
 *
 * ====================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *  ====================================================================
 */

/*
 * Changes to the original project are Copyright 2019, Verizon Media Inc..
 */

package dev.amp.validator.utils;

import javax.annotation.Nonnull;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Functions to extract information from urls.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class UrlUtils {
    /**
     * private constructor
     */
    private UrlUtils() {
    }

    /**
     * Returns true iff the passed in URL is a data: protocol URL.
     *
     * @param urlStr the url to check
     * @return true iff URL is a data: protocol
     */
    public static boolean isDataUrl(@Nonnull final String urlStr) {
        URL url = null;
        try {
            url = new URL(urlStr);
        } catch (MalformedURLException e) {
            return false;
        }
        return urlProtocol(urlStr, url).equals("data");
    }

    /**
     * Returns the protocol of the input URL. Assumes https if relative. Accepts
     * both the original URL string and a parsed URL produced from it, to avoid
     * reparsing.
     *
     * @param urlStr original URL string
     * @param url    parsed URL.
     * @return the protocol of the input URL
     */
    public static String urlProtocol(@Nonnull final String urlStr, @Nonnull final URL url) {
        // Technically, an URL such as "script :alert('foo')" is considered a relative
        // URL, similar to "./script%20:alert(%27foo%27)" since space is not a legal
        // character in a URL protocol. This is what parse_url.URL will determine.
        // However, some very old browsers will ignore whitespace in URL protocols and
        // will treat this as javascript execution. We must be safe regardless of the
        // client. This RE is much more aggressive at extracting a protcol than
        // parse_url.URL for this reason.
        final Matcher match = PROTOCOL.matcher(urlStr);
        String protocol;
        if (match.matches()) {
            protocol = match.group(1);
            protocol = protocol.toLowerCase().trim();
        } else {
            protocol = url.getProtocol();
        }
        return protocol;
    }

    /**
     * A pattern to extract protocol from url.
     */
    private static final Pattern PROTOCOL = Pattern.compile("^([^:\\/?#.]+):.*$");

}
