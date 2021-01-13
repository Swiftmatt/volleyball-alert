import { Carrier } from 'src/lib/Mail/Carrier';
import type { Contact } from 'src/models/Contact';


export enum People {
    VolleyballPlayer_EmailExample = 'VolleyballPlayer_EmailExample',
    VolleyballPlayer_PhoneExample = 'VolleyballPlayer_PhoneExample',
}

export const peopleContactMap: Record<People, Contact> = {
    [People.VolleyballPlayer_EmailExample]: {
        email: 'volleyball_player@mailinator.com',
        name: 'Volleyball Player',
    },
    [People.VolleyballPlayer_PhoneExample]: {
        carrier: Carrier.Verizon,
        name: 'Volleyball Player',
        number: '5555555555',
    },
};
