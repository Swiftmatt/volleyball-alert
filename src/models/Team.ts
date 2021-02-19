import type { Merge, StrictOmit } from 'ts-essentials';

import type { Contact } from 'src/models/Contact';
import type { LeagueConfig } from 'src/models/League';


export type Team = {
    members: Contact[];
    name: string;
    record: [number, number];
    url: string;
};

export type TeamLite = StrictOmit<Team, 'members' | 'url'>;

export type TeamConfig = Merge<
    StrictOmit<Team, 'record' | 'url'>,
    {
        league: LeagueConfig;
    }
>;
