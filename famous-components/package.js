Package.describe({
  name: "gadicohen:famous-components",
  summary: "Deprecated: Use 'gadicohen:famous-views' instead.",
  version: '0.1.2'
});

Package.on_use(function (api) {
  api.use('gadicohen:famous-views@0.1.4', 'client');
  api.imply('gadicohen:famous-views', 'client');

  api.add_files('warning.js', 'client');

  // XXX COMPAT WITH PACKAGES BUILT FOR 0.9.0.
  //
  // (in particular, packages that have a weak dependency on this
  // package, since then exported symbols live on the
  // `Package.deps` object)
  api.export('FView', 'client');
  api.export('famousCmp', 'client');
});
