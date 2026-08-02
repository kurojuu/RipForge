// README.md

Motion Top
==========

A mobile-first 3D spinning-top battle game inspired by Beyblade.

Requirements
------------
- SPCK Editor
- Internet connection (loads Three.js from unpkg)

Project Structure
-----------------
index.html
style.css
main.js
arena.js
player.js
enemy.js
physics.js
ui.js

Controls
--------
- Tilt phone left/right to steer.
- Tilt forward/backward to move.
- Shake phone for a speed boost.

Rules
-----
- RPM is both spin speed and health.
- Every collision reduces RPM.
- A top stops when RPM reaches 0.
- Win by stopping all enemy tops before yours stops.

Current Version
---------------
- 3D arena
- Procedural spinning tops
- Gyroscope controls
- Shake boost
- Random 1–2 AI opponents
- Physics-based collision response
- RPM system
- Victory/Defeat UI

Planned Improvements
--------------------
- Better collision physics using Rapier
- Sparks and particle effects
- Camera shake
- Motion trails
- Special attacks
- Top customization
- Sound effects
- Multiple arenas
- Tournament mode