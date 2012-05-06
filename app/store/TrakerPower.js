Ext.define('KALMTRAK.store.TrakerPower', {
  extend: 'Ext.data.Store',
  //alias: 'store.TrakerPower',

  /*requires: [
    'KALMTRAK.model.Power'
  ],*/

  config: {
    model: 'KALMTRAK.model.Power',
    proxy: {
      type: 'ajax',
      url: '/webFunctions.php',
      reader: {
        type: 'json',
        rootProperty: 'data'
      },
      headers: {
        action: 'plotTraker'
      },
      autoload: true
    }
    , listeners: {
      beforeload: function() {
        console.log("should be loading webFunctions.php");
      }
    }
  }
});
