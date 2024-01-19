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

import logger from '@docusaurus/logger'

// If month/day are not present, extend with defaults.
// It does not accept negative values.
const makeDateISO = ((eventDate: string): string => {
    // logger.info(eventDate)
    let newDate: Date
    if (eventDate.match(/[0-9][0-9]*-[0-9][0-9]*-[0-9][0-9]*/))
        newDate = new Date(eventDate);
    else if (eventDate.match(/[0-9][0-9]*-[0-9][0-9]*/))
        newDate = new Date(eventDate + '-15'); // mid month
    else if (eventDate.match(/[0-9][0-9]*/))
        newDate = new Date(eventDate + '-07-01'); // mid year
    else {
        // Last resort, parse as valid.
        newDate = new Date(eventDate);
    }

    // For weird reasons, 2 digit years are considered relative to epoch.
    // To allow dates in the antiquity, set explicitly.
    const year: number = parseInt(eventDate.replace(/-.*/, ''))
    newDate.setFullYear(year)

    return newDate.toISOString()
})

const getMonthLocalNames = (() => {
    const format = new Intl
      .DateTimeFormat('default', { month: 'long' }).format;
    const monthNames = [ '???' ]
    const now = new Date()
    for (let month = 0; month < 12; month++) {
        now.setMonth(month);
        const name = format(now);
        monthNames.push( name.charAt(0).toUpperCase() + name.slice(1));
    }
    return monthNames;
  })

const monthNames = getMonthLocalNames();

const formatDate = ((eventDate: string): string => {
    const eventDateArray: number[] = eventDate.split('-').map((str) => Number(str))
    if (eventDateArray.length === 3) {
        const monthNumber: number = eventDateArray[1] || 0;
        return `${eventDateArray[2]} ${monthNames[monthNumber]} ${eventDateArray[0]}`;
    } else if (eventDateArray.length === 2) {
        const monthNumber: number = eventDateArray[1] || 0;
        return `${monthNames[monthNumber]} ${eventDateArray[0]}`;
    } else if (eventDateArray.length === 1) {
        return `${eventDateArray[0]}`;
    } else {
        return eventDate;
    }
})

const formatEventInterval = ((eventDate: string, eventEndDate: string): string => {
    const eventDateArray = eventDate.split('-').map((str) => parseInt(str))
    if (eventEndDate === undefined) {
        return formatDate(eventDate);
    } else {
        const eventEndDateArray: number[] = eventEndDate.split('-').map((str) => parseInt(str))

        if (eventDateArray[0] === eventEndDateArray[0]) {
            // Same year.
            let interval: string = ''
            if (eventDateArray.length === 3 && eventEndDateArray.length === 3 && eventDateArray[1] === eventEndDateArray[1]) {
                // Same month, format as '1 - 4 Noiembrie 1993'.
                const monthNumber: number = eventDateArray[1] || 0;
                interval = `${eventDateArray[2]} - ${eventEndDateArray[2]} ${monthNames[monthNumber]}`;
            } else if (eventDateArray.length >= 2 && eventEndDateArray.length >= 2) {
                // Different months, format as 'Octombrie - Noiembrie 1993'.
                if (eventDateArray.length === 3) {
                    interval += ` ${eventDateArray[2]}`
                }
                let monthNumber: number = eventDateArray[1] || 0;
                interval += ` ${monthNames[monthNumber]}`
                interval += ` -`
                if (eventEndDateArray.length === 3) {
                    interval += ` ${eventEndDateArray[2]}`
                }
                monthNumber = eventEndDateArray[1] || 0;
                interval += ` ${monthNames[monthNumber]}`
            } else {
                // One has no month.
                return `${formatDate(eventDate)} - ${formatDate(eventEndDate)}`;
            }
            return `${interval} ${eventDateArray[0]}`
        } else {
            // Different years.
            return `${formatDate(eventDate)} - ${formatDate(eventEndDate)}`;
        }
    }
})

// ----------------------------------------------------------------------------

export type ParsedEventDates = {
    eventDateISO?: string,
    eventEndDateISO?: string,
    eventDateFormatted?: string,
    eventIntervalFormatted?: string
}

export const parseFrontMatterEventDates = (frontMatter: any, date: Date): ParsedEventDates => {

    const result: ParsedEventDates = {}

    if (frontMatter.event_date) {
        result.eventDateISO = makeDateISO(frontMatter.event_date)
        result.eventDateFormatted = formatDate(frontMatter.event_date)

        if (frontMatter.event_end_date) {
            result.eventEndDateISO = makeDateISO(frontMatter.event_end_date)
            result.eventIntervalFormatted = formatEventInterval(
                frontMatter.event_date, frontMatter.event_end_date)
        } else {
            result.eventEndDateISO = result.eventDateISO
            result.eventIntervalFormatted = result.eventDateFormatted
        }
    }
    // logger.info(result)
    return result;
}

