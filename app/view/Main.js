
Ext.define("KALMTRAK.view.Main", {
  extend: 'Ext.tab.Panel',
  requires: [
    'Ext.TitleBar',
    'KALMTRAK.view.Scheduler',
    'KALMTRAK.view.TrakerSelector',
	'KALMTRAK.view.SmartTrakerDescriptor',
	'KALMTRAK.view.BrilliantTrakerDescriptor'
  ],

  config: {
    tabBarPosition: 'bottom',
    fullscreen:true,
    zIndex:10,
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
      },
	  {
        title: '&nbsp;Smart TRAKer Details&nbsp;',
        iconCls: 'compose',
        layout: 'fit',
        items: {xtype:'ktsmartdescriptor'}
      },
	  {
        title: '&nbsp;Brilliant TRAKer Details&nbsp;',
        iconCls: 'compose',
        layout: 'fit',
        items: {xtype:'ktbrilliantdescriptor'}
      }
    ]
  }
});
