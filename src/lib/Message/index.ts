import * as DateFns from 'date-fns';
import {promises as Fs} from 'fs';
import * as Handlebars from 'handlebars';
import * as Path from 'path';

import { SRC_PATH } from 'src/constants';
import type { Match } from 'src/models/Match';


const TEMPLATES_PATH = Path.resolve(SRC_PATH, './templates');
const DEFAULT_TEMPLATE_FILE_NAME = 'message.hbs';


export async function createMessageFromMatch(match: Match): Promise<string> {
    const path = Path.resolve(TEMPLATES_PATH, DEFAULT_TEMPLATE_FILE_NAME);
    const templateBuffer = await Fs.readFile(path);
    const templateFile = templateBuffer.toString();

    const {
        court,
        datetime,
        league,
        opponentTeam,
        team,
    } = match;

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

    const template = Handlebars.compile(templateFile, {
        noEscape: true,
    });
    const message = template({
        court,
        date,
        league,
        opponentTeam,
        opponentTeamRecord,
        team,
        teamRecord,
        time,
    });

    return message;
}
