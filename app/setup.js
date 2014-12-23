angular.module('coreBOSJSTickets.setup', [])
.constant('Setup', {
	debug:			true,
	
	corebosapi:			'http://188.164.131.161/CID',
	corebosuser:		'test',
	corebosaccesskey:	'juKaW2jesSfBhgHM',  //**** DO NOT SHARE THIS WITH ANYONE!!! ***

	
	// default theme
	themeId: 		'bs-binary-admin',
	
	// default lanugage
	language: 		'en',
	
	// app branding
	app:			'coreBOSwsJS',
	version:		'1.0',
	copy: 			'Made by Joe Bordes, JPL TSolucio, S.L.'
	
});
