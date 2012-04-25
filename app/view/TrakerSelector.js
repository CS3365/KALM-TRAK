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
    title: 'KALMTRAK Trakkers',
    items: [
      {
        text: 'Brilliant Trakkers',
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
        text: 'Normal Trakkers',
        items: [
          { text: 'Nuts', leaf: true },
          { text: 'Pretzels', leaf: true },
          { text: 'Wasabi Peas', leaf: true  }
        ]
      }
    ]
  }
});

//var detailContainer = Ext.create('Ext.Container', {
Ext.define('KALMTRAK.view.DetailContainer', {
  extend: 'Ext.Container',
  xtype: 'ktselectorcontainer',
  layout: 'card',
  //xtype:'ktselector',
  flex: 1
});

Ext.define('KALMTRAK.view.KTList', {
  extend: 'Ext.NestedList',
  store: treeStore,
  detailContainer: detailContainer,
  detailCard: true,
  listeners: {
    leafitemtap: function(nestedList, list, index, target, record) {
      var detailCard = nestedList.getDetailCard();
      detailCard.setHtml('You selected: ' + record.get('text'));
    }
  },
  flex: 1
});

Ext.define('KALMTRAK.view.TrakerSelector', {
  extend: 'Ext.Container',
  layout: 'hbox',
  xtype:'ktselector',
  items: [
    {xtype: 'ktselectorcontainer'},
    {xtype: 'ktselectorlist'}
  ]
});

/*Ext.Viewport.add({
layout: 'hbox',
items: [
nestedList,
detailContainer,
]
});*/
