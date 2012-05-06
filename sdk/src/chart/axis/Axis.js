/**
 * @class Ext.chart.axis.Axis
 * @extends Ext.chart.axis.Abstract
 *
 * Defines axis for charts. The axis position, type, style can be configured.
 * The axes are defined in an axes array of configuration objects where the type,
 * field, grid and other configuration options can be set. To know more about how
 * to create a Chart please check the Chart class documentation. Here's an example for the axes part:
 * An example of axis for a series (in this case for an area chart that has multiple layers of yFields) could be:
 *
 *     axes: [{
 *         type: 'Numeric',
 *         grid: true,
 *         position: 'left',
 *         fields: ['data1', 'data2', 'data3'],
 *         title: 'Number of Hits',
 *         grid: {
 *             odd: {
 *                 opacity: 1,
 *                 fill: '#ddd',
 *                 stroke: '#bbb',
 *                 'stroke-width': 1
 *             }
 *         },
 *         minimum: 0
 *     }, {
 *         type: 'Category',
 *         position: 'bottom',
 *         fields: ['name'],
 *         title: 'Month of the Year',
 *         grid: true,
 *         label: {
 *             rotate: {
 *                 degrees: 315
 *             }
 *         }
 *     }]
 *
 * In this case we use a `Numeric` axis for displaying the values of the Area series and a `Category` axis for displaying the names of
 * the store elements. The numeric axis is placed on the left of the screen, while the category axis is placed at the bottom of the chart.
 * Both the category and numeric axes have `grid` set, which means that horizontal and vertical lines will cover the chart background. In the
 * category axis the labels will be rotated so they can fit the space better.
 */
Ext.chart.axis.Axis = Ext.extend(Ext.chart.axis.Abstract, {

    /**
     * @cfg {Number} majorTickSteps
     * If `minimum` and `maximum` are specified it forces the number of major ticks to the specified value.
     */

    /**
     * @cfg {Number} minorTickSteps
     * The number of small ticks between two major ticks. Default is zero.
     */

    /**
     * @cfg {Array} fields
     * An array containing the names of record fields which should be mapped along the axis
     */

    /**
     * @cfg {String} title
     * The title for the Axis
     */

    /**
     * @cfg {Object} label
     * The label configuration object for the Axis
     */

    /**
     * @cfg {Number} dashSize
     * The size of the dash marker. Default's 3.
     */
    dashSize: 3,

    /**
     * @cfg {String} position
     * Where to set the axis. Available options are `left`, `bottom`, `right`, `top`. Default's `bottom`.
     */
    position: 'bottom',

    /**
     * Offset axis position. Default's 0.
     * @property length
     * @type {Number}
     */
    length: 0,

    /**
     * Offset axis width. Default's 0.
     * @property width
     * @type {Number}
     */
    width: 0,

    majorTickSteps: false,

    // @private
    applyData: Ext.emptyFn,

    /**
     * @private If true, label values will be calculated during each axis draw; useful for numeric axes.
     */
    calcLabels: false,

    /**
     * @private Size of the buffer area on either side of the viewport to provide seamless zoom/pan
     * transforms. Expressed as a multiple of the viewport length, e.g. 1 will make the buffer on
     * each side equal to the length of the visible axis viewport.
     */
    overflowBuffer: 1.25,

    renderFrame: function() {
        var me = this,
            surface = me.getSurface(),
            labelSurface = me.getLabelSurface();
        surface.renderFrame();
        if (labelSurface !== surface) {
            labelSurface.renderFrame();
        }
    },

    // @private returns whether this axis is on the left or right side
    isSide: function() {
        var pos = this.position;
        return pos === 'left' || pos === 'right';
    },

    /**
     * @private update the position, size, and clipping of the axis surface to match the
     * current bbox and zoom/pan properties.
     */
    updateSurfaceBox: function() {
        var me = this,
            isSide = me.isSide(),
            length = me.length,
            viewLength = length + 1, //add 1px to viewable area so the last tick lines up with main line of adjacent axis
            width = me.width,
            surface = me.getSurface();

        surface.el.setTopLeft(me.y, me.x);
        surface.setSize(isSide ? width : viewLength, isSide ? viewLength : width);
    },

    // @private creates a structure with start, end and step points.
    calcEnds: function() {
        var me = this,
            boundSeries = me.getBoundSeries(),
            min = isNaN(me.minimum) ? Infinity : me.minimum,
            max = isNaN(me.maximum) ? -Infinity : me.maximum,
            zoom = me['zoom' + (me.isSide() ? 'Y' : 'X')],
            endsLocked = me.chart.endsLocked,
            outfrom, outto, out;

        if (endsLocked) {
            min = me.prevFrom;
            max = me.prevTo;
        } else {
            // For each series bound to this axis, ask the series for its min/max values
            // and use them to find the overall min/max.
            boundSeries.each(function(series) {
                var minMax = me.isBoundToField(series.xField) ? series.getMinMaxXValues() : series.getMinMaxYValues();
                if (minMax[0] < min) {
                    min = minMax[0];
                }
                if (minMax[1] > max) {
                    max = minMax[1];
                }
            });
            if (!isFinite(max)) {
                max = me.prevMax || 0;
            }
            if (!isFinite(min)) {
                min = me.prevMin || 0;
            }

            // If the max isn't on the floor, we want to ceil the max for a better endpoint.
            if (min != max && (max != (Math.floor(max)))) {
                max = Math.ceil(max);
            }
        }

        // if minimum and maximum are the same in a numeric axis then change the minimum bound.
        if (me.type == 'Numeric' && min === max) {
            if (max !== 0) {
                min = max / 2;
            } else {
                min = -1;
            }
        }

        out = Ext.draw.Draw.snapEnds(min, max, (me.majorTickSteps !== false ?  (me.majorTickSteps +1) : me.steps) * zoom, endsLocked);
        outfrom = out.from;
        outto = out.to;

        if (!endsLocked) {
            if (!isNaN(me.maximum)) {
                //TODO(nico) users are responsible for their own minimum/maximum values set.
                //Clipping should be added to remove lines in the chart which are below the axis.
                out.to = me.maximum;
            }
            if (!isNaN(me.minimum)) {
                //TODO(nico) users are responsible for their own minimum/maximum values set.
                //Clipping should be added to remove lines in the chart which are below the axis.
                out.from = me.minimum;
            }
        }

        //Adjust after adjusting minimum and maximum
        out.step = (out.to - out.from) / (outto - outfrom) * out.step;

        if (me.adjustMaximumByMajorUnit) {
            out.to += out.step;
        }
        if (me.adjustMinimumByMajorUnit) {
            out.from -= out.step;
        }
        me.prevTo = out.to;
        me.prevFrom = out.from;
        me.prevMin = min == max? 0 : min;
        me.prevMax = max;
        return out;
    },

    /**
     * Renders the axis into the screen and updates it's position.
     */
    drawAxis: function (init) {
        var me = this,
            zoomX = me.zoomX,
            zoomY = me.zoomY,
            x = me.startX * zoomX,
            y = me.startY * zoomY,
            gutterX = me.chart.maxGutter[0] * zoomX,
            gutterY = me.chart.maxGutter[1] * zoomY,
            dashSize = me.dashSize,
            subDashesX = me.minorTickSteps || 0,
            subDashesY = me.minorTickSteps || 0,
            isSide = me.isSide(),
            viewLength = me.length,
            bufferLength = viewLength * me.overflowBuffer,
            totalLength = viewLength * (isSide ? zoomY : zoomX),
            position = me.position,
            inflections = [],
            calcLabels = me.calcLabels,
            stepCalcs = me.applyData(),
            step = stepCalcs.step,
            from = stepCalcs.from,
            to = stepCalcs.to,
            math = Math,
            mfloor = math.floor,
            mmax = math.max,
            mmin = math.min,
            mround = math.round,
            trueLength, currentX, currentY, startX, startY, path, dashesX, dashesY, delta, skipTicks, i;

        me.updateSurfaceBox();

        //If no steps are specified
        //then don't draw the axis. This generally happens
        //when an empty store.
        if (me.hidden || me.chart.store.getCount() < 1 || stepCalcs.steps <= 0) {
            me.getSurface().items.hide(true);
            if (me.displaySprite) {
                me.displaySprite.hide(true);
            }
            return;
        }

        me.from = stepCalcs.from;
        me.to = stepCalcs.to;
        if (isSide) {
            currentX = mfloor(x) + 0.5;
            path = ["M", currentX, y, "l", 0, -totalLength];
            trueLength = totalLength - (gutterY * 2);
        }
        else {
            currentY = mfloor(y) + 0.5;
            path = ["M", x, currentY, "l", totalLength, 0];
            trueLength = totalLength - (gutterX * 2);
        }

        delta = trueLength * step / (to - from);
        skipTicks = me.skipTicks = mfloor(mmax(0, (isSide ? totalLength + me.panY - viewLength - bufferLength : -me.panX - bufferLength)) / delta);
        dashesX = mmax(subDashesX +1, 0);
        dashesY = mmax(subDashesY +1, 0);
        if (calcLabels) {
            me.labels = [stepCalcs.from + skipTicks * step];
        }
        if (isSide) {
            currentY = startY = y - gutterY - delta * skipTicks;
            currentX = x - ((position == 'left') * dashSize * 2);
            while (currentY >= startY - mmin(trueLength, viewLength + bufferLength * 2)) {
                path.push("M", currentX, mfloor(currentY) + 0.5, "l", dashSize * 2 + 1, 0);
                if (currentY != startY) {
                    for (i = 1; i < dashesY; i++) {
                        path.push("M", currentX + dashSize, mfloor(currentY + delta * i / dashesY) + 0.5, "l", dashSize + 1, 0);
                    }
                }
                inflections.push([ mfloor(x), mfloor(currentY) ]);
                currentY -= delta;
                if (calcLabels) {
                    // Cut everything that is after tenth digit after floating point. This is to get rid of
                    // rounding errors, i.e. 12.00000000000121212.
                    me.labels.push(+(me.labels[me.labels.length - 1] + step).toFixed(10));
                }
                if (delta === 0) {
                    break;
                }
            }
            if (mround(currentY + delta - (y - gutterY - trueLength))) {
                path.push("M", currentX, mfloor(y - totalLength + gutterY) + 0.5, "l", dashSize * 2 + 1, 0);
                for (i = 1; i < dashesY; i++) {
                    path.push("M", currentX + dashSize, mfloor(y - totalLength + gutterY + delta * i / dashesY) + 0.5, "l", dashSize + 1, 0);
                }
                inflections.push([ mfloor(x), mfloor(currentY) ]);
                if (calcLabels) {
                    // Cut everything that is after tenth digit after floating point. This is to get rid of
                    // rounding errors, i.e. 12.00000000000121212.
                    me.labels.push(+(me.labels[me.labels.length - 1] + step).toFixed(10));
                }
            }
        } else {
            currentX = startX = x + gutterX + delta * skipTicks;
            currentY = y - ((position == 'top') * dashSize * 2);
            while (currentX <= startX + mmin(trueLength, viewLength + bufferLength * 2)) {
                path.push("M", mfloor(currentX) + 0.5, currentY, "l", 0, dashSize * 2 + 1);
                if (currentX != startX) {
                    for (i = 1; i < dashesX; i++) {
                        path.push("M", mfloor(currentX - delta * i / dashesX) + 0.5, currentY, "l", 0, dashSize + 1);
                    }
                }
                inflections.push([ mfloor(currentX), mfloor(y) ]);
                currentX += delta;
                if (calcLabels) {
                    // Cut everything that is after tenth digit after floating point. This is to get rid of
                    // rounding errors, i.e. 12.00000000000121212.
                    me.labels.push(+(me.labels[me.labels.length - 1] + step).toFixed(10));
                }
                if (delta === 0) {
                    break;
                }
            }
            if (mround(currentX - delta - (x + gutterX + trueLength))) {
                path.push("M", mfloor(x + totalLength - gutterX) + 0.5, currentY, "l", 0, dashSize * 2 + 1);
                for (i = 1; i < dashesX; i++) {
                    path.push("M", mfloor(x + totalLength - gutterX - delta * i / dashesX) + 0.5, currentY, "l", 0, dashSize + 1);
                }
                inflections.push([mfloor(currentX), mfloor(y) ]);
                if (calcLabels) {
                    // Cut everything that is after tenth digit after floating point. This is to get rid of
                    // rounding errors, i.e. 12.00000000000121212.
                    me.labels.push(+(me.labels[me.labels.length - 1] + step).toFixed(10));
                }
            }
        }
        if (!me.axis) {
            me.axis = me.getSurface().add(Ext.apply({
                type: 'path',
                path: path
            }, me.style));
        }
        me.axis.setAttributes({
            path: path,
            hidden: false
        }, true);
        me.inflections = inflections;
        if (!init) {
            //if grids have been styled in some way
            if ( me.grid ||
                 me.gridStyle.style ||
                 me.gridStyle.oddStyle.style ||
                 me.gridStyle.evenStyle.style ) {
              me.drawGrid();
            }
        }
        me.axisBBox = me.axis.getBBox();
        me.drawLabel();
    },

    /**
     * Renders an horizontal and/or vertical grid into the Surface.
     */
    drawGrid: function() {
        var me = this,
            surface = me.getSurface(),
            grid = me.gridStyle.style || me.grid,
            odd = me.gridStyle.oddStyle.style || grid.odd,
            even = me.gridStyle.evenStyle.style || grid.even,
            inflections = me.inflections,
            ln = inflections.length - ((odd || even)? 0 : 1),
            position = me.position,
            gutter = me.chart.maxGutter,
            width = me.width - 2,
            point, prevPoint,
            i = 1,
            isSide = me.isSide(),
            path = [], styles, lineWidth, dlineWidth,
            oddPath = [], evenPath = [];

        if ((gutter[1] !== 0 && isSide) ||
            (gutter[0] !== 0 && !isSide)) {
            i = 0;
            ln++;
        }
        for (; i < ln; i++) {
            point = inflections[i];
            prevPoint = inflections[i - 1];
            if (odd || even) {
                path = (i % 2)? oddPath : evenPath;
                styles = ((i % 2)? odd : even) || {};
                lineWidth = (styles.lineWidth || styles['stroke-width'] || 0) / 2;
                dlineWidth = 2 * lineWidth;
                if (position == 'left') {
                    path.push("M", prevPoint[0] + 1 + lineWidth, prevPoint[1] + 0.5 - lineWidth,
                              "L", prevPoint[0] + 1 + width - lineWidth, prevPoint[1] + 0.5 - lineWidth,
                              "L", point[0] + 1 + width - lineWidth, point[1] + 0.5 + lineWidth,
                              "L", point[0] + 1 + lineWidth, point[1] + 0.5 + lineWidth, "Z");
                }
                else if (position == 'right') {
                    path.push("M", prevPoint[0] - lineWidth, prevPoint[1] + 0.5 - lineWidth,
                              "L", prevPoint[0] - width + lineWidth, prevPoint[1] + 0.5 - lineWidth,
                              "L", point[0] - width + lineWidth, point[1] + 0.5 + lineWidth,
                              "L", point[0] - lineWidth, point[1] + 0.5 + lineWidth, "Z");
                }
                else if (position == 'top') {
                    path.push("M", prevPoint[0] + 0.5 + lineWidth, prevPoint[1] + 1 + lineWidth,
                              "L", prevPoint[0] + 0.5 + lineWidth, prevPoint[1] + 1 + width - lineWidth,
                              "L", point[0] + 0.5 - lineWidth, point[1] + 1 + width - lineWidth,
                              "L", point[0] + 0.5 - lineWidth, point[1] + 1 + lineWidth, "Z");
                }
                else {
                    path.push("M", prevPoint[0] + 0.5 + lineWidth, prevPoint[1] - lineWidth,
                            "L", prevPoint[0] + 0.5 + lineWidth, prevPoint[1] - width + lineWidth,
                            "L", point[0] + 0.5 - lineWidth, point[1] - width + lineWidth,
                            "L", point[0] + 0.5 - lineWidth, point[1] - lineWidth, "Z");
                }
            } else {
                if (position == 'left') {
                    path = path.concat(["M", point[0] + 0.5, point[1] + 0.5, "l", width, 0]);
                }
                else if (position == 'right') {
                    path = path.concat(["M", point[0] - 0.5, point[1] + 0.5, "l", -width, 0]);
                }
                else if (position == 'top') {
                    path = path.concat(["M", point[0] + 0.5, point[1] + 0.5, "l", 0, width]);
                }
                else {
                    path = path.concat(["M", point[0] + 0.5, point[1] - 0.5, "l", 0, -width]);
                }
            }
        }
        if (odd || even) {
            if (oddPath.length) {
                if (!me.gridOdd && oddPath.length) {
                    me.gridOdd = surface.add({
                        type: 'path',
                        path: oddPath
                    });
                }
                me.gridOdd.setAttributes(Ext.apply({
                    path: oddPath,
                    hidden: false
                }, odd || {}), true);
            }
            if (evenPath.length) {
                if (!me.gridEven) {
                    me.gridEven = surface.add({
                        type: 'path',
                        path: evenPath
                    });
                }
                me.gridEven.setAttributes(Ext.apply({
                    path: evenPath,
                    hidden: false
                }, even || {}), true);
            }
        }
        else {
            if (path.length) {
                if (!me.gridLines) {
                    me.gridLines = me.getSurface().add({
                        type: 'path',
                        path: path,
                        "stroke-width": me.lineWidth || 1,
                        stroke: me.gridColor || '#ccc'
                    });
                }
                me.gridLines.setAttributes({
                    hidden: false,
                    path: path
                }, true);
            }
            else if (me.gridLines) {
                me.gridLines.hide(true);
            }
        }
    },

    isPannable: function() {
        var me = this,
            length = me.length,
            isSide = me.isSide(),
            math = Math,
            ceil = math.ceil,
            floor = math.floor,
            matrix = me.getTransformMatrix();
        return matrix && (
            (isSide ? ceil(matrix.y(0, 0)) < 0 : floor(matrix.x(length, 0)) > length) ||
            (isSide ? floor(matrix.y(0, length)) > length : ceil(matrix.x(0, 0)) < 0)
        );
    },

    //@private
    getOrCreateLabel: function(i, text) {
        var me = this,
            labelGroup = me.labelGroup,
            textLabel = labelGroup.getAt(i),
            surface,
            labelStyle = me.labelStyle.style;
        if (textLabel) {
            if (text != textLabel.attr.text) {
                textLabel.setAttributes(Ext.apply({
                    text: text
                }, labelStyle), true);
                textLabel._bbox = textLabel.getBBox();
            }
        }
        else {
            surface = me.getLabelSurface();
            textLabel = surface.add(Ext.apply({
                group: labelGroup,
                type: 'text',
                x: 0,
                y: 0,
                text: text
            }, labelStyle));
            surface.renderItem(textLabel);
            textLabel._bbox = textLabel.getBBox();
        }
        //get untransformed bounding box
        if (labelStyle.rotation) {
            textLabel.setAttributes({
                rotation: {
                    degrees: 0
                }
            }, true);
            textLabel._ubbox = textLabel.getBBox();
            textLabel.setAttributes(labelStyle, true);
        } else {
            textLabel._ubbox = textLabel._bbox;
        }
        return textLabel;
    },

    rect2pointArray: function(sprite) {
        var surface = this.getSurface(),
            rect = surface.getBBox(sprite, true),
            p1 = [rect.x, rect.y],
            p1p = p1.slice(),
            p2 = [rect.x + rect.width, rect.y],
            p2p = p2.slice(),
            p3 = [rect.x + rect.width, rect.y + rect.height],
            p3p = p3.slice(),
            p4 = [rect.x, rect.y + rect.height],
            p4p = p4.slice(),
            matrix = sprite.matrix;
        //transform the points
        p1[0] = matrix.x.apply(matrix, p1p);
        p1[1] = matrix.y.apply(matrix, p1p);

        p2[0] = matrix.x.apply(matrix, p2p);
        p2[1] = matrix.y.apply(matrix, p2p);

        p3[0] = matrix.x.apply(matrix, p3p);
        p3[1] = matrix.y.apply(matrix, p3p);

        p4[0] = matrix.x.apply(matrix, p4p);
        p4[1] = matrix.y.apply(matrix, p4p);
        return [p1, p2, p3, p4];
    },

    intersect: function(l1, l2) {
        var r1 = this.rect2pointArray(l1),
            r2 = this.rect2pointArray(l2);
        return !!Ext.draw.Draw.intersect(r1, r2).length;
    },

    drawHorizontalLabels: function() {
        var me = this,
            labelConf = me.labelStyle.style,
            renderer = labelConf.renderer || function(v) {
                return v;
            },
            math = Math,
            floor = math.floor,
            max = math.max,
            axes = me.chart.axes,
            position = me.position,
            inflections = me.inflections,
            ln = inflections.length,
            labels = me.labels,
            skipTicks = me.skipTicks,
            maxHeight = 0,
            ratio,
            bbox, point, prevLabel,
            textLabel, text,
            last, x, y, i, firstLabel;

        if (!me.calcLabels && skipTicks) {
            labels = labels.slice(skipTicks);
            ln -= skipTicks;
        }

        last = ln - 1;
        //get a reference to the first text label dimensions
        point = inflections[0];
        firstLabel = me.getOrCreateLabel(0, renderer(labels[0]));
        ratio = math.abs(math.sin(labelConf.rotate && (labelConf.rotate.degrees * math.PI / 180) || 0)) >> 0;

        for (i = 0; i < ln; i++) {
            point = inflections[i];
            text = renderer(labels[i]);
            textLabel = me.getOrCreateLabel(i, text);
            bbox = textLabel._bbox;
            maxHeight = max(maxHeight, bbox.height + me.dashSize + (labelConf.padding || 0));
            x = floor(point[0] - (ratio? bbox.height : bbox.width) / 2);
            if (me.chart.maxGutter[0] == 0) {
                if (i == 0 && axes.findIndex('position', 'left') == -1) {
                    x = point[0];
                }
                else if (i == last && axes.findIndex('position', 'right') == -1) {
                    x = point[0] - bbox.width;
                }
            }
            if (position == 'top') {
                y = point[1] - (me.dashSize * 2) - labelConf.padding - (bbox.height / 2);
            }
            else {
                y = point[1] + (me.dashSize * 2) + labelConf.padding + (bbox.height / 2);
            }
            if (!me.isPannable()) {
                x += me.x;
                y += me.y;
            }
            textLabel.setAttributes({
                hidden: false,
                x: x,
                y: y
            }, true);
            if (labelConf.rotate) {
                textLabel.setAttributes(labelConf, true);
            }
            // Skip label if there isn't available minimum space
            if (i != 0 && (me.intersect(textLabel, prevLabel)
                || me.intersect(textLabel, firstLabel))) {
                textLabel.hide(true);
                continue;
            }
            prevLabel = textLabel;
        }

        return maxHeight;
    },

    drawVerticalLabels: function() {
        var me = this,
            labelConf = me.labelStyle.style,
            renderer = labelConf.renderer || function(v) {
                return v;
            },
            inflections = me.inflections,
            position = me.position,
            ln = inflections.length,
            labels = me.labels,
            skipTicks = me.skipTicks,
            maxWidth = 0,
            math = Math,
            max = math.max,
            floor = math.floor,
            ceil = math.ceil,
            axes = me.chart.axes,
            gutterY = me.chart.maxGutter[1],
            bbox, point, prevLabel,
            textLabel, text,
            last, x, y, i;

        if (!me.calcLabels && skipTicks) {
            labels = labels.slice(skipTicks);
            ln -= skipTicks;
        }

        last = ln;
        for (i = 0; i < last; i++) {
            point = inflections[i];
            text = renderer(labels[i]);
            textLabel = me.getOrCreateLabel(i, text);
            bbox = textLabel._bbox;
            maxWidth = max(maxWidth, bbox.width + me.dashSize + (labelConf.padding || 0));
            y = point[1];
            if (gutterY < bbox.height / 2) {
                if (i == last - 1 && axes.findIndex('position', 'top') == -1) {
                    y += ceil(bbox.height / 2);
                }
                else if (i == 0 && axes.findIndex('position', 'bottom') == -1) {
                    y -= floor(bbox.height / 2);
                }
            }
            if (position == 'left') {
                x = point[0] - bbox.width - me.dashSize - (labelConf.padding || 0) - 2;
            }
            else {
                x = point[0] + me.dashSize + (labelConf.padding || 0) + 2;
            }
            if (!me.isPannable()) {
                x += me.x;
                y += me.y + me.panY;
            }
            textLabel.setAttributes(Ext.apply({
                hidden: false,
                x: x,
                y: y
            }, labelConf), true);
            // Skip label if there isn't available minimum space
            if (i != 0 && me.intersect(textLabel, prevLabel)) {
                textLabel.hide(true);
                continue;
            }
            prevLabel = textLabel;
        }

        return maxWidth;
    },

    /**
     * Renders the labels in the axes.
     */
    drawLabel: function() {
        if (!this.inflections) {
            return 0;
        }
      
        var me = this,
            labelGroup = me.labelGroup,
            inflections = me.inflections,
            surface = me.getLabelSurface(),
            maxWidth = 0,
            maxHeight = 0,
            ln, i;

        // If we are switching between rendering labels to the axis surface and the main
        // chart surface, then we need to blow away all existing labels and let them get
        // re-created on the new surface
        if (me.lastLabelSurface !== surface) {
            labelGroup.each(function(sprite) {
                sprite.destroy();
            });
            labelGroup.clear();
            me.lastLabelSurface = surface;
        }

        if (me.isSide()) {
            maxWidth = me.drawVerticalLabels();
        } else {
            maxHeight = me.drawHorizontalLabels();
        }

        // Hide unused label sprites
        ln = labelGroup.getCount();
        i = inflections.length;
        for (; i < ln; i++) {
            labelGroup.getAt(i).hide(true);
        }

        me.bbox = {};
        Ext.apply(me.bbox, me.axisBBox);
        me.bbox.height = maxHeight;
        me.bbox.width = maxWidth;
        if (Ext.isString(me.title)) {
            me.drawTitle(maxWidth, maxHeight);
        }
    },

    /**
     * @private
     * Returns the surface onto which axis tick labels should be rendered. Differs between
     * when the axis is in its initial non-zoomed state (uses the main chart surface so the
     * labels can display outside the axis clipping area) and when it is zoomed so it overflows
     * (uses the axis surface so the labels are clipped and panned along with the axis grid).
     * @return {Ext.draw.Surface}
     */
    getLabelSurface: function() {
        var me = this;
        return me.isPannable() ? me.getSurface() : me.chart.getSurface('main');
    },

    /**
     * Updates the {@link #title} of this axis.
     * @param {String} title
     */
    setTitle: function(title) {
        this.title = title;
        this.drawLabel();
    },

    // @private draws the title for the axis.
    drawTitle: function(maxWidth, maxHeight) {
        var me = this,
            position = me.position,
            surface = me.chart.getSurface('main'), //title is drawn on main surface so it doesn't get transformed
            displaySprite = me.displaySprite,
            title = me.title,
            rotate = me.isSide(),
            x = me.startX + me.x,
            y = me.startY + me.y,
            base, bbox, pad;

        if (displaySprite) {
            displaySprite.setAttributes({text: title}, true);
        } else {
            base = {
                type: 'text',
                x: 0,
                y: 0,
                text: title
            };
            displaySprite = me.displaySprite = surface.add(Ext.apply(base, me.titleStyle.style, me.labelTitle));
            surface.renderItem(displaySprite);
        }
        bbox = displaySprite.getBBox();
        pad = me.dashSize + (me.titleStyle.style.padding || 0);

        if (rotate) {
            y -= ((me.length / 2) - (bbox.height / 2));
            if (position == 'left') {
                x -= (maxWidth + pad + (bbox.width / 2));
            }
            else {
                x += (maxWidth + pad + bbox.width - (bbox.width / 2));
            }
            me.bbox.width += bbox.width + 10;
        }
        else {
            x += (me.length / 2) - (bbox.width * 0.5);
            if (position == 'top') {
                y -= (maxHeight + pad + (bbox.height * 0.3));
            }
            else {
                y += (maxHeight + pad + (bbox.height * 0.8));
            }
            me.bbox.height += bbox.height + 10;
        }
        displaySprite.setAttributes({
            hidden: false,
            translate: {
                x: x,
                y: y
            }
        }, true);
    },

    /**
     * Return the Series object(s) that are bound to this axis.
     * @return Ext.util.MixedCollection
     */
    getBoundSeries: function() {
        var me = this,
            series = me.chart.series;
        return series.filterBy(function(s) {
            var seriesFields = [].concat(s.xField, s.yField),
                i = seriesFields.length;
            while (i--) {
                if (me.isBoundToField(seriesFields[i])) {
                    return true;
                }
            }
            return false;
        });
    },

    /**
     * Determine whether this axis is bound to the given field name.
     * @param {String} field
     * @return {Boolean}
     */
    isBoundToField: function(field) {
        var fields = this.fields,
            i = fields.length;
        while(i--) {
            if (fields[i] === field) {
                return true;
            }
        }
        return false;
    }

});

