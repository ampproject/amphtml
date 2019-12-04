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
import java.io.UnsupportedEncodingException;

/**
 * Byte utility methods.
 *
 * @author nhant01
 * @author GeorgeLuo
 *
 */

public final class ByteUtils {
    /**
     * Private constructor.
     */
    private ByteUtils() {
    }

    /**
     * Computes the byte length, rather than character length, of a utf8 string.
     * https://en.wikipedia.org/wiki/UTF-8
     * @param utf8Str UTF-8 string.
     * @return returns the byte length.
     */
    public static int byteLength(@Nonnull final String utf8Str) {
        // To figure out which characters are multi-byte we can abuse
        // encodeURIComponent which will escape those specific characters.
        try {
            final int multiByteLength = utf8Str.getBytes("UTF-8").length;
            return multiByteLength;
        } catch (UnsupportedEncodingException uee) {
            return utf8Str.length();
        }
    }
}
