// Суммы вычисляются из того же снимка, который React использует для строк.
// Чтение getState() во время hydration могло смешать пустой HTML и новую сумму.
export function cartTotals(lines: readonly { qty: number; price: number }[], lenses: readonly { qty: number }[] = []) {
  return {
    count: lines.reduce((sum, line) => sum + line.qty, 0) + lenses.reduce((sum, line) => sum + line.qty, 0),
    subtotal: lines.reduce((sum, line) => sum + line.qty * line.price, 0),
  };
}
