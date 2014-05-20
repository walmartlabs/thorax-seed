Application.Collection = Thorax.Collection.extend({
  sync: function(method, model, options) {
    // WARN: This is a quick hack for the purposes of the demo.
    // https://github.com/walmartlabs/thorax/issues/371 has been filed to create a better impl
    var url = this.url();
    if (method === 'read' && window.$serverCache && $serverCache[url]) {
      options.success($serverCache[url]);
    } else {
      return Thorax.Collection.prototype.sync.apply(this, arguments);
    }
  }
});
