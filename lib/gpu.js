"use strict";

var request = require('superagent');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function GPU(req, host) {
    this.request = req || request;
    this.host = host || 'http://127.0.0.1:8085';
    this.url = this.host + '/data.json';
}

util.inherits(GPU, EventEmitter);

GPU.prototype.temp = function (interval) {
    this.tempInterval = interval || 500;


    this.tempIntervalId = setInterval(function () {
        if (this.tempIntervalCanceled) {
            this.tempIntervalCanceled = false;
            return clearInterval(this.tempIntervalId);
        }

        this._getTemp(function(err, temp){
            if (err) {
                return this.emit('error', err);
            }

            this.emit('temp', temp);
        }.bind(this));

    }.bind(this), this.tempInterval);
};

GPU.prototype.cancelTemp = function () {
    this.tempIntervalCanceled = true;
};

GPU.prototype._getTemp = function (cb) {
    request
        .get(this.url)
        .set('Accept', 'application/json')
        .end(function (err, res) {
            if (err) {
                return callback(err);
            }

            var temp;
            var gpuInfo = res.body.Children[0].Children[0];


            for (var i = 0; i < gpuInfo.Children.length; i++) {
                var info = gpuInfo.Children[i];

                if (info.Text === 'Temperatures') {
                    temp = info.Children[0].Value;
                    break;
                }

            }

            temp = parseFloat(temp.substring(0, temp.length - 3));
            cb(null, temp);
        });
};

module.exports.GPU = GPU;