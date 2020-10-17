import type { StrictOmit, Merge } from 'ts-essentials';

import type { Contact } from 'src/lib/Mail/Contact';


export type MatchTeam = {
    name: string;
    record: [number, number];
};

export type Match = {
    court: number;
    datetime: Date;
    teams: [MatchTeam, MatchTeam];
};

export type LeagueMatch = Merge<
    StrictOmit<Match, 'teams'>,
    {
        league: {
            id: string;
            name: string;
            venue: {
                name: string;
                url: string;
            };
        };
        opponentTeam: MatchTeam;
        team: Merge<MatchTeam, {
            members: Contact[];
        }>;
    }
>;
