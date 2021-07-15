export enum Carrier {
    Att = 'Att',
    Sprint = 'Sprint',
    Verizon = 'Verizon',
    Tmobile = 'Tmobile',
}


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


export const carrierEmailSuffixMap = {
    [Carrier.Att]: '@mms.att.net',
    [Carrier.Sprint]: '@pm.sprint.com',
    [Carrier.Verizon]: '@vzwpix.com',
    [Carrier.Tmobile]: '@tmomail.net',
};


export function isEmailContact(contact: Contact): contact is EmailContact {
    return 'email' in contact;
}

export function isMobileContact(contact: Contact): contact is MobileContact {
    return 'number' in contact && 'carrier' in contact;
}
