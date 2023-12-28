import { Data, Lucid, SpendingValidator, UTxO } from "lucid-cardano";

const spend = async (
  lucid: Lucid,
  utxos: UTxO[],
  validator: SpendingValidator
) => {
  utxos = utxos.filter((utxo) => utxo.datum !== undefined);

  const tx = await lucid
    .newTx()
    .collectFrom(utxos, Data.void())
    .attachSpendingValidator(validator)
    .complete();

  return tx.sign().complete();
};

export { spend };
