import type { League } from 'src/models/League';
import type { Team, TeamParsed } from 'src/models/Team';


export type Match = {
    court: number;
    datetime: Date;
    league: League;
    opponentTeam: TeamParsed;
    team: Team;
};

export type MatchWithoutCalculatedDatetime = Pick<Match, 'court' | 'opponentTeam'> & {
    date: string;
    time: string;
};

export type MatchParsed = Pick<Match, 'court' | 'datetime' | 'opponentTeam'>;
