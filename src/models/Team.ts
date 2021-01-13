import type { Contact } from 'src/lib/Mail/Contact';
import type { Day } from 'src/lib/Date';
import type { Venue } from 'src/models/Venue';


export type Team = {
    league: {
        dayOfTheWeek: Day;
        id: string;
        venue: Venue;
    };
    members: Contact[];
    name: string;
};
