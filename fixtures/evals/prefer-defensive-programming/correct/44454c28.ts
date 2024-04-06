// Ensure exhaustiveness in switch statements with a helper function
function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

type Shape = 'circle' | 'square' | 'triangle'

function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return Math.PI * Math.pow(2, 2)
    case 'square':
      return 4 * 4
    case 'triangle':
      return 0.5 * 4 * 3
    default:
      return assertNever(shape)
  }
}
// This adheres to defensive programming by using a helper function to ensure all cases in a switch are handled.

// Generated by gpt-4-0125-preview