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
    final Matcher match = PROTOCOL.matcher(urlStr);
    String protocol;
    if (match.matches()) {
      protocol = match.group(1);
      protocol = protocol.toLowerCase().trim();
      return protocol.equals("data");
    }
    return false;
  }

  /**
   * A pattern to extract protocol from url.
   */
  private static final Pattern PROTOCOL = Pattern.compile("^([^:\\/?#.]+):.*$");

}
