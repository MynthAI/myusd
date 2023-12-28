use aiken/transaction.{ScriptContext}
use validations/mint.{can_mint}

validator(mint: ByteArray) {
  fn validate(_redeemer, context: ScriptContext) {
    can_mint(context, mint)
  }
}
