Ext.define('KALMTRAK.view.TrakerStatus', {
  extend: 'Ext.form.Toggle',
  xtype: 'trakerstatus',

  config: {
    label: 'TRAKer n',
    width: '100%',
    value: 1
    /*layout: {
      type: 'hbox',
      align: 'center'
    },
    items: [
      {
        html: 'TRAKer n'
      }, {
        xtype: 'spacer'
      }, {
        xtype: 'togglefield',
        labelCls: 'x-form-field',
        value: 1
      }
    ]*/
  }
});
