// eslint-disable-next-line @typescript-eslint/no-magic-numbers
type DayOfTheWeekNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export enum Day {
    Sunday = 'Sunday',
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
}

export const dayOfTheWeekNumberMap: Record<DayOfTheWeekNumber, Day> = {
    0: Day.Sunday,
    1: Day.Monday,
    2: Day.Tuesday,
    3: Day.Wednesday,
    4: Day.Thursday,
    5: Day.Friday,
    6: Day.Saturday,
};

export function getDayOfTheWeekFromDate(date: Date): Day {
    const dayOfTheWeekNumber = date.getDay() as DayOfTheWeekNumber;
    return dayOfTheWeekNumberMap[dayOfTheWeekNumber];
}
