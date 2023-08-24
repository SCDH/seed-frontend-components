# SEED Frontend Components

A collection of [web
components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
for building frontends for electronic editions.

Developing web components does not entail a decision to use a certain
JS framework. They are framework-agnostic.  They can even be
integrated in Imperia or other CMSs.

## List of Web Components

- `<seed-synopsis>`: a container in a synopsis setup
- `<seed-synopsis-text>`: an single HTML text in a `<iframe>` element with synoptical features

## Usage Examples

- [Jiob Frontend](https://zivgitlab.uni-muenster.de/SCDH/schnocks-ijob/hiob-synopsis-frontend)


## Installation

Install from the [npm registry](-/packages/6733)!

### Registry set up

```shell
echo @scdh:registry=https://zivgitlab.uni-muenster.de/api/v4/projects/6840/packages/npm/ >> .npmrc
```

### Install

```shell
npm i @scdh/seed-frontend-components
```

## Design Principles / Contributing

1. Follow the **events up; properies down** principle.

1. Write components the [Lit](https://lit.dev/docs/) way.

1. Prefer TS over JS.

1. Do not configure the TS compiler to be tolerant when type checking.

## Further Reading

- [Lit documentation](https://lit.dev/docs/)

- [Vite guide](https://vitejs.dev/guide/)
