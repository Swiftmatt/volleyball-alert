import type { Day } from 'src/lib/Parser/Date';
import type { Venue } from 'src/lib/Parser/Venue';


export type League = {
    day: Day;
    id: string;
    team: {
        members: unknown[];
        name: string;
    };
    venue: Venue;
};
