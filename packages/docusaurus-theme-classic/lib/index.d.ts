/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/// <reference path="../src/theme-classic.d.ts" />
import type { LoadContext, Plugin } from '@docusaurus/types';
import type { PluginOptions } from '@xpack/docusaurus-theme-classic';
export declare const AnnouncementBarDismissStorageKey = "docusaurus.announcement.dismiss";
export default function themeClassic(context: LoadContext, options: PluginOptions): Plugin<undefined>;
export { default as getSwizzleConfig } from './getSwizzleConfig';
export { validateThemeConfig, validateOptions } from './options';
