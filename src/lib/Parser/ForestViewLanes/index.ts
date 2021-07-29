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
    MatchWithoutCalculatedDatetime,
} from 'src/models/Match';
import {
    Team,
    TeamConfig,
    TeamParsed,
} from 'src/models/Team';
import {
    getVenueInfoFromVenueName,
    Venue,
} from 'src/models/Venue';


function createForestViewLanesUrl(teamConfig: TeamConfig, venue: Venue): Team['url'] {
    const { baseUrl } = venue;
    const { id } = teamConfig.league;

    const url = new URL(`${baseUrl}/teaminfo/${id}`);
    return url.toString();
}

function getCourt(dom: JSDOM, contextNode: Node): MatchParsed['court'] {
    const court = getFirstValueAtXpath({
        contextNode,
        dom,
        xpath: 'td[3]',
    });
    return Number(court);
}

function getDate(dom: JSDOM, contextNode: Node): string {
    return getFirstValueAtXpath({
        contextNode,
        dom,
        xpath: 'td[1]',
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
    const datetime = DateFns.parse(
        `${date}_${time}`,
        'yyyy-MM-dd_ha',
        new Date(),
    );

    // If parsing failed, Invalid Date will be returned. Invalid Date is a Date, whose time value is NaN.
    const timeValue = Number(datetime);
    if ( Number.isNaN(timeValue) ) {
        throw new Error(`An invalid date or time was provided. (${date}/${time})`);
    }

    return datetime;
}

function getMatches(matches: MatchWithoutCalculatedDatetime[], team: Team, league: League): Match[] {
    let lastNonEmptyDate = '';
    return matches.map(match => {
        const {
            court,
            date,
            opponentTeam,
            time,
        } = match;

        const datetime = (() => {
            if (date === '') {
                return getMatchDatetime(lastNonEmptyDate, time);
            }
            lastNonEmptyDate = date;
            return getMatchDatetime(date, time);
        })();

        return {
            court,
            datetime,
            league,
            opponentTeam,
            team,
        };
    });
}

// eslint-disable-next-line max-lines-per-function
function getMatchesParsed(dom: JSDOM): MatchWithoutCalculatedDatetime[] {
    const tableRows = [
        ...getNodeAtXpath({
            contextNode: dom.window.document,
            dom,
            xpath: '/html/body/div[1]/div[3]/div/div/table/tbody/tr/td[2]/div[4]/table/tbody/tr',
        }),
    ];

    // Remove the first row as it's just the table header.
    tableRows.shift();

    // eslint-disable-next-line max-statements
    return tableRows.map(tableRow => {
        if ( isNil(tableRow) ) {
            throw new Error('A `tableRow` was null.');
        }

        const date = getDate(dom, tableRow);

        if ( isMatchABye(dom, tableRow) ) {
            // TODO: Figure out a better solution for tracking BYEs
            /* eslint-disable @typescript-eslint/no-magic-numbers */
            return {
                court: 0,
                date,
                opponentTeam: {
                    name: 'BYE',
                    record: [
                        0,
                        0,
                    ],
                },
                time: '12pm',
            };
            /* eslint-enable @typescript-eslint/no-magic-numbers */
        }

        const court = getCourt(dom, tableRow);

        const time = getTime(dom, tableRow);

        const opponentName = getOpponentName(dom, tableRow);
        const opponentRecord = getOpponentRecord(dom, tableRow);
        const opponentTeam = {
            name: opponentName,
            record: opponentRecord,
        };

        return {
            court,
            date,
            opponentTeam,
            time,
        };
    });
}

function getOpponentName(dom: JSDOM, contextNode: Node): TeamParsed['name'] {
    return getFirstValueAtXpath({
        contextNode,
        dom,
        xpath: 'td[4]/a[1]',
    });
}

function getOpponentRecord(dom: JSDOM, contextNode: Node): TeamParsed['record'] {
    const opponentRecordRaw = getFirstValueAtXpath({
        contextNode,
        dom,
        xpath: 'td[4]/span[1]',
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

function getTeam(dom: JSDOM, teamConfig: TeamConfig, url: Team['url']): Team {
    const {
        additionalContacts,
        members,
        name,
    } = teamConfig;

    const record = getTeamRecord(dom, dom.window.document);

    return {
        additionalContacts,
        members,
        name,
        record,
        url,
    };
}

function getTeamRecord(dom: JSDOM, contextNode: Node): TeamParsed['record'] {
    const recordRaw = getFirstValueAtXpath({
        contextNode,
        dom,
        xpath: '/html/body/div[1]/div[3]/div/div/table/tbody/tr/td[2]/div[2]/table/tbody/tr/td[1]',
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

function getTime(dom: JSDOM, contextNode: Node): string {
    return getFirstValueAtXpath({
        contextNode,
        dom,
        xpath: 'td[2]',
    });
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function isMatchABye(dom: JSDOM, contextNode: Node): boolean {
    const opponentValue = getFirstValueAtXpath({
        contextNode,
        dom,
        xpath: 'td[4]',
    });
    return opponentValue === 'BYE';
}

export async function parseForestViewLanesLeague(teamConfig: TeamConfig): Promise<Match[]> {
    const venue = getVenueInfoFromVenueName(teamConfig.league.venue.name);
    const url = createForestViewLanesUrl(teamConfig, venue);

    const dom = await getDomFromUrl(url);

    const matchesWithoutCalculatedDatetime = getMatchesParsed(dom);
    const team = getTeam(dom, teamConfig, url);
    const league = getLeague(dom, teamConfig, venue);

    return getMatches(matchesWithoutCalculatedDatetime, team, league);
}
