# Contributing to Stellar Hooks

Thank you for your interest in contributing to **Stellar Hooks**. We appreciate your time and effort in helping improve the project. Whether you're fixing bugs, implementing new features, or enhancing documentation, your contributions are valued.

## Getting Started

### 1. Fork and Clone the Repository

Fork the repository to your GitHub account, then clone your fork locally.

```bash
git clone https://github.com/<your-username>/stellar-hooks.git
cd stellar-hooks
```

### 2. Install Dependencies

Install the project dependencies using your preferred package manager.

```bash
npm install
```

### 3. Create a Feature Branch

Create a new branch for your changes using a descriptive name.

```bash
git checkout -b feature/your-feature-name
```

## Development

Before submitting your changes, ensure the project builds successfully and all tests pass.

### Run Tests

```bash
npm test
```

### Build the Project

```bash
npm run build
```

### Error handling convention

Every hook in this library that can fail during a transaction (build, sign,
submit, or poll) returns a `StellarTransactionError` object — never a plain
`Error` instance:

```ts
type StellarTransactionError =
  | { type: "network"; message: string }
  | { type: "transaction"; resultCode: string; message: string }
  | { type: "timeout"; message: string };
```

This lets consumers distinguish *why* something failed without parsing
message strings:

```tsx
const { error } = useTransaction(/* ... */);

if (error?.type === "network") {
  // request never reached the network — safe to retry immediately
} else if (error?.type === "transaction") {
  // submitted but failed on-chain — inspect error.resultCode
} else if (error?.type === "timeout") {
  // took too long — may or may not have succeeded, needs manual check
}
```

**When writing a new hook or test:**
- Any `onError` callback, `error` state field, or rejected promise related
  to building/signing/submitting/polling a transaction must use this shape,
  not a bare `Error`.
- Tests should assert against `error.type` and the relevant field
  (`message`, `resultCode`), not against `error instanceof Error` or a raw
  message string — the old plain-`Error` convention was corrected across
  the hooks in a previous cleanup and no longer reflects actual hook
  behavior.

## Submitting Your Contribution

When your work is complete:

1. Commit your changes with a clear and descriptive commit message.
2. Push your branch to your fork.
3. Open a Pull Request against the main repository.
4. Provide a concise description of your changes and reference any related issues, if applicable.

## Code Review

Pull requests are automatically assigned to reviewers through the project's **CODEOWNERS** configuration. Please address any feedback promptly to help streamline the review process.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

Thank you for helping make **Stellar Hooks** better!
