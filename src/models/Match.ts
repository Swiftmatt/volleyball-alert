import type { Merge } from 'ts-essentials';

import type { League } from 'src/models/League';
import type { Team, TeamParsed } from 'src/models/Team';


export type Match = {
    court: number;
    datetime: Date;
    league: League;
    opponentTeam: TeamParsed;
    team: Team;
};

export type MatchParsed = Merge<
    Pick<Match, 'court' | 'datetime'>,
    {
        teams: [TeamParsed, TeamParsed];
    }
>;
