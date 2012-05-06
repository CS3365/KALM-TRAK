/**
 * @class Ext.chart.theme.Theme
 * @ignore
 */
Ext.ns('Ext.chart.theme');

//TODO(nico): I'm pretty sure this shouldn't be here.
Ext.ComponentQuery.pseudos['nth-child'] = function(items, value) {
    var index = +value -1;
    if (items[index]) {
        return [items[index]];
    }
    return [];
};

Ext.ComponentQuery.pseudos.highlight = function(items, value) {
    var i = 0, 
        j = 0,
        l = items.length,
        ans = [],
        item, refItems, refItem, lRefItems;

    for (; i < l; ++i) {
        item = items[i];
        if (item.isXType && item.isXType('highlight')) {
            ans.push(item);
        }
        if (item.getRefItems) {
            refItems = item.getRefItems(true);
            for (j = 0, lRefItems = refItems.length; j < lRefItems; ++j) {
                refItem = refItems[j];
                if (refItem.isXType && refItem.isXType('highlight')) {
                    ans.push(refItem);
                }
            }
        }
        
    }
    return ans;
};

Ext.chart.theme.Theme = Ext.extend(Object, {
    theme: 'Base',
    themeInitialized: false,

    applyStyles: function(themeName) {
        if (this.themeInitialized) {
            return;
        }
        //http://www.w3.org/TR/css3-selectors/#specificity.
        var me = this,
            root = {

                getRefItems: function() {
                    return [me];
                },

                isXType: function() {
                    return false;
                },

                initCls: function() {
                    return [];
                },

                getItemId: function() {
                    return '';
                }
            },
            themes = [Ext.chart.theme.Base.slice()],
            i = 0,
            n = 0,
            results = [],
            res, selector, style, rule, j, matches, lmatches, ln, l, configs;

        if (themeName || me.theme != 'Base') {
            themes.push(Ext.chart.theme[themeName || me.theme].slice());
        }

        for (ln = themes.length; n < ln; ++n) {
            configs = themes[n];
            l = configs.length;

            //sort by specificity
            configs.sort(function(a, b) {
                var sa = a.specificity,
                    sb = b.specificity;

                return sb[0] < sa[0] || (sb[0] == sa[0] && sb[1] < sa[1])
                    || (sb[0] == sa[0] && sb[1] == sa[1] && sb[2] < sa[2]);
            });

            for (i = 0; i < l; ++i) {
                rule = configs[i];
                selector = rule.selector;
                style = rule.style;
                matches = Ext.ComponentQuery.query(selector, root);
                results.push.apply(results, matches);
                for (j = 0, lmatches = matches.length; j < lmatches; ++j) {
                    matches[j].themeStyle = Ext.apply(matches[j].themeStyle || {}, style);
                }
            }
        }

        //Now get all themable elements and apply the themed styles to their style objects.
        //This way we can get the resulting cascaded style `themeStyle` (calculated above) and apply it to the
        //`style` property without overriding the options made by the user.
        for (j = 0, lmatches = results.length; j < lmatches; ++j) {
            res = results[j];
            res.style = Ext.applyIf(res.style || {}, res.themeStyle || {});
        }

        me.themeInitialized = true;
    }
});
