import * as DateFns from 'date-fns';

import { People } from 'config/Contacts';
import { teamConfigs } from 'config/Teams';
import { getDayOfTheWeekFromDate } from 'src/lib/Date';
import {
    createMailOptions,
    createTransporter,
    getMailAddressFromContact,
} from 'src/lib/Mail/Transporter';
import { createMessageFromMatch } from 'src/lib/Message';
import { getMatchesForTeam } from 'src/lib/Parser';


// TODO - Utilize Yargs
const SHOULD_SEND_TEXT_MESSAGES = true;
const OVERRIDE_DATE = '';
const ME: People | null = null;
const SHOULD_ONLY_SEND_TO_ME = false;


(async () => {
    await main();
})().catch(err => {
    console.error(err);
    process.exit();
});


// eslint-disable-next-line max-statements
async function main(): Promise<void> {
    const transporter = await createTransporter();

    const today = OVERRIDE_DATE
        ? new Date(OVERRIDE_DATE)
        : new Date();
    const dayOfTheWeek = getDayOfTheWeekFromDate(today);

    for (const teamConfig of teamConfigs) {
        if (teamConfig.league.dayOfTheWeek !== dayOfTheWeek) {
            continue;
        }

        const matches = await getMatchesForTeam(teamConfig);
        const todaysMatches = matches.filter(match => DateFns.isSameDay(match.datetime, today));

        for (const match of todaysMatches) {
            const message = await createMessageFromMatch(match);

            const contacts = [
                ...match.team.members,
                ...match.team.additionalContacts,
            ];
            for (const contact of contacts) {
                const isSendingToMe = contact.name === ME;
                if (SHOULD_ONLY_SEND_TO_ME && !isSendingToMe) {
                    continue;
                }
                const mailAddress = getMailAddressFromContact(contact);
                const mailOptions = createMailOptions({
                    text: message,
                    to: mailAddress.address,
                });

                console.log(JSON.stringify({ ...mailOptions }, null, 4));

                if (SHOULD_SEND_TEXT_MESSAGES) {
                    const sentMessageInfo = await transporter.sendMail(mailOptions);
                    console.log(JSON.stringify({ sentMessageInfo }, null, 4));
                    continue;
                }
            }
        }
    }
}

// eslint-disable-next-line max-statements
async function findScheduleConflicts(): Promise<void> {
    type DatetimeMemberGameMap = {
        [datetime: string]: {
            [member: string]: string[];
        };
    };
    const datetimeMemberGameMap: DatetimeMemberGameMap = {};
    for (const teamConfig of teamConfigs) {
        const matches = await getMatchesForTeam(teamConfig);
        for (const match of matches) {
            for (const member of match.team.members) {
                const memberName = member.name;
                const datetime = DateFns.format(
                    match.datetime,
                    'MMMM do, yyyy h:mm a',
                );

                const gameInfo = [
                    match.league.name,
                    `Court ${match.court}`,
                    datetime,
                    match.team.name,
                    memberName,
                ].join(' - ');

                const doesDatetimeExistInGameMap = datetime in datetimeMemberGameMap;
                if (!doesDatetimeExistInGameMap) {
                    datetimeMemberGameMap[datetime] = {};
                }
                const doesMemberExistInGameMapDatetime = memberName in datetimeMemberGameMap[datetime];
                if (!doesMemberExistInGameMapDatetime) {
                    datetimeMemberGameMap[datetime][memberName] = [];
                }
                datetimeMemberGameMap[datetime][member.name].push(gameInfo);
            }
        }
    }

    const gameSets: string[][] = [];
    for (const datetime of Object.keys(datetimeMemberGameMap)) {
        for (const member of Object.keys(datetimeMemberGameMap[datetime])) {
            const gameInfo = datetimeMemberGameMap[datetime][member];
            gameSets.push(gameInfo);
        }
    }

    const gameConflicts = gameSets.filter(game => game.length > 1);

    console.log(gameConflicts);
}
