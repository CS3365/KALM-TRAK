/**
 * @class Ext.chart.theme.EvenStyle
 * @ignore
 *
 * @xtype even
 */
Ext.ns('Ext.chart.theme');

Ext.chart.theme.EvenStyle = Ext.extend(Ext.chart.theme.Style, {
    
    constructor: function(config) {
        Ext.chart.theme.EvenStyle.superclass.constructor.call(this, config);
        this.style = false;
    },
    
    /* ---------------------------------
      Methods needed for ComponentQuery
     ----------------------------------*/
    
    isXType: function(xtype) {
        return xtype === 'even';
    }
});


