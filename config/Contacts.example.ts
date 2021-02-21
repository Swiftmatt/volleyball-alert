import { Carrier, Contact } from 'src/models/Contact';


export enum People {
    VolleyballPlayer_EmailExample = 'VolleyballPlayer_EmailExample',
    VolleyballPlayer_PhoneExample = 'VolleyballPlayer_PhoneExample',
}

export const peopleContactMap: Record<People, Contact> = {
    [People.VolleyballPlayer_EmailExample]: {
        email: 'volleyball_player@mailinator.com',
        name: People.VolleyballPlayer_EmailExample,
    },
    [People.VolleyballPlayer_PhoneExample]: {
        carrier: Carrier.Verizon,
        name: People.VolleyballPlayer_PhoneExample,
        number: '5555555555',
    },
};
