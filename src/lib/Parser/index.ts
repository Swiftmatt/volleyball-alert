import type { LeagueMatch } from 'src/models/Match';
import type { Team } from 'src/models/Team';
import { parseToledoSportAndSocialClubLeague } from 'src/lib/Parser/ToledoSportAndSocialClub';
import { Venue } from 'src/models/Venue';


export async function leagueVenueParserSelector(team: Team): Promise<LeagueMatch[]> {
    switch (team.league.venue) {
        // case Venue.ForestViewLanes:
        //     return parseForestViewLanesLeague(league);
        // case Venue.PremierAcademy:
        //     return parsePremierAcademyLeague(league);
        case Venue.ToledoSportAndSocialClub:
            return parseToledoSportAndSocialClubLeague(team);
        default:
            throw new Error(`Unknown league venue provided. (${team.league.venue})`);
    }
}

