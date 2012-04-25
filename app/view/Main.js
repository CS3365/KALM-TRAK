
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

formPanel.add({
    xtype: 'toolbar',
    docked: 'bottom',
    layout: { pack: 'center' },
    items: [
        {
            xtype: 'button',
            text: 'Set Data',
            handler: function() {
                formPanel.setValues({
                    name: 'Ed',
                    password: 'secret'
                })
            }
        },
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
});
