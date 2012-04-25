Ext.define('KALMTRAK.view.TrakerSelector', {
  extend: 'Ext.Container',
  xtype:'ktselector',
  requires: [
    'KALMTRAK.view.TrakerDetails',
    'KALMTRAK.store.TrakerStore'
  ],
  config: {
    layout: 'hbox',
    items: [
      {
        xtype: 'nestedlist',
        store: 'TrakerStore',
        //detailContainer: 'TrakerDetails',
        //detailCard: true,
        flex: 1,
        listeners: {
          leafitemtap: function(nestedList, list, index, target, record) {
            var detailCard = nestedList.getDetailCard();
            detailCard.setHtml('You selected: ' + record.get('text'));
          }
        }
      },
      {
        xtype: 'ktdetails'
      }
    ]
  }
});
