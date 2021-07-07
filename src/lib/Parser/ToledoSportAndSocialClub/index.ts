import * as DateFns from 'date-fns';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

import { onRejectJsdomFromUrl } from 'src/lib/Parser/error';
import {
    isNil,
    isTwoNumberArray,
} from 'src/lib/Util';
import type { League } from 'src/models/League';
import type { Match, MatchParsed } from 'src/models/Match';
import type { TeamConfig, TeamParsed } from 'src/models/Team';
import { getVenueInfoFromVenueName } from 'src/models/Venue';


function createToledoSportAndSocialClubUrl(teamConfig: TeamConfig): string {
    const venue = getVenueInfoFromVenueName(teamConfig.league.venue.name);

    const { baseUrl } = venue;
    const { id } = teamConfig.league;
    const teamName = teamConfig.name.split(' ').join('+');

    const url = new URL(`${baseUrl}?ID=${id}&TeamName=${teamName}`);
    return url.toString();
}

function getLeagueNameFromBody(body: HTMLElement): League['name'] {
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

function getMatchesFromBody(body: HTMLElement): MatchParsed[] {
    const selector = '#ctl00_ContentPlaceHolder1_gvSchedule > tbody > tr';
    const tableRowElements = body.querySelectorAll(selector);
    const [
        , // headerRow,
        ...rows
    ] = Array.from(tableRowElements);

    const matches = rows.reduce<MatchParsed[]>((matches, currentRow) => {
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

function getCourtFromCell(location: string): MatchParsed['court'] {
    const courtRegex = /SRC #(?<court>\d)/u;
    const courtRegexMatches = courtRegex.exec(location.trim());

    const court = courtRegexMatches?.groups?.court;
    if (isNil(court)) {
        throw new Error(`Unable to parse Court from location. (${location})`);
    }

    return Number(court);
}

function getTeamsFromCell(scheduledTeams: string): [TeamParsed, TeamParsed] {
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
    ].map(record => record.split('-')
        .map( score => Number(score) ) );

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

function getTimeFromCell(datetimeRaw: string): MatchParsed['datetime'] {
    const datetimeWithoutSpacing = datetimeRaw.replace(/\s+/gu, '');
    const parsedDatetime = DateFns.parse(
        datetimeWithoutSpacing,
        'M/d/yyyy,h:mma',
        new Date(),
    );
    return parsedDatetime;
}

// eslint-disable-next-line max-lines-per-function,max-statements
export async function parseToledoSportAndSocialClubLeague(teamConfig: TeamConfig): Promise<Match[]> {
    const url = createToledoSportAndSocialClubUrl(teamConfig);
    const dom = await JSDOM.fromURL(url).catch(onRejectJsdomFromUrl);

    const { body } = dom
        .window
        .document;

    const leagueName = getLeagueNameFromBody(body);
    const matchesParsed = getMatchesFromBody(body);

    const venue = getVenueInfoFromVenueName(teamConfig.league.venue.name);

    const matches = matchesParsed.map<Match>(matchParsed => {
        const {
            court,
            datetime,
            teams,
        } = matchParsed;

        const team = teams.find(team => team.name === teamConfig.name);
        const opponentTeam = teams.find(team => team.name !== teamConfig.name);

        if ( isNil(team) ) {
            throw new Error(`Unable to find matching team with the provided teamName. (${teamConfig.name})`);
        }

        if ( isNil(opponentTeam) ) {
            throw new Error(`Unable to find opposing team with the provided teamName. (${teamConfig.name})`);
        }

        const match: Match = {
            court,
            datetime,
            league: {
                id: teamConfig.league.id,
                name: leagueName,
                venue,
            },
            opponentTeam,
            team: {
                ...teamConfig,
                ...team,
                url,
            },
        };

        return match;
    });

    return matches;
}
