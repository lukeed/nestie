import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { nestie } from '../src';

function run(input, output, msg) {
	const value = JSON.stringify(input);
	assert.equal(nestie(input), output, msg);
	assert.is(JSON.stringify(input), value, 'does not mutate');
}

test('exports', () => {
	assert.type(nestie, 'function');
});

test('wrong inputs', () => {
	run(1, undefined);
	run('', undefined);
	run(0, undefined);

	run(null, undefined);
	run(undefined, undefined);
	run(NaN, undefined);
});

test('custom glue', () => {
	const input = {
		'foo.bar': 123,
		'bar.baz': 456,
		'baz_bat': 789,
	};

	const input_string = JSON.stringify(input);

	assert.equal(
		nestie(input, '_'),
		{
			'foo.bar': 123,
			'bar.baz': 456,
			'baz': { bat: 789 },
		}
	);

	assert.is(
		input_string,
		JSON.stringify(input),
		'does not mutate original'
	);

	assert.equal(
		nestie(input, '~'),
		{
			'foo.bar': 123,
			'bar.baz': 456,
			'baz_bat': 789,
		}
	);

	assert.is(
		input_string,
		JSON.stringify(input),
		'does not mutate original'
	);
});

test('keep nullish', () => {
	run({
		'foo.bar': null,
		'bar.baz': undefined,
		'baz.bat': NaN,
		'foo.baz': 0,
	}, {
		foo: { bar: null, baz: 0 },
		bar: { baz: undefined },
		baz: { bat: NaN },
	});

	run({
		'a.0.x': null,
		'a.1.x': undefined,
		'a.3.x': false,
		'a.1.bat': NaN,
		'a.1.baz': 0,
	}, {
		a: [
			{ x: null },
			{ x: undefined, bat: NaN, baz: 0 },
			,
			{ x: false },
		]
	});
});

test('readme/demo', () => {
	run({
		'a': 'hi',
		'b.b.0': 'foo',
		'b.b.1': '',
		'b.b.3': 'bar',
		'b.d': 'hello',
		'b.e.a': 'yo',
		'b.e.b': null,
		'b.e.c': 'sup',
		'b.e.d': 0,
		'b.e.f.0.foo': 123,
		'b.e.f.0.bar': 123,
		'b.e.f.1.foo': 465,
		'b.e.f.1.bar': 456,
		'c': 'world'
	}, {
		a: 'hi',
		b: {
			b: ['foo', '', , 'bar'],
			d: 'hello',
			e: {
				a: 'yo',
				b: null,
				c: 'sup',
				d: 0,
				f: [
					{ foo: 123, bar: 123 },
					{ foo: 465, bar: 456 },
				]
			}
		},
		c: 'world'
	});
});

test('object :: simple', () => {
	run({
		'aaa': 1,
		'bbb': 2,
		'ccc.foo': 'bar',
		'ccc.baz': 'bat',
		'ddd': 4,
	}, {
		aaa: 1,
		bbb: 2,
		ccc: {
			foo: 'bar',
			baz: 'bat'
		},
		ddd: 4
	});
});

test('object :: nested', () => {
	run({
		'aaa': 1,
		'bbb.aaa': 2,
		'bbb.bbb': 3,
		'bbb.ccc.foo': 'bar',
		'bbb.ccc.baz': 'bat',
		'bbb.ddd': 4,
		'ccc': 3
	}, {
		aaa: 1,
		bbb: {
			aaa: 2,
			bbb: 3,
			ccc: {
				foo: 'bar',
				baz: 'bat'
			},
			ddd: 4
		},
		ccc: 3
	});
});

// https://github.com/lukeed/nestie/issues/3
test('NaN keys', () => {
	run({
		'foo.7f4d': 12
	}, {
		'foo': {
			'7f4d': 12
		}
	});

	run(
		{ '1.1a': 5 },
		[ , { '1a': 5 }]
	);
});

test('empty key', () => {
	run({
		'foo.': 12
	}, {
		'foo': {
			'': 12
		}
	});
});

test('object :: kitchen', () => {
	run({
		'a': 1,

		'b.0.0.a': 1,
		'b.0.0.b.0': 2,
		'b.0.0.b.2': 9,
		'b.0.0.c.a.0': 1,
		'b.0.0.c.b.foo.0': 2,
		'b.0.0.c.b.foo.1': 2,
		'b.0.0.d': 4,

		'b.1.0.a': 2,
		'b.1.0.b.0': 4,
		'b.1.0.b.1': null,
		'b.1.0.b.2': 9,
		'b.1.0.c.a.0': 2,
		'b.1.0.c.b.foo.0': 4,
		'b.1.0.c.b.foo.1': 4,
		'b.1.0.d': 5,

		'b.2.0.a': 3,
		'b.2.0.b.0': 6,
		'b.2.0.b.2': 9,
		'b.2.0.c.a.0': 4,
		'b.2.0.c.b.foo.0': 8,
		'b.2.0.c.b.foo.1': 8,
		'b.2.0.d': 6,

		'c': 3,

		'd.foo': undefined,
		'd.bar.0.a': 1,
		'd.bar.0.b': 2,
		'd.bar.0.c.0.a': 1,
		'd.bar.0.c.0.b.c': 3,
		'd.bar.0.c.1.a': 2,
		'd.bar.0.c.1.b.c': 4,
		'd.bar.0.d': 4,

		'd.baz.0.a': 2,
		'd.baz.0.b': 3,
		'd.baz.0.c.0.a': 2,
		'd.baz.0.c.0.b.c': 4,
		'd.baz.0.c.1.a': 3,
		'd.baz.0.c.1.b.c': 5,
		'd.baz.0.d': 5,
	}, {
		a: 1,
		b: [
			[{ a:1, b:[2,,9], c:{ a:[1], b: { foo: [2, 2] } }, d:4 }],
			[{ a:2, b:[4,null,9], c:{ a:[2], b: { foo: [4, 4] } }, d:5 }],
			[{ a:3, b:[6,,9], c:{ a:[4], b: { foo: [8, 8] } }, d:6 }],
		],
		c: 3,
		d: {
			foo: undefined,
			bar: [{ a:1, b:2, c:[{ a:1, b:{ c:3 } }, { a:2, b:{ c:4 } }], d:4 }],
			baz: [{ a:2, b:3, c:[{ a:2, b:{ c:4 } }, { a:3, b:{ c:5 } }], d:5 }],
		}
	});
});

test('array :: simple', () => {
	run({
		'0': 0,
		'2': null,
		'3': undefined,
		'4': 1,
		'5': 2,
		'6': '',
		'7': 3
	}, [
		0, , null, undefined, 1, 2, '', 3
	]);
});

test('array :: nested', () => {
	run({
		'0.0': 1,
		'0.1': 2,
		'0.2': null,
		'0.3': 3,
		'0.4': 4,
		'1.0': 'foo',
		'1.1': 'bar',
		'1.2.0': 'hello',
		'1.2.2': 'world',
		'1.3': 'baz',
		'2.0': 6,
		'2.1': 7,
		'2.2': 8,
		'2.3': undefined,
		'2.4': 9,
	}, [
		[1, 2, null, 3, 4],
		['foo', 'bar', ['hello', , 'world'], 'baz'],
		[6, 7, 8, undefined, 9]
	]);
});

test('array :: object', () => {
	let baz = ['hello', null, 'world'];
	let bbb = { foo: 123, bar: 456, baz };

	run({
		'0.aaa': 1,
		'0.bbb.foo': 123,
		'0.bbb.bar': 456,
		'0.bbb.baz.0': 'hello',
		'0.bbb.baz.1': null,
		'0.bbb.baz.2': 'world',
		'0.ccc.0': 4,
		'0.ccc.1': 5,

		'1.aaa': 2,
		'1.bbb.foo': 123,
		'1.bbb.bar': 456,
		'1.bbb.baz.0': 'hello',
		'1.bbb.baz.1': null,
		'1.bbb.baz.2': 'world',
		'1.ccc': [],

		'2.aaa': 3,
		'2.bbb.foo': 123,
		'2.bbb.bar': 456,
		'2.bbb.baz.0': 'hello',
		'2.bbb.baz.1': null,
		'2.bbb.baz.2': 'world',
		'2.ccc.0': 9999,
	}, [
		{ aaa: 1, bbb, ccc: [4, 5] },
		{ aaa: 2, bbb, ccc: [] },
		{ aaa: 3, bbb, ccc: [9999] },
	]);
});

test('array :: kitchen', () => {
	run({
		'0': 'hello',

		'1.a': 1,
		'1.b.0.0.a': 1,
		'1.b.0.0.b.0': 2,
		'1.b.0.0.b.1': null,
		'1.b.0.0.b.2': 9,
		'1.b.0.0.c.a.0': 1,
		'1.b.0.0.c.b.foo.0': 2,
		'1.b.0.0.c.b.foo.1': 2,
		'1.b.0.0.d': 4,
		'1.b.1.0.a': 2,
		'1.b.1.0.b.0': 4,
		'1.b.1.0.b.1': undefined,
		'1.b.1.0.b.2': 9,
		'1.b.1.0.c.a.0': 2,
		'1.b.1.0.c.b.foo.0': 4,
		'1.b.1.0.c.b.foo.1': 4,
		'1.b.1.0.d': 5,
		'1.b.2.0.a': 3,
		'1.b.2.0.b.0': 6,
		'1.b.2.0.b.1': null,
		'1.b.2.0.b.2': 9,
		'1.b.2.0.c.a.0': 4,
		'1.b.2.0.c.b.foo.0': 8,
		'1.b.2.0.c.b.foo.1': 8,
		'1.b.2.0.d': 6,
		'1.c': 3,
		'1.d.foo': undefined,
		'1.d.bar.0.a': 1,
		'1.d.bar.0.b': 2,
		'1.d.bar.0.c.0.a': 1,
		'1.d.bar.0.c.0.b.c': 3,
		'1.d.bar.0.c.1.a': 2,
		'1.d.bar.0.c.1.b.c': 4,
		'1.d.bar.0.d': 4,
		'1.d.baz.0.a': 2,
		'1.d.baz.0.b': 3,
		'1.d.baz.0.c.0.a': 2,
		'1.d.baz.0.c.0.b.c': 4,
		'1.d.baz.0.c.1.a': 3,
		'1.d.baz.0.c.1.b.c': 5,
		'1.d.baz.0.d': 5,

		'2': 'world',

		'3.a': 1,
		'3.b.0.0.a': 1,
		'3.b.0.0.b.0': 2,
		'3.b.0.0.b.1': null,
		'3.b.0.0.b.2': 9,
		'3.b.0.0.c.a.0': 1,
		'3.b.0.0.c.b.foo.0': 2,
		'3.b.0.0.c.b.foo.1': 2,
		'3.b.0.0.d': 4,
		'3.b.1.0.a': 2,
		'3.b.1.0.b.0': 4,
		'3.b.1.0.b.1': undefined,
		'3.b.1.0.b.2': 9,
		'3.b.1.0.c.a.0': 2,
		'3.b.1.0.c.b.foo.0': 4,
		'3.b.1.0.c.b.foo.1': 4,
		'3.b.1.0.d': 5,
		'3.b.2.0.a': 3,
		'3.b.2.0.b.0': 6,
		'3.b.2.0.b.1': null,
		'3.b.2.0.b.2': 9,
		'3.b.2.0.c.a.0': 4,
		'3.b.2.0.c.b.foo.0': 8,
		'3.b.2.0.c.b.foo.1': 8,
		'3.b.2.0.d': 6,
		'3.c': 3,
		'3.d.foo': undefined,
		'3.d.bar.0.a': 1,
		'3.d.bar.0.b': 2,
		'3.d.bar.0.c.0.a': 1,
		'3.d.bar.0.c.0.b.c': 3,
		'3.d.bar.0.c.1.a': 2,
		'3.d.bar.0.c.1.b.c': 4,
		'3.d.bar.0.d': 4,
		'3.d.baz.0.a': 2,
		'3.d.baz.0.b': 3,
		'3.d.baz.0.c.0.a': 2,
		'3.d.baz.0.c.0.b.c': 4,
		'3.d.baz.0.c.1.a': 3,
		'3.d.baz.0.c.1.b.c': 5,
		'3.d.baz.0.d': 5,
	}, [
		'hello',
		{
			a: 1,
			b: [
				[{ a:1, b:[2,null,9], c:{ a:[1], b: { foo: [2, 2] } }, d:4 }],
				[{ a:2, b:[4,undefined,9], c:{ a:[2], b: { foo: [4, 4] } }, d:5 }],
				[{ a:3, b:[6,null,9], c:{ a:[4], b: { foo: [8, 8] } }, d:6 }],
			],
			c: 3,
			d: {
				foo: undefined,
				bar: [{ a:1, b:2, c:[{ a:1, b:{ c:3 } }, { a:2, b:{ c:4 } }], d:4 }],
				baz: [{ a:2, b:3, c:[{ a:2, b:{ c:4 } }, { a:3, b:{ c:5 } }], d:5 }],
			}
		},
		'world',
		{
			a: 1,
			b: [
				[{ a:1, b:[2,null,9], c:{ a:[1], b: { foo: [2, 2] } }, d:4 }],
				[{ a:2, b:[4,undefined,9], c:{ a:[2], b: { foo: [4, 4] } }, d:5 }],
				[{ a:3, b:[6,null,9], c:{ a:[4], b: { foo: [8, 8] } }, d:6 }],
			],
			c: 3,
			d: {
				foo: undefined,
				bar: [{ a:1, b:2, c:[{ a:1, b:{ c:3 } }, { a:2, b:{ c:4 } }], d:4 }],
				baz: [{ a:2, b:3, c:[{ a:2, b:{ c:4 } }, { a:3, b:{ c:5 } }], d:5 }],
			}
		},
	]);
});

test('proto pollution :: __proto__ :: toplevel', () => {
	let output = nestie({
		'__proto__.foobar': 123
	});

	let tmp = {};
	assert.equal(output, {});
	assert.is(tmp.foobar, undefined);
});

test('proto pollution :: __proto__ :: midlevel', () => {
	let output = nestie({
		'aaa.__proto__.foobar': 123
	});

	let tmp = {};
	assert.equal(output, { aaa: {} });
	assert.is(tmp.foobar, undefined);
});

test('proto pollution :: __proto__ :: sibling', () => {
	let output = nestie({
		'aaa.bbb': 'abc',
		'__proto__.foobar': 123,
		'aaa.xxx': 'xxx',
		'foo.bar': 456,
	});

	assert.equal(output, {
		aaa: {
			bbb: 'abc',
			xxx: 'xxx',
		},
		foo: {
			bar: 456
		}
	});

	let tmp = {};
	assert.is(tmp.foobar, undefined);
});

test('proto pollution :: prototype', () => {
	let output = nestie({
		'a.prototype.hello': 'world',
	});

	assert.equal(output, {
		a: {
			// converted, then aborted
		}
	});

	assert.is.not({}.hello, 'world');
	assert.is({}.hello, undefined);
});

test('proto pollution :: constructor :: direct', () => {
	function Custom() {
		//
	}

	let output = nestie({
		'a.constructor': Custom,
		'foo.bar': 123,
	});

	assert.equal(output, {
		a: {
			// stopped
		},
		foo: {
			bar: 123,
		}
	});

	// Check existing object
	assert.is.not(output.a.constructor, Custom);
	assert.not.instance(output.a, Custom);
	assert.instance(output.a.constructor, Object, '~> 123 -> {}');
	assert.is(output.a.hasOwnProperty('constructor'), false);

	let tmp = {}; // Check new object
	assert.is.not(tmp.constructor, Custom);
	assert.not.instance(tmp, Custom);

	assert.instance(tmp.constructor, Object, '~> 123 -> {}');
	assert.is(tmp.hasOwnProperty('constructor'), false);
});

test('proto pollution :: constructor :: nested', () => {
	let output = nestie({
		'constructor.prototype.hello': 'world',
		'foo': 123,
	});

	assert.equal(output, {
		foo: 123
	});

	assert.is(output.hasOwnProperty('constructor'), false);
	assert.is(output.hasOwnProperty('hello'), false);

	let tmp = {};
	assert.is(tmp.hasOwnProperty('constructor'), false);
	assert.is(tmp.hasOwnProperty('hello'), false);
});

test.run();
