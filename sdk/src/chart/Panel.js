Ext.chart.Panel = Ext.extend(Ext.Panel, {

    defaultType: 'chart',
    layout: 'fit',

    constructor: function(config) {
        config.dockedItems = {
            xtype: 'panel',
            height: '2.6em',
            dock: 'top',
            layout: {
                type: 'card',
                align: 'stretch'
            },
            activeItem: 0,
            dockedItems: {
                dock: 'right',
                xtype: 'toolbar',
                ui: 'light',
                items: config.dockedItems
            },
            items: [{
                dock: 'top',
                xtype: 'toolbar',
                ui: 'light',
                title: config.title || ''
            }, {
                dock: 'top',
                xtype: 'toolbar',
                ui: 'light',
                title: ''
            }]
        };

        Ext.chart.Panel.superclass.constructor.call(this, config);
    },

    onRender: function() {
        var me = this,
            headerPanel;
        Ext.chart.Panel.superclass.onRender.apply(me, arguments);
        headerPanel = me.headerPanel = me.dockedItems.get(0);
        me.descriptionPanel = headerPanel.items.get(1);
    }
});
