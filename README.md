# Mynth Stablecoin

This repository hosts Cardano smart contracts for Mynth’s Stablecoin
(MyUSD). Currently the minting policy is published. Other mechanics will
be published over time.

## Prerequisites

  - [node](https://nodejs.org/download/release/v18.18.2/) (\>=18.18)
  - [Aiken](https://aiken-lang.org/installation-instructions)

## Minting/Burning

Minting and burning requires an auth token. If the auth token is spent,
then minting/burning is allowed. The auth token is protected by other
controls to prevent misuse. This design ensures the minting logic can be
upgraded in the future without needing to modify the policy ID.

## Testing

To run Aiken unit tests:

``` sh
npm run test:aiken
```

To run integration tests:

``` sh
npm run test
```

## Setting Up Vault Secrets

This project utilizes Vault for secure storage of secrets. To set it up
on your computer, follow the steps provided on the [Local
Vault](https://github.com/MynthAI/local-vault) page.

The list of secrets this repository relies on are:

  - `myusd/blockfrost api_key`
  - `myusd/wallets seed1`

`myusd/wallets seed1` is used only for testing purposes. If you need to
run tests locally, contact a Mynth team member to obtain the value.
