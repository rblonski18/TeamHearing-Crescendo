

loadscripts([
	'adaptive',
	'afc',
	'array',
	'audiogram',
	'audiologic',
	'bel',
	'bmld',
	'bugs',
	'calibration',
	'chart',
	'chat',
	'cnc',
	'confronto',
	'consonants',
	'crisp',
	'crm',
	'dichotic',
	'digits',
	'dsp',
	'environmental',
	'fastclick',
	'gabor',
	'harmonics',
	'ild',
	'itd',
	'keywords',
	'l1l2',
	'lateralization',
	'matrix',
	'mdt',
	'messages',
	'mrt',
	'musanim',
	'percept',
	'processor',
	'profiles',
	'protocol',
	'reaction',
	'shs',
	'speech',
	'spin',
	'synth',
	'tonal',
	'vocoder',
	'voice',
	'vowels',
	'playlists/neutral',
	'playlists/easy',
	'playlists/medium',
	'playlists/hard',
	'PianoRollLib/importPianoRoll',
]);
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.onerror = function(msg, url, linenumber) {
	let samplerate = typeof audio == 'undefined' ? 0 : audio.sampleRate;
	console.log('error')
	if (debug) {
		alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber + ' fs:' + samplerate);
	}
	console.log(+iOS)
	jQuery.ajax({
		data: {
			browser: navigator.userAgent,
			bug: 'Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber,
			iOS: +iOS,
			samplerate: samplerate,
			user: user.ID
		},
		error: function (jqXHR, textStatus, errorThrown) {},
		success: function (data, status) {},
		type: 'POST',
		url: 'version/' + version + '/php/bugs.php'
	});
	return true;
}

// window dimensions
var div = document.createElement('div');
div.id = 'dpi';
div.style.height = '1in';
div.style.left = '100%';
div.style.position = 'fixed';
div.style.top = '100%';
div.style.width = '1in';
document.body.appendChild(div);
var windowwidth = window.innerWidth / document.getElementById('dpi').offsetWidth;
var windowheight = window.innerHeight / document.getElementById('dpi').offsetHeight;

/*function idleLogout() {
    var t;
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;  // catches touchscreen presses as well
    window.ontouchstart = resetTimer; // catches touchscreen swipes as well
    window.onclick = resetTimer;      // catches touchpad clicks as well
    window.onkeypress = resetTimer;
    window.addEventListener('scroll', resetTimer, true); // improved; see comments

    function yourFunction() {
        console.log('logout');
		Logout();
    }

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(yourFunction, 5*60*1e3);  // time is in milliseconds
    }
}
idleLogout();*/

// layout
layout = {
	assignment: function (title, options, callbacks, extra, mode, back) {
		// main (sets up the title bar and back button)
		main = layout.main(title,
			() => { back ? back() : layout.dashboard(); },
			extra
		);

		// menu division
		var menu = document.createElement('div');

		// build menu
		for (let a = 0; a < options.length; a++) {
			// init menu item
			var item = document.createElement('li');
			item.id = mode+'.'+a;
			item.onclick = function (a) {
				document.getElementById('home').title = 'Return home.';
				callbacks[a]();
			}.bind(null,a);

			// icon
			var img = document.createElement('img');
			img.src = 'images/runningman.png';
			img.style.height = '1.5em';
			img.style.paddingRight = '8px';

			// title
			var span = document.createElement('span');
			span.innerHTML = options[a];
			span.style.display = 'inline-block';
			span.style.fontSize = windowwidth < 4 ? 'smaller' : '100%';

			// anchor
			var anchor = document.createElement('a');
			anchor.id = 'assignment.'+String(a+1);
			anchor.appendChild(img);
			anchor.appendChild(span);
			menu.appendChild(item);
			item.appendChild(anchor);
			if(iOS){FastClick(item)}
		}
		jQuery(menu).menu();
		main.appendChild(menu);

		// check for active protocol
		let id;
		for (let a = 0; a < options.length; a++) {
			id = mode+'.'+String(a);
			jQuery.ajax({
				data: {
          ear: ear,
					protocol: id,
					subuser: subuser.ID
				},
				success: function(data, status) {
					data = jQuery.parseJSON(data);

          // check if returned data
					if (data.length != 0) {
                        // format
						yo = data[0];

						// try to parse settings
						let error = false;
						try {
							JSON.parse(yo.settings);
						} catch (e) {
							console.error(e);
							error = true;
						}

						// check for unfinished protocol
						let check = true;
						if (check && yo.isComplete==0 && !error) {

							//
							document.getElementById(mode+'.'+a).onclick = function (yo) {
								console.log(mode+'.'+a);
								console.log(protocol,yo);

								//
								protocol = new Protocol();
								protocol.ID = yo.ID;
								protocol.IDs = yo.IDs == null ? [] : yo.IDs.split(',');
								protocol.active = true;
								protocol.activity = yo.activity;
								protocol.callback = () => { assignment(); };
								protocol.elapsedTime = yo.elapsedTime;
								protocol.ind = yo.ind;
								protocol.settings = JSON.parse(yo.settings);
								protocol.testOrder = yo.testOrder.split(',').map(Number);

								// initialize activity
								let set = Object.assign({}, protocol.settings[protocol.ind]);
								set.init = () => {};
								loadscript(protocol.activity,
									() => {
										//
										window[protocol.activity](set);

										//
										layout.message(
											'Protocol Message',
											'Completed '+String(protocol.ind)+' of '+String(protocol.testOrder.length)+'.',
											()=>{window[protocol.activity](protocol.settings[protocol.testOrder[protocol.ind]])}
										);
									}
								);
							}.bind(null,yo);

							//
							let check = document.createElement('img');
							check.src = 'images/incomplete.png';
							check.style.cssFloat = 'right';
							check.style.height = '1.5em';
							check.style.zindex = 10;
							check.title = options[a];
							document.getElementById(yo.protocol).appendChild(check);
						} else {
							//
							let check = document.createElement('img');
							check.src = 'images/check.png';
							check.style.cssFloat = 'right';
							check.style.height = '1.5em';
							check.style.zindex = 10;
							check.title = options[a];
							document.getElementById(yo.protocol).appendChild(check);
						}
					}
				},
				type: 'GET',
				url: 'version/'+version+'/php/protocol.php'
			});
		}
		layout.footer();
	},
	backbutton: function (callback) {
		var back = document.createElement('img');
		back.onclick = () => { callback(); };
		back.src = 'images/340.png';
		back.style.height = '1.1em';
		back.style.cssFloat = 'left';
		jQuery(back).button();
		if(iOS){FastClick(back)}
		return back;
	},
	dashboard: function () {
		// clear
		document.body.innerHTML = '';

		// header
		var header = layout.header();
		document.getElementById('home').title = 'You are home.';

		// main
		var main = layout.main();
		main.innerHTML = '';

		// footer
		layout.footer(true);

		// change layout based on role
		switch (user.role) {
			case 'Administrator':
			case 'Guru':
			case 'Director':
			case 'Clinician': layout.team(); break;
			case 'Client':
			case 'Guardian': layout.menu();
		}

		// Permission to play audio?
		if (typeof audio === 'undefined') {
			layout.message('Audio','Permission to play audio?',{
				Okay: function() {
					loadscript('processor', function() {
						audio = new AudioContext();
						processor = new Processor();
						processor.snr(-12);
						status = 'running';

						// adjust master gain
						loadscripts(['array','dsp','musescore'],()=>{
							gui.gain({
								callback: () => { MASTERHOLD = MASTERGAIN; },
								file: 'data/musescore/3secpiano/piano_45.mp4'
							});
						});
					});
					jQuery(this).dialog('destroy').remove();
				}
			})
		}

		// messages
		if (false) {//messages now run out of email
			jQuery.ajax({
				data:  {
					method: 'newmessages',
					password: undefined,
					subuser: subuser.username,
					user: user.ID
				},
				success: function (data, status) {
					var data = jQuery.parseJSON(data);
					for (var a = 0; a < data.length; a++) {
						layout.message(
							'Message from ' + data[a].sendername,
							data[a].message,
							{
								Okay: function () {
									jQuery(this).dialog('destroy').remove();
								},
								Reply: function (i) {
									return function () {
										jQuery(this).dialog('destroy').remove();

										// dialog (New Message)
										var dialog = document.createElement('div');
										dialog.title = 'Message to '+data[i].sendername;

										// text area
										var textarea = document.createElement('textarea');
										textarea.id = 'p1';
										textarea.rows = 4;
										textarea.style.resize = 'none';
										textarea.style.overflow = 'hidden';
										textarea.style.width = '100%';
										dialog.appendChild(textarea);

										// dialog
										jQuery(dialog).dialog({
											buttons: {
												Cancel: function () {
													jQuery(this).dialog('destroy').remove();
												},
												Send: function () {
													jQuery.ajax({
														data: {
															message: textarea.value,
															recipient: data[i].sender,
															sender: data[i].recipient
														},
														type: 'POST',
														url: 'version/'+version+'/php/messages.php'

													});
													jQuery(this).dialog('destroy').remove();
												}
											},
											modal: true,
											width: 0.8*jQuery(window).width()
										});
									}
								} (a)
							}
						);
					}
				},
				type: 'GET',
				url: 'version/'+version+'/php/messages.php'
			});
		}
	},
	footer: function (display) {
		// create or get footer
		if (document.getElementById('footer')) {
			var footer = document.getElementById('footer');
		} else {
			var footer = document.createElement('div');
			footer.id = 'footer';
			footer.className = 'ui-widget-header';
			document.body.appendChild(footer);
		}

		// clear
		footer.innerHTML = '';

		// footer controls
		if (display) {
			// settings
			var image = document.createElement('img');
			image.index = 3;
			image.styles = ['blitzer','cupertino','humanity','redmond','start','sunny','trontastic'];
			image.onclick = function () {
				this.index = (this.index+1)%this.styles.length;
				document.getElementById('stylesheet').href
				= 'jQuery/jquery-ui-1.11.4.'+this.styles[this.index]+'/jquery-ui.css';
				console.log(this.styles[this.index]);
			};
			image.src = 'images/settings.png';
			image.style.cssFloat = 'left';
			image.style.height = '100%';
			image.style.marginRight = '1%';
			image.style.maxWidth = '12vw';
			image.title = 'settings';
			footer.appendChild(image);

			// calibration
			var image = document.createElement('img');
			image.onclick = function () {
				calibration();
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
			};
			image.src = 'images/calibration.png';
			image.style.cssFloat = 'left';
			image.style.height = '100%';
			image.style.marginRight = '1%';
			image.style.maxWidth = '12vw';
			image.title = 'calibration';
			footer.appendChild(image);

			// ear
			var image = document.createElement('img');
			image.index = 3;
			let earString = '';
			if (ear==1) {
				earString = 'Both';
			} else if (ear==2) {
				earString = 'Left';
			} else if (ear==3) {
				earString = 'Right';
			} else {earString = 'Not Specified';}
			image.onclick = function () {
				layout.message('Ear','Which ear are you testing out of? Currently testing: '+earString,{
					Left: function () {
						ear = 2
						earString = 'Left';
						jQuery(this).dialog('destroy').remove();
					},
					Right: function () {
						ear = 3
						earString = 'Right';
						jQuery(this).dialog('destroy').remove();
					},
					Both: function () {
						ear = 4
						earString = 'Both';
						jQuery(this).dialog('destroy').remove();
					},
					Undefined: function () {
						ear = 1
						earString = 'Not Specified';
						jQuery(this).dialog('destroy').remove();
					},
					Cancel: function () {
						jQuery(this).dialog('destroy').remove();
					}
				});
			};
			image.src = 'images/ear.png'; //find ear
			image.style.cssFloat = 'left';
			image.style.height = '100%';
			image.style.marginRight = '1%';
			image.style.maxWidth = '12vw';
			image.title = 'settings';
			footer.appendChild(image);

			// right side (reverse order)
			// blogs
			var image = document.createElement('img');
			image.onclick = function () {
				window.location.href = "https://www.teamhearing.org/blogs";
			};
			image.src = 'images/blogs.png';
			image.style.cssFloat = 'right';
			image.style.height = '100%';
			image.style.marginLeft = '1%';
			image.style.maxWidth = '12vw';
			image.title = 'blogs';
			footer.appendChild(image);

			// chat
			var image = document.createElement('img');
			image.onclick = function () {
				chat();
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
			};
			image.src = 'images/chat.png';
			image.style.cssFloat = 'right';
			image.style.height = '100%';
			image.style.marginLeft = '1%';
			image.style.maxWidth = '12vw';
			image.title = 'chat';
			footer.appendChild(image);

			// messages
			var image = document.createElement('img');
			image.onclick = function () {
				messagesRead();
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
			};
			image.src = 'images/mail.png';
			image.style.cssFloat = 'right';
			image.style.height = '100%';
			image.style.marginLeft = '1%';
			image.style.maxWidth = '12vw';
			image.title = 'messages';
			footer.appendChild(image);

			// dice
			var image = document.createElement('img');
			image.onclick = function () {
				layout.randomPlaylist('easy', 'speech');
			};
			image.src = 'images/die.png';
			image.style.cssFloat = 'left';
			image.style.height = '100%';
			image.style.marginRight = '1%';
			image.style.maxWidth = '12vw';
			image.title = 'dice';
			footer.appendChild(image);
		}

		// bugger
		var image = document.createElement('img');
		image.onclick = function () {
			if (user.role == 'Administrator') {
				bugsReadUI();
			} else {
				bugsCreateUI();
			}
		};
		image.src = 'images/bug.png';
		image.style.cssFloat = 'right';
		image.style.height = '100%';
		image.style.marginLeft = '1%';
		image.title = 'bug report';
		footer.appendChild(image);

		return footer;
	},
	header: function (callback) {
    // clear header if it exists, otherwise create
		if (document.getElementById('header')) {
			var header = document.getElementById('header');
			header.innerHTML = '';
		} else {
			var header = document.createElement('div');
			header.className = 'ui-widget-header';
			header.id = 'header';
			document.body.appendChild(header);
		}

		// home
		var home = document.createElement('img');
		home.id = 'home';
		home.onclick = callback ? callback : function () {
			if (typeof activity !== 'undefined' && 'processor' in activity) { activity.processor.stop(); }
			if (protocol) { protocol.active = false; }
			subuser = user;
			layout.init();
		};
		home.src = 'images/home.png';
		home.style.cssFloat = 'left';
		home.style.height = '100%';
		home.title = 'Return home.';
		home.ontouchstart = function () { document.getElementById('title').style.color = 'red'; };
		home.ontouchend = function () { document.getElementById('title').style.color = 'black'; };
		jQuery(home).button();
		header.appendChild(home);

		// title
		var title = document.createElement('h2');
		title.id = 'title';
		title.innerHTML = 'TeamHearing';
		title.style.cssFloat = 'left';
		title.style.display = 'inline-block';
		title.style.fontFamily = 'Oleo Script';
		title.style.marginLeft = '8px';
		title.style.marginTop = '0px';
		header.appendChild(title);

		// logout button
		var image = document.createElement('img');
		image.id = 'logout';
		image.onclick = function () { Logout(); };
		image.src = 'images/logout.png';
		image.style.cssFloat = 'right';
		image.style.display = 'inline-block';
		image.style.height = '100%';
		image.style.marginLeft = '1%';
		image.title = 'logout';
		header.appendChild(image);

		// user
		var span = document.createElement('span');
		span.innerHTML
			= subuser.firstname+subuser.lastname == ''
			? subuser.codename
			: (document.documentElement.clientHeight / document.documentElement.clientWidth < 1.4)
				? subuser.firstname+' '+subuser.lastname
				: subuser.firstname+' '+subuser.lastname[0]+'.';
		span.onclick = () => { layout.menu(); };
		span.style.color = 'black';
		span.style.cssFloat = 'right';
		span.style.display = 'inline-block';
		span.title = (subuser === user)
			? 'You can view your own account by clicking on your name.'
			: subuser.firstname+' '+subuser.lastname;
		header.appendChild(span);

		// show control button for Administrator
		if (role == 'Administrator') {
			var button = "<button onclick='profilesReadUsernames()'>change</button>";
			jQuery('#user').html(button+user.firstname+' '+user.lastname);
		} else {
			try { jQuery('#user').html(user.firstname+' '+user.lastname); }
			catch (error) {}
		}
		return header;
	},
	help: function (title, message) {
		var help = document.createElement('img');
		help.src = 'images/info.png';
		help.onclick = function (e) {
			layout.message(title,message);
			e.stopPropagation();
		};
		help.style.height = '1.5em';
		help.title = title;
		return help;
	},
	init: function () {
		subuser = user;

		// subuser's team
		user.method = 'team';
		jQuery.ajax({
			data:user,
			error:function(jqXHR,textStatus,errorThrown){console.error(jqXHR,textStatus,errorThrown)},
			success:function(data,status){
				team = JSON.parse(data);
				team = data.length == 0 ? false : team.sort(compareF);
				layout.dashboard();
			},
			type: 'GET',
			url: 'version/'+version+'/php/profiles.php'
		});

		// all users who are not clients
		jQuery.ajax({
			data: {
				method: 'notClients',
				user: user.username
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.error(jqXHR, textStatus, errorThrown);
			},
			success: function (data, status) {
				notClients = JSON.parse(data);
				notClients.sort(compareF);
			},
			type: 'GET',
			url: 'version/'+version+'/php/profiles.php'
		});
	},
	input: function (value) {
		var input = document.createElement('input');
		input.value = value;
		if (widgetUI) {
			input.style.textAlign = 'left';
			jQuery(input).button();
		}
		return input;
	},
	main: function (title, back, extra) {
		// define main div
		if (document.getElementById('main')) {
			var main = document.getElementById('main');
			main.innerHTML = '';
		} else {
			var main = document.createElement('div');
			main.id = 'main';
			document.body.appendChild(main);
		}

		// title bar
		if (title) {
			// settings table
			var heading = document.createElement('table');
			heading.style.fontSize = '200%';
			heading.style.height = '10%';
			heading.style.width = '100%';
			main.appendChild(heading);
			var cellIndex = 0;
			var row = heading.insertRow(0);
			row.style.width = '100%';

			// back button
			if (back) {
				var cell = row.insertCell(cellIndex++);
				cell.width = '8%';
				var backbutton = document.createElement('img');
				backbutton.onclick = function () { back(); };
				backbutton.src = 'images/340.png';
				backbutton.style.cssFloat = 'left';
				backbutton.style.height = '1.1em';
				backbutton.style.marginRight = '.5em';
				backbutton.style.padding = '.2em';
				backbutton.title = 'Back';
				jQuery(backbutton).button();
				if (iOS) { FastClick(backbutton); }
				cell.appendChild(backbutton);
			}

			// title
			var cell = row.insertCell(cellIndex++);
			var td = document.createElement('span');
			td.innerHTML = title;
			//td.style.height = jQuery(heading).outerHeight(true)+'px';
			td.style.verticalAlign = 'bottom';
			td.style.width = '100%';
			cell.appendChild(td);

			// extra buttons
			if (extra) {
				var cell = row.insertCell(cellIndex);
				for (key in extra) {
					var button = document.createElement('button');
					button.key = key;
					button.innerHTML = key;
					button.onclick = function () { extra[this.key](); };
					button.style.cssFloat = 'right';
					button.style.fontSize = '60%';
					button.style.height = '100%';
					button.style.marginLeft = '.2em';
					button.style.width = '7em';
					jQuery(button).button();
					cell.appendChild(button);
					if (iOS) { FastClick(button); }
				}
			}

			// horizontal rule
			main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');
		}
		return main;
	},
	menu: function () {
		layout.header();
		document.getElementById('home').title = subuser === user ? 'You are home.' : 'Return home.';
		document.getElementById('logout').style.visibility = (subuser === user) ? 'visible' : 'hidden';

		// main
		var main = layout.main('Main Menu',
			(user.role == 'Client') ? false : () => { layout.init(); },
			{ 'Studies': () => {
					switch (version) {
						case 'alpha': loadassignment('menu'); break;
						case 'beta': loadassignment('menu'); break;
						case 'gold': loadassignment('menu_gold'); break;
						case '78': loadassignment('bel_pitch'); break;
						case '79': loadassignment('bel_enhance'); break;
						case '80': loadassignment('bel_modulation'); break;
						case '81': loadassignment('bel_intervals'); break;
						case '82': loadassignment('bel_pleasantness'); break;
						case '83': loadassignment('bel_voice'); break;
						case '84': loadassignment('bel_binaural'); break;
						case '85': loadassignment('bel_bimodal'); break;
						case '86': loadassignment('bel_stream'); break;
						case '87': loadassignment('bel_modulation2'); break;
						case '88': loadassignment('bel_musescore'); break;
						default: loadassignment('menu');
					}
				}
			}
		);

		// menu
		var menu = document.createElement('div');

		// menu options
		var options = [
			'Audiological Information',
			'Audiometry',
			'Environmental Sounds',
			'Musical Listening Exercises',
			'Psychophysics',
			'Seeing & Hearing Speech',
			'Speech Recognition',
		];
		var callbacks = [
			() => { audiologic(); },
			() => { audiogram(); },
			() => { environmental({
				back: () => { layout.menu(); },
				init: () => { activity.menu(); }
			})},
			() => { layout.music(); },
			() => { layout.percept(); },
			() => { shs(); },
			() => { layout.speech(); },
		];
		const messages = [
			'Organize hearing healthcare information.',
			'Measure and organize audiograms.',
			'Hearing tests and training exercises using environmental sounds.',
			'Musical listening exercises and assessments', 
			'Auditory and visual psychophysics.',
			'A wide range of speech recognition activities with audio-visual materials.',
			'Speech recognition activities including phoneme, word, and sentence materials.',
		]; 
		const imagelist = [
			'audi.png',
			'equalizer.png',
			'environmental.png',
			'musanim.png',
			'psi.png',
			'shs.gif',
			'speech.png',
		];

		// menu: build
		for (let a = 0; a < options.length; a++) {
			// help
			var help = layout.help(options[a],messages[a]);
			help.style.cssFloat = 'right';
			help.style.zindex = 10;

			// item
			var item = document.createElement('li');
			item.id = a;
			item.onclick = function () {
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
				callbacks[this.id]();
			};

			// icon
			var img = document.createElement('img');
			img.src = 'images/'+imagelist[a];
			img.style.height = '1.5em';
			img.style.paddingRight = '8px';

			// title
			var span = document.createElement('span');
			span.innerHTML = options[a];
			span.style.display = 'inline-block';

			// anchor
			var anchor = document.createElement('a');
			anchor.id = 'menuitem'+a;
			anchor.appendChild(img);
			anchor.appendChild(span);
			menu.appendChild(item);
			item.appendChild(anchor);
			anchor.appendChild(help);
			if(iOS){FastClick(item)};
		}
		jQuery(menu).menu();
		main.appendChild(menu);

		// footer
		layout.footer(true);
	},
	message: function (title, message, buttons) {
		let dialog = document.createElement('div');
		dialog.id = 'message';
		dialog.innerHTML = message + '<br>';
		dialog.style.fontSize = 'larger';
		dialog.style.textAlign = 'center';
		dialog.title = title;
		jQuery(dialog).dialog({
			buttons: buttons
				? (typeof buttons === "function")
					? 	{
							Okay: function () {
								buttons();
								jQuery(this).dialog('destroy').remove();
							}
						}
					: buttons
				: {
					Okay: function () {
						jQuery(this).dialog('destroy').remove();
					}
			},
			modal: true,
			resizable: false,
			width: 0.8*jQuery(window).width()
		});

		// add message next to start button
		let span = document.createElement('span');
		span.id = 'message';
		span.innerHTML = '';
		span.style.float = 'right';
		jQuery('.ui-dialog-buttonpane').append(span);

		return dialog;
	},
	music: function () {
		// main
		var main = layout.main('Musical Listening Exercises', () => { layout.menu(); });

		// menu definition
		const options = [
			'Melodic Contour',
			'Melody & Rhythm Comparisons',
			'Musical Interval Identification',
			'Pleasantness Ratings'
		];

		// callbacks
		let callbacks = [];

		// melodic contour
		callbacks.push(() => {
			musanim({
				back: () => { layout.music(); },
				init: () => { activity.menu(); }
			});
		});

		// melody and rhythm comparisons
		callbacks.push(() => {
			confronto({
				back: () => { layout.music(); },
				init: () => { activity.menu(); }
			});
		});

		// musical interval identification
		callbacks.push(() => {
			loadscript('intervals', () => {
				intervals({
					back: () => { layout.music(); },
					init: () => { activity.menu(); }
				});
			})
		});

		// pleasantness ratings
		callbacks.push(() => {
			loadscript('pleasantness', () => {
				pleasantness({
					back: () => { layout.music(); },
					init: () => { activity.menu(); }
				});
			})
		});

		//
		var images = ['musanim.png'], messages = [];
		for (let a = 0; a < options.length; a++) {
			messages[a] = '<b>'+options[a]+'</b><br>';
		}
		var a = 0;
		messages[a++] += 'Practice listening to melodic contours.';
		messages[a++] += 'Practice comparing melodies and rhythms.';
		messages[a++] += 'Practice listening to musical intervals.';
		messages[a++] += 'Rate the consonance and dissonance of musical dyads..';

		// footer
		layout.footer();

		// create menu
		var menu = document.createElement('div');
		for (let a = 0; a < options.length; a++) {
			// help
			var help = layout.help(options[a], messages[a]);
			help.style.cssFloat = 'right';
			help.style.zindex = 10;

			// item
			var item = document.createElement('li');
			item.id = a;
			item.onclick = function () {
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
				callbacks[Number(this.id)]();
			};

			// icon
			var img = document.createElement('img');
			img.src = 'images/'+images[Math.min(images.length-1,a)];
			img.style.height = '1.5em';
			img.style.paddingRight = '8px';

			// title
			var span = document.createElement('span');
			span.innerHTML = options[a];
			span.style.display = 'inline-block';

			// anchor
			var anchor = document.createElement('a');
			anchor.id = 'menuitem'+a;
			anchor.appendChild(img);
			anchor.appendChild(span);
			menu.appendChild(item);
			item.appendChild(anchor);
			anchor.appendChild(help);
			if(iOS){FastClick(item)}
		}
		main.appendChild(menu);
		jQuery(menu).menu();
	},
	/**
	 * Function that generates the indices of the playlist, and renders the random playlists webpage.
	 * @param {string} difficulty - Select the difficulty of the playlist: {'easy', 'medium', 'hard'}. Select s'easy' by default.
	 * @param {string} playlistMode - Select the plylist mode: {'music', 'speech'}. Selects 'speech' by default.
	 */
	randomPlaylist(difficulty = 'easy', playlistMode = 'speech') {
		let back = layout.music();//back ? back : () => { layout.dashboard(); };

		// init
		const mode = 'bel_intervals_training';
		let a = 0, callbacks = [], options = [];

		// select the playlist based off of the difficulty
		let playlist;
		switch (difficulty) {
		case 'easy':
			playlist = easyPlaylist;
			break;
		case 'medium':
			playlist = mediumPlaylist;
			break;
		case 'hard':
			playlist = hardPlaylist;
			break;
		default:
			playlist = easyPlaylist;
		}
		// add the neutral playlist and filter the exercises based on mode
		playlist = playlist.concat(neutralPlaylist).filter(obj => {
			return playlistMode === 'speech' ? obj.mode === 'speech'
				: obj.mode !== 'speech';
		});

		/*
		The following code is ajax code that will make php calls. Unfortunately, I have made a lot of changes to
		the structure of the php script and the playlist table, so this ajax code will not work. 
		*/
		// /*
		// NOTE: need to set async to false because this data HAS to load before anything happens,
		// but that means the webpage will have to block :( 
		// */

		// // could use jQuery.ajax.bind() here but w/e 
		// let logDate = () => {
		// 	jQuery.ajax({
		// 		data: {
		// 			user: user.ID,
		// 		},
		// 		error: function (jqXHR, textStatus, errorThrown) {
		// 			console.log(jqXHR, textStatus, errorThrown);
		// 		},
		// 		success: function (data, status) {},
		// 		type: 'POST',
		// 		url: 'version/'+version+'/php/last-visit.php',
		// 		async: false,
		// 	});
		// };

		// let removeDate = () => {
		// 	jQuery.ajax({
		// 		data: {
		// 			user: user.ID,
		// 		},
		// 		error: function (jqXHR, textStatus, errorThrown) {
		// 			console.log(jqXHR, textStatus, errorThrown);
		// 		},
		// 		success: function (data, status) {},
		// 		type: 'DELETE',
		// 		url: 'version/'+version+'/php/last-visit.php',
		// 		async: false,
		// 	});
		// };

		// let logIndices = (indices) => {
		// 	jQuery.ajax({
		// 		data: {
		// 			user: user.ID,
		// 			indices: indices,
		// 		},
		// 		error: function (jqXHR, textStatus, errorThrown) {
		// 			console.log(jqXHR, textStatus, errorThrown);
		// 		},
		// 		success: function (data, status) {},
		// 		type: 'POST',
		// 		url: 'version/'+version+'/php/indices.php',
		// 		async: false,
		// 	});
		// };

		// let removeIndices = () => {
		// 	// log the new date
		// 	jQuery.ajax({
		// 		data: {
		// 			user: user.ID,
		// 		},
		// 		error: function (jqXHR, textStatus, errorThrown) {
		// 			console.log(jqXHR, textStatus, errorThrown);
		// 		},
		// 		success: function (data, status) {},
		// 		type: 'DELETE',
		// 		url: 'version/'+version+'/php/indices.php',
		// 		async: false,
		// 	});
		// };

		// let readIndices = () => {
		// 	let indices;
		// 	jQuery.ajax({
		// 		data: {
		// 			user: user.ID,
		// 		},
		// 		error: function (jqXHR, textStatus, errorThrown) {
		// 			console.log(jqXHR, textStatus, errorThrown);
		// 		},
		// 		success: function (data, status) {
		// 			console.log(data);
		// 			var data = JSON.parse(data);
		// 			console.log(data);
		// 			indices = data;
		// 		},
		// 		type: 'POST',
		// 		url: 'version/'+version+'/php/indices.php',
		// 		async: false,
		// 	});
		// 	return indices;
		// };

		// // check if user logged in a new day
		// // if user hasn't logged in, log the date
		// // if user logged in on a new day, remove indices and log the date
		// // if it's not a new day, do nothing
		// let indices = [];
		// jQuery.ajax({
		// 	data: {
		// 		user: user.ID,
		// 	},
		// 	error: function (jqXHR, textStatus, errorThrown) {
		// 		console.log(jqXHR, textStatus, errorThrown);
		// 	},
		// 	success: function (data, status) {
		// 		console.log(data);
		// 		var data = JSON.parse(data);
		// 		console.log(data);
		// 		// if does not exists, log date and indices
		// 		if (data == 'dne') {
		// 			// populate the array, and then shuffle it, and then grab 6 elements
		// 			for (let i = 0; i < playlist.length; ++i) 
		// 				indices[i] = i;
					
		// 			indices = indices.shuffle().slice(0, 6);

		// 			// log new data
		// 			logDate();
		// 			logIndices(indices);
		// 		// if it's a different day, clear data, then log new data
		// 		} else if (data == 'different') {
		// 			// clear data
		// 			removeDate();
		// 			removeIndices();
					
		// 			let indices = [];
		// 			// populate the array, and then shuffle it, and then grab 6 elements
		// 			for (let i = 0; i < playlist.length; ++i) 
		// 				indices[i] = i;
					
		// 			indices = indices.shuffle().slice(0, 6);

		// 			// log new data
		// 			logDate();
		// 			logIndices(indices);
		// 		// if it's the same day, just read the data
		// 		} else if (data == 'same') {
		// 			indices = readIndices();
		// 		} else {
		// 			console.log('oooooooooooooooooooops');
		// 		}
		// 	},
		// 	type: 'GET',
		// 	url: 'version/'+version+'/php/last-visit.php',
		// 	async: false,
		// });

		// these are just aliases 
		// won't work when I do getItem = window.localStorage.getItem.bind(window), not sure why
		let getItem = (key) => window.localStorage.getItem(key);
		let setItem = (key, val) => window.localStorage.setItem(key, val);
		let removeItem = (key) => window.localStorage.removeItem(key);

		// if there is a day, month, year, check if it's a new day
		if (getItem('day') !== null &&
				getItem('month') !== null &&
				getItem('year') !== null
		) {
			// get the date store in local storage
			let prevDay = JSON.parse(getItem('day'));
			let prevMonth = JSON.parse(getItem('month'));
			let prevYear = JSON.parse(getItem('year'));
			// get current date
			let currDate = new Date();
			let currDay = currDate.getDate();
			let currMonth = currDate.getMonth();
			let currYear = currDate.getFullYear();

			// time flows in one direction, so if any of these are not equal, we assume
			// that a new day has occurred and reset the playlist
			// otherwise, do nothing
			if (currDay !== prevDay || currMonth !== prevMonth || currYear !== prevYear) {
				const remove = (diff, pm) => {
					console.log(JSON.stringify({difficulty: diff, playlistMode: pm}));
					removeItem(JSON.stringify({difficulty: diff, playlistMode: pm}));
				}
				
				// I could use a 2D loop here, but the code isn't tedious enough IMO
				remove('easy', 'speech');
				remove('medium', 'speech');
				remove('hard', 'speech');

				remove('easy', 'music');
				remove('medium', 'music');
				remove('hard', 'music');

				removeItem('day');
				removeItem('month');
				removeItem('year');

				// record today's new date
				let date = new Date();
				setItem('day', JSON.stringify(date.getDate()));
				setItem('month', JSON.stringify(date.getMonth()));
				setItem('year', JSON.stringify(date.getFullYear()));
			}
		} else {
			// date is null, so create date and store in local storage 
			let date = new Date();
			setItem('day', JSON.stringify(date.getDate()));
			setItem('month', JSON.stringify(date.getMonth()));
			setItem('year', JSON.stringify(date.getFullYear()));
		}
		
		// let each exercise take 15 trials. 
		const TRIALS = 15;
		// the idea here is store the indices of the exercises instead of the exercises themselves cuz that would be torture...
		let indices;
		// need an entry given a difficulty and a playlistMode
		let selection = JSON.stringify({difficulty: difficulty, playlistMode: playlistMode});
		console.log(selection);
		// if indices doesn't exist in local storage, create a new random list and store it
		if (getItem(selection) === null) {
			indices = [];
			// populate the array, and then shuffle it, and then grab 6 elements
			for (let i = 0; i < playlist.length; ++i) 
				indices[i] = i;
			
			indices = indices.shuffle().slice(0, 6);
			setItem(selection, JSON.stringify(indices));
			console.log(indices);
		} else {
			// indices exists, so parse it from local storage
			indices = JSON.parse(getItem(selection));
			console.log(indices);
		}
		// prepare the playlist data so that it can passed as an argument
		// technically should use map() instead of forEach()
		playlist.forEach((obj, i) => { 
			obj.callback = () => {
				protocol = new Protocol();
				protocol.activity = obj.activity;
				protocol.callback = finishCallback.bind(null, i);
				obj.settings.trials = TRIALS;
				
				protocol.settings.push(obj.settings);
				// default to 3 if reptitions is null/undefined/<0
				protocol.start(obj.repetitions ? obj.repetitions : 3);
			}
			// store the index before the playlist gets filtered
			obj.index = i;
		});
		// grab the exercises that are in the random list
		playlist = playlist.filter((obj, i) => indices.includes(i));

		var finishCallback = (i) => {
			// get the indices list, remove the desired index, then put it back into local storage
			let indices = JSON.parse(window.localStorage.getItem(selection));
			indices.splice(indices.indexOf(i), 1);
			setItem(selection, JSON.stringify(indices));
			// if there are more exercises, immediately start the next exercise. otherwise, go back to webpage
			if (indices.length > 0) {
				const nextExercise = playlist.find(obj => obj.index === indices[0]);
				console.log(JSON.stringify({index: nextExercise.index, length: playlist.length}))
				protocol = new Protocol();
				protocol.activity = nextExercise.activity;
				protocol.callback = finishCallback.bind(null, nextExercise.index);
				nextExercise.settings.trials = TRIALS;
				protocol.settings.push(nextExercise.settings);
				protocol.start(nextExercise.repetitions ? nextExercise.repetitions : 3);
			} else {
				layout.randomPlaylist(difficulty, playlistMode);
			}
		};

		let extra = {};
		// bind the opposite mode so that user can change modes
		if (playlistMode == 'speech') {
			extra.music = layout.randomPlaylist.bind(null, difficulty, 'music');
		} else {
			extra.speech = layout.randomPlaylist.bind(null, difficulty, 'speech');
		}
		// using map() function to isolate properties of playlist
		// which is technically not efficient but it does the job
		if (playlist.length > 0) {
			layout.assignment(
				`${playlistMode} - ${difficulty}`, 
				playlist.map(obj => obj.option),
				playlist.map(obj => obj.callback),
				extra,
				mode,
				back
			);
		} else {
			// no more exercies to play, so let the user know
			layout.assignment(
				`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} mode (${playlistMode}) complete! See you tomorrow.`, 
				[],
				[],
				extra,
				mode,
				back
			);
		}

		/*
		NOTE: layout.assignment calls layout.footer(),
		so this is technically not efficient to rerender
		the footer twice, but it's easier than having to 
		create another footer function. I'm lazy :) 
		*/
		let footer = layout.footer();

		// empty the footer and then add the easy/med/hard buttons
		while (footer.firstChild)
			footer.removeChild(footer.firstChild);

		// easy
		var button = document.createElement('button');
		button.innerHTML = 'easy';
		button.onclick = layout.randomPlaylist.bind(null, 'easy', playlistMode);
		button.style.cssFloat = 'left';
		button.style.fontSize = '150%';
		button.style.height = '100%';
		button.style.marginLeft = '.2em';
		button.style.width = '7em';
		jQuery(button).button();
		footer.appendChild(button);

		// medium
		var button = document.createElement('button');
		button.innerHTML = 'medium';
		button.onclick = layout.randomPlaylist.bind(null, 'medium', playlistMode);
		button.style.cssFloat = 'left';
		button.style.fontSize = '150%';
		button.style.height = '100%';
		button.style.marginLeft = '.2em';
		button.style.width = '7em';
		jQuery(button).button();
		footer.appendChild(button);

		// hard
		var button = document.createElement('button');
		button.innerHTML = 'hard';
		button.onclick = layout.randomPlaylist.bind(null, 'hard', playlistMode);
		button.style.cssFloat = 'left';
		button.style.fontSize = '150%';
		button.style.height = '100%';
		button.style.marginLeft = '.2em';
		button.style.width = '7em';
		jQuery(button).button();
		footer.appendChild(button);

		// center the buttons on the footer
		footer.style.display = 'flex';
		footer.style.justifyContent = 'center';
	},
	percept: function () {
		// main
		var main = layout.main('Psychophysics', () => { layout.menu(); });

		// menu
		var menu = document.createElement('div');

		// menu options
		var options = [
			'Loudness Perception',
			'Pitch Perception',
			'Spatial Hearing',
			'Visual Psychophysics'
		];
		var callbacks = [
			() => { layout.perceptLoudness(); },
			() => { layout.perceptPitch(); },
			() => { layout.perceptSpatial(); },
			() => { layout.perceptVision(); }
		];
		var messages = [
			'Organize hearing healthcare information.',
			'Measure and organize audiograms.',
			'Hearing tests and training exercises using environmental sounds.',
			'Auditory and visual psychophysics.'
		];
		var imagelist = [
			'psi.png'
		];
		var training = false;

		// menu: build
		for (let a = 0; a < options.length; a++) {
			// help
			var help = layout.help(options[a],messages[a]);
			help.style.cssFloat = 'right';
			help.style.zindex = 10;

			// item
			var item = document.createElement('li');
			item.id = a;
			item.onclick = function () {
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
				callbacks[this.id]();
			};

			// icon
			var img = document.createElement('img');
			img.src = 'images/'+imagelist[Math.min(a,imagelist.length-1)];
			img.style.height = '1.5em';
			img.style.paddingRight = '8px';

			// title
			var span = document.createElement('span');
			span.innerHTML = options[a];
			span.style.display = 'inline-block';

			// anchor
			var anchor = document.createElement('a');
			anchor.id = 'menuitem'+a;
			anchor.appendChild(img);
			anchor.appendChild(span);
			menu.appendChild(item);
			item.appendChild(anchor);
			anchor.appendChild(help);
			if (training) { anchor.appendChild(training); }
			if (iOS) { FastClick(item); };
		}
		jQuery(menu).menu();
		main.appendChild(menu);

		// footer
		layout.footer(true);
	},
	perceptLoudness: function () {
		// main
		let main = layout.main(
			'Loudness Perception',
			() => { layout.percept(); }
		);

		// options
		const options = [
			'Detection Thresholds',
			'Loudness of Pure Tones',
			'Modulation Detection'
		];

		// callbacks
		let callbacks = [];

		// detection thresholds
		callbacks.push(() => {
			harmonics({
				adaptive: new Adaptive({
					rule: 'linear',
					step0: 6,
					valueMax: 0
				}),
				alternatives: 3,
				back: () => { layout.perceptLoudness(); },
				chances: 3,
				init: () => { activity.menu(); },
				material: new Harmonics({
					activity: 0,
					attack: .02,
					duration: .4,
					f0: 0,
					f1: 1000,
					gain_rove: 0,
					mode: 0,
					release: .02,
					title: 'Detection Thresholds'
				})
			});
		});

		// loudness of pure tones
		callbacks.push(() => {
			harmonics({
				alternatives: 3,
				back: () => { layout.perceptLoudness(); },
				chances: 3,
				init: () => { activity.menu(); },
				material: new Harmonics({
					activity: 3,
					difference: new Adaptive({rule:'exponential', value0:24, valueMax:24}),
					f0: 0,
					f1: 1000,
					mode: 0,
					title: 'Loudness Discrimination'
				})
			});
		});

		// modulation detection
		callbacks.push(() => {
			harmonics({
				adaptive: new Adaptive({
					rule: 'exponential',
					value0: 64,
					valueMax: 256
				}),
				alternatives: 3,
				back: () => { layout.perceptLoudness(); },
				chances: 3,
				init: () => { activity.menu(); },
				material: new Harmonics({
					activity: 4,
					attack: .02,
					f0: 10,
					f1: 1000,
					mode: 3,
					release: .02,
					title: 'Modulation Detection'
				})
			});
		});

		// images
		const images = ['psi.png'];

		// messages
		var messages = [];
		for (let a = 0; a < options.length; a++) {
			messages[a] = '<b>'+options[a]+'</b><br>';
		}
		var a = 0;
		messages[a++] += 'message';
		messages[a++] += 'message';
		messages[a++] += 'message';

		// footer
		layout.footer();

		// create menu
		var menu = document.createElement('div');
		for (let a = 0; a < options.length; a++) {
			// help
			var help = layout.help(options[a], messages[a]);
			help.style.cssFloat = 'right';
			help.style.zindex = 10;

			// item
			var item = document.createElement('li');
			item.id = a;
			item.onclick = function () {
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
				callbacks[Number(this.id)]();
			};

			// icon
			var img = document.createElement('img');
			img.src = 'images/'+images[Math.min(images.length-1,a)];
			img.style.height = '1.5em';
			img.style.paddingRight = '8px';

			// title
			var span = document.createElement('span');
			span.innerHTML = options[a];
			span.style.display = 'inline-block';

			// anchor
			var anchor = document.createElement('a');
			anchor.id = 'menuitem'+a;
			anchor.appendChild(img);
			anchor.appendChild(span);
			menu.appendChild(item);
			item.appendChild(anchor);
			anchor.appendChild(help);
			if (iOS) { FastClick(item); }
		}
		main.appendChild(menu);
		jQuery(menu).menu();
	},
	perceptPitch: function () {
		// main
		let main = layout.main('Pitch Perception', () => { layout.percept(); });

		// menu definition
		const options = [
			'Pure Tone Frequency Discrimination',
			'Complex Tones Fundamental Frequency Discrimination',
			'Modulation Frequency Discrimination',
			'Voice Pitch'
		];

		// callbacks
		let callbacks = [];

		// pure tone frequency discrimination
		callbacks.push(() => {
			harmonics({
				alternatives: 2,
				back: () => { layout.perceptPitch(); },
				chances: 3,
				init: () => { activity.menu(); },
				material: new Harmonics({
					activity: 1,
					duration: .4,
					f0: 0,
					f1: 1000,
					mode: 0,
					title: 'Frequency Discrimination'
				})
			});
		});

		// complex tones
		callbacks.push(() => {
			harmonics({
				alternatives: 2,
				back: () => { layout.perceptPitch(); },
				chances: 3,
				init: () => { activity.menu(); },
				material: new Harmonics({
					activity: 2,
					duration: .4,
					gain: 0,
					f0: 110,
					f1: 1000,
					mode: 1,
					title: 'F0 Discrimination'
				})
			});
		});

		// complex tones
		callbacks.push(() => {
			harmonics({
				alternatives: 2,
				back: () => { layout.perceptPitch(); },
				chances: 3,
				init: () => { activity.menu(); },
				material: new Harmonics({
					activity: 2,
					duration: .4,
					f0: 110,
					f1: 1000,
					mode: 0,
					title: 'Modulation Frequency Discrimination'
				})
			});
		});

		// voice
		callbacks.push(() => {
			voice({
				back: () => { layout.perceptPitch(); },
				init: () => { activity.menu(); }
			});
		});

		//
		var images = ['psi.png'], messages = [];
		for (let a = 0; a < options.length; a++) {
			messages[a] = '<b>'+options[a]+'</b><br>';
		}
		var a = 0;
		messages[a++] += 'Practice listening to melodic contours.';
		messages[a++] += 'Pitch discrimination using band-passed filtered harmonic complexes.';
		messages[a++] += 'Pitch discrimination of pure tones.';
		messages[a++] += 'Practice listening to pitch changes in spoken words.';

		// footer
		layout.footer();

		// create menu
		var menu = document.createElement('div');
		for (let a = 0; a < options.length; a++) {
			// help
			var help = layout.help(options[a], messages[a]);
			help.style.cssFloat = 'right';
			help.style.zindex = 10;

			// item
			var item = document.createElement('li');
			item.id = a;
			item.onclick = function () {
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
				callbacks[Number(this.id)]();
			};

			// icon
			var img = document.createElement('img');
			img.src = 'images/'+images[Math.min(images.length-1,a)];
			img.style.height = '1.5em';
			img.style.paddingRight = '8px';

			// title
			var span = document.createElement('span');
			span.innerHTML = options[a];
			span.style.display = 'inline-block';

			// anchor
			var anchor = document.createElement('a');
			anchor.id = 'menuitem'+a;
			anchor.appendChild(img);
			anchor.appendChild(span);
			menu.appendChild(item);
			item.appendChild(anchor);
			anchor.appendChild(help);
			if (iOS) {FastClick(item)}
		}
		main.appendChild(menu);
		jQuery(menu).menu();
	},
	perceptSpatial: function () {
		// main
		let main = layout.main('Spatial Hearing', () => { layout.percept(); });

		// menu definition
		var menu = document.createElement('div');
		let options = [
			'Tone Detection',
			windowwidth < 4 ? 'ILD Discrimination' : 'Interaural Level Difference (ILD) Discrimination',
			windowwidth < 4 ? 'ITD Discrimination' : 'Interaural Timing Difference (ITD) Discrimination',
			'Sound Movement',
			'Speech in Noise'
		];
		let callbacks = [
			() => {
				bmld({
					back: () => { layout.perceptSpatial(); }
				});
			},
			() => {
				ild({
					back: () => { layout.perceptSpatial(); }
				});
			},
			() => {
				itd({
					back: () => { layout.perceptSpatial(); }
				});
			},
			() => {
				lateralization({
					back: () => { layout.perceptSpatial(); }
				});
			},
			() => {
				crisp({
					alternatives: 4,
					back: () => { layout.perceptSpatial(); },
					init: () => {
						protocol.activity = 'crisp';
						protocol.settings = [];
						protocol.settings.push({noise: 'crisp_0', repeat: false});
						protocol.settings.push({noise: 'crisp_L', repeat: false});
						protocol.settings.push({noise: 'crisp_R', repeat: false});
						protocol.start();
					}
				});
			}
		];
		let messages = [];
		for (let a = 0; a < options.length; a++) {
			messages[a] = '<b>'+options[a]+'</b><br>';
		}
		var a = 0;
		messages[a++] += 'message';
		messages[a++] += 'message';
		messages[a++] += 'message';
		messages[a++] += 'message';
		messages[a++] += 'message';
		var images = ['psi.png','psi.png','psi.png','psi.png','speech.png'];

		// footer
		layout.footer();

		// create menu
		var menu = document.createElement('div');
		for (var a = 0; a < options.length; a++) {
			// help
			var help = layout.help(options[a], messages[a]);
			help.style.cssFloat = 'right';
			help.style.zindex = 10;

			// item
			var item = document.createElement('li');
			item.id = a;
			item.onclick = function () {
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
				callbacks[Number(this.id)]();
			};

			// icon
			var img = document.createElement('img');
			img.src = 'images/'+images[Math.min(images.length-1,a)];
			img.style.height = '1.5em';
			img.style.paddingRight = '8px';

			// title
			var span = document.createElement('span');
			span.innerHTML = options[a];
			span.style.display = 'inline-block';

			// anchor
			var anchor = document.createElement('a');
			anchor.id = 'menuitem'+a;
			anchor.appendChild(img);
			anchor.appendChild(span);
			menu.appendChild(item);
			item.appendChild(anchor);
			anchor.appendChild(help);
			if (iOS) {FastClick(item)}
		}
		main.appendChild(menu);
		jQuery(menu).menu();
	},
	perceptVision: function () {
		// main
		var main = layout.main('Visual Psychophysics', () => { layout.percept(); });

		// menu definition
		var menu = document.createElement('div');
		var options = [
			'Gabor Frequency Discrimination',
			'Gabor Tilt Discrimination'
		];
		var callbacks = [
			() => {
				gabor({
					back: () => { layout.perceptVision(); },
					init: () => { activity.menu(); },
					mode: 1//frequency
				});
			},
			() => {
				gabor({
					back: () => { layout.perceptVision(); },
					init: () => { activity.menu(); },
					mode: 0//tilt
				});
			}
		];
		var messages = [];
		for (var a = 0; a < options.length; a++) {
			messages[a] = '<b>'+options[a]+'</b><br>';
		}
		var a = 0;
		messages[a++] += 'message';
		messages[a++] += 'message';
		var images = ['psi.png'];

		// footer
		layout.footer();

		// create menu
		var menu = document.createElement('div');
		for (var a = 0; a < options.length; a++) {
			// help
			var help = layout.help(options[a], messages[a]);
			help.style.cssFloat = 'right';
			help.style.zindex = 10;

			// item
			var item = document.createElement('li');
			item.id = a;
			item.onclick = function () {
				document.getElementById('home').title = 'Return home.';
				document.getElementById('logout').style.visibility = 'hidden';
				callbacks[Number(this.id)]();
			};

			// icon
			var img = document.createElement('img');
			img.src = 'images/'+images[Math.min(images.length-1,a)];
			img.style.height = '1.5em';
			img.style.paddingRight = '8px';

			// title
			var span = document.createElement('span');
			span.innerHTML = options[a];
			span.style.display = 'inline-block';

			// anchor
			var anchor = document.createElement('a');
			anchor.id = 'menuitem'+a;
			anchor.appendChild(img);
			anchor.appendChild(span);
			menu.appendChild(item);
			item.appendChild(anchor);
			anchor.appendChild(help);
			if(iOS){FastClick(item)}
		}
		main.appendChild(menu);
		jQuery(menu).menu();
	},
	select: function (options) {
		var select = document.createElement('select');
		for (let a = 0; a < options.length; a++) {
			var option = document.createElement('option');
			option.text = options[a];
			select.add(option);
		}
		select.style.width = '100%';
		select.value = options[0];
		return select;
	},
	speech: function () {
		// main
		var main = layout.main('Speech Tests', function () { layout.menu(); });

		// menu
		var menu = document.createElement('div');
		var messages = [
			// House Consonants
			'<b>House Consonants</b><br>'
			+'Recorded at the House Ear Institute. <br><br>'
			+'Shannon, R. V, Jensvold, A., Padilla, M., Robert, M. E., & Wang, X. (1999). '
			+'Consonant recordings for speech testing. '
			+'The Journal of the Acoustical Society of America, 106(6), L71-L74. ',
			// Hillenbrand Vowels
			'<b>Hillenbrand Vowels</b><br>'
			+'Recorded at Western Michigan University.<br><br>'
			+'Hillenbrand, J., Getty, L. A, Clark, M. J., & Wheeler, K. (1995). '
			+'Acoustic characteristics of American English vowels. '
			+'The Journal of the Acoustical Society of America, 97(5 Pt 1), 3099-3111.',
			// CRISP Spondee Words
			'<b>CRISP Spondee Words</b><br>'
			+'Recorded at the University of Wisconsin-Madison.<br><br>'
			+'These materials are part of the larger'
			+'<br><i>Children\'s Realistic Index of Speech Perception (CRISP)</i><br>'
			+'test developed by the Binaural Hearing & Speech Lab.',
			// Modified Rhyme Test
			'<b>Modified Rhyme Test</b><br>'
			+'Recorded at Sensimetrics Corporation (www.sens.com)',
			// SPIN Sentences
			'<b>SPIN Sentences</b><br>'
			+'Recorded at ?<br><br>'
			+'Elliott, L.L. (1995). Verbal auditory closure and the Speech Perception in Noise (SPIN) test. '
			+'Journal of Speech and Hearing Research, 38, 1363-1376.',
			// BEL Sentences
			'<b>BEL Sentences</b><br>'
			+'Recorded at Queens College of the City University of New York.<br><br>'
			+'Calandruccio, L., Smiljanic, R., Lecumberri, G., & Wijngaarden, V. (2012). '
			+'New Sentence Recognition Materials Developed Using a Basic Non-Native English Lexicon, 55(October).',
			// Spanish/English Word Test
			'<b>Spanish/English Word Test</b><br>'
			+'Calandruccio, L., Gomez, B., Buss, E., & Leibold, L. J. (2014). '
			+'Development and preliminary evaluation of a pediatric spanish-english speech perception task. '
			+'American Journal of Audiology (Online), 23(2), 158-72. '
			+'doi:http://dx.doi.org.libproxy1.usc.edu/10.1044/2014_AJA-13-0055',
			// Coordinate Response Measure
			'<b>Coordinate Response Measure</b><br>'
			+'Reference original article.'
		];
		var options = [
			'Consonants',
			'Vowels',
			'Spondee Words',
			'Modified Rhymes',
			'SPIN Sentences',
			'BEL Sentences',
			'Spanish/English Words',
			'Coordinate Response Measure',
			'Matrix Vocoder Test',
			'Dichotic Listening'
		];
		for (var a = 0; a < options.length; a++) {
			// help
			var help = layout.help(options[a], messages[a]);
			help.style.cssFloat = 'right';
			help.style.zindex = 10;

			// results
			if (this.resultsMessage) {
				var last = document.createElement('span');
				last.innerHTML = this.resultsMessage[a];
				jQuery(last).css('float','right');
				last.title = 'last test';
			}

			// item
			var item = document.createElement('li');
			item.id = a;
			item.onclick = function () {
				switch (Number(this.id)) {
					case 0: consonants({
						back: () => { layout.speech(); },
						init: () => { activity.menu(); }
					}); break;
					case 1: vowels({
						back: () => { layout.speech(); },
						init: () => { activity.menu(); }
					}); break;
					case 2: crisp({
						back: () => { layout.speech(); },
						init: () => { activity.menu(); }
					}); break;
					case 3: mrt({
						back: () => { layout.speech(); },
						init: () => { activity.menu(); }
					}); break;
					case 4: spin({
						back: () => { layout.speech(); },
						init: () => { activity.menu(); }
					}); break;
					case 5: bel({
						back: () => { layout.speech(); },
						init: () => { activity.menu(); }
					}); break;
					case 6: l1l2({
						back: () => { layout.speech(); },
						init: () => { activity.menu(); }
					}); break;
						/*var password = prompt("Password:","");
						if (password == 'Rameses'){l1l2()} else {return}; break;*/
					case 7: crm({
						back: () => { layout.speech(); },
						init: () => { activity.menu(); }
					}); break;
					case 8: matrix({
						back: () => { layout.speech(); },
						behavior: 'Adaptive',
						init: () => { activity.menu(); },
						noise: 'Noise_1_20sec',
						snr: new Adaptive({multiplier:1, step0:4, stepAdjustment:2, stepMin:1, value0:12})
					}); break;
					case 9: dichotic({
						back: () => { layout.speech(); },
						init: () => { activity.layout(); }
					});
				}
			}

			// anchor
			var anchor = document.createElement('a');
			anchor.id = 'menuitem'+a;

			/* lock
			if (a == 6) {
				var img = document.createElement('img');
				img.src = 'images/lock.png';
				img.style.height = '24px';
				anchor.appendChild(img);
			}*/

			// icon
			var img = document.createElement('img');
			img.src = 'images/speech.png';
			img.style.height = '1.5em';

			// anchor
			anchor.appendChild(img);
			anchor.insertAdjacentHTML('beforeend',' '+options[a]);
			anchor.appendChild(help);

			//
			item.appendChild(anchor);
			menu.appendChild(item);

			//
			if (iOS) { FastClick(item); }
		}
		main.appendChild(menu);
		jQuery(menu).menu();

		// footer
		layout.footer();
	},
	team: function () {
		// main
		var main = layout.main();

		// options based on subuser role
		switch (subuser.role) {
			case 'Administrator':
				var options = ['Clients','Clinicians','Directors','Gurus'],
					roleValues = ['Client','Clinician','Director','Guru']; break;
			case 'Guru':
				var options = ['Clients','Clinicians','Directors'],
					roleValues = ['Client','Clinician','Director']; break;
			case 'Director':
				var options = ['Clients','Clinicians'],
					roleValues = ['Client','Clinician']; break;
			default:
				var options = ['Clients'],
					roleValues = ['Client'];
		}
		if (!role) { role = 'Client'; }

		//
		if (roleValues.indexOf(role) == -1) {
			role = roleValues[roleValues.length - 1];
		}

		// select element
		var select = document.createElement('select');
		select.id = 'team_role';
		for (let a = 0; a < options.length; a++) {
			var option = document.createElement('option');
			option.value = roleValues[a];
			option.innerHTML = options[a];
			select.appendChild(option);
		}
		select.onchange = function () {
			role = this.value;
			layout.team();
		};
		select.style.clear = 'none';
		select.style.width = '50%';
		select.value = role;
		main.appendChild(select);
		jQuery(select).selectmenu({change: select.onchange});

		// help message
		var help = layout.help('Accounts','As a director, you can work with 2 types of accounts: Clients and Clinicians.<br><br>'
			+'A Client account will generally be a hearing impaired individual with whom you work. '
			+'Clients can sign in from home to access Auditory Training activities.<br><br>'
			+'A Clinician account will generally be a clinician with whom you work who is responsible for his '
			+'or her own Clients. A Clinician account is similar to a Director account in that it can be used to '
			+'add and manage multiple Clients. However, a Clinician cannot add or manage other Clinician accounts.');
		main.appendChild(help);

		// add user button
		var image = document.createElement('img');
		image.onclick = function () {

			// dialog: Create Profile
			var dialog = document.createElement('div');
			dialog.id = 'dialog';
			dialog.title = 'Create Profile';

			// different options for different user roles
			switch (user.role) {
				case 'Administrator': var roles = ['Client','Clinician','Director','Guru']; break;
				case 'Guru': var roles = ['Client','Clinician','Director']; break;
				case 'Director': var roles = ['Client','Clinician']; break;
				case 'Clinician': var roles = ['Client'];
			}

			// table
			var table = document.createElement('table');
			table.style.width = '100%';
			dialog.appendChild(table);
			var rowIndex = 0;
			var input = document.createElement('input');
			input.id = 'username';
			layoutTableRow2(table,rowIndex++,input,'(username)');
			var input = document.createElement('input');
			input.id = 'firstname';
			layoutTableRow2(table,rowIndex++,input,'(first name)');
			var input = document.createElement('input');
			input.id = 'lastname';
			layoutTableRow2(table,rowIndex++,input,'(last name)');
			var input = document.createElement('input');
			input.id = 'email';
			layoutTableRow2(table,rowIndex++,input,'(email)');
			var input = document.createElement('input');
			input.id = 'phone';
			layoutTableRow2(table,rowIndex++,input,'(phone number)');
			var input = document.createElement('input');
			input.id = 'dob';
			layoutTableRow2(table,rowIndex++,input,'(date of birth)');
			var select = layout.select(['Not Specified','Male','Female']);
			select.id = 'gender';
			layoutTableRow2(table,rowIndex++,select,'(gender)');
			if (roles.indexOf('Clinician') > -1) {
				var select = layout.select(roles);
				select.id = 'role';
				layoutTableRow2(table,rowIndex++,select,'(role)');
				jQuery(select).val(jQuery('#team_role').val());
			}
			/*var input = document.createElement('input');
			input.id = 'password';
			layoutTableRow2(table,rowIndex++,input,'(password)');*/

			// jQuery dialog (create profile)
			jQuery(dialog).dialog({
				buttons: {
					Cancel: function () { jQuery(this).dialog('destroy').remove(); },
					Create: function () {
						var password = Math.random().toString(36).substring(2, 8);
						var selectedrole = (roles.indexOf('Clinician') > -1)
							? document.getElementById('role').value
							: 'Client';
						jQuery.ajax({
							data: {
								dob: document.getElementById('dob').value,
								email: document.getElementById('email').value,
								firstname: document.getElementById('firstname').value,
								gender: document.getElementById('gender').value,
								lastname: document.getElementById('lastname').value,
								password: CryptoJS.MD5(password).toString(),
								phone: document.getElementById('phone').value,
								role: role,
								status: 'Active',
								user: user.ID,
								username: document.getElementById('username').value
							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.log(jqXHR, textStatus, errorThrown);
							},
							success: function (data, status) {
								console.log(data);
								var data = JSON.parse(data);
								console.log(data);
								if (data == 'exists') {
									layout.message(
										'Username already in use.',
										'Please pick a different username.'
									);
									return;
								} else {
									layout.message('Initial Password',password, function(){layout.init()});
								}
							},
							type: 'POST',
							url: 'version/'+version+'/php/profiles.php'
						});
					}
				},
				modal: true,
				width: 'auto'
			});

			// jQuery elements
			jQuery("#dob").datepicker({
				dateFormat: 'yy-mm-dd',
				changeYear: true,
				yearRange: '-100:+0'
			});
		}
		image.src = 'images/profile.png';
		image.style.cssFloat = 'right';
		image.style.height = '2.5em';
		image.title = 'Add '+role;
		jQuery(image).button();
		main.appendChild(image);

		// horizontal rule
		main.insertAdjacentHTML('beforeend','<hr class=\'ui-widget-header\'>');

		// team menu
		var count = 0;
		var menu = document.createElement('div');
		for (let a = 0; a < team.length; a++) {
			var member = team[a];
			if (member.role == select.value) {
				count++;
				var item = document.createElement('li');
				item.index = Number(a);
				item.onclick = function () {
					subuser = team[this.index];
					if (subuser.role == 'Client') {
						layout.menu();
					} else {
						console.log('test');
						jQuery.ajax({
							data: {
								method: 'team',
								password: subuser.password,
								user: subuser.ID
							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.error(jqXHR, textStatus, errorThrown);
							},
							success: function (data, status) {
								console.log(data);
								team = JSON.parse(data);
								console.log(team);
								if(team){team.sort(compareF)}
								layout.dashboard();
							},
							type: 'GET',
							url: 'version/'+version+'/php/profiles.php'
						});
					}
				};

				// icon
				var img = document.createElement('img');
				img.src = 'images/profile.png';
				img.style.height = '1.5em';
				img.style.paddingRight = '8px';

				// title
				var span = document.createElement('span');
				span.innerHTML = (member.firstname+member.lastname == '')
					? member.codename
					: member.firstname+' '+member.lastname;
				span.style.display = 'inline-block';

				// anchor
				var anchor = document.createElement('a');
				anchor.appendChild(img);
				anchor.appendChild(span);
				item.appendChild(anchor);

				// append and fastclick
				menu.appendChild(item);
				if (iOS) { FastClick(item); }
			}
		}

		// message
		if (count == 0) {
				var img = document.createElement('img');
				img.src = 'images/profile.png';
				img.style.height = '1em';
				span = document.createElement('span');
				span.innerHTML = 'Welcome to TeamHearing!<br><br>'
					+ 'Get started by adding Clients using the add Client ('
					+ '<img src="images/profile.png" style="height:1.5em;vertical-align:middle">'
					+ ') button. You can run yourself on auditory testing and training activities '
					+ 'by clicking on your name in the upper right corner.<br><br>'
					+ 'Please note, TeamHearing is a <span style="font-style:italic">web application</span> and '
					+ 'you need to be connected to the internet to use it. Use the navigation controls '
					+ 'within the application (do not use your browser\'s navigation buttons.)';
				main.appendChild(span);
			} else {
				main.appendChild(menu);
				jQuery(menu).menu();
			}
	},
}

// helpers to bring into layout
function layoutTableRow(table, rowIndex, setting, element, units, help) {
	var row = table.insertRow(rowIndex);
	row.style.width = '100%';
	var cell = row.insertCell(0);
	cell.innerHTML = setting;
	cell.style.textAlign = 'right';
	cell.style.width = '40%';
	var cell = row.insertCell(1);
	cell.style.width = '40%';
	cell.appendChild(element);
	if (widgetUI) {
		switch (element.tagName) {
			case 'INPUT':
				element.style.textAlign = 'left';
				element.addEventListener("keyup", function(event) {
					if (event.keyCode === 13) {
						event.preventDefault();
    					if(typeof element.onblur === 'function'){element.onblur()};
						if(typeof element.onchange === 'function'){element.onchange()};
  					}
				});
				jQuery(element).button();
				break;
			case 'SELECT': jQuery(element).selectmenu({change:element.onchange});
		}
	}
	var cell = row.insertCell(2);
	cell.innerHTML = units;
	cell.style.width = '20%';
	if (help) { cell.appendChild(help); }
}
function createDialog(html) {
	document.body.appendChild(html);
	$(function() {
		$("#dialog").dialog({
			close: function() { $(this).dialog("destroy").remove(); },
			modal: true,
			resizable: false,
			width: 'auto'
		});
	});
}
function createSelect(id,values,label,onchange) {
	if (!onchange) { html = "<select id='"+id+"'>"; }
	else { html = "<select id='"+id+"' onchange='"+onchange+"'>"; }
	for (a=0; a<values.length; a++) { html = html + "<option>"+values[a]+"</option>" }
	html = html+"</select> ("+label+")<br>";
	return html;
}

// preload images
function preload(arrayOfImages, directory) {
	var directory = directory ? directory : 'images'
    jQuery(arrayOfImages).each(function () {
        jQuery('<img/>')[0].src = directory + '/' + this;
    });
}
preload([
	'audi.png',
	'back.png',
	'blogs.png',
	'bug.png',
	'calibration.png',
	'chat.png',
	'check.png',
	'environmental.png',
	'equalizer.png',
	'exit.png',
	'hearingaid.gif',
	'info.png',
	'listenandread.png',
	'lock.png',
	'logout.png',
	'mail.png',
	'musanim.png',
	'notes.png',
	'profile.png',
	'psi.png',
	'records.png',
	'relations.png',
	'results.png',
    'score-nan.png',
    'score-nay.png',
    'score-yay.png',
	'settings.png',
	'shs.gif',
	'speech.png',
	'testing.png',
	'training.png',
	'X.png',
]);

// sorting functions
function compare(a,b) {
	if (a.entry < b.entry)
		return 1;
	if (a.entry > b.entry)
		return -1;
	return 0;
}
function compareK(a,b){
	if (a.keyword < b.keyword)
		return -1;
	if (a.keyword > b.keyword)
		return 1;
	return 0;
}
function compareF(a,b) {
  if (a.firstname < b.firstname)
     return -1;
  if (a.firstname > b.firstname)
    return 1;
  return 0; 
} 

// chat room
function chatroom(){
	$('#main').html("<div id='chatroompanel' style='height:400px'></div>");
	html = "<script type='text/javascript' src='/arrowchat/external.php?type=djs&userid="+user.id+"' charset='utf-8'></script>"
			+ "<script type='text/javascript' src='/arrowchat/external.php?type=js&userid="+user.id+"' charset='utf-8'></script>"
			+ "<br />"
			+ "<iframe src='/arrowchat/public/chatroom/?id=1' frameborder='0' style='width:100%; height:100%; border:1px solid #aaa'></iframe>";
	$('#chatroompanel').html(html);
}
