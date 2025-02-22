"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogDateComparator = exports.validateOptions = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const docusaurus_utils_1 = require("@xpack/docusaurus-utils");
const blogUtils_1 = require("./blogUtils");
const footnoteIDFixer_1 = tslib_1.__importDefault(require("./remark/footnoteIDFixer"));
const translations_1 = require("./translations");
const feed_1 = require("./feed");
const props_1 = require("./props");
const blogDateComparators_1 = require("./blogDateComparators");
async function pluginContentBlog(context, options) {
    const { siteDir, siteConfig, generatedFilesDir, localizationDir, i18n: { currentLocale }, } = context;
    const { onBrokenMarkdownLinks, baseUrl } = siteConfig;
    const contentPaths = {
        contentPath: path_1.default.resolve(siteDir, options.path),
        contentPathLocalized: (0, docusaurus_utils_1.getPluginI18nPath)({
            localizationDir,
            pluginName: 'xpack-docusaurus-plugin-content-blog',
            pluginId: options.id,
        }),
    };
    const pluginId = options.id ?? docusaurus_utils_1.DEFAULT_PLUGIN_ID;
    const pluginDataDirRoot = path_1.default.join(generatedFilesDir, 'xpack-docusaurus-plugin-content-blog');
    const dataDir = path_1.default.join(pluginDataDirRoot, pluginId);
    const aliasedSource = (source) => `~blog/${(0, docusaurus_utils_1.posixPath)(path_1.default.relative(pluginDataDirRoot, source))}`;
    const authorsMapFilePath = await (0, docusaurus_utils_1.getDataFilePath)({
        filePath: options.authorsMapPath,
        contentPaths,
    });
    return {
        name: 'xpack-docusaurus-plugin-content-blog',
        getPathsToWatch() {
            const { include } = options;
            const contentMarkdownGlobs = (0, docusaurus_utils_1.getContentPathList)(contentPaths).flatMap((contentPath) => include.map((pattern) => `${contentPath}/${pattern}`));
            return [authorsMapFilePath, ...contentMarkdownGlobs].filter(Boolean);
        },
        getTranslationFiles() {
            return (0, translations_1.getTranslationFiles)(options);
        },
        // Fetches blog contents and returns metadata for the necessary routes.
        async loadContent() {
            const { postsPerPage: postsPerPageOption, routeBasePath, tagsBasePath, authorsBasePath, blogDescription, blogTitle, blogSidebarTitle, pageBasePath, } = options;
            // logger.info('chronology loadContent() ' + pluginId)
            const baseBlogUrl = (0, docusaurus_utils_1.normalizeUrl)([baseUrl, routeBasePath]);
            const blogTagsListPath = (0, docusaurus_utils_1.normalizeUrl)([baseBlogUrl, tagsBasePath]);
            const blogAuthorsListPath = (0, docusaurus_utils_1.normalizeUrl)([baseBlogUrl, authorsBasePath]);
            const blogPosts = await (0, blogUtils_1.generateBlogPosts)(contentPaths, context, options);
            const listedBlogPosts = blogPosts.filter(blogUtils_1.shouldBeListed);
            if (!blogPosts.length) {
                return {
                    blogSidebarTitle,
                    blogPosts: [],
                    blogPostsNewest: [],
                    blogListPaginated: [],
                    blogTags: {},
                    blogTagsListPath,
                    blogTagsPaginated: [],
                    blogAuthors: {},
                    blogAuthorsListPath,
                    blogAuthorsPaginated: [],
                };
            }
            // Create a new array with the entries sorted by creation/modification
            // date, to be used in feeds and in a separate web page.
            const blogPostsNewest = [...blogPosts].sort(blogDateComparators_1.blogDateNewestComparator);
            // Collocate next and prev metadata.
            listedBlogPosts.forEach((blogPost, index) => {
                const prevItem = index > 0 ? listedBlogPosts[index - 1] : null;
                if (prevItem) {
                    blogPost.metadata.prevItem = {
                        title: prevItem.metadata.title,
                        permalink: prevItem.metadata.permalink,
                    };
                }
                const nextItem = index < listedBlogPosts.length - 1
                    ? listedBlogPosts[index + 1]
                    : null;
                if (nextItem) {
                    blogPost.metadata.nextItem = {
                        title: nextItem.metadata.title,
                        permalink: nextItem.metadata.permalink,
                    };
                }
            });
            const blogListPaginated = (0, blogUtils_1.paginateBlogPosts)({
                blogPosts: listedBlogPosts,
                blogTitle,
                blogDescription,
                postsPerPageOption,
                basePageUrl: baseBlogUrl,
                pageBasePath,
            });
            const blogTags = (0, blogUtils_1.getBlogTags)({
                blogPosts,
                postsPerPageOption,
                blogDescription,
                blogTitle,
                pageBasePath
            });
            const blogAuthors = (0, blogUtils_1.getBlogAuthors)({
                blogPosts,
                postsPerPageOption,
                blogDescription,
                blogTitle,
                pageBasePath
            });
            return {
                blogSidebarTitle,
                blogPosts,
                blogPostsNewest,
                blogListPaginated,
                blogTags,
                blogTagsListPath,
                blogAuthors,
                blogAuthorsListPath,
            };
        },
        async contentLoaded({ content: blogContents, actions }) {
            const { blogListComponent, blogPostComponent, blogTagsListComponent, blogTagsPostsComponent, blogAuthorsListComponent, blogAuthorsPostsComponent, blogArchiveComponent, routeBasePath, archiveBasePath, } = options;
            // logger.info('chronology contentLoaded() ' + pluginId)
            const { addRoute, createData, setGlobalData } = actions;
            const { blogSidebarTitle, blogPosts, blogPostsNewest, blogListPaginated, blogTags, blogTagsListPath, blogAuthors, blogAuthorsListPath, } = blogContents;
            const listedBlogPosts = blogPosts.filter(blogUtils_1.shouldBeListed);
            const blogItemsToMetadata = {};
            const sidebarBlogPosts = options.blogSidebarCount === 'ALL'
                ? blogPosts
                : blogPosts.slice(0, options.blogSidebarCount);
            function blogPostItemsModule(items) {
                return items.map((postId) => {
                    const blogPostMetadata = blogItemsToMetadata[postId];
                    return {
                        content: {
                            __import: true,
                            path: blogPostMetadata.source,
                            query: {
                                truncated: true,
                            },
                        },
                    };
                });
            }
            if (archiveBasePath && listedBlogPosts.length) {
                const archiveUrl = (0, docusaurus_utils_1.normalizeUrl)([
                    baseUrl,
                    routeBasePath,
                    archiveBasePath,
                ]);
                // Create a blog archive route
                const archiveProp = await createData(`${(0, docusaurus_utils_1.docuHash)(archiveUrl)}.json`, JSON.stringify({ blogPosts: listedBlogPosts }, null, 2));
                addRoute({
                    path: archiveUrl,
                    component: blogArchiveComponent,
                    exact: true,
                    modules: {
                        archive: aliasedSource(archiveProp),
                    },
                });
            }
            // This prop is useful to provide the blog list sidebar
            const sidebarProp = await createData(
            // Note that this created data path must be in sync with
            // metadataPath provided to mdx-loader.
            `blog-post-list-prop-${pluginId}.json`, JSON.stringify({
                title: blogSidebarTitle,
                items: sidebarBlogPosts.map((blogPost) => ({
                    title: blogPost.metadata.title,
                    permalink: blogPost.metadata.permalink,
                    unlisted: blogPost.metadata.unlisted,
                })),
            }, null, 2));
            // Create routes for blog entries.
            await Promise.all(blogPosts.map(async (blogPost) => {
                const { id, metadata } = blogPost;
                await createData(
                // Note that this created data path must be in sync with
                // metadataPath provided to mdx-loader.
                `${(0, docusaurus_utils_1.docuHash)(metadata.source)}.json`, JSON.stringify(metadata, null, 2));
                addRoute({
                    path: metadata.permalink,
                    component: blogPostComponent,
                    exact: true,
                    modules: {
                        sidebar: aliasedSource(sidebarProp),
                        content: metadata.source,
                    },
                });
                blogItemsToMetadata[id] = metadata;
            }));
            // Create routes for blog's paginated list entries.
            await Promise.all(blogListPaginated.map(async (listPage) => {
                const { metadata, items } = listPage;
                const { permalink } = metadata;
                const pageMetadataPath = await createData(`${(0, docusaurus_utils_1.docuHash)(permalink)}.json`, JSON.stringify(metadata, null, 2));
                addRoute({
                    path: permalink,
                    component: blogListComponent,
                    exact: true,
                    modules: {
                        sidebar: aliasedSource(sidebarProp),
                        items: blogPostItemsModule(items),
                        metadata: aliasedSource(pageMetadataPath),
                    },
                });
            }));
            const chronologyRecords = [];
            blogPosts.map((post) => {
                if (post.metadata.eventIntervalFormatted) {
                    chronologyRecords.push({
                        interval: post.metadata.eventIntervalFormatted,
                        title: post.metadata.title,
                        permalink: post.metadata.permalink,
                        isInternational: post.metadata.frontMatter?.tags?.includes('international') || false
                    });
                }
            });
            // chronologyRecords.forEach((record) => logger.info(record))
            setGlobalData({
                chronologyRecords
            });
            // ----------------------------------------------------------------------
            // Tags.
            if (Object.keys(blogTags).length > 0) {
                async function createTagsListPage() {
                    const tagsPropPath = await createData(`${(0, docusaurus_utils_1.docuHash)(`${blogTagsListPath}-tags`)}.json`, JSON.stringify((0, props_1.toTagsProp)({ blogTags }), null, 2));
                    addRoute({
                        path: blogTagsListPath,
                        component: blogTagsListComponent,
                        exact: true,
                        modules: {
                            sidebar: aliasedSource(sidebarProp),
                            tags: aliasedSource(tagsPropPath),
                        },
                    });
                }
                async function createTagPostsListPage(tag) {
                    await Promise.all(tag.pages.map(async (blogPaginated) => {
                        const { metadata, items } = blogPaginated;
                        const tagPropPath = await createData(`${(0, docusaurus_utils_1.docuHash)(metadata.permalink)}.json`, JSON.stringify((0, props_1.toTagProp)({ tag, blogTagsListPath }), null, 2));
                        const listMetadataPath = await createData(`${(0, docusaurus_utils_1.docuHash)(metadata.permalink)}-list.json`, JSON.stringify(metadata, null, 2));
                        addRoute({
                            path: metadata.permalink,
                            component: blogTagsPostsComponent,
                            exact: true,
                            modules: {
                                sidebar: aliasedSource(sidebarProp),
                                items: blogPostItemsModule(items),
                                tag: aliasedSource(tagPropPath),
                                listMetadata: aliasedSource(listMetadataPath),
                            },
                        });
                    }));
                }
                await createTagsListPage();
                await Promise.all(Object.values(blogTags).map(createTagPostsListPage));
            }
            // ----------------------------------------------------------------------
            // Authors.
            if (Object.keys(blogAuthors).length > 0) {
                async function createAuthorsListPage() {
                    const authorsPropPath = await createData(`${(0, docusaurus_utils_1.docuHash)(`${blogAuthorsListPath}-authors`)}.json`, JSON.stringify((0, props_1.toAuthorsProp)({ blogAuthors }), null, 2));
                    addRoute({
                        path: blogAuthorsListPath,
                        component: blogAuthorsListComponent,
                        exact: true,
                        modules: {
                            sidebar: aliasedSource(sidebarProp),
                            authors: aliasedSource(authorsPropPath),
                        },
                    });
                }
                async function createAuthorPostsListPage(author) {
                    // assert(author.name)
                    // assert(author.permalink)
                    await Promise.all(author.pages.map(async (blogPaginated) => {
                        const { metadata, items } = blogPaginated;
                        // logger.info('createAuthorPostsListPage author')
                        // logger.info(toAuthorProp({ author, blogAuthorsListPath }))
                        const authorPropPath = await createData(`${(0, docusaurus_utils_1.docuHash)(metadata.permalink)}.json`, JSON.stringify((0, props_1.toAuthorProp)({ author, blogAuthorsListPath }), null, 2));
                        // logger.info('createAuthorPostsListPage metadata')
                        // logger.info(metadata)
                        const listMetadataPath = await createData(`${(0, docusaurus_utils_1.docuHash)(metadata.permalink)}-list.json`, JSON.stringify(metadata, null, 2));
                        addRoute({
                            path: metadata.permalink,
                            component: blogAuthorsPostsComponent,
                            exact: true,
                            modules: {
                                sidebar: aliasedSource(sidebarProp),
                                items: blogPostItemsModule(items),
                                author: aliasedSource(authorPropPath),
                                listMetadata: aliasedSource(listMetadataPath),
                            },
                        });
                    }));
                }
                await createAuthorsListPage();
                await Promise.all(Object.values(blogAuthors)
                    .filter((author) => author.name && author.permalink)
                    .map(createAuthorPostsListPage));
            }
        },
        translateContent({ content, translationFiles }) {
            return (0, translations_1.translateContent)(content, translationFiles);
        },
        configureWebpack(_config, isServer, utils, content) {
            const { admonitions, rehypePlugins, remarkPlugins, truncateMarker, beforeDefaultRemarkPlugins, beforeDefaultRehypePlugins, } = options;
            const markdownLoaderOptions = {
                siteDir,
                contentPaths,
                truncateMarker,
                sourceToPermalink: (0, blogUtils_1.getSourceToPermalink)(content.blogPosts),
                onBrokenMarkdownLink: (brokenMarkdownLink) => {
                    if (onBrokenMarkdownLinks === 'ignore') {
                        return;
                    }
                    logger_1.default.report(onBrokenMarkdownLinks) `Blog markdown link couldn't be resolved: (url=${brokenMarkdownLink.link}) in path=${brokenMarkdownLink.filePath}`;
                },
            };
            const contentDirs = (0, docusaurus_utils_1.getContentPathList)(contentPaths);
            return {
                resolve: {
                    alias: {
                        '~blog': pluginDataDirRoot,
                    },
                },
                module: {
                    rules: [
                        {
                            test: /\.mdx?$/i,
                            include: contentDirs
                                // Trailing slash is important, see https://github.com/facebook/docusaurus/pull/3970
                                .map(docusaurus_utils_1.addTrailingPathSeparator),
                            use: [
                                {
                                    loader: require.resolve('@docusaurus/mdx-loader'),
                                    options: {
                                        admonitions,
                                        remarkPlugins,
                                        rehypePlugins,
                                        beforeDefaultRemarkPlugins: [
                                            footnoteIDFixer_1.default,
                                            ...beforeDefaultRemarkPlugins,
                                        ],
                                        beforeDefaultRehypePlugins,
                                        staticDirs: siteConfig.staticDirectories.map((dir) => path_1.default.resolve(siteDir, dir)),
                                        siteDir,
                                        isMDXPartial: (0, docusaurus_utils_1.createAbsoluteFilePathMatcher)(options.exclude, contentDirs),
                                        metadataPath: (mdxPath) => {
                                            // Note that metadataPath must be the same/in-sync as
                                            // the path from createData for each MDX.
                                            const aliasedPath = (0, docusaurus_utils_1.aliasedSitePath)(mdxPath, siteDir);
                                            return path_1.default.join(dataDir, `${(0, docusaurus_utils_1.docuHash)(aliasedPath)}.json`);
                                        },
                                        // For blog posts a title in markdown is always removed
                                        // Blog posts title are rendered separately
                                        removeContentTitle: true,
                                        // Assets allow to convert some relative images paths to
                                        // require() calls
                                        createAssets: ({ frontMatter, metadata, }) => ({
                                            image: frontMatter.image,
                                            authorsImageUrls: metadata.authors.map((author) => author.imageURL),
                                        }),
                                        markdownConfig: siteConfig.markdown,
                                    },
                                },
                                {
                                    loader: path_1.default.resolve(__dirname, './markdownLoader.js'),
                                    options: markdownLoaderOptions,
                                },
                            ].filter(Boolean),
                        },
                    ],
                },
            };
        },
        async postBuild({ outDir, content }) {
            if (!options.feedOptions.type) {
                return;
            }
            const { blogPostsNewest } = content;
            if (!blogPostsNewest.length) {
                return;
            }
            await (0, feed_1.createBlogFeedFiles)({
                blogPostsNewest,
                options,
                outDir,
                siteConfig,
                locale: currentLocale,
            });
        },
        injectHtmlTags({ content }) {
            if (!content.blogPosts.length || !options.feedOptions.type) {
                return {};
            }
            const feedTypes = options.feedOptions.type;
            const feedTitle = options.feedOptions.title ?? context.siteConfig.title;
            const feedsConfig = {
                rss: {
                    type: 'application/rss+xml',
                    path: 'rss.xml',
                    title: `${feedTitle} RSS Feed`,
                },
                atom: {
                    type: 'application/atom+xml',
                    path: 'atom.xml',
                    title: `${feedTitle} Atom Feed`,
                },
                json: {
                    type: 'application/json',
                    path: 'feed.json',
                    title: `${feedTitle} JSON Feed`,
                },
            };
            const headTags = [];
            feedTypes.forEach((feedType) => {
                const { type, path: feedConfigPath, title: feedConfigTitle, } = feedsConfig[feedType];
                headTags.push({
                    tagName: 'link',
                    attributes: {
                        rel: 'alternate',
                        type,
                        href: (0, docusaurus_utils_1.normalizeUrl)([
                            baseUrl,
                            options.routeBasePath,
                            feedConfigPath,
                        ]),
                        title: feedConfigTitle,
                    },
                });
            });
            return {
                headTags,
            };
        },
    };
}
exports.default = pluginContentBlog;
var options_1 = require("./options");
Object.defineProperty(exports, "validateOptions", { enumerable: true, get: function () { return options_1.validateOptions; } });
var blogDateComparators_2 = require("./blogDateComparators");
Object.defineProperty(exports, "blogDateComparator", { enumerable: true, get: function () { return blogDateComparators_2.blogDateComparator; } });
