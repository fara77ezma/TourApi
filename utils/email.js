const nodemailer=require('nodemailer');
const sendEmail=async  options => {
    //1) Create a transporter //its basically a server which actually send email because nodejs not whose send the email itself
      const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD,
        }
        //Activate in your gmail the "less secure app option" if we use gmail service
      })
    //2)Define the email options 
    const mailOptions={
        from:'farah hezma <fhezma80@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message,
    }
    
    //3) Actually send the email
    await transporter.sendMail(mailOptions);


}
module.exports=sendEmail;