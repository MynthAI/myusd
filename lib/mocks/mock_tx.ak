use aiken/dict
use aiken/interval.{Interval, IntervalBound, PositiveInfinity}
use aiken/transaction.{
  Input, NoDatum, Output, OutputReference, ScriptContext, ScriptPurpose,
  Transaction, TransactionId,
}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{Value}

pub const keyhash = #"010203040506"

pub fn test_out_ref() -> OutputReference {
  // This indicates that the UTXO to be spent is the output with the `output_index` == 0
  let out_ref =
    OutputReference {
      transaction_id: TransactionId { hash: #"acab" },
      output_index: 0,
    }
  out_ref
}

pub fn test_output(address: Address, token: Value) -> Output {
  let output =
    Output { address, value: token, datum: NoDatum, reference_script: None }
  output
}

pub fn context(
  purpose: ScriptPurpose,
  inputs: List<Input>,
  outputs: List<Output>,
) -> ScriptContext {
  ScriptContext { purpose, transaction: tx_1(inputs, outputs) }
}

pub fn tx_1(inputs: List<Input>, outputs: List<Output>) -> Transaction {
  let tx =
    Transaction {
      inputs,
      reference_inputs: [],
      outputs,
      fee: value.zero(),
      mint: value.from_asset(#"000000", #"00", -1) |> value.to_minted_value,
      certificates: [],
      withdrawals: dict.new(),
      validity_range: Interval {
        lower_bound: IntervalBound {
          bound_type: PositiveInfinity,
          is_inclusive: True,
        },
        upper_bound: IntervalBound {
          bound_type: PositiveInfinity,
          is_inclusive: True,
        },
      },
      extra_signatories: [keyhash],
      redeemers: dict.new(),
      datums: dict.new(),
      id: TransactionId { hash: #"" },
    }
  tx
}
