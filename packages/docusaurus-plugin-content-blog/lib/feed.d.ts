/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/// <reference path="../src/plugin-content-blog.d.ts" />
import type { DocusaurusConfig } from '@docusaurus/types';
import type { PluginOptions, BlogPost } from '@xpack/docusaurus-plugin-content-blog';
export declare function createBlogFeedFiles({ blogPostsNewest, options, siteConfig, outDir, locale, }: {
    blogPostsNewest: BlogPost[];
    options: PluginOptions;
    siteConfig: DocusaurusConfig;
    outDir: string;
    locale: string;
}): Promise<void>;
