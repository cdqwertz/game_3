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
	vy : -1
};

var timer = 0;

function load() {
	canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx = canvas.getContext("2d");

	grid_w = Math.ceil(window.innerWidth / scale);
	grid_h = Math.ceil(window.innerHeight / scale);

	reset();

	window.requestAnimationFrame(update);
}

function update(t) {
	var dtime = t - last_time;

	if(game_state == 1) {
		if(timer > 50) {
			player.x += player.vx;
			player.y += player.vy;

			if(is_on_grid(player.x, player.y) && grid[player.x][player.y] == 0) {
				grid[player.x][player.y] = 1;
			} else if(player.y < 0) {
				player.y = grid_h-1;

				grid = [];
				setup_grid();

				grid[player.x][player.y] = 1;
			} else {
				game_state = 0;
			}

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			draw_grid();

			timer = 0;
		}

		timer += dtime;
	} else if(game_state == 0) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
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
				if(grid[x][y] > 10) {
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

	setup_grid();
}

document.onkeydown = function(event) {
	console.log(event.keyCode);

	if(game_state == 1) {
		if (event.keyCode == 37) {
			player.vx = -1;
			player.vy = 0;
		} else if (event.keyCode == 38) {
			player.vx = 0;
			player.vy = -1;
		} else if (event.keyCode == 39) {
			player.vx = 1;
			player.vy = 0;
		} else if (event.keyCode == 40) {
			player.vx = 0;
			player.vy = 1;
		}
	} else {
		game_state = 1;
		reset();
	}
}
