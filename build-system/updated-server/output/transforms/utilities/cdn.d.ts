/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
/// <reference types="node" />
import { URL } from 'url';
export declare const VALID_CDN_ORIGIN = "https://cdn.ampproject.org";
/**
 * Convert an existing URL to one from the local `serve` command.
 * @param url
 */
export declare function CDNURLToLocalDistURL(url: URL, pathnames?: [string | null, string | null], extension?: string): URL;
/**
 * Convert an existing URL to one from a specific RTV.
 * @param url
 */
export declare function CDNURLToRTVURL(url: URL, mode: string, pathnames?: [string | null, string | null], extension?: string): URL;
