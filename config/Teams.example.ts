import { Day } from 'src/lib/Date';
import type { Team } from 'src/lib/Parser/Team';
import { Venue } from 'src/lib/Parser/Venue';
import {
    People,
    peopleContactMap,
} from 'config/Contacts.example';


export const teams: Team[] = [
    {
        league: {
            dayOfTheWeek: Day.Wednesday,
            id: '100',
            venue: Venue.ToledoSportAndSocialClub,
        },
        members: [
            peopleContactMap[People.VolleyballPlayer_EmailExample],
            peopleContactMap[People.VolleyballPlayer_PhoneExample],
        ],
        name: '6 Pack',
    },
];

