const nodemailer	= require('nodemailer');

// config
const {
	variables,
}	= require('../config/index.js');

const {
	// nodemailerHost: host,
	// nodemailerPort: port,
	nodemailerUser: user,
	nodemailerPass: pass,
	nodemailerAdminUser: adminUser,
}	= variables;

// const transporter = nodemailer.createTransport({
// 	host,
// 	port,
// 	requireTLS: true,
// 	auth: { user, pass },
// });
const transporter = nodemailer.createTransport({
	service: 'hotmail',
	auth: { user, pass },
});

const sendMailCallback = (error, info) => {
	if (error) console.log('✘ ERROR: Could not send email with error message:', error);
	else console.log('✔ Email with error message sent:', info.response);
};

module.exports = (errMsgDescription, errorStack, user_id, nodeEnv) => {
	const mailOptions = {
		from: user,
		to: adminUser,
		subject: 'Poker Club Error',
		html:
			`
			<p><b>Description:</b> ${ errMsgDescription }</p>
			<p><b>Environment:</b> ${ nodeEnv }</p>
			<p><b>User ID:</b> ${ user_id }</p>
			<b>Error Stack: </b><pre>${ errorStack }</pre>
			`,
	};
	console.log('=== ERROR BEGIN ===');
	console.log(mailOptions.html);
	console.log('=== ERROR END ===');
	return transporter.sendMail(mailOptions, sendMailCallback);
};
