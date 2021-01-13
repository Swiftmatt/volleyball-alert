export enum Venue {
    ForestViewLanes = 'ForestViewLanes',
    PremierAcademy = 'PremierAcademy',
    ToledoSportAndSocialClub = 'ToledoSportAndSocialClub',
}


export type VenueInfo = {
    baseUrl: string;
    name: string;
};


export const venueInfoMap: Record<Venue, VenueInfo> = {
    [Venue.ForestViewLanes]: {
        baseUrl: 'https://forestviewlanes.bracketpal.com/',
        name: 'Forest View Lanes',
    },
    [Venue.PremierAcademy]: {
        baseUrl: 'https://www.premiervolleyball.com/',
        name: 'Premier Academy',
    },
    [Venue.ToledoSportAndSocialClub]: {
        baseUrl: 'http://www.toledosportandsocialclub.com/LeagueSchedule.aspx',
        name: 'Skyway Recreation Center',
    },
} as const;
