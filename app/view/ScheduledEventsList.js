Ext.define('KALMTRAK.view.ScheduledEventsList', {
  extend: 'Ext.form.FieldSet',
  xtype: 'scheduledeventslist',
  
  requires: [
    'KALMTRAK.view.ScheduledEvent'
  ],

  config: {
    title: 'Events',
    items: [
      {
        docked: 'bottom',
        layout: {
          type: 'hbox',
          align: 'center'
        },
        items: [
          {xtype: 'spacer'},
          {
            xtype: 'button',
            ui: 'action',
            iconCls: 'doc_new',
            iconMask: true
          }
        ]
      }, {
        xtype: 'scheduledevent'
      }, {
        xtype: 'scheduledevent'
      }
    ]
  }
});
