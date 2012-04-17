Ext.define("KALMTRAK.view.Main", {
    extend: 'Ext.tab.Panel',
    requires: ['Ext.TitleBar'],
    
    config: {
        tabBarPosition: 'bottom',
        
        items: [
            {
                title: 'Home',
                iconCls: 'home',
                
                styleHtmlContent: true,
                scrollable: true,

                items: {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: 'Welcome to KALMTRAK'
                },
                {
                var formPanel = Ext.create('Ext.form.Panel', {

					items: [{
						xtype:'fieldset',
						items: [{
							xtype: 'textfield',
							name : 'username',
							label: 'Username:'
						},
						{
							xtype: 'passwordfield',
							name : 'password',
							label: 'Password:'
						}]
                
					}]
				})
				}
            },
            {
                title: 'Get Started',
                iconCls: 'action',
                
                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Getting Started'
                    },
                    {
                        xtype: 'video',
                        url: 'http://av.vimeo.com/64284/137/87347327.mp4?token=1330978144_f9b698fea38cd408d52a2393240c896c',
                        posterUrl: 'http://b.vimeocdn.com/ts/261/062/261062119_640.jpg'
                    }
                ]
            }
        ]
    }
});
/*Ext.define("KALMTRAK.view.Main", {
    extend: 'Ext.tab.Panel',
    requires: ['Ext.TitleBar','Ext.ActionSheet','Ext.form.Panel'],
    
    config: {
        tabBarPosition: 'bottom',
        
        items: [
            {
                title: 'KALMTRAK',
                iconCls: 'home',
                
                //styleHtmlContent: true,
                //scrollable: true,
				var formPanel = Ext.create('Ext.form.Panel', {
					fullscreen: true,

					items: [{
						xtype:'fieldset',
						items: [{
							xtype: 'textfield',
							name : 'username',
							label: 'Username:'
						},
						{
							xtype: 'passwordfield',
							name : 'password',
							label: 'Password:'
						}]
                
					}],
				});
				formPanel.add({
					xtype: 'toolbar',
					//docked: 'bottom',
					layout: { pack: 'center' },
					items: [
						{
							xtype: 'button',
							text: 'Remember Me?',
							handler: function() {
								formPanel.setValues({
									username: 'mKent',
									password: 'secret'
								})
							}
						},
						{
							xtype: 'button',
							text: 'Login',
							handler: function() {
								Ext.Msg.alert('Form Values', JSON.stringify(formPanel.getValues(), null, 2));
							}
						},
						{
							xtype: 'button',
							text: 'Reset',
							handler: function() {
								formPanel.reset();
							}
						}
					]
				});
			}
            {
                title: 'Get Started',
                iconCls: 'action',
                
                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Getting Started'
                    },
                    {
                        xtype: 'video',
                        url: 'http://av.vimeo.com/64284/137/87347327.mp4?token=1330978144_f9b698fea38cd408d52a2393240c896c',
                        posterUrl: 'http://b.vimeocdn.com/ts/261/062/261062119_640.jpg'
                    }
                ]
            }
        ]
    }
});*/