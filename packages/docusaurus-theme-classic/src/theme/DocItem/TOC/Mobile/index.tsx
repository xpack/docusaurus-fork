/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@xpack/docusaurus-theme-common';
import {useDoc} from '@xpack/docusaurus-theme-common/internal';

import TOCCollapsible from '@theme/TOCCollapsible';

import styles from './styles.module.css';

export default function DocItemTOCMobile(): JSX.Element {
  const {toc, frontMatter} = useDoc();
  return (
    <TOCCollapsible
      toc={toc}
      minHeadingLevel={frontMatter.toc_min_heading_level}
      maxHeadingLevel={frontMatter.toc_max_heading_level}
      className={clsx(ThemeClassNames.docs.docTocMobile, styles.tocMobile)}
    />
  );
}
