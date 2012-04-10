Ext.define('KALMTRAK.profile.Tablet', {
  config: {
    controllers: [],
    views: ['Main'],  // refers to app/view/tablet/Main.js
  }

  isActive: function() {
    return Ext.os.is.Tablet || Ext.os.is.Desktop;
  },
  
  launch: function() {
    Ext.create('KALMTRAK.view.tablet.Main');
    this.callParent();
  }
});
