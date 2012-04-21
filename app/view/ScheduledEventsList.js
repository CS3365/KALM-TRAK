Ext.define('KALMTRAK.view.ScheduledEventsList', {
  extend: 'Ext.form.FieldSet',
  xtype: 'scheduledeventslist',

  config: {
    title: 'Events',
    items: [
      {
        xtype: 'button',
        text: 'Add Event',
      }
    ]
  }
});
