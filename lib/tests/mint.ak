use aiken/transaction.{Mint, Spend}
use aiken/transaction/value
use assist/addresses
use mocks/mock_tx as mocks
use validations/mint.{can_mint}

// Verify that the purpose of the context is of type Mint, otherwise the function throws an error.
test can_mint_test() fail {
  let placeholder_utxo = mocks.test_out_ref()

  let script_context = mocks.context(Spend(placeholder_utxo), [], [])

  can_mint(context: script_context, mint: #"")
}

// The purpose of the transaction is "Mint" and no output has the value policy mint.
// This case must return False, since it does not meet the condition of the value policy list.
test can_mint_test_1() {
  let mnt_policy_id =
    #"8a18036115c77e57d4625096948265c6a16a3fabfc51b6cb0b0e5206"

  let mocked_policy_id = #"aaabbeeedfff39938349d9a9d9"
  let mocked_name_asset = #"6d696e74"
  let mocked_address = addresses.create_address(#"face", #"")

  // * Send token that does not contain the policy id to mint *
  let mocked_token = value.from_asset(mocked_policy_id, mocked_name_asset, 1)
  let output = mocks.test_output(address: mocked_address, token: mocked_token)

  let script_context = mocks.context(Mint(mocked_policy_id), [], [output])

  !can_mint(context: script_context, mint: mnt_policy_id)
}

// The purpose of the context is "Mint" and there is at least one output with the mint value policy.
// This case must return True, as it meets the conditions of the function.
test can_mint_test_2() {
  let mnt_policy_id =
    #"8a18036115c77e57d4625096948265c6a16a3fabfc51b6cb0b0e5206"
  let mnt_name_asset = #"6d696e74"
  let mocked_address = addresses.create_address(#"face", #"")

  // * Send token containing policy id to mint *
  let mint_token = value.from_asset(mnt_policy_id, mnt_name_asset, 1)
  let output = mocks.test_output(address: mocked_address, token: mint_token)

  let script_context = mocks.context(Mint(mnt_policy_id), [], [output])

  can_mint(context: script_context, mint: mnt_policy_id)
}
