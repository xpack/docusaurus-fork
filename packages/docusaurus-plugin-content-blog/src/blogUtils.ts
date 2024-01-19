/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';
import logger from '@docusaurus/logger';
import readingTime from 'reading-time';
import {
  parseMarkdownFile,
  normalizeUrl,
  aliasedSitePath,
  getEditUrl,
  getFolderContainingFile,
  posixPath,
  replaceMarkdownLinks,
  Globby,
  normalizeFrontMatterTags,
  groupTaggedItems,
  getTagVisibility,
  getAuthorVisibility,
  getFileCommitDate,
  getContentPathList,
  isUnlisted,
  isDraft,
  Tag,
} from '@xpack/docusaurus-utils';
import { validateBlogPostFrontMatter } from './frontMatter';
import { type AuthorsMap, getAuthorsMap, getBlogPostAuthors, groupAuthoredItems } from './authors';
import type { LoadContext, ParseFrontMatter } from '@docusaurus/types';
import type {
  PluginOptions,
  ReadingTimeFunction,
  BlogPost,
  BlogTags,
  BlogPaginated,
  LastUpdateData,
  FileChange,
  BlogAuthors,
} from '@xpack/docusaurus-plugin-content-blog';
import type { BlogContentPaths, BlogMarkdownLoaderOptions } from './types';
import { blogDateComparator } from './blogDateComparators'
import type { ParsedEventDates } from './frontMatterEventDates'
import { parseFrontMatterEventDates } from './frontMatterEventDates'
import { getFileLastUpdate } from './lastUpdate';

type LastUpdateOptions = Pick<
  PluginOptions,
  'showLastUpdateAuthor' | 'showLastUpdateTime'
>;

export function truncate(fileString: string, truncateMarker: RegExp): string {
  return fileString.split(truncateMarker, 1).shift()!;
}

export function getSourceToPermalink(blogPosts: BlogPost[]): {
  [aliasedPath: string]: string;
} {
  return Object.fromEntries(
    blogPosts.map(({ metadata: { source, permalink } }) => [source, permalink]),
  );
}

export function paginateBlogPosts({
  blogPosts,
  basePageUrl,
  blogTitle,
  blogDescription,
  postsPerPageOption,
  pageBasePath
}: {
  blogPosts: BlogPost[];
  basePageUrl: string;
  blogTitle: string;
  blogDescription: string;
  postsPerPageOption: number | 'ALL';
  pageBasePath: string
}): BlogPaginated[] {
  const totalCount = blogPosts.length;
  const postsPerPage =
    postsPerPageOption === 'ALL' ? totalCount : postsPerPageOption;
  const numberOfPages = Math.ceil(totalCount / postsPerPage);

  const pages: BlogPaginated[] = [];

  function permalink(page: number) {
    const word = pageBasePath

    return page > 0
      ? normalizeUrl([basePageUrl, `${word}/${page + 1}`])
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

export function shouldBeListed(blogPost: BlogPost): boolean {
  return !blogPost.metadata.unlisted;
}

export function getBlogTags({
  blogPosts,
  ...params
}: {
  blogPosts: BlogPost[];
  blogTitle: string;
  blogDescription: string;
  postsPerPageOption: number | 'ALL';
  pageBasePath: string
}): BlogTags {
  const groups = groupTaggedItems(
    blogPosts,
    (blogPost) => blogPost.metadata.tags,
  );
  return _.mapValues(groups, ({ tag, items: tagBlogPosts }) => {
    const tagVisibility = getTagVisibility({
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

export function getBlogAuthors({
  blogPosts,
  ...params
}: {
  blogPosts: BlogPost[];
  blogTitle: string;
  blogDescription: string;
  postsPerPageOption: number | 'ALL';
  pageBasePath: string
}): BlogAuthors {
  const groups = groupAuthoredItems(
    blogPosts,
    (blogPost) => blogPost.metadata.authors,
  );
  return _.mapValues(groups, ({ author, items: authorBlogPosts }) => {
    const authorVisibility = getAuthorVisibility({
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


const DATE_FILENAME_REGEX =
  /^(?<folder>.*)(?<date>\d{4}[-/]\d{1,2}[-/]\d{1,2})[-/]?(?<text>.*?)(?:\/index)?.mdx?$/;

type ParsedBlogFileName = {
  date: Date | undefined;
  text: string;
  slug: string;
};

export function parseBlogFileName(
  blogSourceRelative: string,
): ParsedBlogFileName {
  const dateFilenameMatch = blogSourceRelative.match(DATE_FILENAME_REGEX);
  if (dateFilenameMatch) {
    const { folder, text, date: dateString } = dateFilenameMatch.groups!;
    // Always treat dates as UTC by adding the `Z`
    const date = new Date(`${dateString!}Z`);
    const slugDate = dateString!.replace(/-/g, '/');
    const slug = `/${slugDate}/${folder!}${text!}`;
    return { date, text: text!, slug };
  }
  const text = blogSourceRelative.replace(/(?:\/index)?\.mdx?$/, '');
  const slug = `/${text}`;
  return { date: undefined, text, slug };
}

function formatBlogPostDate(
  locale: string,
  date: Date,
  calendar: string,
): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
      calendar,
    }).format(date);
  } catch (err) {
    logger.error`Can't format blog post date "${String(date)}"`;
    throw err;
  }
}

async function parseBlogPostMarkdownFile({
  filePath,
  parseFrontMatter,
}: {
  filePath: string;
  parseFrontMatter: ParseFrontMatter;
}) {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  try {
    const result = await parseMarkdownFile({
      filePath,
      fileContent,
      parseFrontMatter,
      removeContentTitle: true,
    });

    return {
      ...result,
      frontMatter: validateBlogPostFrontMatter(result.frontMatter),
    };
  } catch (err) {
    logger.error`Error while parsing blog post file path=${filePath}.`;
    throw err;
  }
}

const defaultReadingTime: ReadingTimeFunction = ({ content, options }) =>
  readingTime(content, options).minutes;

async function processBlogSourceFile(
  blogSourceRelative: string,
  contentPaths: BlogContentPaths,
  context: LoadContext,
  options: PluginOptions,
  authorsMap?: AuthorsMap,
): Promise<BlogPost | undefined> {
  const {
    siteConfig: {
      baseUrl,
      markdown: { parseFrontMatter },
    },
    siteDir,
    i18n,
  } = context;
  const {
    routeBasePath,
    tagsBasePath: tagsRouteBasePath,
    authorsBasePath: authorsRouteBasePath,
    truncateMarker,
    showReadingTime,
    editUrl,
  } = options;

  // Lookup in localized folder in priority
  const blogDirPath = await getFolderContainingFile(
    getContentPathList(contentPaths),
    blogSourceRelative,
  );

  const blogSourceAbsolute = path.join(blogDirPath, blogSourceRelative);

  const { frontMatter, content, contentTitle, excerpt } =
    await parseBlogPostMarkdownFile({
      filePath: blogSourceAbsolute,
      parseFrontMatter,
    });

  const {
    last_update: lastUpdateFrontMatter,
  } = frontMatter;

  const lastUpdate = await readLastUpdateData(
    blogSourceAbsolute,
    options,
    lastUpdateFrontMatter,
  );

  if (lastUpdate.lastUpdatedAt) {
    const dateOut = (new Date(lastUpdate.lastUpdatedAt * 1000)).toISOString()
    logger.info(`${dateOut} ${blogSourceAbsolute}`)
  }

  const aliasedSource = aliasedSitePath(blogSourceAbsolute, siteDir);

  const draft = isDraft({ frontMatter });
  const unlisted = isUnlisted({ frontMatter });

  if (draft) {
    return undefined;
  }

  if (frontMatter.id) {
    logger.warn`name=${'id'} header option is deprecated in path=${blogSourceRelative} file. Please use name=${'slug'} option instead.`;
  }

  const parsedBlogFileName = parseBlogFileName(blogSourceRelative);

  async function getDate(): Promise<Date> {
    // Prefer user-defined date.
    if (frontMatter.date) {
      if (typeof frontMatter.date === 'string') {
        // Always treat dates as UTC by adding the `Z`
        return new Date(`${frontMatter.date}Z`);
      }
      // YAML only converts YYYY-MM-DD to dates and leaves others as strings.
      return frontMatter.date;
    } else if (parsedBlogFileName.date) {
      return parsedBlogFileName.date;
    }

    try {
      const result = getFileCommitDate(blogSourceAbsolute, {
        age: 'oldest',
        includeAuthor: false,
      });
      return result.date;
    } catch (err) {
      logger.warn(err);
      return (await fs.stat(blogSourceAbsolute)).birthtime;
    }
  }

  const date = await getDate();
  const formattedDate = formatBlogPostDate(
    i18n.currentLocale,
    date,
    i18n.localeConfigs[i18n.currentLocale]!.calendar,
  );

  const title = frontMatter.title ?? contentTitle ?? parsedBlogFileName.text;
  const description = frontMatter.description ?? excerpt ?? '';

  const slug = frontMatter.slug ?? parsedBlogFileName.slug;

  const permalink = normalizeUrl([baseUrl, routeBasePath, slug]);

  function getBlogEditUrl() {
    const blogPathRelative = path.relative(
      blogDirPath,
      path.resolve(blogSourceAbsolute),
    );

    if (typeof editUrl === 'function') {
      return editUrl({
        blogDirPath: posixPath(path.relative(siteDir, blogDirPath)),
        blogPath: posixPath(blogPathRelative),
        permalink,
        locale: i18n.currentLocale,
      });
    } else if (typeof editUrl === 'string') {
      const isLocalized = blogDirPath === contentPaths.contentPathLocalized;
      const fileContentPath =
        isLocalized && options.editLocalizedFiles
          ? contentPaths.contentPathLocalized
          : contentPaths.contentPath;

      const contentPathEditUrl = normalizeUrl([
        editUrl,
        posixPath(path.relative(siteDir, fileContentPath)),
      ]);

      return getEditUrl(blogPathRelative, contentPathEditUrl);
    }
    return undefined;
  }

  const tagsBasePath = normalizeUrl([
    baseUrl,
    routeBasePath,
    tagsRouteBasePath,
  ]);
  const tags: Tag[] = normalizeFrontMatterTags(tagsBasePath, frontMatter.tags)

  const authorsBasePath = normalizeUrl([
    baseUrl,
    routeBasePath,
    authorsRouteBasePath,
  ]);

  const authors = getBlogPostAuthors({ authorsMap, frontMatter, baseUrl, authorsBasePath });

  // authors.forEach((a) => logger.info(a))

  const parsedEventDates: ParsedEventDates = parseFrontMatterEventDates(frontMatter, date);

  const formatDate = (locale: string, date: Date, calendar: string): string => {
    try {
      return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
        calendar,
      }).format(date);
    } catch (err) {
      logger.error`Can't format docs lastUpdatedAt date "${String(date)}"`;
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
        ? formatDate(
            i18n.currentLocale,
            new Date(lastUpdate.lastUpdatedAt * 1000),
            i18n.localeConfigs[i18n.currentLocale]!.calendar,
          )
        : undefined,
    },
    content,
  };
}

async function readLastUpdateData(
  filePath: string,
  options: LastUpdateOptions,
  lastUpdateFrontMatter: FileChange | undefined,
): Promise<LastUpdateData> {
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
    const fileLastUpdateData =
      process.env.NODE_ENV === 'production'
        ? await getFileLastUpdate(filePath)
        : {
          author: 'Author',
          timestamp: (new Date()).getTime()/1000,
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

export async function generateBlogPosts(
  contentPaths: BlogContentPaths,
  context: LoadContext,
  options: PluginOptions,
): Promise<BlogPost[]> {
  const { include, exclude } = options;

  if (!(await fs.pathExists(contentPaths.contentPath))) {
    return [];
  }

  const blogSourceFiles = await Globby(include, {
    cwd: contentPaths.contentPath,
    ignore: exclude,
  });

  const authorsMap = await getAuthorsMap({
    contentPaths,
    authorsMapPath: options.authorsMapPath,
  });

  async function doProcessBlogSourceFile(blogSourceFile: string) {
    try {
      return await processBlogSourceFile(
        blogSourceFile,
        contentPaths,
        context,
        options,
        authorsMap,
      );
    } catch (err) {
      throw new Error(
        `Processing of blog source file path=${blogSourceFile} failed.`,
        { cause: err as Error },
      );
    }
  }

  const blogPosts = (
    await Promise.all(blogSourceFiles.map(doProcessBlogSourceFile))
  ).filter(Boolean) as BlogPost[];

  blogPosts.sort(
    // (a, b) => b.metadata.date.getTime() - a.metadata.date.getTime(),
    blogDateComparator
  );

  if (options.sortPosts === 'ascending') {
    return blogPosts.reverse();
  }
  // blogPosts.forEach((post) => logger.info(post.metadata.frontMatter.event_date))

  return blogPosts;
}

export type LinkifyParams = {
  filePath: string;
  fileString: string;
} & Pick<
  BlogMarkdownLoaderOptions,
  'sourceToPermalink' | 'siteDir' | 'contentPaths' | 'onBrokenMarkdownLink'
>;

export function linkify({
  filePath,
  contentPaths,
  fileString,
  siteDir,
  sourceToPermalink,
  onBrokenMarkdownLink,
}: LinkifyParams): string {
  const { newContent, brokenMarkdownLinks } = replaceMarkdownLinks({
    siteDir,
    fileString,
    filePath,
    contentPaths,
    sourceToPermalink,
  });

  brokenMarkdownLinks.forEach((l) => onBrokenMarkdownLink(l));

  return newContent;
}
