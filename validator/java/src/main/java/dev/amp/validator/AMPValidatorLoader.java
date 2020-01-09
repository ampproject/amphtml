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

package dev.amp.validator;

import com.google.protobuf.TextFormat;

import javax.annotation.Nonnull;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URISyntaxException;

/**
 * This class load the validator main and extension proto ascii files.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class AMPValidatorLoader {
    /**
     * Loading the rules.
     *
     * @param filePath  file path.
     * @throws IOException if I/O errors occur.
     * @throws  URISyntaxException if this URL is not formatted strictly
     * according to to RFC2396 and cannot be converted to a URI.
     * @return a Builder instance
     */
    public ValidatorProtos.ValidatorRules.Builder load(final String filePath) throws IOException, URISyntaxException {
        final InputStream is;

        final ClassLoader classLoader = getClass().getClassLoader();
        if (filePath == null) {
            is = classLoader.getResourceAsStream(PROTO_ASCII_RESOURCE);
            if (is == null) {
                throw new IllegalArgumentException(PROTO_ASCII_RESOURCE + " file is not found!");
            }
        } else {
            is = classLoader.getResourceAsStream(filePath);
        }

        final ValidatorProtos.ValidatorRules.Builder builder;
        try {
            final StringBuilder protoAsciiRules = new StringBuilder();
            protoAsciiRules.append(getFileContent(is));

            final TextFormat.Parser parser = TextFormat.Parser.newBuilder()
                    .setAllowUnknownFields(true)
                    .setAllowUnknownExtensions(true)
                    .build();
            builder = ValidatorProtos.ValidatorRules.newBuilder();
            parser.merge(protoAsciiRules.toString(), builder);
        } finally {
            if (is != null) {
                is.close();
            }
        }

        return builder;
    }

    /**
     * Reading file as a string.
     *
     * @param is input stream.
     * @return the content of the file in string
     * @throws Exception throws Exception.
     */
    private String getFileContent(@Nonnull final InputStream is) throws IOException {
        final StringBuilder sb = new StringBuilder();
        try (BufferedReader buf = new BufferedReader(new InputStreamReader(is))) {
            String line = buf.readLine();
            while (line != null) {
                sb.append(line).append("\n");
                line = buf.readLine();
            }
        }

        return sb.toString();
    }

    /**
     * Proto ascii resources.
     */
    private static final String PROTO_ASCII_RESOURCE = "validator-all.protoascii";
}
