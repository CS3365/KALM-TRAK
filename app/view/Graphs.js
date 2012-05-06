Ext.define('KALMTRAK.view.Graphs', {
  extend: 'Ext.chart.Chart',
  xtype: 'ktgraphs',

  requires: [
    'KALMTRAK.store.TrakerPower'
  ],

  config: {
    store: 'KALMTRAK.store.TrakerPower'
  }
});
