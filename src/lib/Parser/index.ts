import type { League } from 'src/lib/Parser/League';
import { parseToledoSportAndSocialClubLeague } from 'src/lib/Parser/ToledoSportAndSocialClub';
import { Venue } from 'src/lib/Parser/Venue';


async function leagueParserSelector(league: League): Promise<unknown> {
    switch (league.venue) {
        // case Venue.ForestViewLanes:
        //     return parseForestViewLanesLeague(league);
        // case Venue.PremierAcademy:
        //     return parsePremierAcademyLeague(league);
        case Venue.ToledoSportAndSocialClub:
            return parseToledoSportAndSocialClubLeague(league);
        default:
            throw new Error(`Unknown league venue provided. (${league.venue})`);
    }
}

