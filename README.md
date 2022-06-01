ANCHORGEN
===

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
- [x] Errors
- [ ] Constants
- [ ] State
- [ ] Events
- [ ] Metadata
- [ ] Docs
- [ ] Vectors

Contributing
---

Pull requests and GitHub Issues are welcome.