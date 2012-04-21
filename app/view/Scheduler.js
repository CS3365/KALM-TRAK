Ext.define("KALMTRAK.view.Scheduler", {
  extend: "Ext.form.Panel",
  xtype: 'ktscheduler',
  requires: [
    'Ext.ux.field.DateTimePicker',
    'Ext.form.Panel'
  ],
  config: {
    title: 'Scheduler',
    items: [
      {
        xtype: 'fieldset',
        title: 'Duration',
        instructions: 'duration instructions in app/view/scheduler.js',
        items: [
          {
            xtype: 'datetimepickerfield',
            label: 'Begin',
            name: 'schedBegin',
            value: new Date(),
            dateTimeFormat: 'm/d/Y g:iA',
            picker: {
              yearFrom: 2010,
              yearTo: 2030,
              minuteInterval: 5,
              ampm: true,
              slotOrder: ['month', 'day', 'year','hour','minute','ampm']
            }
          }, {
            xtype: 'datetimepickerfield',
            label: 'End',
            name: 'schedEnd',
            value: new Date(),
            dateTimeFormat: 'm/d/Y g:iA',
            picker: {
              yearFrom: 2010,
              yearTo: 2030,
              minuteInterval: 5,
              ampm: true,
              slotOrder: ['month', 'day', 'year','hour','minute','ampm']
            }
          }, {
            xtype: 'selectfield',
            label: 'Days of Week',
            options: [
              {text: 'Everyday', value: 'everyday'},
              {text: 'Monday - Friday', value: 'm-f'},
              {text: 'Monday, Wednesday, Friday', value: 'mwf'},
              {text: 'Tuesday, Thursday', value: 'tr'},
              {text: 'Weekends', value: 'satsun'}
            ]
          },
          /*//every day checkbox
          {
            xtype: 'checkboxfield',
            label: 'Sunday',
            name: 'schedSun',
            checked: false
          }, {
            xtype: 'checkboxfield',
            label: 'Monday',
            name: 'schedMon',
            checked: true
          }, {
            xtype: 'checkboxfield',
            label: 'Tuesday',
            name: 'schedTue',
            checked: false
          }, {
            xtype: 'checkboxfield',
            label: 'Wednesday',
            name: 'schedWed',
            checked: true
          }, {
            xtype: 'checkboxfield',
            label: 'Thursday',
            name: 'schedThu',
            checked: false
          }, {
            xtype: 'checkboxfield',
            label: 'Friday',
            name: 'schedFri',
            checked: true
          }, {
            xtype: 'checkboxfield',
            label: 'Saturday',
            name: 'schedSat',
            checked: false
          }//*/
        ]
      }
    ]
  }
});
