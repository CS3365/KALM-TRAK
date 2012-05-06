/**
 * @class Ext.chart.axis.Radial
 * @extends Ext.chart.axis.Abstract
 *
 * Radial Axis is the axis to be used with a Radar Series. The Radial axis
 * is a circular display of numerical data by steps, with the number of circles
 * equivalent to the defined number of `steps`. Given the maximum data value,
 * the axis will compute step values depending on the number of defined `steps`.
 *
 * A possible configuration for this axis would look like:
 *
 *  axes: [{
 *      steps: 5,
 *      type: 'Radial',
 *      position: 'radial',
 *      label: {
 *          display: 'none'
 *      }
 *  }]
 */
Ext.chart.axis.Radial = Ext.extend(Ext.chart.axis.Abstract, {

    /**
     * @cfg {Number} maximum (optional) the maximum value to be displayed in the axis.
     */

    /**
     * @cfg {Number} steps (required) the number of steps to add to the radial axis.
     */

    position: 'radial',
    rotation: 0,

    drawAxis: function(init) {
        var me = this,
            chart = me.chart,
            surface = me.getSurface(),
            bbox = chart.chartBBox,
            store = chart.store,
            l = store.getCount(),
            centerX = bbox.x + (bbox.width / 2),
            centerY = bbox.y + (bbox.height / 2),
            math = Math,
            mmax = math.max,
            rho = math.min(bbox.width, bbox.height) /2,
            sprites = [], sprite,
            steps = me.steps,
            rotation = -me.rotation,
            rad = Ext.draw.Draw.rad,
            cos = math.cos,
            sin = math.sin,
            i, angle;

        if (!l) {
            surface.items.hide(true);
            return;
        }

        me.updateSurfaceBox();

        me.centerX = centerX;
        me.centerY = centerY;

        if (!me.sprites) {
            //draw circles
            for (i = 1; i <= steps; i++) {
                sprite = surface.add(Ext.apply(me.style || {}, {
                    type: 'circle',
                    x: centerX,
                    y: centerY,
                    'stroke-width': 1.5,
                    radius: mmax(rho * i / steps, 0),
                    stroke: '#ccc'
                }));
                sprite.setAttributes({
                    hidden: false
                }, true);
                sprites.push(sprite);
            }
            //draw lines
            store.each(function(rec, i) {
                angle = rad(rotation + i / l * 360);
                sprite = surface.add(Ext.apply(me.style || {}, {
                    type: 'path',
                    path: ['M', centerX, centerY, 'L', centerX + rho * cos(angle), centerY + rho * sin(angle), 'Z']
                }));
                sprite.setAttributes({
                    hidden: false
                }, true);
                sprites.push(sprite);
            });
        } else {
            sprites = me.sprites;
            //draw circles
            for (i = 0; i < steps; i++) {
                sprites[i].setAttributes({
                    hidden: false,
                    x: centerX,
                    y: centerY,
                    radius: mmax(rho * (i + 1) / steps, 0)
                }, true);
            }
            //draw lines
            store.each(function(rec, j) {
                angle = rad(rotation + j / l * 360);
                sprites[i + j].setAttributes(Ext.apply(me.style || {}, {
                    hidden: false,
                    path: ['M', centerX, centerY, 'L', centerX + rho * cos(angle), centerY + rho * sin(angle), 'Z']
                }), true);
            });
        }
        me.sprites = sprites;

        me.drawLabel();
    },

    drawLabel: function() {
        var me = this,
            chart = me.chart,
            surface = me.getSurface(),
            bbox = chart.chartBBox,
            store = chart.store,
            centerX = me.centerX,
            centerY = me.centerY,
            rho = Math.min(bbox.width, bbox.height) /2,
            max = Math.max, round = Math.round,
            labelArray = [], label,
            fields = [], nfields,
            categories = [], xField,
            aggregate = !me.maximum,
            maxValue = me.maximum || 0,
            steps = me.steps, i = 0, j, dx, dy,
            rotation = -me.rotation,
            rad = Ext.draw.Draw.rad,
            cos = Math.cos, sin = Math.sin,
            display = me.label.display,
            draw = display !== 'none',
            labelGroup = me.labelGroup,
            labelStyle = me.labelStyle.style,
            categoriesStyle = Ext.apply({}, labelStyle),
            margin = 10,
            angle;

        if (!draw) {
            return;
        }

        //get all rendered fields
        chart.series.each(function(series) {
            fields.push(series.yField);
            xField = series.xField;
        });

        //get maxValue to interpolate
        store.each(function(record, i) {
            if (aggregate) {
                for (i = 0, nfields = fields.length; i < nfields; i++) {
                    maxValue = max(+record.get(fields[i]), maxValue);
                }
            }
            categories.push(record.get(xField));
        });
        if (!me.labelArray) {
            if (display != 'categories') {
                //draw scale
                for (i = 1; i <= steps; i++) {
                    label = surface.add({
                        group: labelGroup,
                        type: 'text',
                        text: round(i / steps * maxValue),
                        x: centerX,
                        y: centerY - rho * i / steps
                    });
                    if (labelStyle) {
                        label.setAttributes(labelStyle, true);
                    }
                    labelArray.push(label);
                }
            }
            if (display != 'scale') {
                //TODO(nico): ignore translate property since positioning is radial.
                delete categoriesStyle.translate;
                //draw text
                for (j = 0, steps = categories.length; j < steps; j++) {
                    angle = rad(rotation + j / steps * 360);
                    dx = cos(angle) * (rho + margin);
                    dy = sin(angle) * (rho + margin);
                    label = surface.add({
                        group: labelGroup,
                        type: 'text',
                        text: categories[j],
                        x: centerX + dx,
                        y: centerY + dy,
                        'text-anchor': dx * dx <= 0.001? 'middle' : (dx < 0? 'end' : 'start')
                    });
                    if (labelStyle) {
                        label.setAttributes(categoriesStyle, true);
                    }
                    labelArray.push(label);
                }
            }
        }
        else {
            labelArray = me.labelArray;
            if (display != 'categories') {
                //draw values
                for (i = 0; i < steps; i++) {
                    labelArray[i].setAttributes({
                        text: round((i + 1) / steps * maxValue),
                        x: centerX,
                        y: centerY - rho * (i + 1) / steps,
                        hidden: false
                    }, true);
                }
            }
            if (display != 'scale') {
                //draw text
                for (j = 0, steps = categories.length; j < steps; j++) {
                    angle = rad(rotation + j / steps * 360);
                    dx = cos(angle) * (rho + margin);
                    dy = sin(angle) * (rho + margin);
                    if (labelArray[i + j]) {
                        labelArray[i + j].setAttributes({
                            type: 'text',
                            text: categories[j],
                            x: centerX + dx,
                            y: centerY + dy,
                            'text-anchor': dx * dx <= 0.001? 'middle' : (dx < 0? 'end' : 'start'),
                            hidden: false
                        }, true);
                    }
                }
            }
        }
        me.labelArray = labelArray;
    },

    getSurface: function() {
        return this.chart.getSurface('main');
    },

    reset: function() {
        this.rotation = 0;
        Ext.chart.axis.Radial.superclass.reset.call(this);
    }

});
