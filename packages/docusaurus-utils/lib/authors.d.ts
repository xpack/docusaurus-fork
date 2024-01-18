/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/** What the user configures. */
export type Author = {
    label: string;
    /** Permalink to this author's page, without the `/authors/` base path. */
    permalink: string;
};
/** What the authors list page should know about each author. */
export type AuthorsListItem = Author & {
    /** Number of posts/docs with this author. */
    count: number;
};
/** What the author's own page should know about the author. */
export type AuthorModule = AuthorsListItem & {
    /** The authors list page's permalink. */
    allAuthorsPath: string;
    /** Is this author unlisted? (when it only contains unlisted items) */
    unlisted: boolean;
};
export type FrontMatterAuthor = string | Author;
/**
 * Takes author objects as they are defined in front matter, and normalizes each
 * into a standard author object. The permalink is created by appending the
 * sluggified label to `authorsPath`. Front matter authors already containing
 * permalinks would still have `authorsPath` prepended.
 *
 * The result will always be unique by permalinks. The behavior with colliding
 * permalinks is undetermined.
 */
export declare function normalizeFrontMatterAuthors(
/** Base path to append the author permalinks to. */
authorsPath: string, 
/** Can be `undefined`, so that we can directly pipe in `frontMatter.authors`. */
frontMatterAuthors?: FrontMatterAuthor[] | undefined): Author[];
type AuthoredItemGroup<Item> = {
    author: Author;
    items: Item[];
};
/**
 * Permits to group docs/blog posts by author (provided by front matter).
 *
 * @returns a map from author permalink to the items and other relevant author data.
 * The record is indexed by permalink, because routes must be unique in the end.
 * Labels may vary on 2 MD files but they are normalized. Docs with
 * label='some label' and label='some-label' should end up in the same page.
 */
export declare function groupAuthoredItems<Item>(items: readonly Item[], 
/**
 * A callback telling me how to get the authors list of the current item. Usually
 * simply getting it from some metadata of the current item.
 */
getItemAuthors: (item: Item) => readonly Author[]): {
    [permalink: string]: AuthoredItemGroup<Item>;
};
/**
 * Permits to get the "author visibility" (hard to find a better name)
 * IE, is this author listed or unlisted
 * And which items should be listed when this author is browsed
 */
export declare function getAuthorVisibility<Item>({ items, isUnlisted, }: {
    items: Item[];
    isUnlisted: (item: Item) => boolean;
}): {
    unlisted: boolean;
    listedItems: Item[];
};
export {};
//# sourceMappingURL=authors.d.ts.map