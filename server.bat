@echo off
set port=8080
explorer http://localhost:%port%
node ./app.js %port%
