// This configures our Application object with values
// from the lumbar config, then sets it as the exported
// value from the base module.
_.extend(Application, module.exports);
module.exports = Application;