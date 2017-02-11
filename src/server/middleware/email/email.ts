import {createTransport, Transporter} from 'nodemailer';
import * as sesTransport from 'nodemailer-ses-transport';

export class EmailService {
    private transporter: Transporter;

    constructor() {
        let useSMTP = !!process.env.EMAIL_SMTP;
        if (useSMTP) {
            this.transporter = createTransport(process.env.EMAIL_SMTP);
        } else {
            // default to SES
            if (process.env.EMAIL_SES) {
                this.transporter = createTransport(sesTransport(JSON.parse(process.env.EMAIL_SES)));
            } else {
                this.transporter = createTransport(sesTransport({}));
            }
        }
    }

    confirm_email(to: string, confirmlink: string, callback:any) {
        let from = 'noreply@tetusecurity.com';
        let text = `To confirm your Crypt account, please visit ${confirmlink} in your browser.`;
        let html = `<p>To confirm your Crypt account, please visit <a href="${confirmlink}" alt="confirmation">${confirmlink}</a> in a browser.</p>`;
        let subject = 'Please confirm your account with Crypt';
        return this.send_email(to, from, subject, text, html, callback);
    }

    send_email(to, from, subject, text, html, callback) {
        this.transporter.sendMail({
            to,
            from,
            subject,
            text,
            html
            }, (err, info) => {
            if (err) {
                return callback(err);
            }
            return callback();
        });
    }
}
