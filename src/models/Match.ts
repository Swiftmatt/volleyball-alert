import * as DateFns from 'date-fns';

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


export function makeLeagueMatchMessage(leagueMatch: LeagueMatch) {
    const {
        court,
        datetime,
        league,
        opponentTeam,
        team,
    } = leagueMatch;

    const date = DateFns.format(
        datetime,
        'MMMM do, yyyy',
    );
    const time = DateFns.format(
        datetime,
        'h:mm a',
    );
    const teamRecord = team.record.join('-');
    const opponentTeamRecord = opponentTeam.record.join('-');

    const message = `🏐 Volleyball Alert 🏐
${time} - Court ${court}

${team.name}
${teamRecord}

${league.name}
${league.venue.name}
${date}

${opponentTeam.name}
${opponentTeamRecord}

${league.venue.url}`;

    return message;
}
