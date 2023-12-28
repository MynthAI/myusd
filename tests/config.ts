import config from "config";
import { applyParamsToScript } from "lucid-cardano";
import { TransactionChainer } from "mynth-helper";
import { readValidator } from "utils";

const getConfig = async (name: string, params: string[] = []) => {
  const validator = await readValidator("plutus.json", name);
  if (params.length)
    validator.script = applyParamsToScript(validator.script, params);

  const blockfrostApiKey = config.get<string>("blockfrost");
  const seed = config.get<string>("wallets.seed1");
  const chainer = await TransactionChainer.loadWallet(blockfrostApiKey, seed);
  const lucid = await chainer.getLucid();
  const contractAddress = lucid.utils.validatorToAddress(validator);

  return {
    validator,
    chainer,
    lucid,
    contractAddress,
  };
};

export { getConfig };
