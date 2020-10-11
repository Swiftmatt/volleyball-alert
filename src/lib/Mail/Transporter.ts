import * as Dotenv from 'dotenv';
import * as Nodemailer from 'nodemailer';

import * as Const from 'src/constants';

import type { Transport, TransportOptions } from 'nodemailer';
import type JSONTransport from 'nodemailer/lib/json-transport';
import type SendmailTransport from 'nodemailer/lib/sendmail-transport';
import type SESTransport from 'nodemailer/lib/ses-transport';
import type SMTPPool from 'nodemailer/lib/smtp-pool';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type StreamTransport from 'nodemailer/lib/stream-transport';


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
    | TransportOptions
;


Dotenv.config({
    path: Const.ENV_FILE_PATH,
});


export const DEFAULT_TRANSPORT_CONFIG: SMTPTransport.Options = {
    auth: {
        pass: process.env.EMAIL_PASSWORD,
        user: process.env.EMAIL,
    },
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
} as const;


export async function createTransporter(transportConfig: TransportConfig = DEFAULT_TRANSPORT_CONFIG): Promise<Nodemailer.Transporter> {
    console.log('Initializing Transporter...');
    const transporter = Nodemailer.createTransport(transportConfig);
    console.log('Transporter setup complete!\n');

    console.log('Verifying Transporter setup...');
    await transporter.verify();
    console.log('Transporter setup was successful!\n');

    return transporter;
}
