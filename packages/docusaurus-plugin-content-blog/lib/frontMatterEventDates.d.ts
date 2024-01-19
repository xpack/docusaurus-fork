export type ParsedEventDates = {
    eventDateISO?: string;
    eventEndDateISO?: string;
    eventDateFormatted?: string;
    eventIntervalFormatted?: string;
};
export declare const parseFrontMatterEventDates: (frontMatter: any, date: Date) => ParsedEventDates;
