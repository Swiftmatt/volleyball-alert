import * as DateFns from 'date-fns';


// Representative value for type: DateFns.Day
export enum DayOfTheWeekNumber {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
}

export enum DayOfTheWeek {
    Sunday = 'Sunday',
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
}


export const DAY_OF_THE_WEEK_NUMBER_LABEL_MAP: Record<DateFns.Day, DayOfTheWeek> = {
    [DayOfTheWeekNumber.Sunday]: DayOfTheWeek.Sunday,
    [DayOfTheWeekNumber.Monday]: DayOfTheWeek.Monday,
    [DayOfTheWeekNumber.Tuesday]: DayOfTheWeek.Tuesday,
    [DayOfTheWeekNumber.Wednesday]: DayOfTheWeek.Wednesday,
    [DayOfTheWeekNumber.Thursday]: DayOfTheWeek.Thursday,
    [DayOfTheWeekNumber.Friday]: DayOfTheWeek.Friday,
    [DayOfTheWeekNumber.Saturday]: DayOfTheWeek.Saturday,
} as const;


function isDayOfTheWeekNumber(num: number): num is DateFns.Day {
    return !Number.isNaN(num) && Object.values(DayOfTheWeekNumber).includes(num);
}

export function getDayOfTheWeekFromDate(date: Date): DayOfTheWeek {
    const dayOfTheWeekNumber = date.getDay();
    if ( !isDayOfTheWeekNumber(dayOfTheWeekNumber) ) {
        throw new Error('Impossible: Value from `getDay` is not a day of the week number.');
    }
    return DAY_OF_THE_WEEK_NUMBER_LABEL_MAP[dayOfTheWeekNumber];
}
