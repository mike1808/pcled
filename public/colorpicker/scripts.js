'use strict';

var socket, emit;

var UIColorPicker = (function UIColorPicker() {

    function getElemById(id) {
        return document.getElementById(id);
    }

    var subscribers = [];
    var pickers = [];

    /**
     * RGBA Color class
     *
     * HSV/HSB and HSL (hue, saturation, value / brightness, lightness)
     * @param hue            0-360
     * @param saturation    0-100
     * @param value        0-100
     * @param lightness        0-100
     */

    function Color(color) {

        if (color instanceof Color === true) {
            this.copy(color);
            return;
        }

        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;
        this.hue = 0;
        this.saturation = 0;
        this.value = 0;
        this.lightness = 0;
        this.format = 'HSV';
    }

    function RGBColor(r, g, b) {
        var color = new Color();
        color.setRGBA(r, g, b, 1);
        return color;
    }

    function RGBAColor(r, g, b, a) {
        var color = new Color();
        color.setRGBA(r, g, b, a);
        return color;
    }

    function HSVColor(h, s, v) {
        var color = new Color();
        color.setHSV(h, s, v);
        return color;
    }

    function HSVAColor(h, s, v, a) {
        var color = new Color();
        color.setHSV(h, s, v);
        color.a = a;
        return color;
    }

    function HSLColor(h, s, l) {
        var color = new Color();
        color.setHSL(h, s, l);
        return color;
    }

    function HSLAColor(h, s, l, a) {
        var color = new Color();
        color.setHSL(h, s, l);
        color.a = a;
        return color;
    }

    Color.prototype.copy = function copy(obj) {
        if (obj instanceof Color !== true) {
            console.log('Typeof parameter not Color');
            return;
        }

        this.r = obj.r;
        this.g = obj.g;
        this.b = obj.b;
        this.a = obj.a;
        this.hue = obj.hue;
        this.saturation = obj.saturation;
        this.value = obj.value;
        this.format = '' + obj.format;
        this.lightness = obj.lightness;
    };

    Color.prototype.setFormat = function setFormat(format) {
        if (format === 'HSV')
            this.format = 'HSV';
        if (format === 'HSL')
            this.format = 'HSL';
    };

    /*========== Methods to set Color Properties ==========*/

    Color.prototype.isValidRGBValue = function isValidRGBValue(value) {
        return (typeof(value) === 'number' && isNaN(value) === false &&
        value >= 0 && value <= 255);
    };

    Color.prototype.setRGBA = function setRGBA(red, green, blue, alpha) {
        if (this.isValidRGBValue(red) === false ||
            this.isValidRGBValue(green) === false ||
            this.isValidRGBValue(blue) === false)
            return;

        this.r = red | 0;
        this.g = green | 0;
        this.b = blue | 0;

        if (this.isValidRGBValue(alpha) === true)
            this.a = alpha | 0;
    };

    Color.prototype.setByName = function setByName(name, value) {
        if (name === 'r' || name === 'g' || name === 'b') {
            if (this.isValidRGBValue(value) === false)
                return;

            this[name] = value;
            this.updateHSX();
        }
    };

    Color.prototype.setHSV = function setHSV(hue, saturation, value) {
        this.hue = hue;
        this.saturation = saturation;
        this.value = value;
        this.HSVtoRGB();
    };

    Color.prototype.setHSL = function setHSL(hue, saturation, lightness) {
        this.hue = hue;
        this.saturation = saturation;
        this.lightness = lightness;
        this.HSLtoRGB();
    };

    Color.prototype.setHue = function setHue(value) {
        if (typeof(value) !== 'number' || isNaN(value) === true ||
            value < 0 || value > 359)
            return;
        this.hue = value;
        this.updateRGB();
    };

    Color.prototype.setSaturation = function setSaturation(value) {
        if (typeof(value) !== 'number' || isNaN(value) === true ||
            value < 0 || value > 100)
            return;
        this.saturation = value;
        this.updateRGB();
    };

    Color.prototype.setValue = function setValue(value) {
        if (typeof(value) !== 'number' || isNaN(value) === true ||
            value < 0 || value > 100)
            return;
        this.value = value;
        this.HSVtoRGB();
    };

    Color.prototype.setLightness = function setLightness(value) {
        if (typeof(value) !== 'number' || isNaN(value) === true ||
            value < 0 || value > 100)
            return;
        this.lightness = value;
        this.HSLtoRGB();
    };

    Color.prototype.setHexa = function setHexa(value) {
        var valid = /(^#{0,1}[0-9A-F]{6}$)|(^#{0,1}[0-9A-F]{3}$)/i.test(value);

        if (valid !== true)
            return;

        if (value[0] === '#')
            value = value.slice(1, value.length);

        if (value.length === 3)
            value = value.replace(/([0-9A-F])([0-9A-F])([0-9A-F])/i, '$1$1$2$2$3$3');

        this.r = parseInt(value.substr(0, 2), 16);
        this.g = parseInt(value.substr(2, 2), 16);
        this.b = parseInt(value.substr(4, 2), 16);

        this.alpha = 1;
        this.RGBtoHSV();
    };

    /*========== Conversion Methods ==========*/

    Color.prototype.convertToHSL = function convertToHSL() {
        if (this.format === 'HSL')
            return;

        this.setFormat('HSL');
        this.RGBtoHSL();
    };

    Color.prototype.convertToHSV = function convertToHSV() {
        if (this.format === 'HSV')
            return;

        this.setFormat('HSV');
        this.RGBtoHSV();
    };

    /*========== Update Methods ==========*/

    Color.prototype.updateRGB = function updateRGB() {
        if (this.format === 'HSV') {
            this.HSVtoRGB();
            return;
        }

        if (this.format === 'HSL') {
            this.HSLtoRGB();
            return;
        }
    };

    Color.prototype.updateHSX = function updateHSX() {
        if (this.format === 'HSV') {
            this.RGBtoHSV();
            return;
        }

        if (this.format === 'HSL') {
            this.RGBtoHSL();
            return;
        }
    };

    Color.prototype.HSVtoRGB = function HSVtoRGB() {
        var sat = this.saturation / 100;
        var value = this.value / 100;
        var C = sat * value;
        var H = this.hue / 60;
        var X = C * (1 - Math.abs(H % 2 - 1));
        var m = value - C;
        var precision = 255;

        C = (C + m) * precision | 0;
        X = (X + m) * precision | 0;
        m = m * precision | 0;

        if (H >= 0 && H < 1) {
            this.setRGBA(C, X, m);
            return;
        }
        if (H >= 1 && H < 2) {
            this.setRGBA(X, C, m);
            return;
        }
        if (H >= 2 && H < 3) {
            this.setRGBA(m, C, X);
            return;
        }
        if (H >= 3 && H < 4) {
            this.setRGBA(m, X, C);
            return;
        }
        if (H >= 4 && H < 5) {
            this.setRGBA(X, m, C);
            return;
        }
        if (H >= 5 && H < 6) {
            this.setRGBA(C, m, X);
            return;
        }
    };

    Color.prototype.HSLtoRGB = function HSLtoRGB() {
        var sat = this.saturation / 100;
        var light = this.lightness / 100;
        var C = sat * (1 - Math.abs(2 * light - 1));
        var H = this.hue / 60;
        var X = C * (1 - Math.abs(H % 2 - 1));
        var m = light - C / 2;
        var precision = 255;

        C = (C + m) * precision | 0;
        X = (X + m) * precision | 0;
        m = m * precision | 0;

        if (H >= 0 && H < 1) {
            this.setRGBA(C, X, m);
            return;
        }
        if (H >= 1 && H < 2) {
            this.setRGBA(X, C, m);
            return;
        }
        if (H >= 2 && H < 3) {
            this.setRGBA(m, C, X);
            return;
        }
        if (H >= 3 && H < 4) {
            this.setRGBA(m, X, C);
            return;
        }
        if (H >= 4 && H < 5) {
            this.setRGBA(X, m, C);
            return;
        }
        if (H >= 5 && H < 6) {
            this.setRGBA(C, m, X);
            return;
        }
    };

    Color.prototype.RGBtoHSV = function RGBtoHSV() {
        var red = this.r / 255;
        var green = this.g / 255;
        var blue = this.b / 255;

        var cmax = Math.max(red, green, blue);
        var cmin = Math.min(red, green, blue);
        var delta = cmax - cmin;
        var hue = 0;
        var saturation = 0;

        if (delta) {
            if (cmax === red) {
                hue = ((green - blue) / delta);
            }
            if (cmax === green) {
                hue = 2 + (blue - red) / delta;
            }
            if (cmax === blue) {
                hue = 4 + (red - green) / delta;
            }
            if (cmax) saturation = delta / cmax;
        }

        this.hue = 60 * hue | 0;
        if (this.hue < 0) this.hue += 360;
        this.saturation = (saturation * 100) | 0;
        this.value = (cmax * 100) | 0;
    };

    Color.prototype.RGBtoHSL = function RGBtoHSL() {
        var red = this.r / 255;
        var green = this.g / 255;
        var blue = this.b / 255;

        var cmax = Math.max(red, green, blue);
        var cmin = Math.min(red, green, blue);
        var delta = cmax - cmin;
        var hue = 0;
        var saturation = 0;
        var lightness = (cmax + cmin) / 2;
        var X = (1 - Math.abs(2 * lightness - 1));

        if (delta) {
            if (cmax === red) {
                hue = ((green - blue) / delta);
            }
            if (cmax === green) {
                hue = 2 + (blue - red) / delta;
            }
            if (cmax === blue) {
                hue = 4 + (red - green) / delta;
            }
            if (cmax) saturation = delta / X;
        }

        this.hue = 60 * hue | 0;
        if (this.hue < 0) this.hue += 360;
        this.saturation = (saturation * 100) | 0;
        this.lightness = (lightness * 100) | 0;
    };

    /*========== Get Methods ==========*/

    Color.prototype.getHexa = function getHexa() {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (this.r < 16) r = '0' + r;
        if (this.g < 16) g = '0' + g;
        if (this.b < 16) b = '0' + b;
        var value = '#' + r + g + b;
        return value.toUpperCase();
    };

    Color.prototype.getRGBA = function getRGBA() {

        var rgb = '(' + this.r + ', ' + this.g + ', ' + this.b;
        var a = '';
        var v = '';
        var x = parseFloat(this.a);
        if (x !== 1) {
            a = 'a';
            v = ', ' + x;
        }

        var value = 'rgb' + a + rgb + v + ')';
        return value;
    };

    Color.prototype.getHSLA = function getHSLA() {
        if (this.format === 'HSV') {
            var color = new Color(this);
            color.setFormat('HSL');
            color.updateHSX();
            return color.getHSLA();
        }

        var a = '';
        var v = '';
        var hsl = '(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%';
        var x = parseFloat(this.a);
        if (x !== 1) {
            a = 'a';
            v = ', ' + x;
        }

        var value = 'hsl' + a + hsl + v + ')';
        return value;
    };

    Color.prototype.getColor = function getColor() {
        if (this.a | 0 === 1)
            return this.getHexa();
        return this.getRGBA();
    };

    /*=======================================================================*/
    /*=======================================================================*/

    /*========== Capture Mouse Movement ==========*/

    var setMouseTracking = function setMouseTracking(elem, callback) {
        elem.addEventListener('mousedown', function (e) {
            callback(e);
            document.addEventListener('mousemove', callback);
        });

        document.addEventListener('mouseup', function (e) {
            document.removeEventListener('mousemove', callback);
        });
    };

    /*====================*/
    // Color Picker Class
    /*====================*/

    function ColorPicker(node) {
        this.color = new Color();
        this.node = node;
        this.subscribers = [];

        var type = this.node.getAttribute('data-mode');
        var topic = this.node.getAttribute('data-topic');

        this.topic = topic;
        this.picker_mode = (type === 'HSL') ? 'HSL' : 'HSV';
        this.color.setFormat(this.picker_mode);

        this.createPickingArea();
        this.createHueArea();

        this.createPreviewBox();

        subscribe('socket', function (color) {
            this.setColor(color);
        }.bind(this));

        this.setColor(this.color);
        pickers[topic] = this;
    }

    /*************************************************************************/
    //				Function for generating the color-picker
    /*************************************************************************/

    ColorPicker.prototype.createPickingArea = function createPickingArea() {
        var area = document.createElement('div');
        var picker = document.createElement('div');

        area.className = 'picking-area';
        picker.className = 'picker';

        this.picking_area = area;
        this.color_picker = picker;
        setMouseTracking(area, this.updateColor.bind(this));

        area.appendChild(picker);
        this.node.appendChild(area);
    };

    ColorPicker.prototype.createHueArea = function createHueArea() {
        var area = document.createElement('div');
        var picker = document.createElement('div');

        area.className = 'hue';
        picker.className = 'slider-picker';

        this.hue_area = area;
        this.hue_picker = picker;
        setMouseTracking(area, this.updateHueVerticalSlider.bind(this));

        area.appendChild(picker);
        this.node.appendChild(area);
    };

    ColorPicker.prototype.createPreviewBox = function createPreviewBox(e) {
        var preview_box = document.createElement('div');
        var preview_color = document.createElement('div');

        preview_box.className = 'preview';
        preview_color.className = 'preview-color';

        this.preview_color = preview_color;

        preview_box.appendChild(preview_color);
        this.node.appendChild(preview_box);
    };


    /*************************************************************************/
    //					Updates properties of UI elements
    /*************************************************************************/

    ColorPicker.prototype.updateColor = function updateColor(e) {
        var x = e.pageX - this.picking_area.offsetLeft;
        var y = e.pageY - this.picking_area.offsetTop;
        var picker_offset = 5;

        // width and height should be the same
        var size = this.picking_area.clientWidth;

        if (x > size) x = size;
        if (y > size) y = size;
        if (x < 0) x = 0;
        if (y < 0) y = 0;

        var value = 100 - (y * 100 / size) | 0;
        var saturation = x * 100 / size | 0;

        if (this.picker_mode === 'HSV')
            this.color.setHSV(this.color.hue, saturation, value);
        if (this.picker_mode === 'HSL')
            this.color.setHSL(this.color.hue, saturation, value);

        this.color_picker.style.left = x - picker_offset + 'px';
        this.color_picker.style.top = y - picker_offset + 'px';

        this.updatePreviewColor();

        this.notify('value', value);
        this.notify('lightness', value);
        this.notify('saturation', saturation);

        this.notify('red', this.color.r);
        this.notify('green', this.color.g);
        this.notify('blue', this.color.b);
        this.notify('hexa', this.color.getHexa());

        notify(this.topic, this.color);
    };



    ColorPicker.prototype.updateHueSlider = function updateHueSlider(e) {
        var x = e.pageX - this.hue_area.offsetLeft;
        var width = this.hue_area.clientWidth;

        if (x < 0) x = 0;
        if (x > width) x = width;

        // TODO 360 => 359
        var hue = ((359 * x) / width) | 0;
        // if (hue === 360) hue = 359;

        this.updateSliderPosition(this.hue_picker, x);
        this.setHue(hue);
    };


    ColorPicker.prototype.updateHueVerticalSlider = function updateHueSlider(e) {
        var y = e.pageY - this.hue_area.offsetTop;
        var height = this.hue_area.clientHeight;

        if (y < 0) y = 0;
        if (y > height) y = height;

        // TODO 360 => 359
        var hue = ((359 * y) / height) | 0;
        // if (hue === 360) hue = 359;

        this.updateVerticalSliderPosition(this.hue_picker, y);
        this.setHue(hue);
    };

    ColorPicker.prototype.setHue = function setHue(value) {
        this.color.setHue(value);

        this.updatePickerBackground();
        this.updatePreviewColor();

        this.notify('red', this.color.r);
        this.notify('green', this.color.g);
        this.notify('blue', this.color.b);
        this.notify('hexa', this.color.getHexa());
        this.notify('hue', this.color.hue);

        notify(this.topic, this.color);
    };


    /*************************************************************************/
    //				Update positions of various UI elements
    /*************************************************************************/

    ColorPicker.prototype.updatePickerPosition = function updatePickerPosition() {
        var size = this.picking_area.clientWidth;
        var value = 0;
        var offset = 5;

        if (this.picker_mode === 'HSV')
            value = this.color.value;
        if (this.picker_mode === 'HSL')
            value = this.color.lightness;

        var x = (this.color.saturation * size / 100) | 0;
        var y = size - (value * size / 100) | 0;

        this.color_picker.style.left = x - offset + 'px';
        this.color_picker.style.top = y - offset + 'px';
    };

    ColorPicker.prototype.updateSliderPosition = function updateSliderPosition(elem, pos) {
        elem.style.left = Math.max(pos - 3, -2) + 'px';
    };

    ColorPicker.prototype.updateVerticalSliderPosition = function updateVerticalSliderPosition(elem, pos) {
        elem.style.top = Math.max(pos - 3, -2) + 'px';
    };

    ColorPicker.prototype.updateHuePicker = function updateHuePicker() {
        var size = this.hue_area.clientHeight;
        var offset = 1;
        var pos = (this.color.hue * size / 360 ) | 0;
        this.hue_picker.style.top = pos - offset + 'px';
    };

    /*************************************************************************/
    //						Update background colors
    /*************************************************************************/

    ColorPicker.prototype.updatePickerBackground = function updatePickerBackground() {
        var nc = new Color(this.color);
        nc.setHSV(nc.hue, 100, 100);
        this.picking_area.style.backgroundColor = nc.getHexa();
    };

    ColorPicker.prototype.updateAlphaGradient = function updateAlphaGradient() {
        this.alpha_mask.style.backgroundColor = this.color.getHexa();
    };

    ColorPicker.prototype.updatePreviewColor = function updatePreviewColor() {
        if (emit) {
            emit('rgb', this.color);
        }

        this.preview_color.style.backgroundColor = this.color.getColor();
    };


    /*************************************************************************/
    //							Internal Pub/Sub
    /*************************************************************************/

    ColorPicker.prototype.subscribe = function subscribe(topic, callback) {
        this.subscribers[topic] = callback;
    };

    ColorPicker.prototype.notify = function notify(topic, value) {
        if (this.subscribers[topic])
            this.subscribers[topic](value);
    };

    /*************************************************************************/
    //							Set Picker Properties
    /*************************************************************************/

    ColorPicker.prototype.setColor = function setColor(color) {
        if (color instanceof Color !== true) {
            console.log('Typeof parameter not Color');
            return;
        }

        if (color.format !== this.picker_mode) {
            color.setFormat(this.picker_mode);
            color.updateHSX();
        }

        this.color.copy(color);
        this.updateHuePicker();
        this.updatePickerPosition();
        this.updatePickerBackground();

        this.updatePreviewColor();

        this.notify('red', this.color.r);
        this.notify('green', this.color.g);
        this.notify('blue', this.color.b);

        this.notify('hue', this.color.hue);
        this.notify('saturation', this.color.saturation);
        this.notify('value', this.color.value);
        this.notify('lightness', this.color.lightness);

        this.notify('alpha', this.color.a);
        this.notify('hexa', this.color.getHexa());
        notify(this.topic, this.color);
    };

    ColorPicker.prototype.setPickerMode = function setPickerMode(mode) {
        if (mode !== 'HSV' && mode !== 'HSL')
            return;

        this.picker_mode = mode;
        this.node.setAttribute('data-mode', this.picker_mode);
        this.setColor(this.color);
    };

    /*************************************************************************/
    //								UNUSED
    /*************************************************************************/

    var setPickerMode = function setPickerMode(topic, mode) {
        if (pickers[topic])
            pickers[topic].setPickerMode(mode);
    };

    var setColor = function setColor(topic, color) {
        if (pickers[topic])
            pickers[topic].setColor(color);
    };

    var getColor = function getColor(topic) {
        if (pickers[topic])
            return new Color(pickers[topic].color);
    };

    var subscribe = function subscribe(topic, callback) {
        if (subscribers[topic] === undefined)
            subscribers[topic] = [];

        subscribers[topic].push(callback);
    };

    var unsubscribe = function unsubscribe(callback) {
        subscribers.indexOf(callback);
        subscribers.splice(index, 1);
    };

    var notify = function notify(topic, value) {
        if (subscribers[topic] === undefined || subscribers[topic].length === 0)
            return;

        var color = new Color(value);
        for (var i in subscribers[topic])
            subscribers[topic][i](color);
    };

    var init = function init() {
        var elem = document.querySelectorAll('.ui-color-picker');
        var size = elem.length;
        var cp;

        for (var i = 0; i < size; i++) {
            cp = new ColorPicker(elem[i]);
        }

        subscribe('picker', console.log.bind(console));
    };


    return {
        init: init,
        Color: Color,
        RGBColor: RGBColor,
        RGBAColor: RGBAColor,
        HSVColor: HSVColor,
        HSVAColor: HSVAColor,
        HSLColor: HSLColor,
        HSLAColor: HSLAColor,
        setColor: setColor,
        getColor: getColor,
        subscribe: subscribe,
        notify: notify,
        unsubscribe: unsubscribe,
        setPickerMode: setPickerMode
    };

})();


window.addEventListener("load", function () {
    ColorPickerTool.init();
    socket = io.connect();
    socket.on('color', function (data) {
        var color = UIColorPicker.RGBColor(data.r, data.g, data.b);
        color.updateHSX();
        UIColorPicker.notify('socket', color);
    });
    emit = socket.emit.bind(socket);
});

var ColorPickerTool = (function ColorPickerTool() {

    var init = function init() {
        UIColorPicker.init();
    };

    return {
        init: init
    };

})();


function cancelTemp() {
    emit('cancel');
}

function temp() {
    emit('temp');
}