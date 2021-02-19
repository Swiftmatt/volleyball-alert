import { parseToledoSportAndSocialClubLeague } from 'src/lib/Parser/ToledoSportAndSocialClub';
import type { Match } from 'src/models/Match';
import type { TeamConfig } from 'src/models/Team';
import { VenueName } from 'src/models/Venue';


export async function getMatchesForTeam(teamConfig: TeamConfig): Promise<Match[]> {
    switch (teamConfig.league.venue.name) {
        // case VenueName.ForestViewLanes:
        //     return parseForestViewLanesLeague(teamConfig);
        // case VenueName.PremierAcademy:
        //     return parsePremierAcademyLeague(teamConfig);
        case VenueName.ToledoSportAndSocialClub:
            return parseToledoSportAndSocialClubLeague(teamConfig);
        default:
            throw new Error(`The provided venue name does not have a parser. (${teamConfig.league.venue.name})`);
    }
}

