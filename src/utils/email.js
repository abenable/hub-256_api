import nodemailer from 'nodemailer';

export const sendMail = async (options) => {
  try {
    //Tranporter
    const tranporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    //Email options
    const mailOptions = {
      from: 'Able Abenaitwe <admin>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    //send email
    await tranporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    next(new ApiError(500, 'internal server error'));
  }
};
