'use strict';

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var fs = require('fs');
var path = require('path');
var settings = require('./settings.json');

var serialPort;

exports.init = function() {
    settings = settings || {};

    serialPort = new SerialPort('COM3', {
        baudrate: 9600,
        parser: serialport.parsers.readline('\n')
    });

    serialPort.on('data', console.log.bind(console));
    serialPort.on('error', console.error.bind(console));


    if (settings.lastColor) {
        serialPort.on('open', function () {
            setTimeout(function () {
                exports.setColor(settings.lastColor.r, settings.lastColor.g, settings.lastColor.b);
            }, 2000);
        });
    }
};

exports.setColor = function (r, g, b) {
    if (!serialPort) {
        return;
    }

    serialPort.write([r, g, b].join(' ') + '\n');
    settings.lastColor = {
        r: r,
        g: g,
        b: b
    };

    exports.saveSettings();
};

exports.saveSettings = function () {
    fs.writeFile(path.join(__dirname, 'settings.json'), JSON.stringify(settings, 2), function (err) {
        if (err) {
            console.error(err);
        }
    });
};


