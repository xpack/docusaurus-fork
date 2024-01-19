"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthorVisibility = exports.groupAuthoredItems = exports.normalizeFrontMatterAuthors = exports.makeUrlFromName = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const urlUtils_1 = require("./urlUtils");
/**
 * Generate an URL from an author name.
 * Remove diacritics and change spaces to dashes.
 * @param name
 * @returns
 */
function makeUrlFromName(name) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replaceAll(' ', '-')
        .replaceAll(/[-][-]*/g, '-')
        .replaceAll(/[^0-9a-z-]/g, '');
}
exports.makeUrlFromName = makeUrlFromName;
function normalizeFrontMatterAuthor(authorsPath, frontMatterAuthor) {
    function toAuthorObject(authorString) {
        return {
            name: authorString,
            permalink: makeUrlFromName(authorString),
        };
    }
    // TODO maybe make ensure the permalink is valid url path?
    function normalizeAuthorPermalink(permalink) {
        // Note: we always apply authorsPath on purpose. For versioned docs, v1/doc.md
        // and v2/doc.md authors with custom permalinks don't lead to the same created
        // page. authorsPath is different for each doc version
        return (0, urlUtils_1.normalizeUrl)([authorsPath, permalink]);
    }
    const author = typeof frontMatterAuthor === 'string'
        ? toAuthorObject(frontMatterAuthor)
        : frontMatterAuthor;
    return {
        label: author.name || '???',
        permalink: normalizeAuthorPermalink(author.permalink || '???'),
    };
}
let isString = ((value) => {
    return (typeof value === 'string' || value instanceof String);
});
/**
 * Takes author objects as they are defined in front matter, and normalizes each
 * into a standard author object. The permalink is created by appending the
 * sluggified label to `authorsPath`. Front matter authors already containing
 * permalinks would still have `authorsPath` prepended.
 *
 * The result will always be unique by permalinks. The behavior with colliding
 * permalinks is undetermined.
 */
function normalizeFrontMatterAuthors(
/** Base path to append the author permalinks to. */
authorsPath, 
/** Can be `undefined`, so that we can directly pipe in `frontMatter.authors`. */
frontMatterAuthors = []) {
    const authors = frontMatterAuthors
        .filter((author) => isString(isString) || author.hasOwnProperty('name'))
        .map((author) => normalizeFrontMatterAuthor(authorsPath, author));
    return lodash_1.default.uniqBy(authors, (author) => author.permalink);
}
exports.normalizeFrontMatterAuthors = normalizeFrontMatterAuthors;
/**
 * Permits to group docs/blog posts by author (provided by front matter).
 *
 * @returns a map from author permalink to the items and other relevant author data.
 * The record is indexed by permalink, because routes must be unique in the end.
 * Labels may vary on 2 MD files but they are normalized. Docs with
 * label='some label' and label='some-label' should end up in the same page.
 */
function groupAuthoredItems(items, 
/**
 * A callback telling me how to get the authors list of the current item. Usually
 * simply getting it from some metadata of the current item.
 */
getItemAuthors) {
    const result = {};
    items.forEach((item) => {
        getItemAuthors(item).forEach((author) => {
            var _a;
            // Init missing author groups
            // TODO: it's not really clear what should be the behavior if 2 authors have
            // the same permalink but the label is different for each
            // For now, the first author found wins
            if (author.permalink) {
                result[_a = author.permalink] ?? (result[_a] = {
                    author,
                    items: [],
                });
                // Add item to group
                result[author.permalink].items.push(item);
            }
        });
    });
    // If user add twice the same author to a md doc (weird but possible),
    // we don't want the item to appear twice in the list...
    Object.values(result).forEach((group) => {
        group.items = lodash_1.default.uniq(group.items);
    });
    return result;
}
exports.groupAuthoredItems = groupAuthoredItems;
/**
 * Permits to get the "author visibility" (hard to find a better name)
 * IE, is this author listed or unlisted
 * And which items should be listed when this author is browsed
 */
function getAuthorVisibility({ items, isUnlisted, }) {
    const allItemsUnlisted = items.every(isUnlisted);
    // When a author is full of unlisted items, we display all the items
    // when author is browsed, but we mark the author as unlisted
    if (allItemsUnlisted) {
        return { unlisted: true, listedItems: items };
    }
    // When a author has some listed items, the author remains listed
    // but we filter its unlisted items
    return {
        unlisted: false,
        listedItems: items.filter((item) => !isUnlisted(item)),
    };
}
exports.getAuthorVisibility = getAuthorVisibility;
//# sourceMappingURL=authors.js.map