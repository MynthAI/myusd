import test from "ava";
import {
  Data,
  fromText,
  generateSeedPhrase,
  SpendingValidator,
} from "lucid-cardano";
import { getAddressFromSeed, TransactionChainer } from "mynth-helper";
import { getConfig } from "./config";

const mintPolicy = "8a18036115c77e57d4625096948265c6a16a3fabfc51b6cb0b0e5206";
const mint = mintPolicy + "6d696e74";

const createNewWallet = async (chainer: TransactionChainer) => {
  const seed = generateSeedPhrase();
  const address = getAddressFromSeed(seed, "testnet");
  await chainer.registerWallet(address, seed);
  return address;
};

test("can mint stablecoin", async (t) => {
  const { chainer, lucid, validator } = await getConfig("mint", [mintPolicy]);
  const mintingWallet = await createNewWallet(chainer);

  chainer.registerTx(
    await (
      await lucid
        .newTx()
        .payToAddress(mintingWallet, { lovelace: 10000000n, [mint]: 1n })
        .complete()
    )
      .sign()
      .complete()
  );

  const minter = await chainer.getLucid(mintingWallet);
  const policyId = lucid.utils.mintingPolicyToId(validator);
  const tx = await minter
    .newTx()
    .mintAssets({ [policyId + fromText("USDZ")]: 100n }, Data.void())
    .attachMintingPolicy(validator)
    .payToAddress(mintingWallet, { [mint]: 1n })
    .complete();
  chainer.registerTx(await tx.sign().complete());

  t.pass();
});

test("cannot mint stablecoin without mint token", async (t) => {
  const { chainer, lucid, validator } = await getConfig("mint", [mintPolicy]);
  const mintingWallet = await createNewWallet(chainer);

  chainer.registerTx(
    await (
      await lucid
        .newTx()
        .payToAddress(mintingWallet, { lovelace: 10000000n })
        .complete()
    )
      .sign()
      .complete()
  );

  const minter = await chainer.getLucid(mintingWallet);
  const policyId = lucid.utils.mintingPolicyToId(validator);
  const tx = minter
    .newTx()
    .mintAssets({ [policyId + fromText("USDZ")]: 100n }, Data.void())
    .attachMintingPolicy(validator);

  try {
    await tx.complete();
    t.fail("Contract allows minting stablecoin without mint token");
  } catch (error) {
    t.pass();
  }
});

test("cannot mint stablecoin with wrong mint token", async (t) => {
  const { lucid, validator } = await getConfig("mint", [
    "aaeaf39449d59d760d95430ad28cfe63f126c0a0974c14ad0a194106",
  ]);
  const address = await lucid.wallet.address();

  const policyId = lucid.utils.mintingPolicyToId(validator);
  const tx = lucid
    .newTx()
    .mintAssets({ [policyId + fromText("USDZ")]: 100n }, Data.void())
    .attachMintingPolicy(validator)
    .payToAddress(address, { [mint]: 1n });

  try {
    await tx.complete();
    t.fail("Contract allows minting stablecoin using unauthorized token");
  } catch (error) {
    t.pass();
  }
});

test("can mint stablecoin using token locked in contract", async (t) => {
  const { chainer, lucid, validator } = await getConfig("mint", [mintPolicy]);
  const policyId = lucid.utils.mintingPolicyToId(validator);

  const mintingScript: SpendingValidator = {
    type: "PlutusV2",
    script: "49480100002221200101",
  };
  const mintingAddress = lucid.utils.validatorToAddress(mintingScript);

  await chainer.registerAddress(mintingAddress);
  const tx = await (
    await lucid
      .newTx()
      .payToContract(mintingAddress, Data.void(), { [mint]: 1n })
      .complete()
  )
    .sign()
    .complete();
  chainer.registerTx(tx);

  const minter = chainer.getUtxo(tx.toHash());
  const mintTx = await lucid
    .newTx()
    .collectFrom([minter], Data.void())
    .mintAssets({ [policyId + fromText("USDZ")]: 200n }, Data.void())
    .attachMintingPolicy(validator)
    .attachSpendingValidator(mintingScript)
    .payToContract(mintingAddress, Data.void(), { [mint]: 1n })
    .complete();
  await mintTx.sign().complete();

  t.pass();
});

test("cannot mint stablecoin if mint token locked", async (t) => {
  const { chainer, lucid, validator } = await getConfig("mint", [mintPolicy]);
  const policyId = lucid.utils.mintingPolicyToId(validator);

  const mintingScript: SpendingValidator = {
    type: "PlutusV2",
    script: "66a67769edd0c54d5f6ec8ba3925394bf0e4fc1f8bfbe3a131eb523c",
  };
  const mintingAddress = lucid.utils.validatorToAddress(mintingScript);

  await chainer.registerAddress(mintingAddress);
  const tx = await (
    await lucid
      .newTx()
      .payToContract(mintingAddress, Data.void(), { [mint]: 1n })
      .complete()
  )
    .sign()
    .complete();
  chainer.registerTx(tx);

  const minter = chainer.getUtxo(tx.toHash());
  const mintTx = lucid
    .newTx()
    .collectFrom([minter], Data.void())
    .mintAssets({ [policyId + fromText("USDZ")]: 200n }, Data.void())
    .attachMintingPolicy(validator)
    .attachSpendingValidator(mintingScript)
    .payToContract(mintingAddress, { inline: Data.void() }, { [mint]: 1n });

  try {
    await mintTx.complete();
    t.fail("Was able to mint when mint token should be locked");
  } catch (error) {
    t.pass();
  }
});

test("cannot mint stablecoin if mint token is referenced", async (t) => {
  const { chainer, lucid, validator } = await getConfig("mint", [mintPolicy]);
  const policyId = lucid.utils.mintingPolicyToId(validator);

  const mintingScript: SpendingValidator = {
    type: "PlutusV2",
    script: "49480100002221200101",
  };
  const mintingAddress = lucid.utils.validatorToAddress(mintingScript);

  await chainer.registerAddress(mintingAddress);
  const tx = await (
    await lucid
      .newTx()
      .payToContract(mintingAddress, Data.void(), { [mint]: 1n })
      .complete()
  )
    .sign()
    .complete();
  chainer.registerTx(tx);

  const minter = chainer.getUtxo(tx.toHash());
  const mintTx = lucid
    .newTx()
    .readFrom([minter])
    .mintAssets({ [policyId + fromText("USDZ")]: 200n }, Data.void())
    .attachMintingPolicy(validator)
    .payToContract(mintingAddress, { inline: Data.void() }, { [mint]: 1n });

  try {
    await mintTx.complete();
    t.fail("Was able to mint when mint token wasn't spent");
  } catch (error) {
    t.pass();
  }
});
