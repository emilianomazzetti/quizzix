// Deterministic word search grid generator for FlipQuiz
// Ensures both student and teacher views have the identical matrix and solution coordinates.

export interface WordSearchGridResult {
  matrix: string[][];
  solutionCoords: { r: number; c: number; word: string }[];
  wordsToFind: string[];
}

export function generateWordSearchGrid(
  rawWords: string[],
  gridSize: number = 8
): WordSearchGridResult {
  const wordsToFind = (rawWords || [])
    .map((w) => w.trim().toUpperCase())
    .filter(Boolean);

  const letters = 'ABCDEFGHILMNOPQRSTUVZ';
  const matrix: string[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => '')
  );
  const solutionCoords: { r: number; c: number; word: string }[] = [];

  // Deterministically place each word horizontally or vertically
  wordsToFind.forEach((word, wIdx) => {
    let placed = false;
    const isHorizontal = wIdx % 2 === 0;

    for (let offset = 0; offset < gridSize * 2 && !placed; offset++) {
      if (isHorizontal) {
        const row = (wIdx * 2 + offset) % gridSize;
        const maxCol = gridSize - word.length;
        if (maxCol >= 0) {
          const col = (offset * 2) % (maxCol + 1);
          let fits = true;
          for (let i = 0; i < word.length; i++) {
            if (matrix[row][col + i] !== '' && matrix[row][col + i] !== word[i]) {
              fits = false;
              break;
            }
          }
          if (fits) {
            for (let i = 0; i < word.length; i++) {
              matrix[row][col + i] = word[i];
              solutionCoords.push({ r: row, c: col + i, word });
            }
            placed = true;
          }
        }
      } else {
        const col = (wIdx * 2 + offset) % gridSize;
        const maxRow = gridSize - word.length;
        if (maxRow >= 0) {
          const row = (offset * 2) % (maxRow + 1);
          let fits = true;
          for (let i = 0; i < word.length; i++) {
            if (matrix[row + i][col] !== '' && matrix[row + i][col] !== word[i]) {
              fits = false;
              break;
            }
          }
          if (fits) {
            for (let i = 0; i < word.length; i++) {
              matrix[row + i][col] = word[i];
              solutionCoords.push({ r: row + i, c: col, word });
            }
            placed = true;
          }
        }
      }
    }
  });

  // Fill empty cells with deterministic pseudo-random letters
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!matrix[r][c]) {
        const charIdx = (r * 11 + c * 17 + 5) % letters.length;
        matrix[r][c] = letters[charIdx];
      }
    }
  }

  return { matrix, solutionCoords, wordsToFind };
}
