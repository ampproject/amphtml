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

import dev.amp.validator.ValidatorProtos;
import dev.amp.validator.SrcsetParsingResult;
import dev.amp.validator.SrcsetSourceDef;

import javax.annotation.Nonnull;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class to parse the text representation of srcset.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes.
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
 *
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class ParseSrcSetUtils {
    /**
     * Private constructor.
     */
    private ParseSrcSetUtils() {
    }

    /**
     * Parses the text representation of srcset into array of SrcsetSourceDef.
     * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes.
     * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
     *
     * If parsing fails, returns false in SrcsetParsingResult.status.
     *
     * @param srcset the srcset.
     * @return returns SrcsetParsingResult.
     */
    public static SrcsetParsingResult parseSrcset(@Nonnull final String srcset) {
        // Regex for leading spaces, followed by an optional comma and whitespace,
        // followed by an URL*, followed by an optional space, followed by an
        // optional width or pixel density**, followed by spaces, followed by an
        // optional comma and whitespace.
        //
        // URL*: matches non-space, non-empty string which neither ends nor begins
        // with a comma. The set of space characters in the srcset attribute is
        // defined to include only ascii characters, so using \s, which is an
        // ascii only character set, is fine. See
        // https://html.spec.whatwg.org/multipage/infrastructure.html#space-character.
        //
        // Optional width or pixel density**: Matches the empty string or (one or
        // more spaces + a non empty string containing no space or commas).
        // Doesn't capture the initial space.
        //
        // \s*                       Match, but don't capture leading spaces
        // (?:,\s*)?                 Optionally match comma and trailing space,
        //                           but don't capture comma.
        // ([^,\s]\S*[^,\s])         Match something like "google.com/favicon.ico"
        //                           but not ",google.com/favicon.ico,"
        // \s*                       Match, but dont capture spaces.
        // ([\d]+.?[\d]*[w|x])?      e.g. "5w" or "5x" or "10.2x"
        // \s*                       Match, but don't capture space
        // (?:(,)\s*)?               Optionally match comma and trailing space,
        //                           capturing comma.

        String remainingSrcset = srcset;
        final Set<String> seenWidthOrPixelDensity = new HashSet<>();
        final SrcsetParsingResult result = new SrcsetParsingResult();
        final Matcher matcher = IMAGE_CANDIDATE_REGEX.matcher(srcset);
        while (matcher.find()) {
            final String url = matcher.group(1);
            String widthOrPixelDensity = matcher.group(2);
            final String comma = matcher.group(3);
            if (widthOrPixelDensity == null) {
                widthOrPixelDensity = "1x";
            }
            // Duplicate width or pixel density in srcset.
            if (seenWidthOrPixelDensity.contains(widthOrPixelDensity)) {
                result.setErrorCode(ValidatorProtos.ValidationError.Code.DUPLICATE_DIMENSION);
                return result;
            }
            seenWidthOrPixelDensity.add(widthOrPixelDensity);
            result.add(new SrcsetSourceDef(url, widthOrPixelDensity));

            // More srcset, comma expected as separator for image candidates.
            if (comma == null) {
                result.setErrorCode(ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE);
                return result;
            }
        }

        // Must have at least one image candidate.
        if (result.getSrcsetImagesSize() == 0) {
            result.setErrorCode(ValidatorProtos.ValidationError.Code.INVALID_ATTR_VALUE);
            return result;
        }
        result.setSuccess(true);
        return result;
    }

    private static final Pattern IMAGE_CANDIDATE_REGEX = Pattern.compile("\\s*"
                    + "(?:,\\s*)?"
                    + "([^,\\s]\\S*[^,\\s])"
                    + "\\s*"
                    + "([\\d]+.?[\\d]*[w|x])?"
                    + "\\s*"
                    + "(?:(,)\\s*)?");
}
