const nodemailer	= require('nodemailer');

// config
const {
	variables,
}	= require('../config/index.js');

const {
	nodemailerHost: host,
	nodemailerPort: port,
	nodemailerUser: user,
	nodemailerPass: pass,
	nodemailerAdminUser: adminUser,
}	= variables;

const transporter = nodemailer.createTransport({
	host,
	port,
	requireTLS: true,
	auth: { user, pass },
});

const sendMailCallback = (error, info) => {
	if (error) console.log('✘ ERROR: Could not send email with error message:', error);
	else console.log('✔ Email with error message sent:', info.response);
};

module.exports = (errMsgDescription, e, user_id, nodeEnv) => {
	const mailOptions = {
		from: user,
		to: adminUser,
		subject: 'Poker Club Error',
		html:
			`
			<p><b>Description:</b> ${ errMsgDescription }</p>
			<p><b>Error Message:</b> ${ e }</p>
			<p><b>User ID:</b> ${ user_id }</p>
			<p><b>Environment:</b> ${ nodeEnv }</p>
			`,
	};
	return transporter.sendMail(mailOptions, sendMailCallback);
};
