## Requirements:
- [M.GRL](https://github.com/aeva/m.grl)
- [python-fhs](https://github.com/wijnen/python-fhs)
- [python-network](https://github.com/wijnen/python-network)
- [python-websocketd](https://github.com/wijnen/python-websocketd)
- [python-webgame](https://github.com/wijnen/python-webgame)
- [Blender](http://blender.org)
- bitmap image editor (possibly Blender, more likely
  [Gimp](http://www.gimp.org) or similar) text editor, such as gedit.  Stay
  away from Microsoft editors; they put a BOM at the start of UTF-8 encoded
  text files, which breaks everything.

## Prerequisites:
- Basic knowledge of Python
- Basic knowledge of Javascript
- Model editing, rigging, and action editing in Blender
- Bitmap image editing

# Installation
If pythhon-{fhs,network,websocketd} are not installed on the system, copy the
module files ({fhs,network,websocketd}.py) into the python-webgame directory.

Copy or link mgrl.js and demos/gl-matrix.js from the m.grl source into the html
directory of the python-webgame source.

In the m.grl source, go to apps/blender\_addon and create a zip of the code in
there using ``zip io_scene_jta.zip io_scene_jta/*`` .  Open Blender, go through
user settings to addons and use the install from file button to install the
newly created zip file.

If you are using [vim](http://vim.org) as your text editor, you want to add this line to your .vimrc:

    autocmd BufNewFile,BufRead *.gpy set filetype=python

It will make vim recognize *.gpy files as python.

# Introduction
This tutorial teaches how to use Python-webgame through examples and
excercises.  Explanations are kept to a minimum.

The code for the examples is in the examples directory, which is located in the
same place as this file.  Every new feature is commented in the code.  Features
that have been explained in earlier code do not always have a comment again.  Only
files that are mentioned under "Read" have new material in them, but the other
files may still be useful to better understand concepts that were explained
before.

## Example 0: Simple working (but useless) program
This program does nothing.  It shows the basic structure of a game written with
Python-webgame.  To make it work, just go to the directory that holds
non-game.gpy and run ``webgame-build``.  Then point a browser to
http://localhost:8891 to see the title screen.  When you create a game there,
it will show you an empty screen that only allows you to leave.

* Read: non-game.gpy
* Exercise: Make it run.

## Example 1: Simple working scene
This program displays some objects.  The objects have been designed in Blender.
The example uses the default monkey head with a texture that is all the same
color, which makes it hard to see that it is a monkey head.

* Read: static.gpy, html/static.js, html/monkey.blend
* Exercise: Design a different object and place three of them in a triangle.

## Example 2: Stop motion scene
This demonstrates communication from the server to the clients.

* Read: stop-motion.gpy, html/stop-motion.js
* Exercise: Create a scene with two actors and control them with the server.

## Example 3: Scripted animations
Smooth animations can be scripted in javascript.  This example shows two ways:
the easy way, and the powerful way.

* Read: html/scripted.js
* Exercise: Make an animation with smooth motion and rotation.

## Example 4: Prepared animations
Blender can edit actions for objects, and those actions are available in M.GRL
as well.  This example shows how to use them.

* Read: html/objects.blend, html/prepared.js
* Exercise: Create a walk action in Blender and use it in combination with a scripted move to make a walking character.

## Example 5: Visual novel
This example shows how the server can allow clients to send commands, and how
clients use it.

* Read: novel.gpy, html/novel.js
* Exercise: Add animations.

## Example 6: Flipping tiles
This example demonstrates how to respond to objects being clicked.

* Read: html/flip.js
* Exercise: Create a short point and click adventure.

## Example 7: Two player game
This example shows how to yield a dict to allow control over what commands are
allowed.  Note that this game documents everything (including things that were
documented before), because it was written as a standalone example.

* Read: quarto.gpy, html/quarto.js
* Excercise: Create tic tac toe

## Example 8: Generated textures
This example shows how to use a canvas that was generated in Javascript instead
of one that was assigned in Blender.

* Read: html/thegame.js, html/tile.blend
* Exercise: Minesweeper.

## Example 9: 
This example shows how Tasks can be used to simplify the implementation of a
game where things happen in parallel, such as all players preparing their turn
simultaneously.

* Read: take5.gpy
* Exercise: Scissors, Paper, Rock.

# To be done
The following is a plan for the rest of this tutorial; this part has not been made yet.

- 2-D interface.

        + Quarto 2-D
        * Tic tac toe 2-D

- Combine 2-D and 3-D.

        + Quarto *-D
        * Tic tac toe *-D

- 2-D generated content.

        + Quarto generated.
        * Tic tac toe generated.

- Events from server.
