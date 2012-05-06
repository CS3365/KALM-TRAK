/**
 * @class Ext.chart.theme.CalloutStyle
 * @ignore
 *
 * @xtype marker
 */
Ext.ns('Ext.chart.theme');

Ext.chart.theme.CalloutStyle = Ext.extend(Ext.chart.theme.Style, {
    
    constructor: function(config) {
        Ext.chart.theme.CalloutStyle.superclass.constructor.call(this, config);
        this.style  = false;
        this.oddStyle = new Ext.chart.theme.OddStyle();
        this.evenStyle = new Ext.chart.theme.EvenStyle();
    },
    
    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/
    
    isXType: function(xtype) {
        return xtype === 'callout';
    },
    
    getRefItems: function(deep) {
        return [];
    }
});


