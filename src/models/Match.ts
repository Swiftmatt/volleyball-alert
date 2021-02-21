import type { Merge } from 'ts-essentials';

import type { League } from 'src/models/League';
import type { Team, TeamLite } from 'src/models/Team';


export type Match = {
    court: number;
    datetime: Date;
    league: League;
    opponentTeam: TeamLite;
    team: Team;
};

export type MatchLite = Merge<
    Pick<Match, 'court' | 'datetime'>,
    {
        teams: [TeamLite, TeamLite];
    }
>;
