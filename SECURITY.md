# Security Policy

## Supported Versions

Only the current latest release is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of **Stellar Hooks** seriously. If you discover a security vulnerability, please report it by either of the following methods:

- **GitHub Private Vulnerability Reporting**: Use the ["Report a Vulnerability"](https://github.com/dark-princezz/stellar-hooks/security/advisories/new) feature under the repository's Security tab.
- **Email**: Send details to the project maintainers at [stellar-hooks-security@googlegroups.com](mailto:stellar-hooks-security@googlegroups.com).

Please do **not** report security vulnerabilities via public GitHub issues or discussions.

## What to Include

When reporting, please include as much of the following information as possible:

- A description of the vulnerability
- Steps to reproduce
- Affected versions and configurations
- Potential impact and exploitability

## Disclosure Policy

We follow a coordinated disclosure process:

1. The report is acknowledged within **48 hours**.
2. A fix is validated and prepared for the next patch release.
3. Once a fix is released, the vulnerability is publicly disclosed.

We aim to release fixes as quickly as possible, typically within **7 days** of confirmation.

## Preferred Encryption

If you need to encrypt sensitive information, you may use our PGP key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGP6G6MBEAC...
-----END PGP PUBLIC KEY BLOCK-----
```

You can also fetch the key from public keyservers:

```
gpg --keyserver keys.openpgp.org --search-keys stellar-hooks-security@googlegroups.com
```

## Recognition

We thank all reporters who follow responsible disclosure practices. With your permission, we will acknowledge your contribution in the release notes once the fix is published.
