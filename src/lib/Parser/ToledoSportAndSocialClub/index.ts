import * as DateFns from 'date-fns';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

import type { League } from 'src/lib/Parser/League';
import { venueInfoMap } from 'src/lib/Parser/Venue';
import { isNil } from 'src/lib/Util';


type MatchInfo = {
    court: number;
    dateTime: string;
    league: {
        id: string;
        name: string;
        url: string;
    };
    opponentTeam: {
        name: string;
        standing: string;
    };
    team: {
        name: string;
        standing: string;
    };
    venue: {
        name: string;
    };
};

type Match = Pick<MatchInfo,
    'court'
    | 'dateTime'
    > & {
        teams: Array<{
            name: string;
            standing: string;
        }>;
    };


function createToledoSportAndSocialClubUrl(league: League): string {
    const {
        id,
        team,
        venue,
    } = league;
    const { name } = team;
    const { baseUrl } = venueInfoMap[venue];

    const teamName = name.split(' ').join('+');
    const url = new URL(`${baseUrl}?ID=${id}&TeamName=${teamName}`);

    return url.toString();
}

function getLeagueNameFromBody(body: HTMLElement): MatchInfo['league']['name'] {
    const selector = '#ctl00_ContentPlaceHolder1_ScheduleHolder > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > h1';

    let leagueRaw = null;
    try {
        leagueRaw = body.querySelector(selector)?.textContent?.trim();
        if (isNil(leagueRaw)) {
            // eslint-disable-next-line no-throw-literal
            throw new Error();
        }
    } catch {
        console.error(leagueRaw);
        throw new Error('Unable to query leagueName from DOM Body.');
    }

    const leagueRegex = /.+:\s+(?<league>.+)\s+@.+/u;
    const leagueRegexMatches = leagueRegex.exec(leagueRaw);

    let league = null;
    try {
        league = leagueRegexMatches?.groups?.court;
        if (isNil(league)) {
            // eslint-disable-next-line no-throw-literal
            throw new Error();
        }
    } catch {
        throw new Error(`Unable to parse League from header text. (${leagueRaw})`);
    }

    return league;
}

function getMatchesFromBody(body: HTMLElement): Match[] {
    const selector = '#ctl00_ContentPlaceHolder1_gvSchedule > tbody > tr';
    const tableRowElements = body.querySelectorAll(selector);
    const [
        , // headerRow,
        ...rows
    ] = Array.from(tableRowElements);

    const matches = rows.reduce<Match[]>((matches, currentRow) => {
        const cells = Array.from(currentRow.children).map<string>(cell => {
            if (isNil(cell.textContent)) {
                throw new Error(`The current row's cell did not have textContent. (${cell.innerHTML})`);
            }
            return cell.textContent;
        });

        const [
            dateTimeRaw,
            scheduledTeams,
            location,
        ] = cells;

        const court = getCourtFromCell(location);
        const dateTime = getTimeFromCell(dateTimeRaw);
        const teams = getTeamsFromCell(scheduledTeams);

        matches.push({
            court,
            dateTime,
            teams,
        });
        return matches;
    }, []);

    return matches;
}

function getCourtFromCell(location: string): MatchInfo['court'] {
    const courtRegex = /SRC #(?<court>\d)/u;
    const courtRegexMatches = courtRegex.exec(location.trim());

    let court = null;
    try {
        court = courtRegexMatches?.groups?.court;
        if (isNil(court)) {
            // eslint-disable-next-line no-throw-literal
            throw new Error();
        }
    } catch {
        throw new Error(`Unable to parse Court from location. (${location})`);
    }

    return Number(court);
}

function getTeamsFromCell(scheduledTeams: string): Match['teams'] {
    const teamsRegex = /\s+(?<awayTeam>.+)\s+(?<awayTeamStanding>\(\d+-\d\))\s+@\s+(?<homeTeam>.+)\s+(?<homeTeamStanding>\(\d+-\d\))/mu;
    const teamsRegexMatches = teamsRegex.exec(scheduledTeams);

    let teams = null;
    try {
        teams = teamsRegexMatches?.groups;
        if (
            isNil(teams)
            || isNil(teams.awayTeam)
            || isNil(teams.awayTeamStanding)
            || isNil(teams.homeTeam)
            || isNil(teams.homeTeamStanding)
        ) {
            // eslint-disable-next-line no-throw-literal
            throw new Error();
        }
    } catch {
        throw new Error(`Unable to parse scheduled teams nor standings. (${scheduledTeams})`);
    }

    const {
        awayTeam,
        awayTeamStanding,
        homeTeam,
        homeTeamStanding,
    } = teams;

    return [
        {
            name: awayTeam,
            standing: awayTeamStanding,
        },
        {
            name: homeTeam,
            standing: homeTeamStanding,
        },
    ];
}

function getTimeFromCell(dateTime: string): MatchInfo['dateTime'] {
    return DateFns.format(
        new Date(dateTime.trim()),
        'M/d/yyyy, h:mm a',
    );
}

// eslint-disable-next-line max-lines-per-function,max-statements
export async function parseToledoSportAndSocialClubLeague(league: League): Promise<MatchInfo[]> {
    const today = new Date();
    const {
        id: leagueId,
        team,
        venue,
    } = league;

    const {
        name: teamName,
    } = team;

    const url = createToledoSportAndSocialClubUrl(league).toString();
    const dom = await JSDOM.fromURL(url);

    const { body } = dom
        .window
        .document;

    const leagueName = getLeagueNameFromBody(body);
    const matches = getMatchesFromBody(body);

    const venueName = venueInfoMap[venue].name;

    const leagueMatches = matches.map(match => {
        const {
            court,
            dateTime,
        } = match;

        const team = match.teams.find(team => team.name === teamName);
        const opponentTeam = match.teams.find(team => team.name !== teamName);

        if ( isNil(team) ) {
            throw new Error(`Unable to find matching team with the provided teamName. (${teamName})`);
        }

        if ( isNil(opponentTeam) ) {
            throw new Error(`Unable to find opposing team with the provided teamName. (${teamName})`);
        }

        return {
            court,
            dateTime,
            league: {
                id: leagueId,
                name: leagueName,
                url,
            },
            opponentTeam,
            team,
            venue: {
                name: venueName,
            },
        };
    });

    const filtered = leagueMatches.filter(leagueMatch => DateFns.isSameDay(
        new Date(today),
        new Date(leagueMatch.dateTime),
    ));

    return filtered;
}
