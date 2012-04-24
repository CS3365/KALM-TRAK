
Ext.define("KALMTRAK.view.Main", {
  extend: 'Ext.tab.Panel',
  requires: [
    'Ext.TitleBar',
    'KALMTRAK.view.Scheduler'
	//'KALMTRAK.view.TrakerList.js'
  ],

  config: {
    tabBarPosition: 'bottom',
    items: [
	  {
        title: 'Login',
        iconCls: 'star',
        xtype: 'formpanel',
        items: [
          {
            xtype: 'fieldset',
            title: 'KALMTRAK Login',
            items: [
              {
                xtype: 'textfield',
                name : 'name',
                label: 'Username:'
              },
              {
                xtype: 'passwordfield',
                name : 'password',
                label: 'Password:'
              }
            ]
          },
		  {
			xtype: 'button',
            text: 'Login'
            /*handler: function() {
                Ext.Msg.alert('Form Values', JSON.stringify(formPanel.getValues(), null, 2));
            }*/
		  }
        ]
      },
      {
        title: 'Scheduler',
        iconCls: 'calendar2',
        layout: 'fit',
        items: {xtype:'ktscheduler'}
      }
    ]
  }
});
