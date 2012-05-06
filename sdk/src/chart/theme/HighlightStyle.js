/**
 * @class Ext.chart.theme.HighlightStyle
 * @ignore
 *
 * @xtype marker
 */
Ext.ns('Ext.chart.theme');

Ext.chart.theme.HighlightStyle = Ext.extend(Ext.chart.theme.Style, {
    
    constructor: function(config) {
        Ext.chart.theme.HighlightStyle.superclass.constructor.call(this, config);
        this.style  = false;
    },
    
    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/
    
    isXType: function(xtype) {
        return xtype === 'highlight';
    },
    
    getRefItems: function(deep) {
        return [];
    }
});



