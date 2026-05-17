export function validate_status(status: number) {
  return status >= 200 && status < 500
}
