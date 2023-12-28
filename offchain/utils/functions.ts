import fs from "fs/promises";
import { SpendingValidator } from "lucid-cardano";

const readValidator = async (
  path: string,
  name: string
): Promise<SpendingValidator> => {
  const validators = JSON.parse(await fs.readFile(path, "utf8")).validators;
  const { compiledCode } = validators.filter(
    (validator: object) =>
      "title" in validator && validator.title == `${name}.validate`
  )[0];

  return {
    type: "PlutusV2",
    script: compiledCode,
  };
};

export { readValidator };
