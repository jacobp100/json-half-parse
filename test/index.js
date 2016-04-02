/* globals describe it */

import * as assert from 'assert';
import { parse, getLocation } from '../src';


describe('json', () => {
  const assertParse = (input) => {
    const { error, value } = parse(input);
    assert.strictEqual(error, null, `Error for input ${input}`);
    const expected = JSON.parse(input);
    assert.deepStrictEqual(value, expected, `No value for input ${input}`);
  };

  const assertFailsWithNoValue = (input) => {
    const { error, value } = parse(input);
    assert.ok(error, `No error for input ${input}`);
    assert.strictEqual(value, undefined, `Got value for input ${input}`);
  };

  const assertFailsWithRecovery = ([input, expected]) => {
    const { error, value } = parse(input);
    assert.ok(error, `For input ${input}`);
    assert.deepStrictEqual(value, expected, `For input ${input}`);
  };

  describe('parse is consistent with native JSON parse', () => {
    it('parses null', () => {
      ['null'].forEach(assertParse);
    });

    it('parses booleans', () => {
      ['true', 'false'].forEach(assertParse);
    });

    it('parses numbers', () => {
      [
        '0', '5', '50', '500', '5.00', '5.12', '0.12', '1E2', '1E20', '1E0', '1E-0', '-0', '-5',
        '-5.00', '-5.12', '-0.12', '-1E2', '-1E20', '-1E0', '-1E-0',
      ].forEach(assertParse);
    });

    it('parses strings', () => {
      ['""', '"test"', '"\'"', '"\\""', '"\\\\"'].forEach(assertParse);
    });

    it('parses arrays', () => {
      [
        '[]', '[null]', '[true]', '["test"]', '[5]', '[[]]', '[{}]', '[1,2,3]',
      ].forEach(assertParse);
    });

    it('parses objects', () => {
      [
        '{}', '{ "test": null }', '{ "test": true }', '{ "test": "test" }', '{ "test": 5 }',
        '{ "a": 1, "b": 2, "c": 3 }', '{ "a": {} }',
      ].forEach(assertParse);
    });

    it('ignores leading and trailling whitespace', () => {
      ['    null', '    true     ', 'false   ', '\n\n\t5\n\n\t'].forEach(assertParse);
    });
  });

  describe('parse throws for', () => {
    it('invalid numbers', () => {
      ['00', '1E0.5', '-'].forEach(assertFailsWithNoValue);
    });

    it('invalid strings', () => {
      ['"\\\\""', '"test'].forEach(assertFailsWithNoValue);
    });
  });

  describe('parse throws for, but partially parses', () => {
    it('invalid arrays', () => {
      [
        ['[,]', []],
        ['[1,]', [1]],
        ['[1,2,]', [1, 2]],
        ['{ "test": [1,2,] }', { test: [1, 2] }],
      ].forEach(assertFailsWithRecovery);
    });

    it('invalid objects', () => {
      [
        ['{,}', {}],
        ['{ 5 }', {}],
        ['{ "a }', {}],
        ['{ "a" }', {}],
        ['{ "a": }', {}],
        ['{ "a" 5 }', {}],
        ['{ "a": 5, }', { a: 5 }],
        ['{ "a": 5, " }', { a: 5 }],
        ['{ "a": 5 " }', { a: 5 }],
        ['{ "a": 5 5 }', { a: 5 }],
        ['{ "a": 5 : }', { a: 5 }],
        ['{ "a": 5, "b }', { a: 5 }],
        ['{ "a": 5, "b" }', { a: 5 }],
        ['{ "a": 5, "b": }', { a: 5 }],
        ['{ "a": 5, "b": 5, }', { a: 5, b: 5 }],
        ['[{ "a": 5, "b": 5, }]', [{ a: 5, b: 5 }]],
      ].forEach(assertFailsWithRecovery);
    });
  });
});

describe('get location', () => {
  const expectLocation = ([text, remainingText, expected]) => {
    const value = getLocation(text, remainingText);
    assert.deepStrictEqual(
      value,
      expected,
      `For input ${JSON.stringify(text)}, ${JSON.stringify(remainingText)}`
    );
  };

  it('should return correct values', () => {
    [
      ['test', 'test', { line: 1, column: 0, offset: 0 }],
      ['test', 'st', { line: 1, column: 2, offset: 2 }],
      ['test', '', { line: 1, column: 4, offset: 4 }],
      ['test\n', 'test\n', { line: 1, column: 0, offset: 0 }],
      ['test\n', 'st\n', { line: 1, column: 2, offset: 2 }],
      ['test\n', '\n', { line: 1, column: 4, offset: 4 }],
      ['test\n', '', { line: 2, column: 0, offset: 5 }],
      ['test\ning', 'test\ning', { line: 1, column: 0, offset: 0 }],
      ['test\ning', 'st\ning', { line: 1, column: 2, offset: 2 }],
      ['test\ning', '\ning', { line: 1, column: 4, offset: 4 }],
      ['test\ning', 'ing', { line: 2, column: 0, offset: 5 }],
      ['test\ning', '', { line: 2, column: 3, offset: 8 }],
    ].forEach(expectLocation);
  });
});
