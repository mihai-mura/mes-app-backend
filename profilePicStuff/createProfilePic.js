const colors = require('./profilePicColors.js');
const fs = require('fs');
const nodeCanvas = require('canvas');

const { createCanvas } = nodeCanvas;

const createProfilePic = (_id, firstName, lastName) => {
	const width = 360;
	const height = 360;
	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');
	//add random bgc

	context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
	context.fillRect(0, 0, width, height);
	//add initials

	context.fillStyle = '#000';
	context.font = '120px Arial';
	context.textAlign = 'center';
	context.fillText(`${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`, 180, 220);

	const buffer = canvas.toBuffer('image/png');

	fs.writeFileSync(`${process.env.PROFILE_PIC_PATH}/${_id}.png`, buffer);
};

module.exports = createProfilePic;
