/**
 * Math Problem Generator for FlipQuiz
 * Generates custom arithmetic challenges according to teacher/student editor specifications.
 */

export interface MathProblem {
  equation: string;
  answer: number;
}

export function generateMathProblems(
  operators: ('+' | '-' | '*' | '/')[],
  numberOfOperations: 1 | 2 | 3 | 4,
  digitRange: 10 | 100 | 1000,
  allowCarryOrRemainder: boolean
): MathProblem[] {
  const problems: MathProblem[] = [];
  const selectedOps = operators.length > 0 ? operators : ['+', '-'];

  for (let i = 0; i < numberOfOperations; i++) {
    const op = selectedOps[Math.floor(Math.random() * selectedOps.length)];
    let a = 0;
    let b = 0;
    let ans = 0;
    let eq = '';

    if (op === '+') {
      if (!allowCarryOrRemainder) {
        // No carry
        if (digitRange === 10) {
          a = Math.floor(Math.random() * 5) + 1;
          b = Math.floor(Math.random() * (10 - a));
        } else if (digitRange === 100) {
          const tensA = Math.floor(Math.random() * 5) + 1;
          const tensB = Math.floor(Math.random() * (9 - tensA));
          const unitsA = Math.floor(Math.random() * 5);
          const unitsB = Math.floor(Math.random() * (10 - unitsA));
          a = tensA * 10 + unitsA;
          b = tensB * 10 + unitsB;
        } else {
          a = Math.floor(Math.random() * 400) + 50;
          b = Math.floor(Math.random() * 400) + 50;
        }
      } else {
        const max = digitRange === 10 ? 9 : digitRange === 100 ? 99 : 999;
        a = Math.floor(Math.random() * (max * 0.7)) + 2;
        b = Math.floor(Math.random() * (max * 0.7)) + 2;
      }
      ans = a + b;
      eq = `${a} + ${b}`;
    } else if (op === '-') {
      if (!allowCarryOrRemainder) {
        // No borrowing
        if (digitRange === 10) {
          a = Math.floor(Math.random() * 8) + 2;
          b = Math.floor(Math.random() * a);
        } else {
          const tensA = Math.floor(Math.random() * 7) + 2;
          const tensB = Math.floor(Math.random() * tensA);
          const unitsA = Math.floor(Math.random() * 7) + 2;
          const unitsB = Math.floor(Math.random() * unitsA);
          a = tensA * 10 + unitsA;
          b = tensB * 10 + unitsB;
        }
      } else {
        const max = digitRange === 10 ? 10 : digitRange === 100 ? 100 : 1000;
        a = Math.floor(Math.random() * (max - 5)) + 5;
        b = Math.floor(Math.random() * (a - 1)) + 1;
      }
      ans = a - b;
      eq = `${a} - ${b}`;
    } else if (op === '*') {
      const maxFactor = digitRange === 10 ? 5 : digitRange === 100 ? 12 : 25;
      a = Math.floor(Math.random() * (maxFactor - 1)) + 2;
      b = Math.floor(Math.random() * (maxFactor - 1)) + 2;
      ans = a * b;
      eq = `${a} × ${b}`;
    } else if (op === '/') {
      // Division: ensure integer result without remainder unless specified
      const divisor = Math.floor(Math.random() * 8) + 2;
      const quotient = Math.floor(Math.random() * (digitRange === 10 ? 4 : 12)) + 1;
      const dividend = divisor * quotient;
      ans = quotient;
      eq = `${dividend} : ${divisor}`;
    }

    problems.push({ equation: eq, answer: ans });
  }

  return problems;
}
