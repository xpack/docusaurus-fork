/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import clsx from 'clsx';
// import {ThemeClassNames} from '@xpack/docusaurus-theme-common';
import {ThemeClassNames, useBlogPost} from '@xpack/docusaurus-theme-common/internal';
import EditThisPage from '@theme/EditThisPage';
import TagsListInline from '@theme/TagsListInline';
import AuthorsListInline from '@theme/AuthorsListInline';
import ReadMoreLink from '@theme/BlogPostItem/Footer/ReadMoreLink';

import styles from './styles.module.css';

import LastUpdated from '@theme/LastUpdated';

export default function BlogPostItemFooter(): JSX.Element | null {
  const {metadata, isBlogPostPage} = useBlogPost();
  const {tags, title, editUrl, hasTruncateMarker} = metadata;

  // A post is truncated if it's in the "list view" and it has a truncate marker
  const truncatedPost = !isBlogPostPage && hasTruncateMarker;

  const tagsExists = tags.length > 0;

  const renderFooter = tagsExists || truncatedPost || editUrl;

  if (!renderFooter) {
    return null;
  }

  const lastUpdatedAt = metadata.lastUpdatedAt;
  const lastUpdatedBy = metadata.lastUpdatedBy
  const formattedLastUpdatedAt = metadata.formattedLastUpdatedAt;

  return (
    <footer
      className={clsx(
        'row docusaurus-mt-lg',
        isBlogPostPage && styles.blogPostFooterDetailsFull,
      )}>
      {tagsExists && (
        <div className={clsx('col', {'col--9': truncatedPost})}>
          <TagsListInline tags={tags} />
        </div>
      )}
      {!truncatedPost && tagsExists && (
        <div className={clsx('col', {'col--9': truncatedPost})}>
          <AuthorsListInline authors={authors} />
        </div>
      )}

      <div className={clsx(ThemeClassNames.docs.docFooterEditMetaRow, 'row')}>
        {isBlogPostPage && editUrl && (
          <div className="col margin-top--sm">
            <EditThisPage editUrl={editUrl} />
          </div>
        )}

        <div className={clsx('col', styles.lastUpdated)}>
          {(lastUpdatedAt || lastUpdatedBy) && (!truncatedPost) && (
            <LastUpdated
              lastUpdatedAt={lastUpdatedAt}
              formattedLastUpdatedAt={formattedLastUpdatedAt}
              lastUpdatedBy={lastUpdatedBy}
            />
          )}
        </div>
      </div>

      {truncatedPost && (
        <div
          className={clsx('col text--right', {
            'col--3': tagsExists,
          })}>
          <ReadMoreLink blogPostTitle={title} to={metadata.permalink} />
        </div>
      )}
    </footer>
  );
}
