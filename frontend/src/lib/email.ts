import nodemailer from 'nodemailer';

interface InvitationalEmailData {
    to: string;
    groupName: string;
    invitedBy: string;
    invitationLink: string;
}
