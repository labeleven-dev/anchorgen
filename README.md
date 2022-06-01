ANCHORGEN
===

[![Publish Status](https://github.com/labeleven-dev/anchorgen/actions/workflows/publish.yml/badge.svg)](https://github.com/labeleven-dev/anchorgen/actions/workflows/publish.yml) [![npm version](https://badge.fury.io/js/@lab11%2Fanchorgen.svg)](https://www.npmjs.com/package/@lab11/anchorgen) [![Known Vulnerabilities](https://snyk.io/test/github/labeleven-dev/anchorgen/badge.svg)](https://snyk.io/test/github/labeleven-dev/anchorgen) [![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

> This is a work-in-progress. Use at your own risk.

Reverse engineers an Anchor program's interface from its IDL.

This could be useful when invoking CPIs on a closed-source Anchor program.

Try it
---

```
anchor init jupiter

anchor idl fetch --provider.cluster mainnet JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo | \
npx @lab11/anchorgen JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo > jupiter/programs/jupiter/src/lib.rs

anchor build
```

Now you can use reference it in your program's `Cargo.toml` as a depedency:

```toml
[dependencies]
jupiter = { path = "../../../jupiter/programs/jupiter", features = ["cpi", "no-entrypoint"] }
```

See `npx @lab11/anchorgen --help` for more info.

Features
---

Tested with Anchor 0.24.x.

- [x] Instrcutions
- [x] Accounts
- [ ] Accounts: Nested
- [x] Types: Primitives
- [x] Types: Struct
- [x] Types: Enum
- [x] Types: Option & COption
- [x] Types: Vector & Array
- [x] Errors
- [ ] Constants
- [ ] State
- [ ] Events
- [ ] Metadata
- [ ] Docs (waiting for <https://github.com/project-serum/anchor/pull/1561> to make it to a canonical release)

Contributing
---

Pull requests and GitHub Issues are welcome.