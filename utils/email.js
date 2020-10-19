const nodemailer = require('nodemailer');
const pug = require('pug');
const htmltotext = require('html-to-text');

//a Generic class to send Email
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name.split(' ')[0];
    this.url = url;
    this.from = `Joseph Joy <${process.env.EMIAL_ADD}>`;
  }

  getTransporter() {
    if (process.env.NODE_ENV === 'production') {
      //IMPLEMENT SENDGRID HERE!!
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1.USE a PUG template to generate a html file which can be send using email!!
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      name: this.name,
      url: this.url,
      subject,
    });

    // 2.CONFIGURE the mailoptions
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      //this converts the above html to text format!!
      text: htmltotext.fromString(html),
    };

    // 3.Actually send the mail!!
    await this.getTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcomeContent', `Welcome to the natours family!!`);
  }

  async sendForgotPassword() {
    await this.send('passwordReset', 'Reset password');
  }
};

// exports.sendEmail = async (options) => {
//   //1.CREATE TRANSPORTER
//   /**
//    * this is where we define the host, service, port on which the protocol is running, authentication name and password
//    */
//   const transporter = nodemailer.createTransport({
//     //some popular services like gmail, yahoo, hotmail are recognised by the nodemailer module and hence dont need to configured
//     //as in set the host, port, etc but other services do need to be configured manually!!
//     //gmail is not a good mail service to use in production environment even if it allows you to send 500 mails per day
//     //the reason is because it will mark you as a spammer if you send a lot of mails to your clients!!

//     //for testing purposes we actually dont send mails to legit accounts but use a service called mailtrap which basically traps the
//     //mail in its inbox before reaching the actual mailing address.
//     //here we be using SMTP protocol to send mail instead of POP# or IMAP!!
//     // service: 'Gmail',
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   //2.DEFINE THE EMAIL OPTIONS
//   const mailOptions = {
//     from: 'Joseph Joy <josephjoy07@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     //this can convert the above text message into html formatted text!!
//     // html:
//   };

//   //3.SEND THE MAIL
//   await transporter.sendMail(mailOptions);
// };
