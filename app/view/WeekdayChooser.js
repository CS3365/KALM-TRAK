Ext.define('KALMTRAK.view.WeekdayChooser', {
  extend: 'Ext.field.Field',
  xtype: 'weekdaychooserfield',

  config: {
    isField: false,
    component: {
      xtype: 'segmentedbutton',
      allowMultiple: true,
      pressedCls: 'x-button-confirm',
      ui: 'decline',
      items: [
        {text: 'S'},
        {text: 'M'},
        {text: 'T'},
        {text: 'W'},
        {text: 'R'},
        {text: 'F'},
        {text: 'S'}
      ]
    }
  }
});
      /*xtype: 'panel',
      layout: {
        type: 'hbox',
        align: 'top'
      },
      items: [
        {
          xtype: 'segmentedbutton',
          allowMultiple: true,
          items: [
            {text: 'S'},
            {text: 'M'},
            {text: 'T'},
            {text: 'W'},
            {text: 'R'},
            {text: 'F'},
            {text: 'S'}
          ]
        },
        /*{
          xtype: 'checkboxfield',
          label: 'S',
          name: 'Sun',
          labelWidth: '50%',
          flex: 1
        }, {
          xtype: 'checkboxfield',
          label: 'M',
          name: 'Mon',
          labelWidth: '50%',
          flex: 1
        }, {
          xtype: 'checkboxfield',
          label: 'T',
          name: 'Tue',
          labelWidth: '50%',
          flex: 1
        }, {
          xtype: 'checkboxfield',
          label: 'W',
          name: 'Wed',
          labelWidth: '50%',
          flex: 1
        }, {
          xtype: 'checkboxfield',
          label: 'R',
          name: 'Thu',
          labelWidth: '50%',
          flex: 1
        }, {
          xtype: 'checkboxfield',
          label: 'F',
          name: 'Fri',
          labelWidth: '50%',
          flex: 1
        }, {
          xtype: 'checkboxfield',
          label: 'S',
          name: 'Sat',
          labelWidth: '50%',
          flex: 1
        }*
      ]
    }
  }
});//*/
