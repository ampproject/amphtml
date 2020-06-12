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

import javax.annotation.Nonnull;
import java.util.HashSet;
import java.util.Set;

/**
 * ParsedUrlSpec is used for both ParsedAttrSpec and ParsedCdataSpec, to
 * check URLs.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ParsedUrlSpec {
    /**
     * Constructor.
     *
     * @param urlSpec the UrlSpec.
     */
    public ParsedUrlSpec(@Nonnull final ValidatorProtos.UrlSpec urlSpec) {
        this.spec = urlSpec;
        this.allowedProtocols = new HashSet<>();
        if (this.spec != null) {
            for (final String protocol : spec.getProtocolList()) {
                allowedProtocols.add(protocol);
            }
        }
    }

    /**
     * Returns the UrlSpec.
     *
     * @return returns the UrlSpec.
     */
    public ValidatorProtos.UrlSpec getSpec() {
        return this.spec;
    }

    /**
     * Returns true if the protocol is found.
     *
     * @param protocol the allowed protocol.
     * @return returns true if the protocol is found.
     */
    public boolean isAllowedProtocol(final String protocol) {
        return allowedProtocols.contains(protocol);
    }

    /**
     * Clean up reference, improve gc performance.
     */
    public void cleanup() {
        this.allowedProtocols = null;
    }

    /**
     * The UrlSpec.
     */
    @Nonnull
    private ValidatorProtos.UrlSpec spec;

    /**
     * A set of allowed protocols.
     */
    @Nonnull
    private Set<String> allowedProtocols;
}
