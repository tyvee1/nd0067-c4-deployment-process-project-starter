# Application dependencies

What each part of the system depends on, and why.

## Runtime requirements

| Requirement | Version | Why |
| --- | --- | --- |
| Node.js | v14.15 per the course; v14 to v22 supported here | See the Node version note in the root README. The build routes through `scripts/node-compat.js`, which handles the OpenSSL 3 difference between versions. |
| npm | ships with Node | |
| PostgreSQL | 12 or 13 | Provided by RDS; only a client is needed locally. |
| AWS CLI | v2 | Deployment only. |
| EB CLI | current | Deployment only. |

## Backend — `udagram/udagram-api`

| Package | Role |
| --- | --- |
| `express`, `body-parser`, `cors` | HTTP layer and request parsing. |
| `sequelize`, `sequelize-typescript`, `pg`, `reflect-metadata` | ORM and the PostgreSQL driver. |
| `aws-sdk` | Generates pre-signed S3 URLs so uploads go to the media bucket directly, without passing through the API. |
| `jsonwebtoken`, `bcryptjs` | Authentication: token issuing and password hashing. |
| `dotenv` | Loads environment variables for local runs. |
| `email-validator` | Input validation on registration. |

Development-only: `typescript`, `ts-node-dev`, `eslint` and the
`@typescript-eslint` plugins, `@types/*`.

**Note on `aws-sdk`.** This is AWS SDK for JavaScript v2, which has reached
end of support. It is retained because it is what the supplied application
uses and migrating to v3 is outside this project's scope. A production system
would migrate.

## Frontend — `udagram/udagram-frontend`

| Package | Role |
| --- | --- |
| `@angular/*` 8.2 | Application framework. |
| `@ionic/angular` 4, `@ionic-native/*` | UI components and native wrappers. |
| `rxjs`, `zone.js`, `core-js` | Reactive primitives, change detection, polyfills. |

Development-only: `@angular/cli`, `@angular-devkit/build-angular`, `typescript`,
`tslint` and `codelyzer`, `karma` with `jasmine`, `protractor`.

## Why the versions are not upgraded

`package.json` is the authority for this project, and it is committed exactly
as supplied. The course material, its conventions and its tslint configuration
are written against the versions it declares, and upgrading Angular would
change the build system, the linter and the test runner at once.

## The supplied lockfiles do not match the supplied package.json

This is a property of the starter, measured rather than assumed, and it
changes how the project must be installed.

The archive ships a `package-lock.json` from an earlier generation of the
project than its own `package.json`. In `udagram-api`, `package.json` declares
`sequelize ^6.26.0`, `sequelize-typescript ^2.1.5`, `typescript ^4.2.3`,
`eslint ^6.8.0` and `pg ^8.7.1`, while the shipped lockfile pins
`sequelize 5.21.4`, `sequelize-typescript 0.6.10` and `typescript 3.9.10`, and
contains no `eslint` at all. A caret range cannot cross a major version, so
these two files cannot both be satisfied.

`npm ci` installs a lockfile exactly and refuses when it disagrees with
`package.json`. Against the unmodified archive it reports:

```
npm error Invalid: lock file's ms@2.1.2 does not satisfy ms@2.1.3
```

`npm install` is therefore the required verb here, not a preference: it
resolves from `package.json`, which is the file that expresses what the
project is written against. A consequence is that both `package-lock.json`
files are regenerated on first install — in `udagram-api` 21 packages change
version, 2 are added and 6 removed; in `udagram-frontend` 31 change, 24 are
added and 1 removed — and the regenerated files are what this submission
carries. They are reproducible from `package.json` and this `npm` major, and
they are not the files the archive shipped.

What a reviewer should expect: `npm install` succeeds, `npm ci` does not. The
lockfiles in this repository are an output of the install, not an input to it.

## Dependency changes made for this submission

No runtime dependency was added. Anything added for tooling is in
`devDependencies`, per the project rubric.
