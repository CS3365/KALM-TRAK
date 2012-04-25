Ext.define('ListItem', {
    extend: 'Ext.data.Model',
    config: {
        fields: ['text']
    }
});

var treeStore = Ext.create('Ext.data.TreeStore', {
    model: 'ListItem',
    defaultRootProperty: 'items',
    root: {
		text: 'KALMTRAK Trakkers',
        items: [
            {
                text: 'Drinks',
                items: [
                    {
                        text: 'Water',
                        items: [
                            { text: 'Still', leaf: true },
                            { text: 'Sparkling', leaf: true }
                        ]
                    },
                    { text: 'Soda', leaf: true }
                ]
            },
            {
                text: 'Snacks',
                items: [
                    { text: 'Nuts', leaf: true },
                    { text: 'Pretzels', leaf: true },
                    { text: 'Wasabi Peas', leaf: true  }
                ]
            }
        ]
    }
});

var detailContainer = Ext.create('Ext.Container', {
    layout: 'card',
	zIndex:1,
    flex: 1
});

var nestedList = Ext.create('Ext.NestedList', {
    store: treeStore,
    detailContainer: detailContainer,
    detailCard: true,
	zIndex:1,
	xtype:'ktselector',
    listeners: {
        leafitemtap: function(nestedList, list, index, target, record) {
            var detailCard = nestedList.getDetailCard();
            detailCard.setHtml('You selected: ' + record.get('text'));
        }
    },
    flex: 1
});

Ext.Viewport.add({
    layout: 'hbox',
    items: [
        nestedList,
        detailContainer
    ]
});