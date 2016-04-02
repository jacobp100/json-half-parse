# json-half-parse

```
npm install --save json-half-parse
```

Parses JSON, returning a partially parsed result if there are errors:

```javascript
JSON.parse('[1, 2, ueauu]'); // Error
json.parse('[1, 2, ueauu]'); // [1, 2]

JSON.parse('{ "a": 1, "b":'); // Error
json.parse('{ "a": 1, "b":'); // { a: 1 }
```

Still respects JSON syntax: no trailling commas, double quoted strings only etc.

# API

```javascript
const { error, value } = json.parse(string);
```

`value` is an object like that returned `JSON.parse`.
`error` is an object represented as `{ message, remainingText, location }`

* `location` is represented as `{ line, column, offset }`, where offset is character index


```javascript
const { error, value } = json.parseWithAst(string);
```

`value` is an abstract syntax tree (ast) with each node being represented as `{ type, value, ?match, ?isComplete }`.

* `type` is either `null`, `string`, `boolean`, `number`, `array`, or `object`
* For all primitive, `value` is the JSON value
* For an array, `value` is an array of values represented in the ast form
* For an object, `value` is a entry of `[key, v]`, where `key` is a string, and `v` is an ast value
* `match` is available for primitives, and gives the string that was matched
* `isComplete` is available for objects and arrays, and indicates whether they were completely parsed

Not built around efficiency: don't use it in performance sensitive scenarios.
