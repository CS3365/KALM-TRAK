/**
 * @class Ext.draw.Canvas
 * @extends Ext.draw.Surface
 *<p>Provides specific methods to draw with Canvas.</p>
 */

Ext.draw.engine.Canvas = Ext.extend(Ext.draw.Surface, {

    //read only style attribute canvas property mapping.
    attributeMap: {
        rotate: "rotation",
        stroke: "strokeStyle",
        fill: "fillStyle",
        lineWidth: "lineWidth",
        "text-anchor": "textAlign",
        "stroke-width": "lineWidth",
        "stroke-linecap": "lineCap",
        "stroke-linejoin": "lineJoin",
        "stroke-miterlimit": "miterLimit",
        opacity: "globalAlpha",
        font: 'font',
        shadowColor: "shadowColor",
        shadowOffsetX: "shadowOffsetX",
        shadowOffsetY: "shadowOffsetY",
        shadowBlur: "shadowBlur"
    },

    //read only default canvas property value map.
    attributeDefaults: {
        strokeStyle: "rgba(0, 0, 0, 0)",
        fillStyle: "rgba(0, 0, 0, 0)",
        lineWidth: 1,
        lineCap: "square",
        lineJoin: "miter",
        miterLimit: 1,
        shadowColor: "none",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0,
        font: "10px Helvetica, sans-serif",
        textAlign: "start",
        globalAlpha: 1
    },

    gradientRe: /\s*url\s*\(#([^\)]+)\)\s*/,

    //read-only map of value convertions
    //used to convert a gradient id string into a gradient object
    //in a generic way
    attributeParsers: {
        fillStyle: function(value, sprite, me) {
            if (!value) {
                return value;
            }
            //is a gradient object
            if (Ext.isObject(value)) {
                me.addGradient(value);
                value = 'url(#' + value.id + ')';
            }
            var id = value.match(me.gradientRe);
            if (id) {
                return me.createGradient(me._gradients[id[1]], sprite);
            } else {
                return value == 'none'? 'rgba(0, 0, 0, 0)' : value;
            }
        },
        strokeStyle: function(value, sprite, me) {
            if (!value) {
                return value;
            }
            //is a gradient object
            if (Ext.isObject(value)) {
                me.addGradient(value);
                value = 'url(#' + value.id + ')';
            }
            var id = value.match(me.gradientRe);
            if (id) {
                return me.createGradient(me._gradients[id[1]], sprite);
            } else {
                return value == 'none'? 'rgba(0, 0, 0, 0)' : value;
            }
        },
        textAlign: function(value, sprite) {
            if (value === 'middle') {
                return 'center';
            }
            return value;
        }
    },

    constructor: function(config) {
        var me = this;
        //whether to add an event system to the canvas or not
        me.initEvents = 'initEvents' in config ? config.initEvents : true;
        //store a hash of gradient configurations
        me._gradients = {};
        Ext.draw.engine.Canvas.superclass.constructor.apply(this, arguments);
        me.initCanvas(config.renderTo);

        // Redraw after each animation frame event
        Ext.fx.Manager.addListener('frameend', function() {
            // Only render a frame on frameend if we were changed via tween
            if (me.animatedFrame) {
                me.animatedFrame = false;
                me.renderFrame();
            }
        });

        //disable context menu
        //TODO(nico): This should be configurable.
        this.canvas.oncontextmenu = function() { return false; };
    },

    //initializes the only canvas instance to draw the shapes to.
    initCanvas: function(container) {
        if (this.ctx) {
            return;
        }

        var me = this,
            domContainer = Ext.get(container),
            width = domContainer.getWidth(),
            height = domContainer.getHeight(),
            div = me.createWrapEl(container),
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        div.setSize(width, height);
        //add an id to the dom div element.
        div.dom.id = me.id + '-wrap';
        canvas.id = me.id + '-canvas';
        canvas.width = width;
        canvas.height = height;

        div.appendChild(canvas);

        me.el = div;
        me.surfaceEl = Ext.get(canvas);
        me.canvas = canvas;
        me.ctx = ctx;

        //Add event manager for canvas class
        if (me.initEvents) {
            me.initializeEvents();
        }

    },

    getSpriteForEvent: function() {
        return null; //TODO!!!
    },

    //stores the gradient configuration into a hashmap
    addGradient: function(gradient) {
        var me = this;
        gradient = Ext.draw.Draw.parseGradient(gradient);
        me._gradients[gradient.id] = gradient;
    },

    //applies the current transformations to the element's matrix
    //TODO(nico): similar to what's found in Svg engine
    transform: function(sprite) {
        var matrix = new Ext.draw.Matrix,
            transforms = sprite.transformations,
            transformsLength = transforms.length,
            i = 0,
            transform, type;

        for (; i < transformsLength; i++) {
            transform = transforms[i];
            type = transform.type;
            if (type == "translate") {
                matrix.translate(transform.x, transform.y);
            }
            else if (type == "rotate") {
                matrix.rotate(transform.degrees, transform.x, transform.y);
            }
            else if (type == "scale") {
                matrix.scale(transform.x, transform.y, transform.centerX, transform.centerY);
            }
        }
        sprite.matrix = matrix;
    },

    setSize: function(w, h) {
        var width, height,
            me = this,
            canvas = me.canvas;
        if (typeof w == 'object') {
            width = w.width;
            height = w.height;
        } else {
            width = w;
            height = h;
        }
        if (width !== canvas.width || height !== canvas.height) {
            me.el.setSize(width, height);
            me.surfaceEl.setSize(width, height);
            canvas.width = width;
            canvas.height = height;

            me.width = width;
            me.height = height;
        }

        Ext.draw.engine.Canvas.superclass.setSize.call(this, w, h);
    },

    tween: function() {
        this.animatedFrame = true;
        Ext.draw.engine.Canvas.superclass.tween.apply(this);
    },

    //Rendering
    renderFrame: function() {
        this.render();
    },

    render: function(container) {
        var me = this;
        if (!me.canvas) {
            me.initCanvas(container);
        }
        me.renderAll();
    },

    createItem: function (config) {
        var sprite = new Ext.draw.Sprite(config);
        sprite.surface = this;
        sprite.matrix = new Ext.draw.Matrix;
        sprite.bbox = {
            plain: 0,
            transform: 0
        };
        return sprite;
    },

    // @private
    //TODO(nico): should sort also by abstract concept: "priority"
    zIndexSort: function(a, b) {
        var aAttr = a.attr,
            bAttr = b.attr,
            aIndex = aAttr && aAttr.zIndex || -1,
            bIndex = bAttr && bAttr.zIndex || -1,
            val = aIndex - bIndex;
        if (!val) {
            return (a.id > b.id) ? 1 :  -1;
        }
        else {
            return val;
        }
    },

    renderAll: function() {
        var me = this;
        me.clear();
        //sort by zIndex
        me.items.items.sort(me.zIndexSort);
        me.items.each(me.renderSprite, me);
    },

    renderSprite: function (sprite) {
        // Clear dirty flags that aren't used by the Canvas renderer
        sprite.dirtyHidden = sprite.dirtyPath = sprite.zIndexDirty = sprite.dirtyFont = sprite.dirty = false;

        if (sprite.attr.hidden) {
            return;
        }
        if (!sprite.matrix) {
            sprite.matrix = new Ext.draw.Matrix();
        }
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            attributeMap = me.attributeMap,
            attributeDefaults = me.attributeDefaults,
            attributeParsers = me.attributeParsers,
            prop, val, propertyValue;

        if (sprite.dirtyTransform) {
            me.applyTransformations(sprite);
        }
        ctx.save();

        //set matrix state
        sprite.matrix.toCanvas(ctx);

        //set styles
        for (prop in attributeMap) {
            val = attributeMap[prop];
            if (val in attributeParsers) {
                propertyValue = attributeParsers[val](attr[prop], sprite, me);
                if (propertyValue !== undefined) {
                    ctx[val] = propertyValue;
                } else {
                    ctx[val] = attributeDefaults[val];
                }
            }
            else {
                propertyValue = attr[prop];
                if (propertyValue !== undefined) {
                    ctx[val] = propertyValue;
                } else {
                    ctx[val] = attributeDefaults[val];
                }
            }
        }

        //render shape
        me[sprite.type + 'Render'](sprite);
        ctx.restore();
    },

    circleRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            x = +(attr.x || 0),
            y = +(attr.y || 0),
            radius = attr.radius,
            pi2 = Ext.draw.Draw.pi2;

        //draw fill circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, pi2, true);
		ctx.closePath();
        ctx.fill();

        //draw stroke circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, pi2, true);
		ctx.closePath();
        ctx.stroke();
    },

    ellipseRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            width = attr.width,
            height = attr.height,
            x = +(attr.x || 0),
            y = +(attr.y || 0),
            scaleX = 1,
            scaleY = 1,
            scalePosX = 1,
            scalePosY = 1,
            radius = 0,
            pi2 = Ext.draw.Draw.pi2;

        if (width > height) {
            radius = width / 2;
            scaleY = height / width;
            scalePosY = width / height;
        }
        else {
            radius = height / 2;
            scaleX = width / height;
            scalePosX = height / width;
        }
        ctx.scale(scaleX, scaleY);

        //make fill ellipse
        ctx.beginPath();
        ctx.arc(x * scalePosX, y * scalePosY, radius, 0, pi2, true);
        ctx.closePath();
        ctx.fill();

        //make stroke ellipse
        ctx.beginPath();
        ctx.arc(x * scalePosX, y * scalePosY, radius, 0, pi2, true);
        ctx.closePath();
        ctx.stroke();
    },

    imageRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            width = attr.width,
            height = attr.height,

            x = +(attr.x || 0),
            y = +(attr.y || 0),
            src = attr.src,
            img;

        if (sprite._img) {
            img = sprite._img;
        }
        else {
            sprite._img = img = new Image();
            img.height = height;
            img.width = width;
            img._loading = true;
            img.onload = function() {
                img._loading = false;
                me.renderFrame();
            };
            img.src = src.slice(1, src.length -1);
        }

        if (!img._loading) {
            ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
        }
    },

    rectRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            width = attr.width,
            height = attr.height,
            x = +(attr.x || 0),
            y = +(attr.y || 0);

        if (isFinite(x) && isFinite(y) && isFinite(width) && isFinite(height)) {
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);
        }
    },

    textRender: function(sprite) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            x = +(attr.x || 0),
            y = +(attr.y || 0),
            text = attr.text;
        if (isFinite(x) && isFinite(y)) {
            ctx.textBaseline = 'middle';
            ctx.fillText(text, x, y);
        }
    },

    pathRender: function(sprite) {
        if (!sprite.attr.path) {
            return;
        }

        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            path = Ext.draw.Draw.path2curve(attr.path),
            ln = path.length,
            x, y, i;

        ctx.beginPath();
        for (i = 0; i < ln; i++) {
            switch (path[i][0]) {
                case "M":
                    ctx.moveTo(path[i][1], path[i][2]);
                    if (x == null) {
                        x = path[i][1];
                    }
                    if (y == null) {
                        y = path[i][2];
                    }
                break;
                case "C":
                    ctx.bezierCurveTo(path[i][1],
                                      path[i][2],
                                      path[i][3],
                                      path[i][4],
                                      path[i][5],
                                      path[i][6]);
                break;
                case "Z":
                    ctx.lineTo(x, y);
                break;
            }
        }
        //if stroke is not transparent then draw it
        if (attr.stroke && attr.stroke != 'none' && attr.stroke != 'rgba(0, 0, 0, 0)') {
            ctx.stroke();
        }
        //if fill is not transparent then draw it
        if (attr.fill && attr.fill != 'none' && attr.fill != 'rgba(0, 0, 0, 0)') {
            ctx.fill();
        }
        ctx.closePath();
    },

    //Contains method used for event handling.
    //Returns the target pointed by the mouse or
    //false otherwise.
    contains: function(x, y) {
        var me = this,
            items = me.items.items,
            l = items.length,
            sprite;

        while (l--) {
            sprite = items[l];
            if (me.bboxContains(x, y, sprite)) {
                if (me[sprite.type + 'Contains'](x, y, sprite)) {
                    //TODO(nico): not returning just the sprite because a
                    //more complex object with more informaiton on the event
                    //may be returned.
                    return {
                        target: sprite
                    };
                }
            }
        }

        return false;
    },

    //Whether the point is in the BBox of the shape
    bboxContains: function(x, y, sprite) {
        var bbox = sprite.getBBox();

        return (x >= bbox.x && x <= (bbox.x + bbox.width)
            && (y >= bbox.y && y <= (bbox.y + bbox.height)));
    },

    //Whether the point is in the shape
    circleContains: function(x, y, sprite) {
        var attr = sprite.attr,
            trans = attr.translation,
            cx = (attr.x || 0) + (trans && trans.x || 0),
            cy = (attr.y || 0) + (trans && trans.y || 0),
            dx = x - cx,
            dy = y - cy,
            radius = attr.radius;

        return (dx * dx + dy * dy) <= (radius * radius);
    },

    //Whether the point is in the shape
    ellipseContains: function(x, y, sprite) {
        var attr = sprite.attr,
            trans = attr.translation,
            cx = (attr.x || 0) + (trans && trans.x || 0),
            cy = (attr.y || 0) + (trans && trans.y || 0),
            radiusX = attr.radiusX || (attr.width  / 2) || 0,
            radiusY = attr.radiusY || (attr.height / 2) || 0,
            radius = 0,
            scaleX = 1,
            scaleY = 1,
            dx, dy;

        if (radiusX > radiusY) {
                radius = radiusX;
                scaleY = radiusY / radiusX;
        } else {
            radius = radiusY;
            scaleY = radiusX / radiusY;
        }

        dx = (x - cx) / scaleX;
        dy = (y - cy) / scaleY;

        return (dx * dx + dy * dy) <= (radius * radius);
    },

    //Same behavior as the BBox check, so return true.
    imageContains: function(x, y, sprite) {
        return true;
    },

    //Same behavior as the BBox check, so return true.
    rectContains: function(x, y, sprite) {
        return true;
    },

    //Same behavior as the BBox check, so return true.
    textContains: function(x, y, sprite) {
        return true;
    },

    //TODO(nico): to be implemented later.
    pathContains: function(x, y, sprite) {
        return false;
    },

    createGradient: function(gradient, sprite) {
        var ctx = this.ctx,
            bbox = sprite.getBBox(),
            x1 = bbox.x,
            y1 = bbox.y,
            width = bbox.width,
            height = bbox.height,
            x2 = x1 + width,
            y2 = y1 + height,
            a = Math.round(Math.abs(gradient.degrees || gradient.angle || 0) % 360),
            stops = gradient.stops,
            stop, canvasGradient;

        if (a <= 0) {
            canvasGradient = ctx.createLinearGradient(x1, y1, x1, y2);
        } else if (a <= 45) {
            canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        } else if (a <= 90) {
            canvasGradient = ctx.createLinearGradient(x1, y1, x2, y1);
        } else if (a <= 135) {
            canvasGradient = ctx.createLinearGradient(x2, y1, x1, y2);
        } else if (a <= 180) {
            canvasGradient = ctx.createLinearGradient(x1, y2, x1, y1);
        } else if (a <= 225) {
            canvasGradient = ctx.createLinearGradient(x2, y2, x1, y1);
        } else if (a <= 270) {
            canvasGradient = ctx.createLinearGradient(x2, y1, x1, y1);
        } else if (a <= 315) {
            canvasGradient = ctx.createLinearGradient(x1, y2, x2, y1);
        } else {
            canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        }

        for (stop in stops) {
            if (stops.hasOwnProperty(stop)) {
                canvasGradient.addColorStop(stop, stops[stop].color || '#000');
            }
        }

        return canvasGradient;
    },

    //getBBox
    getBBox: function (sprite, isWithoutTransform) {
        if (sprite.type == 'text') {
            return this.getBBoxText(sprite, isWithoutTransform);
        }
        var realPath = this["getPath" + sprite.type](sprite);
        if (isWithoutTransform) {
            sprite.bbox.plain = sprite.bbox.plain || Ext.draw.Draw.pathDimensions(realPath);
            return sprite.bbox.plain;
        }
        //sprite.bbox.transform = sprite.bbox.transform || Ext.draw.Draw.pathDimensions(Ext.draw.Draw.mapPath(realPath, sprite.matrix));
        //caching the bounding box causes problems :(
        sprite.bbox.transform = Ext.draw.Draw.pathDimensions(Ext.draw.Draw.mapPath(realPath, sprite.matrix));
        return sprite.bbox.transform;
    },

    getBBoxText: function(sprite, isWithoutTransform) {
        var me = this,
            ctx = me.ctx,
            attr = sprite.attr,
            matrix,
            x = attr.x || 0,
            y = attr.y || 0,
            x1, x2, y1, y2,
            x1t, x2t, x3t, x4t,
            y1t, y2t, y3t, y4t,
            width, height,
            trans = sprite.attr.translation,
            dx = trans && trans.x || 0,
            dy = trans && trans.y || 0,
            font = attr.font,
            fontSize = +(font && font.match(/[0-9]+/)[0]) || 10,
            text = attr.text,
            measure;

        ctx.save();
        if (font) {
            ctx.font = font;
        }
        measure = ctx.measureText(text);
        ctx.restore();

        if (sprite.dirtyTransform) {
            me.applyTransformations(sprite);
        }
        matrix = sprite.matrix;

        x1 = x + dx;
        y1 = y + dy;
        x2 = x1 + (measure.width || fontSize);
        y2 = y1 + (measure.height || fontSize);

        if (isWithoutTransform) {
            return {
                x: x,
                y: y,
                width: (measure.width || fontSize),
                height: (measure.height || fontSize)
            };
        }

        x1t = matrix.x(x1, y1);
        y1t = matrix.y(x1, y1);

        x2t = matrix.x(x1, y2);
        y2t = matrix.y(x1, y2);

        x3t = matrix.x(x2, y1);
        y3t = matrix.y(x2, y1);

        x4t = matrix.x(x2, y2);
        y4t = matrix.y(x2, y2);

        x = Math.min(x1t, x2t, x3t, x4t);
        y = Math.min(y1t, y2t, y3t, y4t);

        width = Math.abs(x - Math.max(x1t, x2t, x3t, x4t));
        height = Math.abs(y - Math.max(y1t, y2t, y3t, y4t));

        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    },

    getRegion: function() {
        var canvas = this.canvas,
            xy = Ext.get(canvas).getXY();

        return {
            left: xy[0],
            top: xy[1],
            right: xy[0] + canvas.width,
            bottom: xy[1] + canvas.height
        };
    },

    //force will force the method to return a value.
    getShadowAttributesArray: function(force) {
        if (force) {
            return [{
                    "stroke-width": 6,
                    "stroke-opacity": 1,
                    stroke: 'rgba(200, 200, 200, 0.5)',
                    translate: {
                        x: 1.2,
                        y: 2
                    }
                },
                {
                    "stroke-width": 4,
                    "stroke-opacity": 1,
                    stroke: 'rgba(150, 150, 150, 0.5)',
                    translate: {
                        x: 0.9,
                        y: 1.5
                    }
                },
                {
                    "stroke-width": 2,
                    "stroke-opacity": 1,
                    stroke: 'rgba(100, 100, 100, 0.5)',
                    translate: {
                        x: 0.6,
                        y: 1
                    }
                }];
        } else {
            return [];
        }
    },

    //force will force the method to return a value.
    getShadowOptions: function(force) {
        return {
            shadowOffsetX: 2,
            //http://code.google.com/p/android/issues/detail?id=16025
            shadowOffsetY: Ext.is.Android ? -2 : 2,
            shadowBlur: 3,
            shadowColor: '#444'
        };
    },

    clear: function() {
        var me = this,
            canvas = me.canvas,
            ctx = me.ctx,
            width = canvas.width,
            height = canvas.height;

        ctx.clearRect(0, 0, width, height);
    }
});
