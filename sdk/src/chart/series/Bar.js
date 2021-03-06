/**
 * Creates a Bar Chart. A Bar Chart is a useful visualization technique to display quantitative information for
 * different categories that can show some progression (or regression) in the dataset. As with all other series, the Bar
 * Series must be appended in the *series* Chart array configuration. See the Chart documentation for more information.
 * A typical configuration object for the bar series could be:
 *
 * {@img Ext.chart.series.Bar/Ext.chart.series.Bar.png Ext.chart.series.Bar chart series}
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
 *         axes: [{
 *             type: 'Numeric',
 *             position: 'bottom',
 *             fields: ['data1'],
 *             label: {
 *                 renderer: Ext.util.Format.numberRenderer('0,0')
 *             },
 *             title: 'Sample Values',
 *             grid: true,
 *             minimum: 0
 *         }, {
 *             type: 'Category',
 *             position: 'left',
 *             fields: ['name'],
 *             title: 'Sample Metrics'
 *         }],
 *         series: [{
 *             type: 'bar',
 *             axis: 'bottom',
 *             highlight: true,
 *             tips: {
 *               trackMouse: true,
 *               width: 140,
 *               height: 28,
 *               renderer: function(storeItem, item) {
 *                 this.setTitle(storeItem.get('name') + ': ' + storeItem.get('data1') + ' views');
 *               }
 *             },
 *             label: {
 *               display: 'insideEnd',
 *                 field: 'data1',
 *                 renderer: Ext.util.Format.numberRenderer('0'),
 *                 orientation: 'horizontal',
 *                 color: '#333',
 *                 'text-anchor': 'middle'
 *             },
 *             xField: 'name',
 *             yField: ['data1']
 *         }]
 *     });
 *
 * In this configuration we set `bar` as the series type, bind the values of the bar to the bottom axis and set the
 * xField or category field to the `name` parameter of the store. We also set `highlight` to true which enables smooth
 * animations when bars are hovered. We also set some configuration for the bar labels to be displayed inside the bar,
 * to display the information found in the `data1` property of each element store, to render a formated text with the
 * `Ext.util.Format` we pass in, to have an `horizontal` orientation (as opposed to a vertical one) and we also set
 * other styles like `color`, `text-anchor`, etc.
 */
Ext.chart.series.Bar = Ext.extend(Ext.chart.series.Cartesian, {

    type: 'bar',

    /**
     * @private {Boolean} column Whether to set the visualization as column chart or horizontal bar chart.
     */
    column: false,
    
    axis: 'bottom',
    /**
     * @cfg style Style properties that will override the theming series styles.
     */
    
    /**
     * @cfg {Number} gutter The gutter space between single bars, as a percentage of the bar width
     */
    gutter: 38.2,

    /**
     * @cfg {Number} groupGutter The gutter space between groups of bars, as a percentage of the bar width
     */
    groupGutter: 38.2,

    /**
     * @cfg {Number} xPadding Padding between the left/right axes and the bars
     */
    xPadding: 0,

    /**
     * @cfg {Number} yPadding Padding between the top/bottom axes and the bars
     */
    yPadding: 10,

    /**
     * @private
     * @property disjointStacked
     * @type Boolean
     * If set to `true`, then if `stacked:true` the bars will be drawn stacked in terms of their
     * y-values but remain side-by-side in the x-direction, basically a hybrid between stacked and
     * grouped. This is only used internally to support an intermediate animation state when
     * toggling between stacked and grouped (see the ToggleStacked interaction).
     */

    constructor: function(config) {
        Ext.chart.series.Bar.superclass.constructor.apply(this, arguments);
        var me = this,
            surface = me.getSurface(),
            shadow = me.chart.shadow,
            i, l;
        Ext.apply(me, config, {
            shadowAttributes: surface.getShadowAttributesArray(),
            shadowOptions: Ext.apply(surface.getShadowOptions(), shadow === true ? {} : (shadow || {}))
        });
        me.group = surface.getGroup(me.seriesId + '-bars');
        if (shadow) {
            for (i = 0, l = me.shadowAttributes.length; i < l; i++) {
                me.shadowGroups.push(surface.getGroup(me.seriesId + '-shadows' + i));
            }
        }
        me.initialStacked = me.stacked;
    },

    // @private sets the bar girth.
    getBarGirth: function() {
        var me = this,
            column = me.column,
            ln = me.getRecordCount(),
            gutter = me.gutter / 100;
        
        return (me.chart.chartBBox[column ? 'width' : 'height'] - me[column ? 'xPadding' : 'yPadding'] * 2) / (ln * (gutter + 1) - gutter);
    },

    // @private returns the gutters.
    getGutters: function() {
        var me = this,
            column = me.column,
            gutter = Math.ceil((column ? me.xPadding : me.yPadding) + me.getBarGirth() / 2);
        return column ? [gutter, 0] : [0, gutter];
    },

    // @private Get chart and data boundaries
    getBounds: function() {
        var me = this,
            chart = me.chart,
            barsLen = me.getYValueCount(),
            visibleBarsLen = barsLen,
            groupGutter = me.groupGutter / 100,
            column = me.column,
            zoomX = me.zoomX,
            zoomY = me.zoomY,
            xPadding = me.xPadding * zoomX,
            yPadding = me.yPadding * zoomY,
            stacked = me.stacked,
            disjointStacked = me.disjointStacked,
            barWidth = me.getBarGirth() * (column ? zoomX : zoomY),
            math = Math,
            mmax = math.max,
            mabs = math.abs,
            groupBarWidth, bbox, minY, maxY, axis, out,
            scale, zero, total, j, plus, minus, recordIndex;

        me.setBBox(true);
        bbox = me.bbox;

        //Skip excluded yFields
        for (j = 0, total = barsLen; j < total; j++) {
            if (me.isExcluded(j)) {
                visibleBarsLen--;
            }
        }

        if (me.axis) {
            axis = chart.axes.get(me.axis);
            if (axis) {
                out = axis.calcEnds();
                minY = out.from;
                maxY = out.to;
            }
        }

        if (me.yField && !Ext.isNumber(minY)) {
            axis = new Ext.chart.axis.Axis({
                chart: chart,
                fields: [].concat(me.yField)
            });
            out = axis.calcEnds();
            minY = out.from;
            maxY = out.to;
        }

        if (!Ext.isNumber(minY)) {
            minY = 0;
        }
        if (!Ext.isNumber(maxY)) {
            maxY = 0;
        }
        scale = (column ? bbox.height - yPadding * 2 : bbox.width - xPadding * 2) / (maxY - minY);
        groupBarWidth = barWidth / ((stacked && !disjointStacked ? 1 : visibleBarsLen) * (groupGutter + 1) - groupGutter);
        zero = (column) ? bbox.y + bbox.height - yPadding : bbox.x + xPadding;


        function eachYValue(yValue, i) {
            if (!me.isExcluded(i)) {
                total[yValue > 0 ? 1 : 0][recordIndex] += mabs(yValue);
            }
        }

        if (stacked) {
            total = [[], []];
            me.eachRecord(function(record, i) {
                total[0][i] = total[0][i] || 0;
                total[1][i] = total[1][i] || 0;
                recordIndex = i;
                me.eachYValue(record, eachYValue);
            });
            total[+(maxY > 0)].push(mabs(maxY));
            total[+(minY > 0)].push(mabs(minY));
            minus = mmax.apply(math, total[0]);
            plus = mmax.apply(math, total[1]);
            scale = (column ? bbox.height - yPadding * 2 : bbox.width - xPadding * 2) / (plus + minus);
            zero = zero + minus * scale * (column ? -1 : 1);
        }
        else if (minY / maxY < 0) {
            zero = zero - minY * scale * (column ? -1 : 1);
        }
        return {
            bbox: bbox,
            barsLen: barsLen,
            visibleBarsLen: visibleBarsLen,
            barWidth: barWidth,
            groupBarWidth: groupBarWidth,
            scale: scale,
            zero: zero,
            xPadding: xPadding,
            yPadding: yPadding,
            signed: minY / maxY < 0,
            minY: minY,
            maxY: maxY
        };
    },

    // @private Build an array of paths for the chart
    getPaths: function() {
        var me = this,
            chart = me.chart,
            bounds = me.bounds = me.getBounds(),
            items = me.items = [],
            gutter = me.gutter / 100,
            groupGutter = me.groupGutter / 100,
            animate = chart.animate,
            column = me.column,
            group = me.group,
            enableShadows = chart.shadow,
            shadowGroups = me.shadowGroups,
            shadowGroupsLn = shadowGroups.length,
            bbox = bounds.bbox,
            xPadding = me.xPadding * me.zoomX,
            yPadding = me.yPadding * me.zoomY,
            stacked = me.stacked,
            disjointStacked = me.disjointStacked,
            barsLen = bounds.barsLen,
            colors = me.colorArrayStyle,
            colorLength = colors && colors.length || 0,
            math = Math,
            mmax = math.max,
            mabs = math.abs,
            total = me.getRecordCount(),
            height, totalDim, totalNegDim, bottom, top, hasShadow, barAttr, attrs, counter,
            shadowIndex, shadow, sprite, offset, floorY, recordIndex, currentRecord;

        function eachYValue(yValue, i) {
            // Excluded series
            if (me.isExcluded(i)) {
                return;
            }

            height = Math.round(yValue * bounds.scale);
            barAttr = {
                fill: colors[(barsLen > 1 ? i : 0) % colorLength]
            };
            if (column) {
                Ext.apply(barAttr, {
                    height: height,
                    width: mmax(bounds.groupBarWidth, 0),
                    x: (bbox.x + xPadding + recordIndex * bounds.barWidth * (1 + gutter) + counter * bounds.groupBarWidth * (1 + groupGutter) * (!stacked || disjointStacked ? 1 : 0)),
                    y: bottom - height
                });
            }
            else {
                // draw in reverse order
                offset = (total - 1) - recordIndex;
                Ext.apply(barAttr, {
                    height: mmax(bounds.groupBarWidth, 0),
                    width: height + (bottom == bounds.zero),
                    x: bottom + (bottom != bounds.zero),
                    y: (bbox.y + yPadding + offset * bounds.barWidth * (1 + gutter) + counter * bounds.groupBarWidth * (1 + groupGutter) * (!stacked || disjointStacked ? 1 : 0) + 1)
                });
            }
            if (height < 0) {
                if (column) {
                    barAttr.y = top;
                    barAttr.height = mabs(height);
                } else {
                    barAttr.x = top + height;
                    barAttr.width = mabs(height);
                }
            }
            if (stacked) {
                if (height < 0) {
                    top += height * (column ? -1 : 1);
                } else {
                    bottom += height * (column ? -1 : 1);
                }
                totalDim += mabs(height);
                if (height < 0) {
                    totalNegDim += mabs(height);
                }
            }
            barAttr.x = Math.floor(barAttr.x) + 1;
            floorY = Math.floor(barAttr.y);
            if (!Ext.isIE9 && barAttr.y > floorY) {
                floorY--;
            }
            barAttr.y = floorY;
            barAttr.width = Math.floor(barAttr.width);
            barAttr.height = Math.floor(barAttr.height);
            items.push({
                series: me,
                storeItem: currentRecord,
                value: [currentRecord.get(me.xField), yValue],
                attr: barAttr,
                point: column ? [barAttr.x + barAttr.width / 2, yValue >= 0 ? barAttr.y : barAttr.y + barAttr.height] :
                                [yValue >= 0 ? barAttr.x + barAttr.width : barAttr.x, barAttr.y + barAttr.height / 2]
            });
            // When resizing, reset before animating
            if (animate && chart.resizing) {
                attrs = column ? {
                    x: barAttr.x,
                    y: bounds.zero,
                    width: barAttr.width,
                    height: 0
                } : {
                    x: bounds.zero,
                    y: barAttr.y,
                    width: 0,
                    height: barAttr.height
                };
                if (enableShadows && (stacked && !hasShadow || !stacked)) {
                    hasShadow = true;
                    //update shadows
                    for (shadowIndex = 0; shadowIndex < shadowGroupsLn; shadowIndex++) {
                        shadow = shadowGroups[shadowIndex].getAt(stacked ? recordIndex : (recordIndex * barsLen + i));
                        if (shadow) {
                            shadow.setAttributes(attrs, true);
                        }
                    }
                }
                //update sprite position and width/height
                sprite = group.getAt(recordIndex * barsLen + i);
                if (sprite) {
                    sprite.setAttributes(attrs, true);
                }
            }
            counter++;
        }

        me.eachRecord(function(record, i) {
            bottom = top = bounds.zero;
            totalDim = 0;
            totalNegDim = 0;
            hasShadow = false;
            counter = 0;
            currentRecord = record;
            recordIndex = i;
            me.eachYValue(record, eachYValue);
            if (stacked && items.length) {
                items[i * counter].totalDim = totalDim;
                items[i * counter].totalNegDim = totalNegDim;
            }
        }, me);
    },

    // @private render/setAttributes on the shadows
    renderShadows: function(i, barAttr, baseAttrs, bounds) {
        var me = this,
            chart = me.chart,
            surface = me.getSurface(),
            animate = chart.animate,
            stacked = me.stacked,
            shadowGroups = me.shadowGroups,
            shadowAttributes = me.shadowAttributes,
            shadowGroupsLn = shadowGroups.length,
            store = chart.substore || chart.store,
            column = me.column,
            items = me.items,
            shadows = [],
            zero = bounds.zero,
            shadowIndex, shadowBarAttr, shadow, totalDim, totalNegDim, j, rendererAttributes;

        if ((stacked && (i % bounds.visibleBarsLen === 0)) || !stacked) {
            j = i / bounds.visibleBarsLen;
            //create shadows
            for (shadowIndex = 0; shadowIndex < shadowGroupsLn; shadowIndex++) {
                shadowBarAttr = Ext.apply({}, shadowAttributes[shadowIndex]);
                shadow = shadowGroups[shadowIndex].getAt(stacked ? j : i);
                shadowBarAttr.x = barAttr.x;
                shadowBarAttr.y = barAttr.y;
                shadowBarAttr.width = barAttr.width;
                shadowBarAttr.height = barAttr.height;
                if (!shadow) {
                    shadow = surface.add(Ext.apply({
                        type: 'rect',
                        group: shadowGroups[shadowIndex]
                    }, Ext.apply({}, baseAttrs, shadowBarAttr)));
                }
                if (stacked) {
                    totalDim = items[i].totalDim;
                    totalNegDim = items[i].totalNegDim;
                    if (column) {
                        shadowBarAttr.y = zero - totalNegDim;
                        shadowBarAttr.height = totalDim;
                    }
                    else {
                        shadowBarAttr.x = zero - totalNegDim;
                        shadowBarAttr.width = totalDim;
                    }
                }
                if (animate) {
                    if (!stacked) {
                        rendererAttributes = me.renderer(shadow, store.getAt(j), shadowBarAttr, i, store);
                        me.onAnimate(shadow, { to: rendererAttributes });
                    }
                    else {
                        rendererAttributes = me.renderer(shadow, store.getAt(j), Ext.apply(shadowBarAttr, { hidden: true }), i, store);
                        shadow.setAttributes(rendererAttributes, true);
                    }
                }
                else {
                    rendererAttributes = me.renderer(shadow, store.getAt(j), Ext.apply(shadowBarAttr, { hidden: false }), i, store);
                    shadow.setAttributes(rendererAttributes, true);
                }
                shadows.push(shadow);
            }
        }
        return shadows;
    },

    /**
     * Draws the series for the current chart.
     */
    drawSeries: function() {
        var me = this,
            chart = me.chart,
            store = chart.substore || chart.store,
            surface = me.getSurface(),
            animate = chart.animate,
            stacked = me.stacked,
            column = me.column,
            enableShadows = chart.shadow,
            shadowGroups = me.shadowGroups,
            shadowGroupsLn = shadowGroups.length,
            group = me.group,
            seriesStyle = me.style,
            items, ln, i, j, baseAttrs, sprite, rendererAttributes, shadowIndex, shadowGroup,
            bounds, endSeriesStyle, barAttr, attrs, anim, item;
        
        if (me.fireEvent('beforedraw', me) === false) {
            return;
        }

        Ext.chart.series.Bar.superclass.drawSeries.call(this);

        if (!me.getRecordCount()) {
            surface.items.hide(true);
            return;
        }

        //fill colors are taken from the colors array.
        delete seriesStyle.fill;
        me.unHighlightItem();
        me.cleanHighlights();

        me.getPaths();
        bounds = me.bounds;
        items = me.items;

        baseAttrs = column ? {
            y: bounds.zero,
            height: 0
        } : {
            x: bounds.zero,
            width: 0
        };
        ln = items.length;
        // Create new or reuse sprites and animate/display
        for (i = 0; i < ln; i++) {
            item = items[i];
            sprite = group.getAt(i);
            barAttr = item.attr;

            if (enableShadows) {
                item.shadows = me.renderShadows(i, barAttr, baseAttrs, bounds);
            }

            // Create a new sprite if needed (no height)
            if (!sprite) {
                attrs = Ext.apply({}, baseAttrs, barAttr);
                attrs = Ext.apply(attrs, endSeriesStyle || {});
                if (enableShadows) {
                    Ext.apply(attrs, me.shadowOptions);
                }
                sprite = surface.add(Ext.apply({}, {
                    type: 'rect',
                    group: group
                }, attrs));
            }
            if (animate) {
                rendererAttributes = me.renderer(sprite, store.getAt(i), barAttr, i, store);
                sprite._to = rendererAttributes;
                anim = me.onAnimate(sprite, { to: Ext.apply(rendererAttributes, endSeriesStyle) });
                if (enableShadows && stacked && (i % bounds.barsLen === 0)) {
                    j = i / bounds.barsLen;
                    for (shadowIndex = 0; shadowIndex < shadowGroupsLn; shadowIndex++) {
                        anim.on('afteranimate', function() {
                            this.show(true);
                        }, shadowGroups[shadowIndex].getAt(j));
                    }
                }
            }
            else {
                rendererAttributes = me.renderer(sprite, store.getAt(i), Ext.apply(barAttr, { hidden: false }), i, store);
                sprite.setAttributes(Ext.apply(rendererAttributes, endSeriesStyle), true);
            }
            item.sprite = sprite;
        }

        // Hide unused sprites
        ln = group.getCount();
        for (j = i; j < ln; j++) {
            group.getAt(j).hide(true);
        }
        // Hide unused shadows
        if (enableShadows) {
            for (shadowIndex = 0; shadowIndex < shadowGroupsLn; shadowIndex++) {
                shadowGroup = shadowGroups[shadowIndex];
                ln = shadowGroup.getCount();
                for (j = i; j < ln; j++) {
                    shadowGroup.getAt(j).hide(true);
                }
            }
        }
        me.renderLabels();
        me.fireEvent('draw', me);
    },
    
    // @private handled when creating a label.
    onCreateLabel: function(storeItem, item, i, display) {
        var me = this,
            surface = me.getSurface(),
            group = me.labelsGroup,
            config = me.label,
            endLabelStyle = Ext.apply({}, config, me.labelStyle.style || {}),
            sprite;
       
        return surface.add(Ext.apply({
            type: 'text',
            group: group
        }, endLabelStyle || {}));
    },
    
    // @private callback used when placing a label.
    onPlaceLabel: function(label, storeItem, item, i, display, animate, j, index) {
        // Determine the label's final position. Starts with the configured preferred value but
        // may get flipped from inside to outside or vice-versa depending on space.
        var me = this,
            opt = me.bounds,
            groupBarWidth = opt.groupBarWidth,
            column = me.column,
            chart = me.chart,
            chartBBox = chart.chartBBox,
            resizing = chart.resizing,
            xValue = item.value[0],
            yValue = item.value[1],
            attr = item.attr,
            config = Ext.apply(me.labelStyle.style || {},  me.label || {}),
            rotate = config.orientation == 'vertical',
            field = [].concat(config.field),
            format = config.renderer,
            text = format(storeItem.get(field[index])),
            size = me.getLabelSize(text),
            width = size.width,
            height = size.height,
            zero = opt.zero,
            outside = 'outside',
            insideStart = 'insideStart',
            insideEnd = 'insideEnd',
            offsetX = 10,
            offsetY = 6,
            signed = opt.signed,
            x, y, finalAttr;
        
        label.setAttributes({
            text: text
        });

        label.isOutside = false;
        if (column) {
            if (display == outside) {
                if (height + offsetY + attr.height > (yValue >= 0 ? zero: chartBBox.height - zero)) {
                    display = insideEnd;
                }
            } else {
                if (height + offsetY > attr.height) {
                    display = outside;
                    label.isOutside = true;
                }
            }
            x = attr.x + groupBarWidth / 2;
            y = display == insideStart ?
                    (zero + ((height / 2 + 3) * (yValue >= 0 ? -1 : 1))) :
                    (yValue >= 0 ? (attr.y + ((height / 2 + 3) * (display == outside ? -1 : 1))) :
                                   (attr.y + attr.height + ((height / 2 + 3) * (display === outside ? 1 : -1))));
        }
        else {
            if (display == outside) {
                if (width + offsetX + attr.width > (yValue >= 0 ? chartBBox.width - zero : zero)) {
                    display = insideEnd;
                }
            }
            else {
                if (width + offsetX > attr.width) {
                    display = outside;
                    label.isOutside = true;
                }
            }
            x = display == insideStart ?
                (zero + ((width / 2 + 5) * (yValue >= 0 ? 1 : -1))) :
                (yValue >= 0 ? (attr.x + attr.width + ((width / 2 + 5) * (display === outside ? 1 : -1))) :
                (attr.x + ((width / 2 + 5) * (display === outside ? -1 : 1))));
            y = attr.y + groupBarWidth / 2;
        }
        //set position
        finalAttr = {
            x: x,
            y: y
        };
        //rotate
        if (rotate) {
            finalAttr.rotate = {
                x: x,
                y: y,
                degrees: 270
            };
        }
        //check for resizing
        if (animate && resizing) {
            if (column) {
                x = attr.x + attr.width / 2;
                y = zero;
            } else {
                x = zero;
                y = attr.y + attr.height / 2;
            }
            label.setAttributes({
                x: x,
                y: y
            }, true);
            if (rotate) {
                label.setAttributes({
                    rotate: {
                        x: x,
                        y: y,
                        degrees: 270
                    }
                }, true);
            }
        }
        //handle animation
        if (animate) {
            me.onAnimate(label, { to: finalAttr });
        }
        else {
            label.setAttributes(Ext.apply(finalAttr, {
                hidden: false
            }), true);
        }
    },

    /* @private
     * Gets the dimensions of a given bar label. Uses a single hidden sprite to avoid
     * changing visible sprites.
     * @param value
     */
    getLabelSize: function(value) {
        var tester = this.testerLabel,
            config = this.label,
            endLabelStyle = Ext.apply({}, config, this.labelStyle.style || {}),
            rotated = config.orientation === 'vertical',
            bbox, w, h,
            undef;
        if (!tester) {
            tester = this.testerLabel = this.getSurface().add(Ext.apply({
                type: 'text',
                opacity: 0
            }, endLabelStyle));
        }
        tester.setAttributes({
            text: value
        }, true);

        // Flip the width/height if rotated, as getBBox returns the pre-rotated dimensions
        bbox = tester.getBBox();
        w = bbox.width;
        h = bbox.height;
        return {
            width: rotated ? h : w,
            height: rotated ? w : h
        };
    },

    // @private used to animate label, markers and other sprites.
    onAnimate: function(sprite, attr) {
        sprite.show();
        Ext.chart.series.Bar.superclass.onAnimate.apply(this, arguments);
    },
    
    isItemInPoint: function(x, y, item) {
        var bbox = item.sprite.getBBox();
        return bbox.x <= x && bbox.y <= y
            && (bbox.x + bbox.width) >= x
            && (bbox.y + bbox.height) >= y;
    },
    
    // @private hide all markers
    hideAll: function() {
        var axes = this.chart.axes;
        if (!isNaN(this._index)) {
            if (!this.__excludes) {
                this.__excludes = [];
            }
            this.__excludes[this._index] = true;
            this.drawSeries();
            axes.each(function(axis) {
                axis.drawAxis();
            });
        }
    },

    // @private show all markers
    showAll: function() {
        var axes = this.chart.axes;
        if (!isNaN(this._index)) {
            if (!this.__excludes) {
                this.__excludes = [];
            }
            this.__excludes[this._index] = false;
            this.drawSeries();
            axes.each(function(axis) {
                axis.drawAxis();
            });
        }
    },
    
    /**
     * Returns a string with the color to be used for the series legend item.
     * @param index
     */
    getLegendColor: function(index) {
        var me = this,
            colorArrayStyle = me.colorArrayStyle;
        return me.getColorFromStyle(colorArrayStyle[index % colorArrayStyle.length]);
    },

    highlightItem: function(item) {
        Ext.chart.series.Bar.superclass.highlightItem.apply(this, arguments);
        this.renderLabels();
    },

    unHighlightItem: function() {
        Ext.chart.series.Bar.superclass.unHighlightItem.apply(this, arguments);
        this.renderLabels();
    },

    cleanHighlights: function() {
        Ext.chart.series.Bar.superclass.cleanHighlights.apply(this, arguments);
        this.renderLabels();
    },

    reset: function() {
        var me = this;
        me.stacked = me.initialStacked;
        Ext.chart.series.Bar.superclass.reset.call(me);
    }
});
