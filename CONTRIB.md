Contributing
===

Style Guide
---

This repository enforces [Google's TypeScript style guide](https://github.com/google/gts).

Ensure both linting and formatter are passing before commiting the code.

Merging Pull Requests
---

This repository enforces strict [semver](https://semver.org/), using [conventional commits](https://www.conventionalcommits.org/) via [semantic-release](https://github.com/semantic-release/semantic-release).

Each PR should be squash-merged and commit message modified to align to conventional commits.

> **Warning:** Merging to `main` branch automatically triggers a release to npmjs.org. So tread carefully.