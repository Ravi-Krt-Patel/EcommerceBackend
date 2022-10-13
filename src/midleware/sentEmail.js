const nodemailer = require('nodemailer');
require("dotenv").config();
const sendEmail = async(option)=>{
	const transporter = nodemailer.createTransport({
		host:process.env.SMPT_HOST,
		port:process.env.SMPT_PORT,
		service:process.env.SMPT_SERVICE,
		auth:{
			user:process.env.SMTP_EMAIL,
			pass:process.env.SMTP_PASSWORD,
		}
	})

	const mailOption = {
		from:process.env.SMTP_EMAIL,
		to:option.email,
		subject:option.subject,
		text:option.message,
	}

	await transporter.sendMail(mailOption);
}

module.exports = sendEmail;