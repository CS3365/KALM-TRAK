Ext.define('KALMTRAK.view.SmartTrakerDescriptor', {
  extend: 'Ext.Container',
  xtype: 'ktsmartdescriptor',
  requires: [
    'KALMTRAK.view.TrakerStatus'
  ],
  config: {
    items: [
      {
		xtype: 'ktstatus'
      }
    ]
  }
});