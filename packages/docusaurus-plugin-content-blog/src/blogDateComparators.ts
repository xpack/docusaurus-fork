/*
 * This file is part of the Cronica-IT project (https://github.com/cronica-it).
 * Copyright (c) 2023 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/license/mit/.
 */

import type { BlogPost } from '@xpack/docusaurus-plugin-content-blog';
import logger from '@docusaurus/logger'

// Compare the number of milliseconds, with the most recent posts on the top.
const compareDates = ((aDate: Date, bDate: Date): number => {
    return bDate.getTime() - aDate.getTime();
})

export const blogDateComparator = ((a: BlogPost, b: BlogPost): number => {
    // If event dates are available, prefer them over post creation dates.
    if (a.metadata.eventDateISO || b.metadata.eventDateISO) {
        let aDate: Date = a.metadata.eventDateISO ? new Date(a.metadata.eventDateISO) : a.metadata.date;
        let bDate: Date = b.metadata.eventDateISO ? new Date(b.metadata.eventDateISO) : b.metadata.date;
        // logger.info(aDate);
        // logger.info(bDate);

        let value: number = compareDates(aDate, bDate);
        // logger.info(value)
        if (value !== 0) {
            return value
        }

        // For identical event dates, if event end dates are available,
        // use them as secondary criteria.
        if (a.metadata.eventEndDateISO || b.metadata.eventEndDateISO) {
            if (a.metadata.eventEndDateISO) {
                aDate = new Date(a.metadata.eventEndDateISO);
            }
            if (b.metadata.eventEndDateISO) {
                bDate = new Date(b.metadata.eventEndDateISO);
            }

            value = compareDates(aDate, bDate)
            if (value !== 0) {
                return value
            }
        }
        // If all are the same, fall through and compare posts creation dates.
    }

    return compareDates(a.metadata.date, b.metadata.date)
})

export const blogDateNewestComparator = ((a: BlogPost, b: BlogPost): number => {
    if (a.metadata.lastUpdatedAt || b.metadata.lastUpdatedAt) {
        const aDate = a.metadata.lastUpdatedAt ? new Date(a.metadata.lastUpdatedAt * 1000) : a.metadata.date
        const bDate = b.metadata.lastUpdatedAt ? new Date(b.metadata.lastUpdatedAt * 1000) : b.metadata.date
        
        let value: number = compareDates(aDate, bDate)
        if (value !== 0) {
            return value
        }
        // If they are the same, fall through and compare posts creation dates.
    }

    return compareDates(a.metadata.date, b.metadata.date)
})
