import type { Carrier } from 'src/lib/Mail/Carrier';


type EmailContact = {
    email: string;
    name: string;
};

type MobileContact = {
    carrier: Carrier;
    name: string;
    number: string;
};

export type Contact = MobileContact | EmailContact;


export function isEmailContact(contact: Contact): contact is EmailContact {
    return 'email' in contact;
}

export function isMobileContact(contact: Contact): contact is MobileContact {
    return 'number' in contact && 'carrier' in contact;
}
