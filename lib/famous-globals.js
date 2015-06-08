/*
 * Commonly used famous stuff that we can share throughout the package
 */

FamousEngine = null;
Size = null;
Color = null;

// Called from first FView.ready() and before FView.init()
setGlobals = function() {
  FamousEngine = FView._FamousEngine = famous.core.FamousEngine;
  Size = famous.components.Size;  // component?  not really a common global
  Color = famous.utilities.Color;
}