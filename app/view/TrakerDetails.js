Ext.define('KALMTRAK.view.TrakerDetails', {
  extend: 'Ext.Container',
  xtype: 'ktdetails',
  config: {
    id: 'TrakerDetails',
	//style: 'background:-webkit-gradient(linear, left top, left bottom, color-stop(0%,#1d82c8), color-stop(100%,#FFFFFF));',
    layout: 'card',
    flex: 2,
	height:300,
	items:{ xtype:'ktstatus'}
  }
});
