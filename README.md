scrollMonitor
=============

The scroll monitor allows you to receive events when elements enter or exit the viewport. It does this using watcher objects, which watch an element and trigger events. Watcher objects also contain information about the element they watch, including the element's visibility and location relative to the viewport.

The scroll monitor was designed to be very fast. On each scroll event the DOM is only touched twice, once to find the document height and again to find the viewport top. No variables are declared, nor are any objects, arrays, or strings created.

The code is based on vanilla javascript and has no external dependencies. Except if you want to put it in the head of the document, then you'll need jQuery for the DOMContentLoaded event.

Watchers are _very_ cheap. Create them liberally.

[![browser support](http://ci.testling.com/sakabako/scrollMonitor.png)](http://ci.testling.com/sakabako/scrollMonitor)

## Basic Usage

```javascript
var scrollMonitor = require("./scrollMonitor"); // if you're not using require, you can use the scrollMonitor global.
var myElement = document.getElementById("itemToWatch");

var elementWatcher = scrollMonitor.create( myElement );

elementWatcher.enterViewport(function() {
    console.log( 'I have entered the viewport' );
});
elementWatcher.exitViewport(function() {
    console.log( 'I have left the viewport' );
});
```
## Demos

* [Stress Test](http://sakabako.github.com/scrollMonitor/demos/stress.html) - Test with as many watchers as you'd like
* [Fixed Positioning and Locking](http://sakabako.github.com/scrollMonitor/demos/fixed.html)
* [Anchored section headers](http://sakabako.github.com/scrollMonitor/demos/list.html)
* [Complex sidebar behavior](http://sakabako.github.com/scrollMonitor/demos/scoreboard.html)

## Watcher Objects

Create watcher objects with `scrollMonitor.create( watchItem )`. An optional second argument lets you receive events before or after this element enters the viewport. _See "[Offsets](#offsets)"_.

`watchItem` can be one of the following:

* **DOM Element** - the watcher will watch the area contained by the DOM element.
* **Object** - `obj.top` and `obj.bottom` will be used for watcher.top and watcher.bottom.
* **Number** - the watcher will watch a 1px area this many pixels from the top. Negative numbers will watch from the bottom.
* **jQuery object** - it will use the first DOM element.
* **NodeList** or **Array** - it will use the first DOM element.
* **string** - it will use the string as a CSS selector and watch the first match.

Watchers are automatically recalculated on the first scroll event after the height of the document changes.

### Events

Element watchers trigger six events:

* `visibilityChange` - when the element enters or exits the viewport.
* `stateChange` - similar to `visibilityChange` but is also called if the element goes from below the viewport to above it in one scroll event or when the element goes from partially to fully visible or vice versa.
* `enterViewport` - when the element enters the viewport.
* `fullyEnterViewport` - when the element is completely in the viewport [1].
* `exitViewport` - when the element completely leaves the viewport.
* `partiallyExitViewport` - when the element goes from being fully in the viewport to only partially [2].

1. If the element is larger than the viewport `fullyEnterViewport` will be triggered when the element spans the entire viewport.
2. If the element is larger than the viewport `partiallyExitViewport` will be triggered when the element no longer spans the entire viewport.

### Properties

* `elementWatcher.isInViewport` - true if any part of the element is visible, false if not.
* `elementWatcher.isFullyInViewport` - true if the entire element is visible [1].
* `elementWatcher.isAboveViewport` - true if any part of the element is above the viewport.
* `elementWatcher.isBelowViewport` - true if any part of the element is below the viewport.
* `elementWatcher.top` - distance from the top of the document to the top of this watcher.
* `elementWatcher.bottom` - distance from the top of the document to the bottom of this watcher.
* `elementWatcher.height` - top - bottom.
* `elementWatcher.watchItem` - the element, number, or object that this watcher is watching.
* `elementWatcher.offsets` - an object that determines the offsets of this watcher. _See "[Offsets](#offsets)"_.

1. If the element is larger than the viewport `isFullyInViewport` is true when the element spans the entire viewport.

### Methods

* `elementWatcher.on/off/one` - the standard event functions.
* `elementWatcher.recalculateLocation` - recalculates the location of the element in relation to the document.
* `elementWatcher.destroy` - removes this watcher and clears out its event listeners.
* `elementWatcher.lock` - locks this watcher at its current location. _See "[Locking](#locking)"_.
* `elementWatcher.unlock` - unlocks this watcher.

These methods are automatically called by the scrollMonitor, you should never need them:

* `elementWatcher.update` - updates the boolean properties in relation to the viewport. Does not trigger events.
* `elementWatcher.triggerCallbacks` - triggers any callbacks that need to be called.

### Locking

Sometimes you want to change the element you're watching, but want to continue watching the original area. One common use case is setting `position: fixed` on an element when it exits the viewport, then removing positioning when it when it reenters.

```javascript
var watcher = scrollMonitor.create( $element );
watcher.lock(); // ensure that we're always watching the place the element originally was

watcher.exitViewport(function() {
    $element.addClass('fixed');
});
watcher.enterViewport(function() {
    $element.removeClass('fixed');
});
```

Because the watcher was locked on the second line, the scroll monitor will never recalculate its location.

### Offsets

If you want to trigger an event when the edge of an element is near the edge of the viewport, you can use offsets. The offset is the second argument to `scrollMonitor.create`.

This will trigger events when an element gets within 200px of the viewport:
```javascript
scrollMonitor.create( element, 200 )
```

This will trigger when the element is 200px inside the viewport:
```javascript
scrollMonitor.create( element, -200 )
```

 If you only want it to affect the top and bottom differently you can send an object in.
 ```javascript
 scrollMonitor.create( element, {top: 200, bottom: 50})
 ```

 If you only want it to affect the top and not the bottom you can use only one property in.
 ```javascript
 scrollMonitor.create( element, {top: 200})
 ```

## scrollMonitor Module

### Methods
* `scrollMonitor.create( watchItem, offsets )` - Returns a new watcher. `watchItem` is a DOM element, jQuery object, NodeList, CSS selector, object with .top and .bottom, or a number.
* `scrollMonitor.update()` - update and trigger all watchers.
* `scrollMonitor.recalculateLocations()` - recalculate the location of all unlocked watchers and trigger if needed.

### Properties
* `scrollMonitor.viewportTop` - distance from the top of the document to the top of the viewport.
* `scrollMonitor.viewportBottom` - distance from the top of the document to the bottom of the viewport.
* `scrollMonitor.viewportHeight` - height of the viewport.
* `scrollMonitor.documentHeight` - height of the document.

