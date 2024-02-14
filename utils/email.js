const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Farah Hezma <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV.trim() === 'production') {
      //Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid', //SendGrid service already known by nodemailer just like gmail so you don't need to specify the port or the host because nodemailer already know them.
        auth: {
          user: process.env.SENDGRID_USERNAME,
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

  async send(subject, text) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text,
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    const text = `Dear ${this.firstName},\n \n
    Welcome to our Tours API community! We are thrilled to have you on board and excited about the adventures we'll be embarking on together.\n
    As a valuable member of our Tours API family, your presence enhances the richness of our platform. Whether you're exploring new destinations, discovering unique features, or contributing your insights,\n 
    you play a vital role in making our community vibrant  and dynamic.\n
    Feel free to dive into the wealth of resources our API offers, and if you have any questions or ideas to share, don't hesitate to reach out. We're here to ensure your experience with our Tours API is seamless and enjoyable.\n
    Thank you for being a part of our journey. We look forward to creating memorable and fulfilling experiences together.\n
    Best Regards, \n \n
    Farah Hezma`;
    await this.send('Welcome to the Natours Family!', text);
  }

  async sendPasswordReset() {
    const text = `Forget your password? Submit a PATCH request with your new password and password confirm to: ${this.url}.\n if you didn't forget your password, please ignore this email!`;

    await this.send('Reset Password', text);
  }
};

// const sendEmail = async (options) => {
//   // 1) Create a transporter //its basically a server which actually send email because nodejs not whose send the email itself
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     // Activate in your gmail the "less secure app option" if we use gmail service
//   });
//   // 2)Define the email options
//   const mailOptions = {
//     from: 'farah hezma <fhezma80@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };
