'use strict';

var colorLib = require('./color');
var GPU = require('./gpu').GPU;
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var RGBColor = colorLib.RGBColor;

function GpuColors(options) {
    this.gpu = new GPU();

    options = options || {};

    this.maxTemp = options.maxTemp || 90;
    this.minTemp = options.minTemp || 35;
    this.maxColor = options.maxColor || new RGBColor(255, 0, 0);
    this.minColor = options.minColor || new RGBColor(0, 0, 255);
}

util.inherits(GpuColors, EventEmitter);

GpuColors.prototype.setMax = function(temp) {
    this.maxTemp = temp;
};

GpuColors.prototype.setMin = function(temp) {
    this.minTemp = temp;
};

GpuColors.prototype.setColors = function(min, max) {
    this.minColor = min;
    this.maxColor = max;
};

GpuColors.prototype.fade = function () {
    this.gpu.temp();
    this.gpu.on('temp', this._onTemp.bind(this));
};

GpuColors.prototype.cancelFade = function () {
    this.gpu.cancelTemp();
};


GpuColors.prototype._onTemp = function (temp) {
    temp = Math.min(Math.max(this.minTemp, temp), this.maxTemp);
    temp = map(temp, this.minTemp, this.maxTemp, 0, 1);

    var color = colorLib.getRangeColor(this.minColor, this.maxColor, temp * temp);

    this.emit('color', color);
};

function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

exports.GpuColors = GpuColors;