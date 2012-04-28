
Ext.define("KALMTRAK.view.Main", {
  extend: 'Ext.tab.Panel',
  requires: [
    'Ext.TitleBar',
    'KALMTRAK.view.Scheduler',
    'KALMTRAK.view.TrakerSelector'
  ],

  config: {
    tabBarPosition: 'bottom',
    fullscreen:true,
    zIndex:10,
    items: [
	  {
		title: 'KALMTRAK',
		iconCls: 'home',
		items: [
			{
				xtype: 'image',
				height:400,
				width:1000,
				centered:true,
				src: '../../resources/icons/KALMTRAK_Logo.png'
			}
		]
      },
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
              },
              {    xtype: 'toolbar',
                layout: { pack: 'center' },
                items: [
                  {
                    xtype: 'button',
                    text: 'Submit',
                    handler: function() {
                      Ext.Msg.alert('Form Values', JSON.stringify(formPanel.getValues(), null, 2));
                    }
                  },
                  {
                    xtype: 'button',
                    text: 'Remember Me',
                    handler: function() {
                      formPanel.reset();
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        title: 'Scheduler',
        iconCls: 'calendar2',
        layout: 'fit',
        items: {xtype:'ktscheduler'}
      },
	  {
        title: 'Controller',
        iconCls: 'settings',
        layout: 'fit',
        items: {xtype:'ktselector'}
      }
    ]
  }
});
