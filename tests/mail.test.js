const Email = require('../utils/email');

exports.sendTestMail = async (req, res, next) => {
  console.log("sending test mail");
  try {
    await new Email(null, null, true).sendTestMail();

    res.status(200).json({
      message: 'success'
    });
  } catch (error) {
    console.log("failed to send message");
    res.status(400).json({
      message: 'failed',
      error
    });
  }
}