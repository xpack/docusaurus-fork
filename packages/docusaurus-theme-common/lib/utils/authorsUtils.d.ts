/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { AuthorsListItem } from '@xpack/docusaurus-utils';
export declare const translateAuthorsPageTitle: () => string;
export type AuthorLetterEntry = {
    letter: string;
    authors: AuthorsListItem[];
};
/**
 * Takes a list of authors (as provided by the content plugins), and groups them by
 * their initials.
 */
export declare function listAuthorsByLetters(authors: readonly AuthorsListItem[]): AuthorLetterEntry[];
//# sourceMappingURL=authorsUtils.d.ts.map