Ext.define('KALMTRAK.view.ScheduledTrakerStatus', {
  extend: 'Ext.Container',
  xtype: 'ktschedtrakerstatus',

  requires: [
    'KALMTRAK.view.TrakerStatus'
  ],

  config: {
    layout: {
      type: 'hbox'
    },
    items: [
      {
        xtype: 'ktstatus',
        flex: 1
      },
      {
        xtype: 'button',
        ui: 'decline',
        iconCls: 'delete',
        iconMask: true,
        handler: function() {
          var pt = this.getParent();
          pt.getParent().remove(pt);
        }
      }
    ]
  }
});
