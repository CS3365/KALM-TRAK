Ext.define('KALMTRAK.store.TrakerStore', {
  extend: 'Ext.data.TreeStore',
  requires: [
    'KALMTRAK.model.Traker'
  ],
  config: {
    model: 'KALMTRAK.model.Traker',
    defaultRootProperty: 'items',
    root: {
      text: 'KALMTRAK Trakkers',
      items: [
        {
          text: 'Brilliant Trakkers',
          items: [
            {
              text: 'Water',
              items: [
                { text: 'Still', leaf: true },
                { text: 'Sparkling', leaf: true }
              ]
            },
            { text: 'Soda', leaf: true }
          ]
        },
        {
          text: 'Normal Trakkers',
          items: [
            { text: 'Nuts', leaf: true },
            { text: 'Pretzels', leaf: true },
            { text: 'Wasabi Peas', leaf: true  }
          ]
        }
      ]
    }
  }
});
