Ext.define('KALMTRAK.view.ScheduledEventsList', {
  extend: 'Ext.form.FieldSet',
  xtype: 'scheduledeventslist',
  
  requires: [
    'KALMTRAK.view.ScheduledEvent'
  ],

  config: {
    title: 'Events',
    id: 'ScheduledEventsList',
    items: [
      {
        docked: 'bottom',
        instructions: "Click add to add an event",
        layout: {
          type: 'hbox',
          align: 'center'
        },
        items: [
          {xtype: 'spacer'},
          {
            xtype: 'button',
            ui: 'confirm',
            iconCls: 'doc_new',
            iconMask: true,
            handler: function() {
              var lst = Ext.getCmp('ScheduledEventsList');
              lst.add({xtype:'scheduledevent'});
            }
          }
        ]
      }
    ]
  }
});
