const sgMail = require('@sendgrid/mail');
const EMAIL_API = "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";


sgMail.setApiKey(EMAIL_API);

const msg = {
  to: 'lopamudragiri2@gmail.com',
  from: 'coolrshd@gmail.com',
  subject: 'Testing express app to send emails',
  text: 'Patli',
  html: "<strong>Patli Give Me Hugs</strong>"
};

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })