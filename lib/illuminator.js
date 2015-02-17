'use strict';

var leds = require('./leds');
var GpuColors = require('./gpu-colors').GpuColors;
var gpu;


exports.init = function () {
    gpu = new GpuColors();

    gpu.on('color', function (color) {
        leds.setColor(color.r, color.g, color.b);
    });
};

exports.ws = function (socket) {
    gpu.on('color', function (color) {
        socket.emit('color', color);
    });


    socket.on('rgb', function (data) {
        leds.setColor(data.r, data.g, data.b);
    });

    socket.on('temp', function () {
        gpu.fade();
    });

    socket.on('cancel', function () {
        gpu.cancelFade();
    });
};