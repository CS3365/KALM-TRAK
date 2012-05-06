/**
 * @class Ext.chart.Highlight
 * @ignore
 */
Ext.chart.Highlight = Ext.extend(Object, {

    /**
     * Specifies whether this series should respond to highlighting, and optionally specifies custom
     * attributes for the highlighting effect. Only used if the
     * {@link Ext.chart.interactions.ItemHighlight itemhighlight} interaction is configured.
     * Defaults to `true` which uses a default highlighting effect for the series items; set it to
     * `false` to disable highlighting entirely on this series, or to an object with style properties
     * (i.e fill, stroke, radius) to customize the highlighting effect.
     */
    highlight: true,

    /**
     * @cfg {Number} highlightDuration
     * The duration for the highlight effect in milliseconds. Default's 150
     */
    highlightDuration: 150,

    highlightCfg : null,

    constructor: function(config) {
        if (config.highlight !== false) {
            if (config.highlight !== true) { //is an object
                this.highlightCfg = Ext.apply({}, config.highlight);
            }
            else {
                this.highlightCfg = {};
            }
            this.addEvents('highlight', 'unhighlight');
            this.highlightStyle = new Ext.chart.theme.HighlightStyle();
        }
    },

    /**
     * Highlight the given series item.
     * @param {Object} item Info about the item; same format as returned by #getItemForPoint.
     */
    highlightItem: function(item) {
        if (!item) {
            return;
        }

        var me = this,
            sprite = item.sprite,
            opts = me.highlightCfg,
            surface = me.chart.surface,
            animate = me.chart.animate,
            p, from, to, pi;

        if (me.highlight === false || !sprite || sprite._highlighted) {
            return;
        }
        //make sure we apply the stylesheet styles.
        Ext.applyIf(me.highlightCfg, me.highlightStyle.style || {});
        
        if (sprite._anim) {
            sprite._anim.paused = true;
        }
        sprite._highlighted = true;
        if (!sprite._defaults) {
            sprite._defaults = Ext.apply({}, sprite.attr);
            from = {};
            to = {};
            for (p in opts) {
                if (! (p in sprite._defaults)) {
                    sprite._defaults[p] = surface.attributeDefaults[surface.attributeMap[p]];
                }
                from[p] = sprite._defaults[p];
                to[p] = opts[p];
                if (Ext.isObject(opts[p])) {
                    from[p] = {};
                    to[p] = {};
                    Ext.apply(sprite._defaults[p], sprite.attr[p]);
                    Ext.apply(from[p], sprite._defaults[p]);
                    for (pi in sprite._defaults[p]) {
                        if (! (pi in opts[p])) {
                            to[p][pi] = from[p][pi];
                        } else {
                            to[p][pi] = opts[p][pi];
                        }
                    }
                    for (pi in opts[p]) {
                        if (! (pi in to[p])) {
                            to[p][pi] = opts[p][pi];
                        }
                    }
                }
            }
            sprite._from = from;
            sprite._to = to;
            sprite._endStyle = to;
        }
        if (animate) {
            sprite._anim = new Ext.fx.Anim({
                target: sprite,
                from: sprite._from,
                to: sprite._to,
                duration: me.highlightDuration || 150
            });
        } else {
            sprite.setAttributes(sprite._to, true);
        }

        me.fireEvent('highlight', item);
    },

    /**
     * Un-highlight any existing highlights
     */
    unHighlightItem: function() {
        if (this.highlight === false || !this.items) {
            return;
        }

        var me = this,
            items = me.items,
            len = items.length,
            opts = me.highlightCfg,
            animate = me.chart.animate,
            i = 0,
            obj, p, sprite;

        for (; i < len; i++) {
            if (!items[i]) {
                continue;
            }
            sprite = items[i].sprite;
            if (sprite && sprite._highlighted) {
                if (sprite._anim) {
                    sprite._anim.paused = true;
                }
                obj = {};
                for (p in opts) {
                    if (Ext.isObject(sprite._defaults[p])) {
                        obj[p] = {};
                        Ext.apply(obj[p], sprite._defaults[p]);
                    }
                    else {
                        obj[p] = sprite._defaults[p];
                    }
                }
                if (animate) {
                    //sprite._to = obj;
                    sprite._endStyle = obj;
                    sprite._anim = new Ext.fx.Anim({
                        target: sprite,
                        to: obj,
                        duration: me.highlightDuration || 150
                    });
                }
                else {
                    sprite.setAttributes(obj, true);
                }
                delete sprite._highlighted;
                //delete sprite._defaults;
            }
        }

        me.fireEvent('unhighlight');
    },

    cleanHighlights: function() {
        if (this.highlight === false) {
            return;
        }

        var group = this.group,
            markerGroup = this.markerGroup,
            i = 0,
            l;
        for (l = group.getCount(); i < l; i++) {
            delete group.getAt(i)._defaults;
        }
        if (markerGroup) {
            for (l = markerGroup.getCount(); i < l; i++) {
                delete markerGroup.getAt(i)._defaults;
            }
        }
    }
});
