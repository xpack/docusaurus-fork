/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import clsx from 'clsx';
import {
  PageMetadata,
  HtmlClassNameProvider,
  // ThemeClassNames,
  // translateTagsPageTitle,
} from '@xpack/docusaurus-theme-common';
import BlogLayout from '@theme/BlogLayout';
import AuthorsListByLetter from '@theme/AuthorsListByLetter';
import type {Props} from '@theme/BlogAuthorsListPage';
import SearchMetadata from '@theme/SearchMetadata';
import Heading from '@theme/Heading';
import { translateAuthorsPageTitle } from '@site/src/local-theme-common/utils/authorsUtils';
import logger from '@docusaurus/logger';
import { ThemeClassNames } from '@site/src/local-theme-common/utils/ThemeClassNames';

export default function BlogAuthorsListPage({authors, sidebar}: Props): JSX.Element {
  const title: string = translateAuthorsPageTitle();
  // logger.info(`BlogAuthorsListPage ${title} ${authors.length}`)
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogAuthorsListPage,
      )}>
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_authors_list" />
      <BlogLayout sidebar={sidebar}>
        <Heading as="h1">{title}</Heading>
        <AuthorsListByLetter authors={authors} />
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
