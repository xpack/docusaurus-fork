"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkify = exports.generateBlogPosts = exports.parseBlogFileName = exports.getBlogAuthors = exports.getBlogTags = exports.shouldBeListed = exports.paginateBlogPosts = exports.getSourceToPermalink = exports.truncate = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const reading_time_1 = tslib_1.__importDefault(require("reading-time"));
const docusaurus_utils_1 = require("@xpack/docusaurus-utils");
const frontMatter_1 = require("./frontMatter");
const authors_1 = require("./authors");
const blogDateComparators_1 = require("./blogDateComparators");
const frontMatterEventDates_1 = require("./frontMatterEventDates");
const lastUpdate_1 = require("./lastUpdate");
function truncate(fileString, truncateMarker) {
    return fileString.split(truncateMarker, 1).shift();
}
exports.truncate = truncate;
function getSourceToPermalink(blogPosts) {
    return Object.fromEntries(blogPosts.map(({ metadata: { source, permalink } }) => [source, permalink]));
}
exports.getSourceToPermalink = getSourceToPermalink;
function paginateBlogPosts({ blogPosts, basePageUrl, blogTitle, blogDescription, postsPerPageOption, pageBasePath }) {
    const totalCount = blogPosts.length;
    const postsPerPage = postsPerPageOption === 'ALL' ? totalCount : postsPerPageOption;
    const numberOfPages = Math.ceil(totalCount / postsPerPage);
    const pages = [];
    function permalink(page) {
        const word = pageBasePath;
        return page > 0
            ? (0, docusaurus_utils_1.normalizeUrl)([basePageUrl, `${word}/${page + 1}`])
            : basePageUrl;
    }
    for (let page = 0; page < numberOfPages; page += 1) {
        pages.push({
            items: blogPosts
                .slice(page * postsPerPage, (page + 1) * postsPerPage)
                .map((item) => item.id),
            metadata: {
                permalink: permalink(page),
                page: page + 1,
                postsPerPage,
                totalPages: numberOfPages,
                totalCount,
                previousPage: page !== 0 ? permalink(page - 1) : undefined,
                nextPage: page < numberOfPages - 1 ? permalink(page + 1) : undefined,
                blogDescription,
                blogTitle,
            },
        });
    }
    return pages;
}
exports.paginateBlogPosts = paginateBlogPosts;
function shouldBeListed(blogPost) {
    return !blogPost.metadata.unlisted;
}
exports.shouldBeListed = shouldBeListed;
function getBlogTags({ blogPosts, ...params }) {
    const groups = (0, docusaurus_utils_1.groupTaggedItems)(blogPosts, (blogPost) => blogPost.metadata.tags);
    return lodash_1.default.mapValues(groups, ({ tag, items: tagBlogPosts }) => {
        const tagVisibility = (0, docusaurus_utils_1.getTagVisibility)({
            items: tagBlogPosts,
            isUnlisted: (item) => item.metadata.unlisted,
        });
        return {
            label: tag.label,
            items: tagVisibility.listedItems.map((item) => item.id),
            permalink: tag.permalink,
            pages: paginateBlogPosts({
                blogPosts: tagVisibility.listedItems,
                basePageUrl: tag.permalink,
                ...params,
            }),
            unlisted: tagVisibility.unlisted,
        };
    });
}
exports.getBlogTags = getBlogTags;
function getBlogAuthors({ blogPosts, ...params }) {
    const groups = (0, authors_1.groupAuthoredItems)(blogPosts, (blogPost) => blogPost.metadata.authors);
    return lodash_1.default.mapValues(groups, ({ author, items: authorBlogPosts }) => {
        const authorVisibility = (0, docusaurus_utils_1.getAuthorVisibility)({
            items: authorBlogPosts,
            isUnlisted: (item) => item.metadata.unlisted,
        });
        return {
            name: author.name,
            items: authorVisibility.listedItems.map((item) => item.id),
            permalink: author.permalink,
            pages: author.permalink ? paginateBlogPosts({
                blogPosts: authorVisibility.listedItems,
                basePageUrl: author.permalink,
                ...params,
            }) : [],
            unlisted: authorVisibility.unlisted,
        };
    });
}
exports.getBlogAuthors = getBlogAuthors;
const DATE_FILENAME_REGEX = /^(?<folder>.*)(?<date>\d{4}[-/]\d{1,2}[-/]\d{1,2})[-/]?(?<text>.*?)(?:\/index)?.mdx?$/;
function parseBlogFileName(blogSourceRelative) {
    const dateFilenameMatch = blogSourceRelative.match(DATE_FILENAME_REGEX);
    if (dateFilenameMatch) {
        const { folder, text, date: dateString } = dateFilenameMatch.groups;
        // Always treat dates as UTC by adding the `Z`
        const date = new Date(`${dateString}Z`);
        const slugDate = dateString.replace(/-/g, '/');
        const slug = `/${slugDate}/${folder}${text}`;
        return { date, text: text, slug };
    }
    const text = blogSourceRelative.replace(/(?:\/index)?\.mdx?$/, '');
    const slug = `/${text}`;
    return { date: undefined, text, slug };
}
exports.parseBlogFileName = parseBlogFileName;
function formatBlogPostDate(locale, date, calendar) {
    try {
        return new Intl.DateTimeFormat(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
            calendar,
        }).format(date);
    }
    catch (err) {
        logger_1.default.error `Can't format blog post date "${String(date)}"`;
        throw err;
    }
}
async function parseBlogPostMarkdownFile({ filePath, parseFrontMatter, }) {
    const fileContent = await fs_extra_1.default.readFile(filePath, 'utf-8');
    try {
        const result = await (0, docusaurus_utils_1.parseMarkdownFile)({
            filePath,
            fileContent,
            parseFrontMatter,
            removeContentTitle: true,
        });
        return {
            ...result,
            frontMatter: (0, frontMatter_1.validateBlogPostFrontMatter)(result.frontMatter),
        };
    }
    catch (err) {
        logger_1.default.error `Error while parsing blog post file path=${filePath}.`;
        throw err;
    }
}
const defaultReadingTime = ({ content, options }) => (0, reading_time_1.default)(content, options).minutes;
async function processBlogSourceFile(blogSourceRelative, contentPaths, context, options, authorsMap) {
    const { siteConfig: { baseUrl, markdown: { parseFrontMatter }, }, siteDir, i18n, } = context;
    const { routeBasePath, tagsBasePath: tagsRouteBasePath, authorsBasePath: authorsRouteBasePath, truncateMarker, showReadingTime, editUrl, } = options;
    // Lookup in localized folder in priority
    const blogDirPath = await (0, docusaurus_utils_1.getFolderContainingFile)((0, docusaurus_utils_1.getContentPathList)(contentPaths), blogSourceRelative);
    const blogSourceAbsolute = path_1.default.join(blogDirPath, blogSourceRelative);
    const { frontMatter, content, contentTitle, excerpt } = await parseBlogPostMarkdownFile({
        filePath: blogSourceAbsolute,
        parseFrontMatter,
    });
    const { last_update: lastUpdateFrontMatter, } = frontMatter;
    const lastUpdate = await readLastUpdateData(blogSourceAbsolute, options, lastUpdateFrontMatter);
    if (lastUpdate.lastUpdatedAt) {
        const dateOut = (new Date(lastUpdate.lastUpdatedAt * 1000)).toISOString();
        logger_1.default.info(`${dateOut} ${blogSourceAbsolute}`);
    }
    const aliasedSource = (0, docusaurus_utils_1.aliasedSitePath)(blogSourceAbsolute, siteDir);
    const draft = (0, docusaurus_utils_1.isDraft)({ frontMatter });
    const unlisted = (0, docusaurus_utils_1.isUnlisted)({ frontMatter });
    if (draft) {
        return undefined;
    }
    if (frontMatter.id) {
        logger_1.default.warn `name=${'id'} header option is deprecated in path=${blogSourceRelative} file. Please use name=${'slug'} option instead.`;
    }
    const parsedBlogFileName = parseBlogFileName(blogSourceRelative);
    async function getDate() {
        // Prefer user-defined date.
        if (frontMatter.date) {
            if (typeof frontMatter.date === 'string') {
                // Always treat dates as UTC by adding the `Z`
                return new Date(`${frontMatter.date}Z`);
            }
            // YAML only converts YYYY-MM-DD to dates and leaves others as strings.
            return frontMatter.date;
        }
        else if (parsedBlogFileName.date) {
            return parsedBlogFileName.date;
        }
        try {
            const result = (0, docusaurus_utils_1.getFileCommitDate)(blogSourceAbsolute, {
                age: 'oldest',
                includeAuthor: false,
            });
            return result.date;
        }
        catch (err) {
            logger_1.default.warn(err);
            return (await fs_extra_1.default.stat(blogSourceAbsolute)).birthtime;
        }
    }
    const date = await getDate();
    const formattedDate = formatBlogPostDate(i18n.currentLocale, date, i18n.localeConfigs[i18n.currentLocale].calendar);
    const title = frontMatter.title ?? contentTitle ?? parsedBlogFileName.text;
    const description = frontMatter.description ?? excerpt ?? '';
    const slug = frontMatter.slug ?? parsedBlogFileName.slug;
    const permalink = (0, docusaurus_utils_1.normalizeUrl)([baseUrl, routeBasePath, slug]);
    function getBlogEditUrl() {
        const blogPathRelative = path_1.default.relative(blogDirPath, path_1.default.resolve(blogSourceAbsolute));
        if (typeof editUrl === 'function') {
            return editUrl({
                blogDirPath: (0, docusaurus_utils_1.posixPath)(path_1.default.relative(siteDir, blogDirPath)),
                blogPath: (0, docusaurus_utils_1.posixPath)(blogPathRelative),
                permalink,
                locale: i18n.currentLocale,
            });
        }
        else if (typeof editUrl === 'string') {
            const isLocalized = blogDirPath === contentPaths.contentPathLocalized;
            const fileContentPath = isLocalized && options.editLocalizedFiles
                ? contentPaths.contentPathLocalized
                : contentPaths.contentPath;
            const contentPathEditUrl = (0, docusaurus_utils_1.normalizeUrl)([
                editUrl,
                (0, docusaurus_utils_1.posixPath)(path_1.default.relative(siteDir, fileContentPath)),
            ]);
            return (0, docusaurus_utils_1.getEditUrl)(blogPathRelative, contentPathEditUrl);
        }
        return undefined;
    }
    const tagsBasePath = (0, docusaurus_utils_1.normalizeUrl)([
        baseUrl,
        routeBasePath,
        tagsRouteBasePath,
    ]);
    const tags = (0, docusaurus_utils_1.normalizeFrontMatterTags)(tagsBasePath, frontMatter.tags);
    const authorsBasePath = (0, docusaurus_utils_1.normalizeUrl)([
        baseUrl,
        routeBasePath,
        authorsRouteBasePath,
    ]);
    const authors = (0, authors_1.getBlogPostAuthors)({ authorsMap, frontMatter, baseUrl, authorsBasePath });
    // authors.forEach((a) => logger.info(a))
    const parsedEventDates = (0, frontMatterEventDates_1.parseFrontMatterEventDates)(frontMatter, date);
    const formatDate = (locale, date, calendar) => {
        try {
            return new Intl.DateTimeFormat(locale, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC',
                calendar,
            }).format(date);
        }
        catch (err) {
            logger_1.default.error `Can't format docs lastUpdatedAt date "${String(date)}"`;
            throw err;
        }
    };
    return {
        id: slug,
        metadata: {
            permalink,
            editUrl: getBlogEditUrl(),
            source: aliasedSource,
            title,
            description,
            date,
            formattedDate,
            tags,
            authors,
            readingTime: showReadingTime
                ? options.readingTime({
                    content,
                    frontMatter,
                    defaultReadingTime,
                })
                : undefined,
            hasTruncateMarker: truncateMarker.test(content),
            frontMatter,
            unlisted,
            eventDateISO: parsedEventDates.eventDateISO,
            eventEndDateISO: parsedEventDates.eventEndDateISO,
            eventDateFormatted: parsedEventDates.eventDateFormatted,
            eventIntervalFormatted: parsedEventDates.eventIntervalFormatted,
            lastUpdatedBy: lastUpdate.lastUpdatedBy,
            lastUpdatedAt: lastUpdate.lastUpdatedAt,
            formattedLastUpdatedAt: lastUpdate.lastUpdatedAt
                ? formatDate(i18n.currentLocale, new Date(lastUpdate.lastUpdatedAt * 1000), i18n.localeConfigs[i18n.currentLocale].calendar)
                : undefined,
        },
        content,
    };
}
async function readLastUpdateData(filePath, options, lastUpdateFrontMatter) {
    const { showLastUpdateAuthor, showLastUpdateTime } = options;
    if (showLastUpdateAuthor || showLastUpdateTime) {
        const frontMatterTimestamp = lastUpdateFrontMatter?.date
            ? new Date(lastUpdateFrontMatter.date).getTime() / 1000
            : undefined;
        if (lastUpdateFrontMatter?.author && lastUpdateFrontMatter.date) {
            return {
                lastUpdatedAt: frontMatterTimestamp,
                lastUpdatedBy: lastUpdateFrontMatter.author,
            };
        }
        // Use fake data in dev for faster development.
        const fileLastUpdateData = process.env.NODE_ENV === 'production'
            ? await (0, lastUpdate_1.getFileLastUpdate)(filePath)
            : {
                author: 'Author',
                timestamp: (new Date()).getTime() / 1000,
            };
        const { author, timestamp } = fileLastUpdateData ?? {};
        return {
            lastUpdatedBy: showLastUpdateAuthor
                ? lastUpdateFrontMatter?.author ?? author
                : undefined,
            lastUpdatedAt: showLastUpdateTime
                ? frontMatterTimestamp ?? timestamp
                : undefined,
        };
    }
    return {};
}
async function generateBlogPosts(contentPaths, context, options) {
    const { include, exclude } = options;
    if (!(await fs_extra_1.default.pathExists(contentPaths.contentPath))) {
        return [];
    }
    const blogSourceFiles = await (0, docusaurus_utils_1.Globby)(include, {
        cwd: contentPaths.contentPath,
        ignore: exclude,
    });
    const authorsMap = await (0, authors_1.getAuthorsMap)({
        contentPaths,
        authorsMapPath: options.authorsMapPath,
    });
    async function doProcessBlogSourceFile(blogSourceFile) {
        try {
            return await processBlogSourceFile(blogSourceFile, contentPaths, context, options, authorsMap);
        }
        catch (err) {
            throw new Error(`Processing of blog source file path=${blogSourceFile} failed.`, { cause: err });
        }
    }
    const blogPosts = (await Promise.all(blogSourceFiles.map(doProcessBlogSourceFile))).filter(Boolean);
    blogPosts.sort(
    // (a, b) => b.metadata.date.getTime() - a.metadata.date.getTime(),
    blogDateComparators_1.blogDateComparator);
    if (options.sortPosts === 'ascending') {
        return blogPosts.reverse();
    }
    // blogPosts.forEach((post) => logger.info(post.metadata.frontMatter.event_date))
    return blogPosts;
}
exports.generateBlogPosts = generateBlogPosts;
function linkify({ filePath, contentPaths, fileString, siteDir, sourceToPermalink, onBrokenMarkdownLink, }) {
    const { newContent, brokenMarkdownLinks } = (0, docusaurus_utils_1.replaceMarkdownLinks)({
        siteDir,
        fileString,
        filePath,
        contentPaths,
        sourceToPermalink,
    });
    brokenMarkdownLinks.forEach((l) => onBrokenMarkdownLink(l));
    return newContent;
}
exports.linkify = linkify;
