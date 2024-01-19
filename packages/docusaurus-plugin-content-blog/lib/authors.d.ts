/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/// <reference path="../src/plugin-content-blog.d.ts" />
import type { BlogContentPaths } from './types';
import type { BlogPostFrontMatter } from '@xpack/docusaurus-plugin-content-blog';
import { Author } from '@xpack/docusaurus-utils/lib/authors';
export type AuthorsMap = {
    [authorKey: string]: Author;
};
export declare function validateAuthorsMap(content: unknown): AuthorsMap;
export declare function getAuthorsMap(params: {
    authorsMapPath: string;
    contentPaths: BlogContentPaths;
}): Promise<AuthorsMap | undefined>;
type AuthorsParam = {
    frontMatter: BlogPostFrontMatter;
    authorsMap: AuthorsMap | undefined;
    baseUrl: string;
    authorsBasePath: string;
};
export declare function getBlogPostAuthors(params: AuthorsParam): Author[];
type AuthoredItemGroup<Item> = {
    author: Author;
    items: Item[];
};
export declare function groupAuthoredItems<Item>(items: readonly Item[], 
/**
 * A callback telling me how to get the tags list of the current item. Usually
 * simply getting it from some metadata of the current item.
 */
getItemAuthors: (item: Item) => readonly Author[]): {
    [permalink: string]: AuthoredItemGroup<Item>;
};
export {};
