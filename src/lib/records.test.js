import { expect, test } from 'vitest';
import { csvCell } from './records.js';
test('CSV escapes separators, quotes, newlines and spreadsheet formulas', () => {
  expect(csvCell('Ana;"QA"\n')).toBe('"Ana;""QA""\n"');
  expect(csvCell('=SUM(A1)')).toBe('"\'=SUM(A1)"');
  expect(csvCell(' +1')).toBe('"\' +1"');
  expect(csvCell(null)).toBe('""');
});
