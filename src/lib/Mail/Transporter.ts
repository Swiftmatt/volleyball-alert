import * as Dotenv from 'dotenv';
import * as NodeMailer from 'nodemailer';
import type JSONTransport from 'nodemailer/lib/json-transport';
import type Mail from 'nodemailer/lib/mailer';
import type SendmailTransport from 'nodemailer/lib/sendmail-transport';
import type SESTransport from 'nodemailer/lib/ses-transport';
import type SMTPPool from 'nodemailer/lib/smtp-pool';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type StreamTransport from 'nodemailer/lib/stream-transport';

import { ENV_FILE_PATH } from 'src/constants';
import { carrierEmailSuffixMap } from 'src/lib/Mail/Carrier';
import {
    Contact,
    isEmailContact,
    isMobileContact,
} from 'src/models/Contact';
import { isNil } from 'src/lib/Util';


type TransportConfig =
    string
    | JSONTransport
    | JSONTransport.Options
    | SendmailTransport
    | SendmailTransport.Options
    | SESTransport
    | SESTransport.Options
    | SMTPPool
    | SMTPPool.Options
    | SMTPTransport
    | SMTPTransport.Options
    | StreamTransport
    | StreamTransport.Options
    | Transport
    | NodeMailer.TransportOptions
;


Dotenv.config({
    path: ENV_FILE_PATH,
});

if ( isNil(process.env.EMAIL) ) {
    throw new Error('Environment variable EMAIL was undefined.');
}


export const DEFAULT_TRANSPORT_CONFIG: SMTPTransport.Options = {
    auth: {
        pass: process.env.EMAIL_PASSWORD,
        user: process.env.EMAIL,
    },
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
} as const;

export const FROM_MAIL_ADDRESS: Mail.Address = {
    address: process.env.EMAIL,
    name: 'Volleyball Alerts',
} as const;


export async function createTransporter(transportConfig: TransportConfig = DEFAULT_TRANSPORT_CONFIG): Promise<NodeMailer.Transporter> {
    const transporter = NodeMailer.createTransport(transportConfig);
    await transporter.verify();

    return transporter;
}

export function getMailAddressFromContact(contact: Contact): Mail.Address {
    if (isMobileContact(contact)) {
        const {
            carrier,
            name,
            number,
        } = contact;

        const emailSuffix = carrierEmailSuffixMap[carrier];
        const address = `${number}${emailSuffix}`;

        return {
            address,
            name,
        };
    }

    if (isEmailContact(contact)) {
        const {
            email,
            name,
        } = contact;

        const address = email;
        return {
            address,
            name,
        };
    }

    throw new Error('Unable to get mail address for the provided contact. (Impossible!)');
}
