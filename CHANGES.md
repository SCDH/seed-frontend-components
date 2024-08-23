# Changes

## 0.8.0

- highlight selected annotations and annotations hovered over
- default color for highlighting annotations

## 0.7.0

- renamed `seed-synopsis-text` to `seed-text-view`:
  - removed all items from the status bar and made it a slot for child elements
  - minimize updates that result to re-rendering of the component and
    thus of the text in it
  - allow to render a text from the textSlice choosen by `textId`
- `seed-state-scroll-position` as child component for the status slot
  of text views
- `seed-state-sync-others` as child component for the status slot
  of text views

## 0.6.5

- `seed-synopsis-text`:
  - more robust to coors by comparing event sources instead of locations
  - initial values for variables in js injections

## 0.6.4

- fixed #27

## 0.6.1-3

- silent fixes
- examples no longer deployed, because they do not work as expected

## 0.6.0

- redux-based scrolling on synopsis
  - scroll targets can either be determined by regex or by a mapping
  - allow for manual entering of scroll target
- `seed-config`
  - all fetched data except specific to a certain text view is fetched
    through this element. So this takes functions that was in other
    elements before: in `seed-annotations-*` and `seed-synopsis`:
    - annotations via `annotations-url` attribute
	- ontology via `ontology-urls` attribute
    - alignments via `regex-alignment` or `mapping-alignment` attribute
- `seed-config-text`
  - experimentally load a text via this custom element, which has no display.
- `seed-annotations-permanent`
  - is a window and a pure view component now
  - remove attributes `annotations-url` and `ontology-urls`
- use CSS flex box model for setting the size of synopsis texts
  instead of widget size provider/consumer
- `seed-synopsis` is deprecated
- added `figures.html` example
- deploy examples in gitlab pages

## 0.5.10

- `seed-synopsis`
  - fixed default values for width and height
- more robost implementation of window state

## 0.5.3...9

- fix issues #23 and #24

## 0.5.2

- export all new stuff via `main.ts`

## 0.5.0

- connect to Redux store via
  [context](https://lit.dev/docs/data/context/) instead of using
  `pwa-helper` mixin
  - thus, the Redux store instance is no longer hard-wired into the
    component
  - this enables the use of the components with any Redux store that
    extends the `SeedStore`
- introduced `seed-app` web component
  - provides a `SeedStore` as context
- introduced mixins
  - `storeConsumerMixin` for connecting a custom component to a Redux
    store providing a `SeedStore`
  - `windowMixin` for adding window functionality to a widget,
    i.e. expose functions for minimizing, maximizing, disposing a
    window to the user
  - `widgetSizeProvider` for providing size information for widget
    children via context
  - `widgetSizeConsumer` for widget that require size information from
    an anchestor
- `seed-synopsis` and `seed-synopsis-text` use these new mixin now

## 0.4.*

- introduced Redux (RTK) for state management
