use validations/check.{is_true}

validator {
  fn validate(_datum, _redeemer, _context) {
    is_true()
  }
}
