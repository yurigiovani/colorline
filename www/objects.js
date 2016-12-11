var Game = {
	retries: 0,

	loadAds: function() {
		if (typeof AdMob != 'undefined' ) { 
			AdMob.prepareInterstitial({
				adId: 'ca-app-pub-8150323953790828/5836091992',
				autoShow: false
			});
		}
	},
	showAds: function() {
		if (typeof AdMob != 'undefined' ) { 
			AdMob.isInterstitialReady(function(isReady){
				if(isReady){
					AdMob.showInterstitial();
				}
			});
		}
	},
	reset: function() {
		player.reset();
		lines.reset();
		score.reset();
	}
},

Sound = {
	path: false,
	list: [],
	sound: false,

	init: function() {
		this.load('bounce');
		this.load('gameover');
		this.load('jump');
		// this.load('point');
	},
	load: function(sound) {
		if(typeof device != 'undefined') {
			var mypath = location.pathname;
			var idx = mypath.lastIndexOf('/');
			var filePath = mypath.substring(0, idx + 1) + "assets/sound/";

			if( device.platform == 'windows' ) {
				filePath = 'ms-appx://br.com.colorline/www/assets/sound/';
			}

			this.path = filePath;

			var pathSound = this.path + sound + '.mp3';

			if(this.list.length == 0) {
				this.list[sound] = new Media(pathSound);

				this.list[sound].setVolume(30);
			}
		}
	},
	play: function(sound) {
		if(typeof device != 'undefined') {
			this.list[sound].seekTo(0);
			this.list[sound].play();
		}
	},
},

background = {
	draw: function() {
		ctx.fillStyle = '#EEF5DB';
		ctx.fillRect(0, 0, width, height);

		if(score.score == 0 && player.x == 0 && player.y == 0) {
			player.init();
		}

		if(lines._lines.length == 0) {
			score.plus();
			lines.insert();
		}
	},
	update: function() {}
},

colors = [
			[
				'#EBE316',
				'#EBE316',
				'#F03732',
				'#0F93F7',
				'#EF476F',
				'#754F44',
			],
			[
				'#83E4B5',
				'#6E60A0',
				'#D6EC78',
				'#FA7E0A',
				'#8F0E0E',
				'#530C0C',
			],
			[
				'#300532',
				'#6078EA',
				'#3E3E3E',
				'#F4722B',
				'#FA5555',
				'#F7FB76',
				'#8DED8E',
				'#2D7D8F',
			],
			[
				'#001F3F',
				'#055049',
				'#A1E3D8',
				'#F64E8B',
				'#452B45',
			],
			[
				'#9BDF46',
				'#432F44',
				'#E94822',
				'#403121',
				'#3FC1C9',
			],
			[
				'#106EE8',
				'#0FC1A1',
				'#5D414D',
				'#E45A84',
				'#FF7676',
			]
		],

player = {
	x: 0,
	y: 0,
	initY: 0,
	height: 16,
	width: 16,
	radius: 16,

	gravity: 0.22,
	_jump: 7.2,
	velocity: 0,

	color: '',
	group: '',

	init: function() {
		this.x = 50;
		this.y = height / 2 - this.height / 2;

		this.gravity = 0.22;
		this.velocity = 0;
		this._jump = 7.2;

		this.changeColor();
	},
	changeColor: function() {
		this.group = Math.floor(Math.random() * (colors.length - 0)) + 0;
		var color = Math.floor(Math.random() * (colors[this.group].length - 0)) + 0;

		this.color = colors[this.group][color];
	},

	jump: function() {
		Sound.play('jump');
		this.velocity = -this._jump;
	},

	draw: function () {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
		ctx.fill();
		// ctx.fillRect(this.x, this.y, this.width, this.height);
	},
	update: function() {
		if (currentstate === states.Splash) {
		}
		else {
			if((this.y >= height - this.height) ) {
				this.velocity = -this._jump;

				Sound.play('bounce');
			}
			else if(this.y <= 0) {
				this.velocity = this._jump;

				Sound.play('bounce');
			}

			if(currentstate === states.Game) {
				this.velocity += this.gravity;
				this.y += this.velocity;
			}
		}
	},
	reset: function() {
		this.init();
	}
}

lines = {
	_lines: [],
	_qty: 2,
	_veloticy: 1.80,

	draw: function() {
		for( var i = 0, size = this._lines.length; i < size; i++) {
			var line = this._lines[i];

			ctx.fillStyle = line.color;
			ctx.fillRect(line.x, line.y, line.width, line.height);
		}
	},
	insert: function() {
		if(score.score < 4) {
			this.qty = score.score + 1;
		}

		var placePlayerColor = Math.floor(Math.random() * (this.qty - 0)) + 0

		for(var i = 0; i < this.qty; i++) {
			var color = Math.floor(Math.random() * (colors[player.group].length - 0)) + 0;
			var heightLine = height / this.qty;
			var y = 0;

			if(i > 0) {
				y = heightLine * i;
			}

			this._lines.push({
				x: width + 100,
				y: y,
				width: 25,
				height: heightLine + 1,
				color: i == placePlayerColor ? player.color : colors[player.group][color]
			});
		}
	},
	update: function() {
		if(this._lines.length && currentstate == states.Game) {
			for( var i = 0, size = this._lines.length; i < size; i++) {
				var line = this._lines[i];

				if(line) {
					line.x -= this._veloticy;

					if(player.x > line.x + line.width) {
						player.changeColor();
					}

					if(line.x <= -line.width) {
						this.remove(i);

						i --;
						size --;
					}

					if(colision(player, line)) {
						Sound.play('gameover');
						currentstate = states.Score;
					}
				}
			}
		}
	},
	remove: function(i) {
		this._lines.splice(i, 2);
	},
	reset: function() {
		this._lines = [];
		this.qty = 2;
		this._veloticy = 1.80;
	},
},

appScreen = {
	score: {
		draw: function() {
			score.drawScores();
		}
	},
	splash: {
		draw: function() {
			if(typeof s_splash != 'undefined') {
				var x = width / 2 - s_splash.width / 2;
				y = height / 3;
				s_splash.draw(ctx, x, y);
			}
		}
	},
	nextWave: {
		draw: function() {
			ctx.fillStyle = "lighgreen";
			ctx.fillRect(width / 2 - 50, height / 2 - 50, 100, 101);
		}
	}
},

score = {
	best: localStorage.getItem('best') || 0,
	score: 0,

	plus: function() {
		if(this.score > 0) {
			// Sound.play('point');
		}

		this.score++;

		lines._veloticy += 0.035;

		if(score.score % 2) {
			player._jump += 0.035;
		}
	},
	reset: function() {
		this.score = 0;
	},
	drawScores: function() {
		var scoreShow = this.score == 0 ? 0 : this.score - 1;

		var x = width / 2 - s_bestscore.width / 2;
		var y = height / 5;

		var iS = iB = 1;

		if(scoreShow > 9 && scoreShow  < 20) {
			iS = 2
		}
		else if(scoreShow > 99) {
			iS = 3
		}

		if(this.best > 9 && this.best  < 20) {
			iB = 2
		}
		else if(this.best > 99) {
			iB = 3
		}

		s_score.draw(ctx, x, y);
		s_numberScore.draw(ctx, width / 2 - s_numberScore.width / 2 * iS, y + 55, scoreShow);

		y += s_score.height + 15;

		s_bestscore.draw(ctx, x, y);
		s_numberScore.draw(ctx, width / 2 - s_numberScore.width / 2 * iB, y + 55, this.best);

		s_buttons.Retry.draw(ctx, width / 2 - s_buttons.Retry.width / 2, height - 200);
	},
	drawScore: function() {
		if(typeof s_numberGame != 'undefined') {
			var scoreShow = this.score == 0 ? 0 : this.score - 1;
			var x = width / 2 - s_numberGame.width / 2;
			var y = 25;

			s_numberGame.draw(ctx, x, y, scoreShow);
		}
	}
}



function colision(object1, object2) {
	ret =  (	object1.x < object2.x + object2.width  && object1.x + object1.width  > object2.x &&
				object1.y < object2.y + object2.height && object1.y + object1.height > object2.y);

	if(ret) {
		if(object1.color == object2.color) {
			return false;
		}
		else {
			return true;
		}
	}
}

function itemTouched(object1, object2) {
	var cx = Math.min(Math.max(object1.x, object2.x), object2.x + object2.width);
	var cy = Math.min(Math.max(object1.y, object2.y), object2.y + object2.height);

	var dx = object1.x - cx;
	var dy = object1.y - cy;

	var d = dx * dx + dy * dy;
	var r = object2.radius * object2.radius;

	if(r > d) {
		return true;
	}

	return false;
}