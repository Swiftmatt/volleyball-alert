import type { Merge } from 'ts-essentials';

import type { Contact } from 'src/models/Contact';
import type { LeagueConfig } from 'src/models/League';


export type Team = {
    members: Contact[];
    name: string;
    record: [number, number];
    url: string;
};

export type TeamParsed = Pick<Team, 'name' | 'record'>;

export type TeamConfig = Merge<
    Pick<Team, 'members' | 'name'>,
    {
        league: LeagueConfig;
    }
>;
