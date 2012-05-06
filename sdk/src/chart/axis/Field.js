/**
 * Creates Field Axis.
 * TODO:
 *    -    useful description
 *    -    test label rotation
 */

Ext.chart.axis.Field = Ext.extend(Ext.chart.axis.Category, {

    drawAxis: function(){
        var me = this,
            fields = me.fields,
            ln = fields.length,
            labels = me.labels = [],
            length = me.length,
            width = me.width,
            position = me.position,
            isLeftOrRight = (position == 'left' || position == 'right'),
            surface, i;

        //If the axis is hidden
        //then don't draw the axis.
        if (me.hidden) {
            return;
        }


        surface = me.getSurface();
        surface.el.setTopLeft(me.y, me.x);
        surface.setSize(
            isLeftOrRight ? width : length,
            isLeftOrRight ? length : width
        );

        for(i=0; i < ln; i++){
            labels.push(fields[i].label);
        }

        me.drawLabel();
    },

    drawHorizontalLabels: function() {
       var  me = this,
            chartBBox = me.chart.chartBBox,
            max = Math.max,
            position = me.position,
            labels = me.labels,
            ln = labels.length,
            singleStep = chartBBox.width / ln >> 0,
            maxHeight = 0,
            startY = me.startY,
            startX = me.startX,
            bbox, prevLabel,
            textLabel, text,
            last, x, y, i, firstLabel;

        last = ln - 1;

        //get a reference to the first text label dimensions
        firstLabel = me.getOrCreateLabel(0, me.label.renderer(labels[0]));

        for (i = 0; i < ln; i++) {
            text = me.label.renderer(labels[i]);
            textLabel = me.getOrCreateLabel(i, text);

            bbox = textLabel._bbox;
            maxHeight = max(maxHeight, bbox.height + me.dashSize + me.label.padding);

            x = startX + singleStep/2 + singleStep*i - bbox.width/2 >> 0;

            if (position == 'top') {
                y = startY - (bbox.height / 2) - me.label.padding;
            }
            else {
                y = startY  + (bbox.height / 2) + me.label.padding;
            }
            textLabel.setAttributes({
                hidden: false,
                x: x,
                y: y
            }, true);

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
            position = me.position,
            chartBBox = me.chart.chartBBox,
            labels = me.labels,
            ln = labels.length,
            maxWidth = 0,
            max = Math.max,
            startX = me.startX,
            startY = me.startY,
            singleStep = chartBBox.height / ln >> 0,
            bbox, prevLabel, textLabel, text, x, y, i;

        for (i = 0; i < ln; i++) {
            text = me.label.renderer(labels[i]);
            textLabel = me.getOrCreateLabel(i, text);
            bbox = textLabel._bbox;

            maxWidth = max(maxWidth, bbox.width + me.dashSize + me.label.padding);
            y = startY - singleStep/2 - singleStep*i + bbox.height/4 >> 0;

            if (position == 'left') {
                x = startX - bbox.width - me.dashSize - me.label.padding - 10;
            }
            else {
                x = startX + me.dashSize + me.label.padding + 10;
            }

            textLabel.setAttributes(Ext.apply({
                hidden: false,
                x: x,
                y: y
            }, me.label), true);
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
        var me = this,
            position = me.position,
            labelGroup = me.labelGroup,
            labels = me.labels,
            maxWidth = 0,
            maxHeight = 0,
            ln, i;

        if (position == 'left' || position == 'right') {
            maxWidth = me.drawVerticalLabels();
        } else {
            maxHeight = me.drawHorizontalLabels();
        }

        // Hide unused bars
        ln = labelGroup.getCount();
        i = labels.length;
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
    getFieldIndex: function(value){
        var me = this,
            labels = me.labels,
            ln = labels.length;

        while(ln--)
            if(labels[ln] == value)
                return ln;

        return -1;
    }
});