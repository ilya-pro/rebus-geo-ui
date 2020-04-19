//'use strict';

//if (typeof module !== 'undefined') module.exports = simpleheat;
export default simpleheat;

function simpleheat(canvas) {
    if (!(this instanceof simpleheat)) return new simpleheat(canvas);

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._max = 1;
    this._data = [];
}

simpleheat.prototype = {

    defaultRadius: 10, //25,

    defaultGradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
    },

    data: function (data) {
        this._data = data;
        return this;
    },

    max: function (max) {
        this._max = max;
        return this;
    },

    add: function (point) {
        this._data.push(point);
        return this;
    },

    clear: function () {
        this._data = [];
        return this;
    },

    radius: function (r, blur) {
        blur = 0;//blur === undefined ? 15 : blur;

        // create a grayscale blurred circle image that we'll use for drawing points
        var circle = this._circle = this._createCanvas(),
            ctx = circle.getContext('2d'),
            r2 = this._r = r + blur;

        circle.width = circle.height = r2 * 2;

        //ctx.fillStyle = 'black'; // my
        ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;

        // TODO не рекомендуется https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
        ctx.shadowBlur = blur;
        ctx.shadowColor = 'black';

        ctx.beginPath();
        ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        return this;
    },

    resize: function () {
        this._width = this._canvas.width;
        this._height = this._canvas.height;
        console.log(this._canvas.width, '=2', this._canvas.height);
    },

    gradient: function (grad) {
        // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
        var canvas = this._createCanvas(),
            ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        for (var i in grad) {
            gradient.addColorStop(+i, grad[i]);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);

        this._grad = ctx.getImageData(0, 0, 1, 256).data;

        return this;
    },

    draw: function (/*minOpacity*/) {
        // TODO отладка canvas https://www.html5rocks.com/en/tutorials/canvas/inspection/
        if (!this._circle) this.radius(this.defaultRadius);
        if (!this._grad) this.gradient(this.defaultGradient);

        var ctx = this._ctx;

        ctx.clearRect(0, 0, this._width, this._height);
        ctx.save();

        // draw a grayscale heatmap by putting a blurred circle at each data point
        //TODO remove debug alpha
        ctx.globalAlpha = 1;
        for (var i = 0, len = this._data.length, p; i < len; i++) {
            p = this._data[i];
            //ctx.globalAlpha = Math.min(Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity), 1);
            //TODO remove debug alpha
            if (i % 2 !== 0) {
                ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
            }
        }

        var copy = ctx.getImageData(0, 0, this._width, this._height);
        this._setPixelsAlpha(copy.data, 255 * 0.3);
        ctx.clearRect(0, 0, this._width, this._height);
        //ctx.restore(); // clear

        // test add odd circles (emulate another group)
        for (i = 0, len = this._data.length, p; i < len; i++) {
            p = this._data[i];
            //ctx.globalAlpha = Math.min(Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity), 1);
            //TODO remove debug alpha
            if (i % 2 === 0) {
                ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
            }

        }

        var copy2 = ctx.getImageData(0, 0, this._width, this._height);
        this._setPixelsAlpha(copy2.data, 255 * 0.3);
        ctx.clearRect(0, 0, this._width, this._height);
        //ctx.restore();

        //ctx.putImageData(copy, 0, 0);
        //ctx.globalCompositeOperation = 'multiply'; //doesnt affect for drawImage
        //ctx.putImageData(copy2, 0, 0);

        //ctx.putImageData(copy2, 0, 0);
        //ctx.drawImage(copy, 0, 0);  //dont apply pixels, only ImageBitmap.
        //ctx.drawImage(copy2, 0, 0);
        var self = this;
        Promise.all([
            // Cut out two sprites from the sprite sheet
            createImageBitmap(copy, 0, 0, this._width, this._height),
            createImageBitmap(copy2, 0, 0, this._width, this._height)
        ]).then(function(sprites) {
            // Draw each sprite onto the canvas
            ctx.drawImage(sprites[0], 0, 0);
            ctx.drawImage(sprites[1], 0, 0);

            var colored = ctx.getImageData(0, 0, self._width, self._height);
            self._colorize(colored.data, self._grad);
            // TODO вернуть для раскрашивания ч/б изображения в цвет
            ctx.putImageData(colored, 0, 0);
        });

        // вычитание в канвасе https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Compositing

        // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
        // копируем пиксели всего canvas
        /*var colored = ctx.getImageData(0, 0, this._width, this._height);
        this._colorize(colored.data, this._grad);
        // TODO вернуть для раскрашивания ч/б изображения в цвет
        ctx.putImageData(colored, 0, 0);*/

        return this;
    },

    _colorize: function (pixels, gradient) {
        for (var i = 0, len = pixels.length, j; i < len; i += 4) {
            j = pixels[i + 3] * 4; // get gradient color from opacity value

            if (j) {
                pixels[i] = gradient[j];
                pixels[i + 1] = gradient[j + 1];
                pixels[i + 2] = gradient[j + 2];
            }
        }
    },
    _setPixelsAlpha: function (pixels, alpha) {
        for (var i = 0, len = pixels.length, j; i < len; i += 4) {
            j = pixels[i + 3]; // get gradient color from opacity value
            if (j) {
                // учитываем текущий уровено прозрачность, чтобы не терять сглаженность на краях кругов
                pixels[i + 3] = j * alpha / 255; // change alpha chanel
            }
        }
    },

    _createCanvas: function () {
        if (typeof document !== 'undefined') {
            return document.createElement('canvas');
        } else {
            // create a new canvas instance in node.js
            // the canvas class needs to have a default constructor without any parameter
            return new this._canvas.constructor();
        }
    }
};
