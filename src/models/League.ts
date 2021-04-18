import type { Merge } from 'ts-essentials';

import type { DayOfTheWeek } from 'src/lib/Date';
import type { Venue, VenueConfig } from 'src/models/Venue';


export type League = {
    id: string;
    name: string;
    venue: Venue;
};

export type LeagueConfig = Merge<
    Pick<League, 'id'>,
    {
        dayOfTheWeek: DayOfTheWeek;
        venue: VenueConfig;
    }
>;
