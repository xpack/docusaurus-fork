"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupAuthoredItems = exports.getBlogPostAuthors = exports.getAuthorsMap = exports.validateAuthorsMap = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const docusaurus_utils_1 = require("@xpack/docusaurus-utils");
const utils_validation_1 = require("@docusaurus/utils-validation");
const authors_1 = require("@xpack/docusaurus-utils/lib/authors");
const AuthorsMapSchema = utils_validation_1.Joi.object()
    .pattern(utils_validation_1.Joi.string(), utils_validation_1.Joi.object({
    name: utils_validation_1.Joi.string(),
    url: utils_validation_1.URISchema,
    imageURL: utils_validation_1.URISchema,
    title: utils_validation_1.Joi.string(),
    email: utils_validation_1.Joi.string(),
})
    .rename('image_url', 'imageURL')
    .or('name', 'imageURL')
    .unknown()
    .required()
    .messages({
    'object.base': '{#label} should be an author object containing properties like name, title, and imageURL.',
    'any.required': '{#label} cannot be undefined. It should be an author object containing properties like name, title, and imageURL.',
}))
    .messages({
    'object.base': "The authors map file should contain an object where each entry contains an author key and the corresponding author's data.",
});
function validateAuthorsMap(content) {
    const { error, value } = AuthorsMapSchema.validate(content);
    if (error) {
        throw error;
    }
    return value;
}
exports.validateAuthorsMap = validateAuthorsMap;
async function getAuthorsMap(params) {
    return (0, docusaurus_utils_1.getDataFileData)({
        filePath: params.authorsMapPath,
        contentPaths: params.contentPaths,
        fileType: 'authors map',
    }, validateAuthorsMap);
}
exports.getAuthorsMap = getAuthorsMap;
function normalizeImageUrl({ imageURL, baseUrl, }) {
    return imageURL?.startsWith('/')
        ? (0, docusaurus_utils_1.normalizeUrl)([baseUrl, imageURL])
        : imageURL;
}
function makeAuthorPermalink(name, authorsBasePath) {
    return `${authorsBasePath}/${(0, authors_1.makeUrlFromName)(name)}`;
}
// Legacy v1/early-v2 front matter fields
// We may want to deprecate those in favor of using only frontMatter.authors
function getFrontMatterAuthorLegacy({ baseUrl, frontMatter, authorsBasePath, }) {
    const name = frontMatter.author;
    const title = frontMatter.author_title ?? frontMatter.authorTitle;
    const url = frontMatter.author_url ?? frontMatter.authorURL;
    const imageURL = normalizeImageUrl({
        imageURL: frontMatter.author_image_url ?? frontMatter.authorImageURL,
        baseUrl,
    });
    const permalink = name ? makeAuthorPermalink(name, authorsBasePath) : undefined;
    if (name || title || url || imageURL) {
        return {
            name,
            title,
            url,
            imageURL,
            permalink
        };
    }
    return undefined;
}
function normalizeFrontMatterAuthors(frontMatterAuthors = []) {
    function normalizeAuthor(authorInput) {
        if (typeof authorInput === 'string') {
            // Technically, we could allow users to provide an author's name here, but
            // we only support keys, otherwise, a typo in a key would fallback to
            // becoming a name and may end up unnoticed
            return { key: authorInput };
        }
        return authorInput;
    }
    return Array.isArray(frontMatterAuthors)
        ? frontMatterAuthors.map(normalizeAuthor)
        : [normalizeAuthor(frontMatterAuthors)];
}
function getFrontMatterAuthors(params) {
    const { authorsMap, authorsBasePath } = params;
    const frontMatterAuthors = normalizeFrontMatterAuthors(params.frontMatter.authors);
    function getAuthorsMapAuthor(key) {
        if (key) {
            if (!authorsMap || Object.keys(authorsMap).length === 0) {
                throw new Error(`Can't reference blog post authors by a key (such as '${key}') because no authors map file could be loaded.
Please double-check your blog plugin config (in particular 'authorsMapPath'), ensure the file exists at the configured path, is not empty, and is valid!`);
            }
            const author = authorsMap[key];
            if (!author) {
                throw Error(`Blog author with key "${key}" not found in the authors map file.
Valid author keys are:
${Object.keys(authorsMap)
                    .map((validKey) => `- ${validKey}`)
                    .join('\n')}`);
            }
            if (author.name) {
                author.permalink = makeAuthorPermalink(author.name, authorsBasePath);
            }
            else {
                author.permalink = makeAuthorPermalink(key, authorsBasePath);
            }
            return author;
        }
        return undefined;
    }
    function toAuthor(frontMatterAuthor) {
        return {
            // Author def from authorsMap can be locally overridden by front matter
            ...getAuthorsMapAuthor(frontMatterAuthor.key),
            ...frontMatterAuthor,
        };
    }
    return frontMatterAuthors.map(toAuthor);
}
function fixAuthorImageBaseURL(authors, { baseUrl }) {
    return authors.map((author) => ({
        ...author,
        imageURL: normalizeImageUrl({ imageURL: author.imageURL, baseUrl }),
    }));
}
function getBlogPostAuthors(params) {
    const authorLegacy = getFrontMatterAuthorLegacy(params);
    const authors = getFrontMatterAuthors(params);
    const updatedAuthors = fixAuthorImageBaseURL(authors, params);
    if (authorLegacy) {
        // Technically, we could allow mixing legacy/authors front matter, but do we
        // really want to?
        if (updatedAuthors.length > 0) {
            throw new Error(`To declare blog post authors, use the 'authors' front matter in priority.
Don't mix 'authors' with other existing 'author_*' front matter. Choose one or the other, not both at the same time.`);
        }
        return [authorLegacy];
    }
    return updatedAuthors;
}
exports.getBlogPostAuthors = getBlogPostAuthors;
function groupAuthoredItems(items, 
/**
 * A callback telling me how to get the tags list of the current item. Usually
 * simply getting it from some metadata of the current item.
 */
getItemAuthors) {
    const result = {};
    items.forEach((item) => {
        getItemAuthors(item).forEach((author) => {
            var _a;
            // Init missing tag groups
            // TODO: it's not really clear what should be the behavior if 2 tags have
            // the same permalink but the label is different for each
            // For now, the first tag found wins
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
