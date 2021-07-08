import * as DateFns from 'date-fns';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

import { getDomFromUrl } from 'src/lib/Parser';
import {
    getFirstValueAtXpath,
    getNodeAtXpath,
} from 'src/lib/Parser/xpath';
import {
    isNil,
    isTwoNumberArray,
} from 'src/lib/Util';
import { League } from 'src/models/League';
import {
    Match,
    MatchParsed,
} from 'src/models/Match';
import {
    TeamConfig,
    TeamParsed,
} from 'src/models/Team';
import {
    getVenueInfoFromVenueName,
    Venue,
} from 'src/models/Venue';


function createForestViewLanesUrl(teamConfig: TeamConfig, venue: Venue): string {
    const { baseUrl } = venue;
    const { id } = teamConfig.league;

    const url = new URL(`${baseUrl}/teaminfo/${id}`);
    return url.toString();
}

// eslint-disable-next-line max-lines-per-function
function getMatchesParsed(dom: JSDOM): MatchParsed[] {
    const teamName = getTeamName(
        dom,
        dom.window.document,
        '/html/body/div[1]/div[3]/div/div/div[3]',
    );
    const teamRecord = getTeamRecord(
        dom,
        dom.window.document,
        '/html/body/div[1]/div[3]/div/div/table/tbody/tr/td[2]/div[2]/table/tbody/tr/td[1]',
    );

    const team = {
        name: teamName,
        record: teamRecord,
    };

    const tableRows = [
        ...getNodeAtXpath(
            dom,
            '/html/body/div[1]/div[3]/div/div/table/tbody/tr/td[2]/div[4]/table/tbody/tr',
            dom.window.document,
        ),
    ];

    // Remove the first row as it's just the table header.
    tableRows.shift();

    // eslint-disable-next-line max-statements
    return tableRows.map(tableRow => {
        if ( isNil(tableRow) ) {
            throw new Error('A `tableRow` was null.');
        }

        const court = getCourt(dom, tableRow, 'td[3]');

        const date = getDate(dom, tableRow, 'td[1]');
        const time = getTime(dom, tableRow, 'td[2]');
        const datetime = getMatchDatetime(date, time);

        const opponentName = getOpponentName(dom, tableRow, 'td[4]/a[1]');
        const opponentRecord = getOpponentRecord(dom, tableRow, 'td[4]/span[1]');
        const opponentTeam = {
            name: opponentName,
            record: opponentRecord,
        };
        const teams = getTeams(team, opponentTeam);

        return {
            court,
            datetime,
            teams,
        };
    });
}

function getCourt(dom: JSDOM, contextNode: Node, xpath: string): MatchParsed['court'] {
    const court = getFirstValueAtXpath({
        contextNode,
        dom,
        xpath,
    });
    return Number(court);
}

function getDate(dom: JSDOM, contextNode: Node, xpath: string): string {
    return getFirstValueAtXpath({
        contextNode,
        dom,
        xpath,
    });
}

function getLeague(dom: JSDOM, teamConfig: TeamConfig, venue: Venue): League {
    const { league } = teamConfig;
    const { id } = league;

    const name = getLeagueName(dom);

    return {
        id,
        name,
        venue,
    };
}

function getLeagueName(dom: JSDOM): League['name'] {
    return getFirstValueAtXpath({
        dom,
        xpath: '/html/body/div[1]/div[3]/div/div/div[5]/table/tbody/tr/td[1]/div/a',
    });
}

function getMatchDatetime(date: string, time: string): MatchParsed['datetime'] {
    return DateFns.parse(
        `${date}_${time}`,
        'yyyy-MM-dd_ha',
        new Date(),
    );
}

function getMatches(matchesParsed: MatchParsed[], teamConfig: TeamConfig, league: League, url: string): Match[] {
    return matchesParsed.map(matchParsed => {
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

        return {
            court,
            datetime,
            league,
            opponentTeam,
            team: {
                ...teamConfig,
                ...team,
                url,
            },
        };
    });
}

function getOpponentName(dom: JSDOM, contextNode: Node, xpath: string): TeamParsed['name'] {
    return getFirstValueAtXpath({
        contextNode,
        dom,
        xpath,
    });
}

function getOpponentRecord(dom: JSDOM, contextNode: Node, xpath: string): TeamParsed['record'] {
    const opponentRecordRaw = getFirstValueAtXpath({
        contextNode,
        dom,
        xpath,
    });

    const recordRegex = /Current\s*Record:\s*(?<wins>\d+)-(?<loses>\d+)/gmu;
    const recordRegexMatches = recordRegex.exec(opponentRecordRaw);

    const opponentRecordGroups = recordRegexMatches?.groups;
    if (
        isNil(opponentRecordGroups)
        || isNil(opponentRecordGroups.wins)
        || isNil(opponentRecordGroups.loses)
    ) {
        throw new Error(`Unable to parse opponent's record. (${opponentRecordRaw})`);
    }

    const opponentRecord = [
        opponentRecordGroups.wins,
        opponentRecordGroups.loses,
    ].map(Number);

    if ( !isTwoNumberArray(opponentRecord) ) {
        throw new Error(`Unable to parse opponent's record correctly. (${opponentRecordRaw})`);
    }

    return opponentRecord;
}

function getTeamName(dom: JSDOM, contextNode: Node, xpath: string): TeamParsed['name'] {
    const nameRaw = getFirstValueAtXpath({
        contextNode,
        dom,
        xpath,
    });

    const nameRegex = /\s*Team: (?<teamName>.+)\s*/gmu;
    const nameMatches = nameRegex.exec(nameRaw);

    const teamNameGroups = nameMatches?.groups;
    if (
        isNil(teamNameGroups)
        || isNil(teamNameGroups.teamName)
    ) {
        throw new Error(`Unable to parse team name. (${nameRaw})`);
    }

    return teamNameGroups.teamName;
}

function getTeamRecord(dom: JSDOM, contextNode: Node, xpath: string): TeamParsed['record'] {
    const recordRaw = getFirstValueAtXpath({
        contextNode,
        dom,
        xpath,
    });

    const recordRegex = /Games:\s*(?<wins>\d+)\s*- \s*(?<loses>\d+)\s*\(\d+%\)/gmu;
    const recordMatches = recordRegex.exec(recordRaw);

    const teamRecordGroups = recordMatches?.groups;
    if (
        isNil(teamRecordGroups)
        || isNil(teamRecordGroups.wins)
        || isNil(teamRecordGroups.loses)
    ) {
        throw new Error(`Unable to parse team record. (${recordRaw})`);
    }

    const teamRecord = [
        teamRecordGroups.wins,
        teamRecordGroups.loses,
    ].map(Number);

    if ( !isTwoNumberArray(teamRecord) ) {
        throw new Error(`Unable to parse team's record correctly. (${recordRaw})`);
    }

    return teamRecord;
}

function getTeams(team1: TeamParsed, team2: TeamParsed): MatchParsed['teams'] {
    return [
        team1,
        team2,
    ];
}

function getTime(dom: JSDOM, contextNode: Node, xpath: string): string {
    return getFirstValueAtXpath({
        contextNode,
        dom,
        xpath,
    });
}

// eslint-disable-next-line max-lines-per-function,max-statements
export async function parseForestViewLanesLeague(teamConfig: TeamConfig): Promise<Match[]> {
    const venue = getVenueInfoFromVenueName(teamConfig.league.venue.name);
    const url = createForestViewLanesUrl(teamConfig, venue);

    const dom = await getDomFromUrl(url);
    const matchesParsed = getMatchesParsed(dom);

    const league = getLeague(dom, teamConfig, venue);
    const matches = getMatches(matchesParsed, teamConfig, league, url);

    return matches;
}
