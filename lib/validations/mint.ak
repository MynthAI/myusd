use aiken/list
use aiken/transaction.{Mint, ScriptContext}
use aiken/transaction/value

pub fn can_mint(context: ScriptContext, mint: ByteArray) {
  expect Mint(_) = context.purpose

  context.transaction.outputs
    |> list.any(
         fn(output) {
           output.value
             |> value.policies
             |> list.has(mint)
         },
       )
}
