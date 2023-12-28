import test from "ava";
import { Data } from "lucid-cardano";
import { spend } from "spend";
import { getConfig } from "./config";

test("can spend ADA", async (t) => {
  const { validator, chainer, lucid, contractAddress } = await getConfig(
    "spend"
  );
  await chainer.registerAddress(contractAddress);

  const tx = await lucid
    .newTx()
    .payToContract(
      contractAddress,
      { inline: Data.void() },
      { lovelace: 5000000n }
    )
    .complete();
  chainer.registerTx(await tx.sign().complete());

  const spendTx = await spend(
    lucid,
    chainer.getUtxos(contractAddress),
    validator
  );
  chainer.registerTx(spendTx);

  t.pass();
});
