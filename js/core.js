/*

The MIT License (MIT)

Copyright (c) 2017 cd2 (cdqwertz) <cdqwertz@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

*/

var canvas;
var ctx;
var last_time = 0;

var game_state = 1;

var grid = [];
var grid_w = 100;
var grid_h = 70;
var scale = 10;

var player = {
	x : grid_w/2,
	y : grid_h-2,
	vx : 0,
	vy : -1,

	len : 10
};

var timer = 0;
var timer_boost = 0;

var shake = {
	timer : 0,
	x : 0,
	y : 0
}

var speed = 50;
var speed_boost = 25;

var score = 0;

var mouse_start_x = 0;
var mouse_start_y = 0;

var mouse_pressed = false;

function load() {
	canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx = canvas.getContext("2d");

	grid_w = Math.ceil(window.innerWidth / scale);
	grid_h = Math.ceil(window.innerHeight / scale);

	canvas.onmousedown = function(event) {
		mouse_start_x = event.pageX;
		mouse_start_y = event.pageY;

		mouse_pressed = true;
	}

	canvas.onmousemove = function (event) {
		if(mouse_pressed) {
			var x = event.pageX;
			var y = event.pageY;

			var dx = x - mouse_start_x;
			var dy = y - mouse_start_y;

			if(dist(dx, dy) > 5) {
				if(Math.abs(dx) > Math.abs(dy)) {
					if(dx > 0) {
						player.vx = 1;
						player.vy = 0;
					} else {
						player.vx = -1;
						player.vy = 0;
					}
				} else {
					if(dy > 0) {
						player.vy = 1;
						player.vx = 0;
					} else {
						player.vy = -1;
						player.vx = 0;
					}
				}

				mouse_start_x = event.pageX;
				mouse_start_y = event.pageY;

				timer_boost = 4;
			}
		}
	}

	canvas.onmouseup = function (event) {
		mouse_pressed = false;
	}


	reset();

	window.requestAnimationFrame(update);
}

function update(t) {
	var dtime = t - last_time;

	if(shake.timer > 0) {
		ctx.translate(-shake.x, -shake.y);
		shake.x += Math.floor(Math.random() * (shake.max+1)) - shake.max/2;
		shake.y += Math.floor(Math.random() * (shake.max+1)) - shake.max/2;
		ctx.translate(shake.x, shake.y);
		shake.timer -= dtime;
	} else {
		ctx.translate(-shake.x, -shake.y);
		shake.x = 0;
		shake.y = 0;
	}

	if(game_state == 1) {
		if(timer > speed || (timer_boost > 0 && timer > speed_boost)) {
			player.x += player.vx;
			player.y += player.vy;

			if(player.vy != 0) {
				score += -player.vy;
				player.len = Math.floor(score / 30) + 10;
			}

			if(is_on_grid(player.x, player.y) && grid[player.x][player.y] == 0) {
				grid[player.x][player.y] = 1;
			} else if(player.y < 0) {
				player.y = grid_h-1;

				grid = [];
				setup_grid();

				grid[player.x][player.y] = 1;
			} else {
				game_state = 2;

				shake.timer = 400;
				shake.max = 4;
			}

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			draw_grid();

			if(timer_boost > 0) {
				timer_boost -= 1;
			}

			timer = 0;
		}

		timer += dtime;
	} else if(game_state == 0) {
		//ctx.clearRect(0, 0, canvas.width, canvas.height);
		alert("Score: " + score);
		mouse_pressed = false;
		reset();
		game_state = 1;
	} else if (game_state == 2) {
		if(shake.timer <= 1)  {
			game_state = 0;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		draw_grid();
	}

	last_time = t;
	window.requestAnimationFrame(update);
}

function setup_grid() {
	for(var x = 0; x < grid_w; x++) {
		var l = [];
		for(var y = 0; y < grid_h; y++) {
			l.push(-1);
		}
		grid.push(l);
	}

	var paths = 1;

	if(Math.random() > 0.8) {
		paths = 2;
	}

	for(var path = 0; path < paths; path++) {
		var x = player.x;
		var y = grid_h;
		var vx = 0;
		var vy = -1;

		while (y > 0) {
			if(is_on_grid(x+vx, y+vy)) {
				x += vx;
				y += vy;
			} else {
				if(is_on_grid(x+1, y)) {
					vx = 1;
					vy = 0;
				} else if (is_on_grid(x-1, y)) {
					vx = -1;
					vy = 0;
				} else if (is_on_grid(x, y-1)) {
					vx = 0;
					vy = -1;
				} else {
					console.log("ERROR");
					break;
				}
			}

			for (var i = -3; i <= 3; i++) {
				for (var j = -3; j <= 3; j++) {
					if(is_on_grid(x+i, y+j)) {
						grid[x+i][y+j] = 0;
					}
				}
			}

			if(Math.random() > 0.8 && y < grid_h-5) {
				var dir = Math.floor(Math.random()*3);

				if(dir == 0) {
					vx = 0;
					vy = -1;
				} else if(dir == 1) {
					vx = 1;
					vy = 0;
				} else if(dir == 2) {
					vx = -1;
					vy = 0;
				}
			}
		}
	}
}

function draw_grid() {
	for(var x = 0; x < grid_w; x++) {
		for(var y = 0; y < grid_h; y++) {
			if(grid[x][y] > 0) {
				if(grid[x][y] > player.len) {
					grid[x][y] = 0;
				} else {
					grid[x][y] += 1;
				}

				ctx.fillStyle = "#3b3";
				ctx.fillRect(x*scale, y*scale, scale, scale);
			} else if (grid[x][y] == -1) {
				ctx.fillStyle = "#333";
				ctx.fillRect(x*scale, y*scale, scale, scale);
			}
		}
	}
}

function is_on_grid(x, y) {
	return (x >= 0 && y >= 0 && x < grid_w && y < grid_h);
}

function reset() {
	player = {
		x : Math.floor(grid_w/2),
		y : grid_h-2,
		vx : 0,
		vy : -1
	};

	grid = [];
	timer = 0;
	player.len = 10;
	score = 0;

	setup_grid();
}

document.onkeydown = function(event) {
	console.log(event.keyCode);

	if(game_state == 1) {
		if (event.keyCode == 37 || event.keyCode == 65) {
			player.vx = -1;
			player.vy = 0;

			timer_boost = 4;
		} else if (event.keyCode == 38 || event.keyCode == 87) {
			player.vx = 0;
			player.vy = -1;

			timer_boost = 4;
		} else if (event.keyCode == 39 || event.keyCode == 68) {
			player.vx = 1;
			player.vy = 0;

			timer_boost = 4;
		} else if (event.keyCode == 40 || event.keyCode == 83) {
			player.vx = 0;
			player.vy = 1;

			timer_boost = 4;
		}
	}
}

function dist(a, b) {
	return (Math.pow(Math.pow(a, 2) + Math.pow(b, 2), 0.5));
}

function ontouch(event) {
	event.preventDefault();

	var touch = event.changedTouches[0];
	var evt = {
		pageX : touch.pageX,
		pageY : touch.pageY
	}

	if (event.type == "touchstart") {
		canvas.onmousedown(evt);
	} else if (event.type == "touchmove") {
		canvas.onmousemove(evt);
	} else if (event.type == "touchup") {
		canvas.onmouseup(evt);
	}
}

document.addEventListener("touchstart", ontouch, true);
document.addEventListener("touchmove", ontouch, true);
document.addEventListener("touchend", ontouch, true);
