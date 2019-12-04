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

/**
 * An url error adaptor interface.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public interface UrlErrorAdapter {
    /**
     * Adding missing url validation error.
     *
     * @param context context.
     * @param tagSpec tag spec.
     * @param result validation result.
     */
    void missingUrl(Context context, ValidatorProtos.TagSpec tagSpec,
                           ValidatorProtos.ValidationResult.Builder result);

    /**
     * Adding invalid url validation error.
     *
     * @param context context.
     * @param url the url.
     * @param tagSpec tag spec.
     * @param result validation result.
     */
    void invalidUrl(Context context, String url, ValidatorProtos.TagSpec tagSpec,
                           ValidatorProtos.ValidationResult.Builder result);

    /**
     * Adding invalid url protocol error.
     *
     * @param context context.
     * @param protocol the protocol.
     * @param tagSpec tag spec.
     * @param result validation result.
     */
    void invalidUrlProtocol(Context context, String protocol, ValidatorProtos.TagSpec tagSpec,
                           ValidatorProtos.ValidationResult.Builder result);

    /**
     * Adding disallowed relative url error.
     *
     * @param context context.
     * @param url the url.
     * @param tagSpec tag spec.
     * @param result validation result.
     */
    void disallowedRelativeUrl(Context context, String url, ValidatorProtos.TagSpec tagSpec,
                           ValidatorProtos.ValidationResult.Builder result);
}
