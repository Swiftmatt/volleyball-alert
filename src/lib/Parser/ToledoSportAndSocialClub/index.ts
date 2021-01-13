import * as DateFns from 'date-fns';
import { JSDOM } from 'jsdom';
import type { StatusCodeError } from 'request-promise/errors';
import { URL } from 'url';

import type {
    LeagueMatch,
    Match,
    MatchTeam,
} from 'src/models/Match';
import type { Team } from 'src/models/Team';
import { venueInfoMap } from 'src/models/Venue';
import {
    isNil,
    isTwoNumberArray,
} from 'src/lib/Util';


function createToledoSportAndSocialClubUrl(team: Team): string {
    const {
        league,
        name,
    } = team;
    const {
        id,
        venue,
    } = league;
    const { baseUrl } = venueInfoMap[venue];

    const teamName = name.split(' ').join('+');

    const url = new URL(`${baseUrl}?ID=${id}&TeamName=${teamName}`);
    return url.toString();
}

function getLeagueNameFromBody(body: HTMLElement): LeagueMatch['league']['name'] {
    const selector = '#ctl00_ContentPlaceHolder1_ScheduleHolder > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > h1';

    const leagueRaw = body.querySelector(selector)?.textContent?.trim();
    if (isNil(leagueRaw)) {
        throw new Error('Unable to query leagueName from DOM Body.');
    }

    const leagueRegex = /.+:\s+(?<league>.+)\s+@.+/u;
    const leagueRegexMatches = leagueRegex.exec(leagueRaw);

    const league = leagueRegexMatches?.groups?.league;
    if (isNil(league)) {
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
            datetimeRaw,
            scheduledTeams,
            location,
        ] = cells;

        const court = getCourtFromCell(location);
        const datetime = getTimeFromCell(datetimeRaw);
        const teams = getTeamsFromCell(scheduledTeams);

        matches.push({
            court,
            datetime,
            teams,
        });
        return matches;
    }, []);

    return matches;
}

function getCourtFromCell(location: string): LeagueMatch['court'] {
    const courtRegex = /SRC #(?<court>\d)/u;
    const courtRegexMatches = courtRegex.exec(location.trim());

    const court = courtRegexMatches?.groups?.court;
    if (isNil(court)) {
        throw new Error(`Unable to parse Court from location. (${location})`);
    }

    return Number(court);
}

function getTeamsFromCell(scheduledTeams: string): [MatchTeam, MatchTeam] {
    const teamsRegex = /\s+(?<awayTeam>.+)\s+\((?<awayTeamRecordRaw>\d+-\d)\)\s+@\s+(?<homeTeam>.+)\s+\((?<homeTeamRecordRaw>\d+-\d)\)/mu;
    const teamsRegexMatches = teamsRegex.exec(scheduledTeams);

    const teams = teamsRegexMatches?.groups;
    if (
        isNil(teams)
        || isNil(teams.awayTeam)
        || isNil(teams.awayTeamRecordRaw)
        || isNil(teams.homeTeam)
        || isNil(teams.homeTeamRecordRaw)
    ) {
        throw new Error(`Unable to parse scheduled teams nor records. (${scheduledTeams})`);
    }

    const {
        awayTeam,
        awayTeamRecordRaw,
        homeTeam,
        homeTeamRecordRaw,
    } = teams;

    const [
        awayTeamRecord,
        homeTeamRecord,
    ] = [
        awayTeamRecordRaw,
        homeTeamRecordRaw,
    ].map(record => record.split('-').map( score => Number(score) ) );

    if (
        !isTwoNumberArray(awayTeamRecord)
        || !isTwoNumberArray(homeTeamRecord)
    ) {
        throw new Error(`Unable to parse team records correctly. ('${awayTeamRecordRaw}', '${homeTeamRecordRaw}')`);
    }

    return [
        {
            name: awayTeam,
            record: awayTeamRecord,
        },
        {
            name: homeTeam,
            record: homeTeamRecord,
        },
    ];
}

function getTimeFromCell(datetimeRaw: string): LeagueMatch['datetime'] {
    const datetimeWithoutSpacing = datetimeRaw.replace(/\s+/gu, '');
    const parsedDatetime = DateFns.parse(
        datetimeWithoutSpacing,
        'M/d/yyyy,h:mma',
        new Date(),
    );
    return parsedDatetime;
}

// eslint-disable-next-line max-lines-per-function,max-statements
export async function parseToledoSportAndSocialClubLeague(team: Team): Promise<LeagueMatch[]> {
    const {
        league,
        members,
        name: teamName,
    } = team;
    const {
        id: leagueId,
        venue,
    } = league;

    const url = createToledoSportAndSocialClubUrl(team);
    const dom = await JSDOM.fromURL(url).catch((err: StatusCodeError) => {
        const {
            response,
            statusCode,
        } = err;
        const statusMessage = response.statusMessage ?? '';

        const errorCodeMessage = [
            statusCode,
            statusMessage,
        ].join(': ');

        console.error(errorCodeMessage);
        throw new Error(`An error occurred while trying to fetch page content from URL. (${url})`);
    });

    const { body } = dom
        .window
        .document;

    const leagueName = getLeagueNameFromBody(body);
    const matches = getMatchesFromBody(body);

    const venueName = venueInfoMap[venue].name;

    const leagueMatches = matches.map(match => {
        const {
            court,
            datetime,
            teams,
        } = match;

        const team = teams.find(team => team.name === teamName);
        const opponentTeam = teams.find(team => team.name !== teamName);

        if ( isNil(team) ) {
            throw new Error(`Unable to find matching team with the provided teamName. (${teamName})`);
        }

        if ( isNil(opponentTeam) ) {
            throw new Error(`Unable to find opposing team with the provided teamName. (${teamName})`);
        }

        return {
            court,
            datetime,
            league: {
                id: leagueId,
                name: leagueName,
                venue: {
                    name: venueName,
                    url,
                },
            },
            opponentTeam,
            team: {
                ...team,
                members,
            },
        };
    });

    return leagueMatches;
}
