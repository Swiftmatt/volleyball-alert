import { isNil } from 'src/lib/Util';


export enum VenueName {
    ForestViewLanes = 'Forest View Lanes',
    PremierAcademy = 'Premier Academy',
    ToledoSportAndSocialClub = 'Toledo Sport And Social Club',
}


export type Venue = {
    baseUrl: string;
    name: VenueName;
};

export type VenueConfig = Pick<Venue, 'name'>;


export const venueMap: Record<VenueName, Venue> = {
    [VenueName.ForestViewLanes]: {
        baseUrl: 'https://forestviewlanes.bracketpal.com',
        name: VenueName.ForestViewLanes,
    },
    [VenueName.PremierAcademy]: {
        baseUrl: 'https://www.premiervolleyball.com',
        name: VenueName.PremierAcademy,
    },
    [VenueName.ToledoSportAndSocialClub]: {
        baseUrl: 'http://www.toledosportandsocialclub.com/LeagueSchedule.aspx',
        name: VenueName.ToledoSportAndSocialClub,
    },
} as const;


export function getVenueInfoFromVenueName(venueName: Venue['name']): Venue {
    const isVenueNameInVenueMap = venueName in venueMap;
    if (!isVenueNameInVenueMap) {
        throw new Error(`The provided venue name was not mapped. (${venueName})`);
    }

    const venue = venueMap[venueName];
    if ( isNil(venue) ) {
        throw new Error(`The mapped venue has missing info. (${venueName})`);
    }

    return venue;
}
