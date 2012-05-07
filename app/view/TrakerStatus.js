Ext.define('KALMTRAK.view.TrakerStatus', {
  extend: 'Ext.form.Toggle',
  xtype: 'ktstatus',

  config: {
    label: 'TRAKer Selected',
	style: 'margin-top:20%;background:-webkit-gradient(linear, left top, left bottom, color-stop(0%,#FFFFFF), color-stop(100%,#1d82c8));',
    value: 1
  }
});
