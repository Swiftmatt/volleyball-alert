export enum Carrier {
    Att = 'Att',
    Sprint = 'Sprint',
    Verizon = 'Verizon',
}

export const carrierEmailSuffixMap = {
    [Carrier.Att]: '@mms.att.net',
    [Carrier.Sprint]: '@pm.sprint.com',
    [Carrier.Verizon]: '@vzwpix.com',
};
