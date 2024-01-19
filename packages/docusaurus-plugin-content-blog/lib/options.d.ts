/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/// <reference path="../src/plugin-content-blog.d.ts" />
import type { PluginOptions, Options } from '@xpack/docusaurus-plugin-content-blog';
import type { OptionValidationContext } from '@docusaurus/types';
export declare const DEFAULT_OPTIONS: PluginOptions;
export declare function validateOptions({ validate, options, }: OptionValidationContext<Options | undefined, PluginOptions>): PluginOptions;
