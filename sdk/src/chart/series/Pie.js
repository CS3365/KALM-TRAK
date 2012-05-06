/**
 * @class Ext.chart.series.Pie
 * @extends Ext.chart.series.Series
 *
 * Creates a Pie Chart. A Pie Chart is a useful visualization technique to display quantitative information for different
 * categories that also have a meaning as a whole.
 * As with all other series, the Pie Series must be appended in the *series* Chart array configuration. See the Chart
 * documentation for more information. A typical configuration object for the pie series could be:
 *
 * {@img Ext.chart.series.Pie/Ext.chart.series.Pie.png Ext.chart.series.Pie chart series}
 *
 *     var store = new Ext.data.JsonStore({
 *         fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5'],
 *         data: [
 *             {'name':'metric one', 'data1':10, 'data2':12, 'data3':14, 'data4':8, 'data5':13},
 *             {'name':'metric two', 'data1':7, 'data2':8, 'data3':16, 'data4':10, 'data5':3},
 *             {'name':'metric three', 'data1':5, 'data2':2, 'data3':14, 'data4':12, 'data5':7},
 *             {'name':'metric four', 'data1':2, 'data2':14, 'data3':6, 'data4':1, 'data5':23},
 *             {'name':'metric five', 'data1':27, 'data2':38, 'data3':36, 'data4':13, 'data5':33}
 *         ]
 *     });
 *
 *     new Ext.chart.Chart({
 *         renderTo: Ext.getBody(),
 *         width: 500,
 *         height: 300,
 *         animate: true,
 *         store: store,
 *         theme: 'Base:gradients',
 *         series: [{
 *             type: 'pie',
 *             angleField: 'data1',
 *             showInLegend: true,
 *             tips: {
 *               trackMouse: true,
 *               width: 140,
 *               height: 28,
 *               renderer: function(storeItem, item) {
 *                 //calculate and display percentage on hover
 *                 var total = 0;
 *                 store.each(function(rec) {
 *                     total += rec.get('data1');
 *                 });
 *                 this.setTitle(storeItem.get('name') + ': ' + Math.round(storeItem.get('data1') / total * 100) + '%');
 *               }
 *             },
 *             highlight: {
 *               segment: {
 *                 margin: 20
 *               }
 *             },
 *             label: {
 *                 field: 'name',
 *                 display: 'rotate',
 *                 contrast: true,
 *                 font: '18px Arial'
 *             }
 *         }]
 *     });
 *
 * In this configuration we set `pie` as the type for the series, set an object with specific style properties for highlighting options
 * (triggered when hovering elements). We also set true to `showInLegend` so all the pie slices can be represented by a legend item.
 * We set `data1` as the value of the field to determine the angle span for each pie slice. We also set a label configuration object
 * where we set the field name of the store field to be renderer as text for the label. The labels will also be displayed rotated.
 * We set `contrast` to `true` to flip the color of the label if it is to similar to the background color. Finally, we set the font family
 * and size through the `font` parameter.
 *
 * @xtype pie
 */
Ext.chart.series.Pie = Ext.extend(Ext.chart.series.Series, {

    type: 'pie',

    rad: Math.PI / 180,

    /**
     * @cfg {Number} rotation
     * The angle in degrees at which the first pie slice should start. Defaults to `0`.
     */
    rotation: 0,

    /**
     * @cfg {String} angleField
     * The store record field name to be used for the pie angles.
     * The values bound to this field name must be positive real numbers.
     * This parameter is required.
     */
    angleField: false,

    /**
     * @cfg {String} lengthField
     * The store record field name to be used for the pie slice lengths.
     * The values bound to this field name must be positive real numbers.
     * This parameter is optional.
     */
    lengthField: false,

    /**
     * @cfg {Boolean|Number} donut
     * Whether to set the pie chart as donut chart.
     * Default's false. Can be set to a particular percentage to set the radius
     * of the donut chart.
     */
    donut: false,

    /**
     * @cfg {Boolean} showInLegend
     * Whether to add the pie chart elements as legend items. Default's false.
     */
    showInLegend: false,

    /**
     * @cfg {Boolean} labelOverflowPadding
     * Extra distance value for which the labelOverflow listener is triggered. Default to 20.
     */
    labelOverflowPadding: 20,

    /**
     * @cfg {Array} colorSet
     * An array of color values which will be used, in order, as the pie slice fill colors.
     */

    /**
     * @cfg {Object} style
     * An object containing styles for overriding series styles from Theming.
     */

    constructor: function(config) {
        Ext.applyIf(config, {
            highlightCfg: {
                segment: {
                    margin: 20
                }
            }
        });

        Ext.chart.series.Pie.superclass.constructor.apply(this, arguments);
        var me = this,
            chart = me.chart,
            surface = me.getSurface(),
            shadow = chart.shadow, i, l;
        Ext.apply(me, config, {
            shadowAttributes: surface.getShadowAttributesArray(),
            shadowOptions: Ext.apply(surface.getShadowOptions(), shadow === true ? {} : (shadow || {}))
        });
        me.group = surface.getGroup(me.seriesId);
        if (shadow) {
            for (i = 0, l = me.shadowAttributes.length; i < l; i++) {
                me.shadowGroups.push(surface.getGroup(me.seriesId + '-shadows' + i));
            }
        }
        surface.customAttributes.segment = function(opt) {
            return me.getSegment(opt);
        };
        me.__excludes = me.__excludes || [];

        //add labelOverflows as managed events.
        me.addEvents('labelOverflow');

        //add default label overflow listener which hides the label.
        me.addListener('labelOverflow', me.onLabelOverflow);
    },

    //default configuration for label overflowing the pie slice shape.
    onLabelOverflow: function(label) {
        label.hide(true);
    },

    // @private returns an object with properties for a PieSlice.
    getSegment: function(opt) {
        var me = this,
            rad = me.rad,
            cos = Math.cos,
            sin = Math.sin,
            abs = Math.abs,
            x = me.centerX,
            y = me.centerY,
            x1 = 0, x2 = 0, x3 = 0, x4 = 0,
            y1 = 0, y2 = 0, y3 = 0, y4 = 0,
            delta = 1e-2,
            startAngle = opt.startAngle,
            endAngle = opt.endAngle,
            midAngle = (startAngle + endAngle) / 2 * rad,
            margin = opt.margin || 0,
            flag = abs(endAngle - startAngle) > 180,
            a1 = Math.min(startAngle, endAngle) * rad,
            a2 = Math.max(startAngle, endAngle) * rad,
            singleSlice = false,
            fullCircle = false;

        x += margin * cos(midAngle);
        y += margin * sin(midAngle);

        x1 = x + opt.startRho * cos(a1);
        y1 = y + opt.startRho * sin(a1);

        x2 = x + opt.endRho * cos(a1);
        y2 = y + opt.endRho * sin(a1);

        x3 = x + opt.startRho * cos(a2);
        y3 = y + opt.startRho * sin(a2);

        x4 = x + opt.endRho * cos(a2);
        y4 = y + opt.endRho * sin(a2);

        if (abs(x1 - x3) <= delta && abs(y1 - y3) <= delta) {
            singleSlice = true;
        }

        fullCircle = singleSlice && (abs(x2 - x4) <= delta && abs(y2 - y4) <= delta);

        if (startAngle === endAngle) {
            return {path: ''}
        }
        //Solves mysterious clipping bug with IE
        else if (fullCircle) {
            return {
                path: [
                ["M", x + opt.endRho, y - 1e-4],
                ["A", opt.endRho, opt.endRho, 0, 1, 0, x + opt.endRho, y],
                ["Z"]]
            };
        } else if (singleSlice) {
            return {
                path: [
                ["M", x1, y1],
                ["L", x2, y2],
                ["A", opt.endRho, opt.endRho, 0, +flag, 1, x4, y4],
                ["Z"]]
            };
        } else {
            return {
                path: [
                ["M", x1, y1],
                ["L", x2, y2],
                ["A", opt.endRho, opt.endRho, 0, +flag, 1, x4, y4],
                ["L", x4, y4],
                ["L", x3, y3],
                ["A", opt.startRho, opt.startRho, 0, +flag, 0, x1, y1],
                ["Z"]]
            };
        }
    },

    // @private utility function to calculate the middle point of a pie slice.
    calcMiddle: function(item) {
        var me = this,
            rad = me.rad,
            slice = item.slice,
            x = me.centerX,
            y = me.centerY,
            startAngle = slice.startAngle,
            endAngle = slice.endAngle,
            a1 = Math.min(startAngle, endAngle) * rad,
            a2 = Math.max(startAngle, endAngle) * rad,
            midAngle = -(a1 + (a2 - a1) / 2),
            xm = x + (item.endRho + item.startRho) / 2 * Math.cos(midAngle),
            ym = y - (item.endRho + item.startRho) / 2 * Math.sin(midAngle);

        item.middle = {
            x: xm,
            y: ym
        };
    },

    /**
     * Draws the series for the current chart.
     */
    drawSeries: function() {
        var me = this,
            store = me.chart.substore || me.chart.store,
            group = me.group,
            animate = me.chart.animate,
            field = me.angleField || me.field || me.xField,
            lenField = [].concat(me.lengthField),
            totalLenField = 0,
            chart = me.chart,
            surface = me.getSurface(),
            chartBBox = chart.chartBBox,
            enableShadows = chart.shadow,
            shadowGroups = me.shadowGroups,
            shadowAttributes = me.shadowAttributes,
            lnsh = shadowGroups.length,
            layers = lenField.length,
            rhoAcum = 0,
            donut = +me.donut,
            layerTotals = [],
            items = [],
            totalField = 0,
            maxLenField = 0,
            angle = me.rotation,
            seriesStyle = me.style,
            colorArrayStyle = me.colorArrayStyle,
            colorArrayLength = colorArrayStyle && colorArrayStyle.length || 0,
            rendererAttributes,
            shadowAttr,
            shadows,
            shadow,
            shindex,
            centerX,
            centerY,
            deltaRho,
            first = 0,
            slice,
            slices,
            sprite,
            value,
            item,
            lenValue,
            ln,
            i,
            j,
            endAngle,
            middleAngle,
            path,
            p,
            spriteOptions, bbox;

        if (me.fireEvent('beforedraw', me) === false) {
            return;
        }

        Ext.chart.series.Pie.superclass.drawSeries.call(this);

        me.setBBox();
        bbox = me.bbox;

        //override theme colors
        if (me.colorSet) {
            colorArrayStyle = me.colorSet;
            colorArrayLength = colorArrayStyle.length;
        }

        me.unHighlightItem();
        me.cleanHighlights();

        centerX = me.centerX = chartBBox.x + (chartBBox.width / 2);
        centerY = me.centerY = chartBBox.y + (chartBBox.height / 2);
        me.radius = Math.min(centerX - chartBBox.x, centerY - chartBBox.y);
        me.slices = slices = [];
        me.items = items = [];

        me.eachRecord(function(record, i) {
            if (me.isExcluded(i)) {
                //hidden series
                return;
            }
            totalField += +record.get(field);
            if (lenField[0]) {
                for (j = 0, totalLenField = 0; j < layers; j++) {
                    totalLenField += +record.get(lenField[j]);
                }
                layerTotals[i] = totalLenField;
                maxLenField = Math.max(maxLenField, totalLenField);
            }
        }, this);

        totalField = totalField || 1;
        me.eachRecord(function(record, i) {
            if (me.isExcluded(i)) {
                //hidden series
                return;
            }
            value = record.get(field);
            middleAngle = angle - 360 * value / totalField / 2;
            // TODO - Put up an empty circle
            if (isNaN(middleAngle)) {
                middleAngle = 360;
                value = 1;
                totalField = 1;
            }
            // First slice
            if (!i || first === 0) {
                angle = 360 - middleAngle;
                me.firstAngle = angle;
                middleAngle = angle - 360 * value / totalField / 2;
            }
            endAngle = angle - 360 * value / totalField;
            slice = {
                series: me,
                value: value,
                startAngle: angle,
                endAngle: endAngle,
                storeItem: record
            };
            if (lenField[0]) {
                lenValue = layerTotals[i];
                slice.rho = me.radius * (lenValue / maxLenField);
            } else {
                slice.rho = me.radius;
            }
            slices[i] = slice;
            angle = endAngle;
            first++;
        }, me);

        //do all shadows first.
        if (enableShadows) {
            for (i = 0, ln = slices.length; i < ln; i++) {
                if (me.isExcluded(i)) {
                    //hidden series
                    continue;
                }
                slice = slices[i];
                slice.shadowAttrs = [];
                for (j = 0, rhoAcum = 0, shadows = []; j < layers; j++) {
                    sprite = group.getAt(i * layers + j);
                    deltaRho = lenField[j] ? store.getAt(i).get(lenField[j]) / layerTotals[i] * slice.rho: slice.rho;
                    //set pie slice properties
                    rendererAttributes = {
                        segment: {
                            startAngle: slice.startAngle,
                            endAngle: slice.endAngle,
                            margin: 0,
                            rho: slice.rho,
                            startRho: rhoAcum + (deltaRho * donut / 100),
                            endRho: rhoAcum + deltaRho
                        },
                        hidden: !slice.value && (slice.startAngle % 360) == (slice.endAngle % 360)
                    };
                    //create shadows
                    for (shindex = 0, shadows = []; shindex < lnsh; shindex++) {
                        shadowAttr = shadowAttributes[shindex];
                        shadow = shadowGroups[shindex].getAt(i);
                        if (!shadow) {
                            shadow = me.getSurface().add(Ext.apply({}, {
                                type: 'path',
                                group: shadowGroups[shindex],
                                strokeLinejoin: "round"
                            }, rendererAttributes, shadowAttr));
                        }
                        if (animate) {
                            shadowAttr = me.renderer(shadow, store.getAt(i), Ext.apply({}, rendererAttributes, shadowAttr), i, store);
                            me.onAnimate(shadow, {
                                to: shadowAttr
                            });
                        } else {
                            shadowAttr = me.renderer(shadow, store.getAt(i), Ext.apply(shadowAttr, {
                                hidden: false
                            }), i, store);
                            shadow.setAttributes(shadowAttr, true);
                        }
                        shadows.push(shadow);
                    }
                    slice.shadowAttrs[j] = shadows;
                }
            }
        }
        //do pie slices after.
        for (i = 0, ln = slices.length; i < ln; i++) {
            if (me.isExcluded(i)) {
                //hidden series
                continue;
            }
            slice = slices[i];
            for (j = 0, rhoAcum = 0; j < layers; j++) {
                sprite = group.getAt(i * layers + j);
                deltaRho = lenField[j] ? store.getAt(i).get(lenField[j]) / layerTotals[i] * slice.rho: slice.rho;
                //set pie slice properties
                rendererAttributes = Ext.apply({
                    segment: {
                        startAngle: slice.startAngle,
                        endAngle: slice.endAngle,
                        margin: 0,
                        rho: slice.rho,
                        startRho: rhoAcum + (deltaRho * donut / 100),
                        endRho: rhoAcum + deltaRho
                    },
                    hidden: !slice.value && (slice.startAngle % 360) == (slice.endAngle % 360)
                }, Ext.apply(seriesStyle, colorArrayStyle && { fill: colorArrayStyle[(layers > 1? j : i) % colorArrayLength] } || {}));
                item = Ext.apply({},
                rendererAttributes.segment, {
                    slice: slice,
                    series: me,
                    storeItem: slice.storeItem,
                    index: i
                });
                me.calcMiddle(item);
                if (enableShadows) {
                    item.shadows = slice.shadowAttrs[j];
                }
                items[i] = item;
                // Create a new sprite if needed (no height)
                if (!sprite) {
                    spriteOptions = Ext.apply({
                        type: "path",
                        group: group,
                        middle: item.middle
                    }, Ext.apply(seriesStyle, colorArrayStyle && { fill: colorArrayStyle[(layers > 1? j : i) % colorArrayLength] } || {}));

                    if (enableShadows) {
                        Ext.apply(spriteOptions, me.shadowOptions);
                    }

                    sprite = surface.add(Ext.apply(spriteOptions, rendererAttributes));
                }
                slice.sprite = slice.sprite || [];
                item.sprite = sprite;
                slice.sprite.push(sprite);
                slice.point = [item.middle.x, item.middle.y];
                rendererAttributes = me.renderer(sprite, store.getAt(i), rendererAttributes, i, store);
                if (animate) {
                    sprite._to = rendererAttributes;
                    me.onAnimate(sprite, {
                        to: rendererAttributes
                    });
                } else {
                    sprite.setAttributes(rendererAttributes, true);
                }
                rhoAcum += deltaRho;
            }
        }

        // Hide unused bars
        ln = group.getCount();
        for (i = 0; i < ln; i++) {
            if (!slices[(i / layers) >> 0] && group.getAt(i)) {
                group.getAt(i).hide(true);
            }
        }
        if (enableShadows) {
            lnsh = shadowGroups.length;
            for (shindex = 0; shindex < ln; shindex++) {
                if (!slices[(shindex / layers) >> 0]) {
                    for (j = 0; j < lnsh; j++) {
                        if (shadowGroups[j].getAt(shindex)) {
                            shadowGroups[j].getAt(shindex).hide(true);
                        }
                    }
                }
            }
        }
        me.renderLabels();
        me.renderCallouts();

        me.fireEvent('draw', me);
    },

    // @private callback for when creating a label sprite.
    onCreateLabel: function(storeItem, item) {
        var me = this,
            group = me.labelsGroup,
            config = me.label,
            middle = item.middle,
            endLabelStyle = Ext.apply(me.labelStyle.style || {}, config || {});

        return me.getSurface().add(Ext.apply({
            'type': 'text',
            'text-anchor': 'middle',
            'group': group,
            'x': middle.x,
            'y': middle.y
        }, endLabelStyle));
    },

    // @private callback for when placing a label sprite.
    onPlaceLabel: function(label, storeItem, item, i, display, animate, index) {
        var me = this,
            chart = me.chart,
            resizing = chart.resizing,
            config = me.label,
            format = config.renderer,
            field = [].concat(config.field),
            centerX = me.centerX,
            centerY = me.centerY,
            middle = item.middle,
            opt = {
                x: middle.x,
                y: middle.y
            },
            x = middle.x - centerX,
            y = middle.y - centerY,
            from = {},
            rho = 1,
            theta = Math.atan2(y, x || 1),
            dg = theta * 180 / Math.PI,
            prevDg,
            sliceContainsLabel;

        function fixAngle(a) {
            if (a < 0) a += 360;
            return a % 360;
        }

        label.setAttributes({
            text: format(storeItem.get(field[index]))
        }, true);

        switch (display) {
        case 'outside':
            rho = Math.sqrt(x * x + y * y) * 2;
            //update positions
            opt.x = rho * Math.cos(theta) + centerX;
            opt.y = rho * Math.sin(theta) + centerY;
            break;

        case 'rotate':
            dg = fixAngle(dg);
            dg = (dg > 90 && dg < 270) ? dg + 180: dg;

            prevDg = label.attr.rotation.degrees;
            if (prevDg != null && Math.abs(prevDg - dg) > 180) {
                if (dg > prevDg) {
                    dg -= 360;
                } else {
                    dg += 360;
                }
                dg = dg % 360;
            } else {
                dg = fixAngle(dg);
            }
            //update rotation angle
            opt.rotate = {
                degrees: dg,
                x: opt.x,
                y: opt.y
            };
            break;

        default:
            break;
        }
        //ensure the object has zero translation
        opt.translate = {
            x: 0, y: 0
        };
        if (animate && !resizing && (display != 'rotate' || prevDg !== null)) {
            me.onAnimate(label, {
                to: opt
            });
        } else {
            label.setAttributes(opt, true);
        }
        label._from = from;


        sliceContainsLabel = me.sliceContainsLabel(item.slice, label);

        if (!sliceContainsLabel) {
            me.fireEvent('labelOverflow', label, item);
        }
    },

    onCreateCallout: function() {
        var me = this, ans;

        ans = Ext.chart.series.Pie.superclass.onCreateCallout.apply(this, arguments);

        ans.lines.setAttributes({
            path: ['M', me.centerX, me.centerY]
        });

        ans.box.setAttributes({
            x: me.centerX,
            y: me.centerY
        });

        ans.label.setAttributes({
            x: me.centerX,
            y: me.centerY
        });

        return ans;
    },

    // @private callback for when placing a callout sprite.
    onPlaceCallout: function(callout, storeItem, item) {
        var me = this,
            chart = me.chart,
            centerX = me.centerX,
            centerY = me.centerY,
            middle = item.middle,
            opt = {
                x: middle.x,
                y: middle.y
            },
            x = middle.x - centerX,
            y = middle.y - centerY,
            rho = 1,
            rhoCenter,
            theta = Math.atan2(y, x || 1),
            label = callout.label,
            box = callout.box,
            lines = callout.lines,
            lattr = lines.attr,
            bbox = label.getBBox(),
            offsetFromViz = lattr.offsetFromViz || 20,
            offsetToSide = lattr.offsetToSide || 10,
            offsetBox = box.attr.offsetBox || 10,
            p;
        //should be able to config this.
        rho = item.endRho + offsetFromViz;
        rhoCenter = (item.endRho + item.startRho) / 2 + (item.endRho - item.startRho) / 3;
        //update positions
        opt.x = rho * Math.cos(theta) + centerX;
        opt.y = rho * Math.sin(theta) + centerY;

        x = rhoCenter * Math.cos(theta);
        y = rhoCenter * Math.sin(theta);

        if (chart.animate) {
            //set the line from the middle of the pie to the box.
            me.onAnimate(callout.lines, {
              to: {
                    path: ["M", x + centerX, y + centerY, "L", opt.x, opt.y, "Z", "M", opt.x, opt.y, "l", x > 0 ? offsetToSide: -offsetToSide, 0, "z"]
                }
            });
            //set box position
            me.onAnimate(callout.box, {
                to: {
                    x: opt.x + (x > 0 ? offsetToSide: -(offsetToSide + bbox.width + 2 * offsetBox)),
                    y: opt.y + (y > 0 ? ( - bbox.height - offsetBox / 2) : ( - bbox.height - offsetBox / 2)),
                    width: bbox.width + 2 * offsetBox,
                    height: bbox.height + 2 * offsetBox
                }
            });
            //set text position
            me.onAnimate(callout.label, {
                to: {
                    x: opt.x + (x > 0 ? (offsetToSide + offsetBox) : -(offsetToSide + bbox.width + offsetBox)),
                    y: opt.y + (y > 0 ? -bbox.height / 4: -bbox.height / 4)
                }
            });
        } else {
            //set the line from the middle of the pie to the box.
            callout.lines.setAttributes({
                path: ["M", x + centerX, y + centerY, "L", opt.x, opt.y, "Z", "M", opt.x, opt.y, "l", x > 0 ? offsetToSide: -offsetToSide, 0, "z"]
            },
            true);
            //set box position
            callout.box.setAttributes({
                x: opt.x + (x > 0 ? offsetToSide: -(offsetToSide + bbox.width + 2 * offsetBox)),
                y: opt.y + (y > 0 ? ( - bbox.height - offsetBox / 2) : ( - bbox.height - offsetBox / 2)),
                width: bbox.width + 2 * offsetBox,
                height: bbox.height + 2 * offsetBox
            },
            true);
            //set text position
            callout.label.setAttributes({
                x: opt.x + (x > 0 ? (offsetToSide + offsetBox) : -(offsetToSide + bbox.width + offsetBox)),
                y: opt.y + (y > 0 ? -bbox.height / 4: -bbox.height / 4)
            },
            true);
        }
        for (p in callout) {
            callout[p].show(true);
        }
    },

    // @private handles sprite animation for the series.
    onAnimate: function(sprite, attr) {
        sprite.show();
        return Ext.chart.series.Pie.superclass.onAnimate.apply(this, arguments);
    },

    isItemInPoint: function(x, y, item) {
        var me = this,
            chartBBox = me.chart.chartBBox,
            cx = me.centerX - chartBBox.x,
            cy = me.centerY - chartBBox.y,
            abs = Math.abs,
            dx = abs(x - cx),
            dy = abs(y - cy),
            startAngle = item.startAngle,
            endAngle = item.endAngle,
            rho = Math.sqrt(dx * dx + dy * dy),
            angle = Math.atan2(y - cy, x - cx) / me.rad;

        while (angle < endAngle) {
            angle += 360;
        }
        while (angle > startAngle) {
            angle -= 360;
        }
        return (angle <= startAngle && angle > endAngle
                && rho >= item.startRho && rho <= item.endRho);
    },

    getItemForAngle: function(angle) {
        var me = this,
            items = me.items,
            i = items.length;
        while (i--) {
            if (items[i] && me.isAngleInItem(angle, items[i])) {
                return items[i];
            }
        }
    },

    isAngleInItem: function(angle, item) {
        var startAngle = item.startAngle,
            endAngle = item.endAngle;

        while (angle < endAngle) {
            angle += 360;
        }
        while (angle > startAngle) {
            angle -= 360;
        }
        return (angle <= startAngle && angle > endAngle);
    },

    sliceContainsLabel: function(slice, label) {
        var me = this,
            PI = Math.PI,
            startAngle = slice.startAngle,
            endAngle = slice.endAngle,
            diffAngle =  Math.abs(endAngle - startAngle) * PI / 180,
            bbox = label.getBBox(true), //isWithoutTransform == true
            dist = me.radius,
            height = bbox.height + (me.labelOverflowPadding || 0),
            angleHeight;

        if (diffAngle >= PI) {
            return true;
        }

        angleHeight = Math.abs(Math.tan(diffAngle / 2)) * dist * 2;

        return angleHeight >= height;
    },

    // @private hides all elements in the series.
    hideAll: function() {
        var i, l, shadow, shadows, sh, lsh, sprite;
        if (!isNaN(this._index)) {
            this.__excludes = this.__excludes || [];
            this.__excludes[this._index] = true;
            sprite = this.slices[this._index].sprite;
            for (sh = 0, lsh = sprite.length; sh < lsh; sh++) {
                sprite[sh].setAttributes({
                    hidden: true
                }, true);
            }
            if (this.slices[this._index].shadowAttrs) {
                for (i = 0, shadows = this.slices[this._index].shadowAttrs, l = shadows.length; i < l; i++) {
                    shadow = shadows[i];
                    for (sh = 0, lsh = shadow.length; sh < lsh; sh++) {
                        shadow[sh].setAttributes({
                            hidden: true
                        }, true);
                    }
                }
            }
            this.drawSeries();
        }
    },

    // @private shows all elements in the series.
    showAll: function() {
        var me = this,
            excludes = me.__excludes,
            index = me._index;
        if (!isNaN(index) && excludes && excludes[index]) {
            excludes[index] = false;
            me.drawSeries();
        }
    },

    /**
     * Highlight the specified item. If no item is provided the whole series will be highlighted.
     * @param item {Object} Info about the item; same format as returned by #getItemForPoint
     */
    highlightItem: function(item) {
        var me = this,
            rad = me.rad;
        item = item || this.items[this._index];
        if (!item || item.sprite && item.sprite._animating) {
            return;
        }

        Ext.chart.series.Pie.superclass.highlightItem.apply(this, [item]);

        if (me.highlight === false) {
            return;
        }
        if ('segment' in me.highlightCfg) {
            var highlightSegment = me.highlightCfg.segment,
                animate = me.chart.animate,
                attrs, i, shadows, shadow, ln, to, itemHighlightSegment, prop;
            //animate labels
            if (me.labelsGroup) {
                var group = me.labelsGroup,
                    label = group.getAt(item.index),
                    middle = (item.startAngle + item.endAngle) / 2 * rad,
                    r = highlightSegment.margin || 0,
                    x = r * Math.cos(middle),
                    y = r * Math.sin(middle);

                //TODO(nico): rounding to 1e-10
                //gives the right translation. Translation
                //was buggy for very small numbers. In this
                //case we're not looking to translate to very small
                //numbers but not to translate at all.
                if (Math.abs(x) < 1e-10) {
                    x = 0;
                }
                if (Math.abs(y) < 1e-10) {
                    y = 0;
                }

                if (animate) {
                    label.stopAnimation();
                    label.animate({
                        to: {
                            translate: {
                                x: x,
                                y: y
                            }
                        },
                        duration: me.highlightDuration
                    });
                }
                else {
                    label.setAttributes({
                        translate: {
                            x: x,
                            y: y
                        }
                    }, true);
                }
            }
            //animate shadows
            if (me.chart.shadow && item.shadows) {
                i = 0;
                shadows = item.shadows;
                ln = shadows.length;
                for (; i < ln; i++) {
                    shadow = shadows[i];
                    to = {};
                    itemHighlightSegment = item.sprite._from.segment;
                    for (prop in itemHighlightSegment) {
                        if (! (prop in highlightSegment)) {
                            to[prop] = itemHighlightSegment[prop];
                        }
                    }
                    attrs = {
                        segment: Ext.applyIf(to, me.highlightCfg.segment)
                    };
                    if (animate) {
                        shadow.stopAnimation();
                        shadow.animate({
                            to: attrs,
                            duration: me.highlightDuration
                        });
                    }
                    else {
                        shadow.setAttributes(attrs, true);
                    }
                }
            }
        }
    },

    /**
     * un-highlights the specified item. If no item is provided it will un-highlight the entire series.
     * @param item {Object} Info about the item; same format as returned by #getItemForPoint
     */
    unHighlightItem: function() {
        var me = this;
        if (me.highlight === false) {
            return;
        }

        if (('segment' in me.highlightCfg) && me.items) {
            var items = me.items,
                animate = me.chart.animate,
                shadowsEnabled = !!me.chart.shadow,
                group = me.labelsGroup,
                len = items.length,
                i = 0,
                j = 0,
                display = me.label.display,
                shadowLen, p, to, ihs, hs, sprite, shadows, shadow, item, label, attrs;

            for (; i < len; i++) {
                item = items[i];
                if (!item) {
                    continue;
                }
                sprite = item.sprite;
                if (sprite && sprite._highlighted) {
                    //animate labels
                    if (group) {
                        label = group.getAt(item.index);
                        attrs = Ext.apply({
                            translate: {
                                x: 0,
                                y: 0
                            }
                        },
                        display == 'rotate' ? {
                            rotate: {
                                x: label.attr.x,
                                y: label.attr.y,
                                degrees: label.attr.rotation.degrees
                            }
                        }: {});
                        if (animate) {
                            label.stopAnimation();
                            label.animate({
                                to: attrs,
                                duration: me.highlightDuration
                            });
                        }
                        else {
                            label.setAttributes(attrs, true);
                        }
                    }
                    if (shadowsEnabled) {
                        shadows = item.shadows;
                        shadowLen = shadows.length;
                        for (; j < shadowLen; j++) {
                            to = {};
                            ihs = item.sprite._to.segment;
                            hs = item.sprite._from.segment;
                            Ext.apply(to, hs);
                            for (p in ihs) {
                                if (! (p in hs)) {
                                    to[p] = ihs[p];
                                }
                            }
                            shadow = shadows[j];
                            if (animate) {
                                shadow.stopAnimation();
                                shadow.animate({
                                    to: {
                                        segment: to
                                    },
                                    duration: me.highlightDuration
                                });
                            }
                            else {
                                shadow.setAttributes({ segment: to }, true);
                            }
                        }
                    }
                }
            }
        }
        Ext.chart.series.Pie.superclass.unHighlightItem.apply(me, arguments);
    },

    getLegendLabels: function() {
        var me = this,
            labelField = me.label.field,
            labels = [];

        if (labelField) {
            me.eachRecord(function(rec) {
                labels.push(rec.get(labelField));
            });
        }

        return labels;
    },

    /**
     * Returns the color of the series (to be displayed as color for the series legend item).
     * @param item {Object} Info about the item; same format as returned by #getItemForPoint
     */
    getLegendColor: function(index) {
        var me = this,
            colorSet = me.colorSet,
            colorArrayStyle = me.colorArrayStyle;
        return me.getColorFromStyle(
            (colorSet && colorSet[index % colorSet.length]) || colorArrayStyle[index % colorArrayStyle.length]
        );
    },

    /**
     * Iterate over each of the displayed records for this pie series, taking into account
     * records that have been combined into one by the user.
     * @param {Function} fn The function to execute for each record.
     * @param {Object} scope Scope for the fn.
     */
    eachRecord: function(fn, scope) {
        var me = this,
            store = me.chart.substore || me.chart.store,
            combinations = me.combinations,
            labelField = me.label.field,
            angleField = me.angleField || me.field || me.xField,
            lengthFields = [].concat(me.lengthField),
            records;

        // If we have combined records, take a snapshot of the store data and apply the combinations
        if (combinations) {
            records = store.data.clone();
            Ext.each(combinations, function(combo) {
                var record1 = records.getAt(combo[0]),
                    record2 = records.getAt(combo[1]),
                    comboData = {};

                // Build a combination data model object from the two target records
                comboData[labelField] = record1.get(labelField) + ' & ' + record2.get(labelField);
                comboData[angleField] = +record1.get(angleField) + record2.get(angleField);
                if (lengthFields[0]) {
                    Ext.each(lengthFields, function(lengthField) {
                        comboData[lengthField] = +record1.get(lengthField) + record2.get(lengthField);
                    });
                }

                // Insert the new combination record in place of the second original record, and remove both originals
                records.insert(combo[1], Ext.ModelMgr.create(comboData, store.model));
                records.remove(record1);
                records.remove(record2);
            });
            records.each(fn, scope);
        } else {
            // No combinations - just iterate the store directly
            store.each(fn, scope);
        }
    },

    getRecordCount: function() {
        var me = this,
            combinations = me.combinations;
        return Ext.chart.series.Pie.superclass.getRecordCount.call(me) - (combinations ? combinations.length : 0);
    },

    /**
     * @private update the position/size of the series surface. For pie series we set it to the
     * full chart size so it doesn't get clipped when slices slide out.
     */
    updateSurfaceBox: function() {
        var me = this,
            surface = me.getSurface(),
            overlaySurface = me.getOverlaySurface(),
            chart = me.chart,
            width = chart.curWidth,
            height = chart.curHeight;

        surface.el.setTopLeft(0, 0);
        surface.setSize(width, height);

        overlaySurface.el.setTopLeft(0, 0);
        overlaySurface.setSize(width, height);
    },

    reset: function() {
        this.rotation = 0;
        Ext.chart.series.Pie.superclass.reset.call(this);
    }

});

