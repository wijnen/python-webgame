// vim: set foldmethod=marker :
// Global variables. {{{
var _body, _state, Public, Private, _titlescreen, title_select, _title_title, _mainscreen, _footer, _title_selection, _canvas;
var _gametitle;
var _title_screen;
var title_gamelist = [];
var server;
var _audio, audio;
var use_3d;
var mouse_navigation = true;
var my_name = null;
var _players = [], _playerdiv;
var viewport = [-20, -15, 20, 15];
// }}}

AddEvent('load', function () { // {{{
	_title_screen = true;
	_gametitle = document.title;
	_titlescreen = document.getElementById('title');
	_mainscreen = document.getElementById('notitle');
	_footer = document.getElementById('footer');
	_title_title = document.getElementById('game_title');
	_title_selection = document.getElementById('titleselection');
	title_select = document.getElementById('title_games');
	_playerdiv = document.getElementById('players');
	_canvas = document.getElementById('canvas');
	Public = { state: '', name: '' };
	Private = { state: '' };
#USE3D#
	if (use_3d)
		please.gl.set_context('canvas');
	else
		please.dom.set_context('canvas');
	please.set_search_path('img', '#MAIN#/img');
	please.set_search_path('jta', '#MAIN#/jta');
	please.set_search_path('gani', '#MAIN#/gani');
	please.set_search_path('audio', '#MAIN#/audio');
	please.set_search_path('glsl', '#MAIN#/glsl');
	please.set_search_path('text', '#MAIN#/text');
#LOAD#
}); // }}}

AddEvent('mgrl_media_ready', please.once(function () { // {{{
	window.graph = new please.SceneGraph();
	window.camera = new please.CameraNode();
	graph.add(camera);
	graph.camera = camera;
	if (use_3d) {
		var prog = please.glsl('default', 'simple.vert', 'diffuse.frag');
		prog.activate();
		please.set_clear_color(0, 0, 0, 0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		var light_direction = vec3.fromValues(.25, -1.0, -.4);
		vec3.normalize(light_direction, light_direction);
		vec3.scale(light_direction, light_direction, -1);
		prog.vars.light_direction = light_direction;
		var renderer = new please.RenderNode('default');
		renderer.graph = graph;
		window.camera_base = new please.GraphNode();
		graph.add(camera_base);
		camera.look_at = camera_base;
		camera.up_vector = [0, 0, 1];
		camera_base.location = [(viewport[0] + viewport[2]) / 2, (viewport[1] + viewport[3]) / 2, 0];
		// Set initial distance to match requested viewport.
		var rx = (viewport[2] - viewport[0]) / 2 / Math.tan(please.radians(camera.fov) / 2);
		var ry = (viewport[3] - viewport[1]) / 2 / Math.tan(please.radians(camera.fov) / 2);
		please.make_animatable(window, 'r', rx > ry ? rx : ry);
		please.make_animatable(window, 'theta', -90);
		please.make_animatable(window, 'phi', 30);
		camera.location = function() { return [camera_base.location_x + r * Math.cos(please.radians(theta)) * Math.cos(please.radians(phi)), camera_base.location_y + r * Math.sin(please.radians(theta)) * Math.cos(please.radians(phi)), camera_base.location_z + r * Math.sin(please.radians(phi))]; };
		if (mouse_navigation) {
			window._move_event = [null, null];
			window.AddEvent('mousedown', function(event) {
				if (event.buttons != 4)
					return;
				_move_event = [event.clientX, event.clientY];
			});
			window.AddEvent('mousemove', function(event) {
				if (event.buttons != 4)
					return;
				var diff = [event.clientX - _move_event[0], event.clientY - _move_event[1]];
				_move_event = [event.clientX, event.clientY];
				var clamp = function(min, val, max, wrap) {
					if (val > max) {
						if (wrap) {
							while (val > max)
								val -= (max - min);
							return val;
						}
						return max;
					}
					if (val < min) {
						if (wrap) {
							while (val < min)
								val += (max - min);
							return val;
						}
						return min;
					}
					return val;
				}
				if (event.shiftKey) {
					var dx = (diff[1] * Math.cos(please.radians(theta)) - diff[0] * Math.sin(please.radians(theta))) / -500 * r;
					var dy = (diff[0] * Math.cos(please.radians(theta)) + diff[1] * Math.sin(please.radians(theta))) / -500 * r;
					camera_base.location = [camera_base.location_x + dx, camera_base.location_y + dy, camera_base.location_z];
				}
				else {
					theta = clamp(-180, theta - diff[0], 180, true);
					phi = clamp(-89, phi + diff[1], 89, false);
				}
			});
			window.AddEvent('mousewheel', function(event) {
				r += event.detail;
			});
			window.AddEvent('DOMMouseScroll', function(event) {
				r += event.detail;
			});
		}
	}
	else {
	}
	camera.activate();

	_audio = {};
	audio = {};
	var make_play = function(target) {
		var name = '';
		obj = audio;
		for (var i = 0; i < target[0].length; ++i) {
			name += target[0][i] + '/';
			if (obj[target[0][i]] === undefined)
				obj[target[0][i]] = {};
			obj = obj[target[0][i]];
		}
		_audio[name + target[2]] = please.access(name + target[1]);
		obj[target[2]] = function(loop) {
			_audio[name + target[2]].loop = loop === true;
			if (loop !== false) {
				_audio[name + target[2]].fastSeek(0);
				_audio[name + target[2]].play();
			}
		}
	}
	var audio_data = (#AUDIO#);
	for (var s = 0; s < audio_data.length; ++s)
		make_play(audio_data[s]);

	_body = document.getElementsByTagName('body')[0];
	_state = document.getElementById('state');
	var messages = {
		win: function(code) { if (window.win !== undefined) window.win(code); },
		Public_update: _Public_update,
		Private_update: _Private_update,
		name: function(n) {
			my_name = n;
			document.getElementById('title_game_name').value = my_name;
			_makestate();
		},
		'': function() {
			var name = arguments[0];
			var args = [];
			for (var a = 1; a < arguments.length; ++a)
				args.push(arguments[a]);
			window[name].apply(window, args);
		}
	};
	server = Rpc(messages,
		function() { _body.RemoveClass('disconnected'); },
		function() { _body.AddClass('disconnected'); });
	please.set_viewport(renderer);
	window.AddEvent('resize', _resize_window);
	if (!use_3d && window.init_2d !== undefined) window.init_2d();
	if (use_3d && window.init_3d !== undefined) window.init_3d();
	if (window.init !== undefined) window.init();
})); // }}}

AddEvent('mgrl_dom_context_changed', function () { // {{{
	if (window.update_canvas && !use_3d)
		window.update_canvas(please.dom.context);
}); // }}}

function playercolor(num) { // {{{
	var colors = ['#f00', '#00f', '#0f0', '#f0f', '#ff0', '#0ff', '#fff', '#000'];
	num %= colors.length;
	return colors[num];
} // }}}

function _Public_update(path, value) { // {{{
	if (path !== undefined) {
		if (path.length == 0) {
			Public = value;
		}
		else {
			var target = Public;
			for (var i = 0; i < path.length - 1; ++i)
				target = target[path[i]];
			if (value === undefined)
				delete target[path[path.length - 1]];
			else
				target[path[path.length - 1]] = value;
		}
	}
	_makestate();
	if (Public.name == '') {
		_title_screen = true;
		document.title = _gametitle;
		// Set number of players for new games.
		if (Public.min_players == Public.max_players) {
			document.getElementById('numplayers').AddClass('hidden');
			document.getElementById('title_num_players').value = Public.max_players;
		}
		else {
			document.getElementById('numplayers').RemoveClass('hidden');
			if (Public.max_players === null)
				document.getElementById('range').ClearAll().AddText('(' + Public.max_players + ' or more)');
			else
				document.getElementById('range').ClearAll().AddText('(' + Public.min_players + ' - ' + Public.max_players + ')');
		}
		// Show title screen.
		_title_title.ClearAll().AddText(Public.title);
		var games = Public.games || [];
		// Remove titles that aren't in the list.
		var new_list = [];
		for (var g = 0; g < title_gamelist.length; ++g) {
			for (var n = 0; n < games.length; ++n) {
				if (games[n] == title_gamelist[g][0]) {
					new_list.push(title_gamelist[g]);
					break;
				}
			}
		}
		// Add titles that are in the list and remove the old ones from the Select element.
		var current = 0;
		title_gamelist = [];
		for (var n = 0; n < games.length; ++n) {
			while (current < new_list.length && n < title_select.options.length && new_list[current][0] != title_select.options[n].value)
				title_select.removeChild(title_select.options[n]);
			if (current < new_list.length && games[n] == new_list[current][0]) {
				title_gamelist.push(new_list[current]);
				continue;
			}
			title_gamelist.push([games[n], title_make_option(title_select, games[n], n)]);
		}
		while (title_select.options.length > n)
			title_select.removeChild(title_select.options[n]);
		if (title_gamelist.length == 0)
			_title_selection.AddClass('hidden');
		else
			_title_selection.RemoveClass('hidden');
		// Show the titlescreen.
		_titlescreen.RemoveClass('hidden');
		_mainscreen.AddClass('hidden');
		_footer.AddClass('hidden');
		please.renderer.overlay.AddClass('hidden');
		if (window.title_Public_update !== undefined)
			window.title_Public_update();
		if (window.title_update !== undefined)
			window.title_update();
		return;
	}
	if (_title_screen) {
		// Hide the titlescreen.
		_title_screen = false;
		_titlescreen.AddClass('hidden');
		_mainscreen.RemoveClass('hidden');
		_footer.RemoveClass('hidden');
		please.renderer.overlay.RemoveClass('hidden');
		document.title = _gametitle + ' - ' + Public.name;
		_resize_window();
		if (window.update_canvas && !use_3d)
			window.update_canvas(please.dom.context);
		if (window.new_game)
			window.new_game();
	}
	if (window.Public_update !== undefined)
		window.Public_update();
	if (window.update !== undefined)
		window.update();
} // }}}

function title_make_option(select, name, n) { // {{{
	var ret = Create('option').AddText(name);
	ret.value = name;
	if (n >= select.options.length) {
		select.appendChild(ret);
	}
	else {
		select.insertBefore(ret, select.options[n]);
	}
	return ret;
} // }}}

function _title_join() { // {{{
	var game = title_select.options[title_select.selectedIndex].value;
	server.call('join', [game]);
} // }}}

function _title_view() { // {{{
	var game = title_select.options[title_select.selectedIndex].value;
	server.call('view', [game]);
} // }}}

function _title_new() { // {{{
	server.call('new', [document.getElementById('title_game_name').value, Number(document.getElementById('title_num_players').value)]);
} // }}}

function _Private_update(path, value) { // {{{
	if (path !== undefined) {
		if (path.length == 0) {
			Private = value;
		}
		else {
			var target = Private;
			for (var i = 0; i < path.length - 1; ++i)
				target = target[path[i]];
			if (value === undefined)
				delete target[path[path.length - 1]];
			else
				target[path[path.length - 1]] = value;
		}
	}
	_makestate();
	if (Public.name == '') {
		if (window.title_Private_update !== undefined)
			window.title_Private_update();
		if (window.title_update !== undefined)
			window.title_update();
		return;
	}
	if (window.Private_update !== undefined)
		window.Private_update();
	if (window.update !== undefined)
		window.update();
} // }}}

function _leave() { // {{{
	server.call('leave');
} // }}}

function _makestate() { // {{{
	_state.ClearAll().AddText((Public.state || '') + ((Private && Private.state) || ''));
	if (!Public.players)
		return;
	while (Public.players.length < _players.length)
		_playerdiv.removeChild(_players.pop()[0]);
	while (_players.length < Public.players.length)
		_players.push([_playerdiv.AddElement('span', 'player'), null]);
	for (var p = 0; p < _players.length; ++p) {
		if (_players[p][1] != Public.players[p].name) {
			_players[p][1] = Public.players[p].name;
			_players[p][0].ClearAll().AddText(_players[p][1]);
			_players[p][0].style.color = playercolor(p);
			if (my_name == _players[p][1])
				_players[p][0].AddClass('self');
			else
				_players[p][0].RemoveClass('self');
		}
	}
} // }}}

var _canvas_list = [];
var _div_list = [];

function new_canvas(w, h, name, redraw) { // {{{
	var div = please.overlay.new_element(name);
	var node = new please.GraphNode();
	node.div = div;
	graph.add(node);
	div.bind_to_node(node);
	node.canvas = div.AddElement('canvas');
	node.canvas.redraw_func = function() {
		node.canvas.width = w * 2 * window.camera.orthographic_grid;
		node.canvas.height = h * 2 * window.camera.orthographic_grid;
		div.style.width = node.canvas.style.width = node.canvas.width / 2 + 'px';
		div.style.height = node.canvas.style.heigth = node.canvas.height / 2 + 'px';
		node.context = node.canvas.getContext('2d');
		node.context.scale(window.camera.orthographic_grid * 2, -window.camera.orthographic_grid * 2);
		node.context.translate(w / 2, -h / 2);
		if (redraw)
			redraw(node);
	};
	_canvas_list.push(node.canvas);
	node.canvas.AddEvent('click', function(event) {
		if (!node.selectable)
			return;
		event.world_location = please.dom.pos_from_event(event.pageX, event.pageY, node.location_z);
		// FIXME: this should take rotation and scale into account.
		event.local_location = [event.world_location[0] - node.location_x, event.world_location[1] - node.location_y, 0];
		node.dispatch('click', event);
	});
	node.canvas.redraw_func();
	return node;
} // }}}

function del_canvas(node) { // {{{
	_canvas_list.splice(_canvas_list.indexOf(node.canvas), 1);
	graph.remove(node);
	please.overlay.remove_element(node.div);
} // }}}

function new_div(w, h, pw, ph, name, redraw) { // {{{
	var div = please.overlay.new_element(name);
	var node = new please.GraphNode();
	node.div = div;
	graph.add(node);
	div.bind_to_node(node);
	div.style.width = pw + 'px';
	div.style.height = ph + 'px';
	div.redraw_func = function() {
		div.style.transformOrigin = 'top left';
		div.style.transform = 'scale(' + w * window.camera.orthographic_grid / pw + ',' + h * window.camera.orthographic_grid / ph + ')';
		if (redraw)
			redraw(node);
	};
	_div_list.push(div);
	div.AddEvent('click', function(event) {
		if (!node.selectable)
			return;
		node.dispatch('click', event);
	});
	div.redraw_func();
	return node;
} // }}}

function del_div(node) { // {{{
	_div_list.splice(_div_list.indexOf(node.div), 1);
	graph.remove(node);
	please.overlay.remove_element(node.div);
} // }}}

function _resize_window() { // {{{
	var size = [_mainscreen.clientWidth, _mainscreen.clientHeight];
	if (size[0] == 0 || size[1] == 0)
		return;
	if (_canvas.width != size[0] || _canvas.height != size[1]) {
		_canvas.width = size[0];
		_canvas.height = size[1];
		if (use_3d) {
			gl.viewport(0, 0, size[0], size[1]);
		}
		else {
			var vw = viewport[2] - viewport[0];
			var vh = viewport[3] - viewport[1];
			var other_w = size[1] * vw / vh;
			if (size[0] > other_w)
				please.dom.orthographic_grid = size[1] / vh;
			else
				please.dom.orthographic_grid = size[0] / vw;
			window.camera.orthographic_grid = please.dom.orthographic_grid;
			please.dom.canvas_changed();
			camera.update_camera();
		}
	}
	please.__align_canvas_overlay();
} // }}}

window.AddEvent('mgrl_overlay_aligned', function () { // {{{
	for (var c = 0; c < _canvas_list.length; ++c)
		_canvas_list[c].redraw_func();
	for (var d = 0; d < _div_list.length; ++d)
		_div_list[d].redraw_func();
}); // }}}

window.AddEvent('mgrl_dom_context_changed', function() { // {{{
	if (window.update_canvas && !use_3d)
		window.update_canvas(please.dom.context);
}); // }}}
