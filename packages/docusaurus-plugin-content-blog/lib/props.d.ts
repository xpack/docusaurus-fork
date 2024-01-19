/// <reference path="../src/plugin-content-blog.d.ts" />
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { TagsListItem, TagModule } from '@xpack/docusaurus-utils';
import type { BlogTag, BlogTags } from '@xpack/docusaurus-plugin-content-blog';
import type { AuthorsListItem, AuthorModule } from '@xpack/docusaurus-utils';
import type { BlogAuthor, BlogAuthors } from '@xpack/docusaurus-plugin-content-blog';
export declare function toTagsProp({ blogTags }: {
    blogTags: BlogTags;
}): TagsListItem[];
export declare function toTagProp({ blogTagsListPath, tag, }: {
    blogTagsListPath: string;
    tag: BlogTag;
}): TagModule;
export declare function toAuthorsProp({ blogAuthors }: {
    blogAuthors: BlogAuthors;
}): AuthorsListItem[];
export declare function toAuthorProp({ blogAuthorsListPath, author, }: {
    blogAuthorsListPath: string;
    author: BlogAuthor;
}): AuthorModule;
