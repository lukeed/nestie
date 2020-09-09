const { klona } = require('klona');
const assert = require('uvu/assert');
const { Suite } = require('benchmark');

const FIXTURE = {
	'a': 'hi',
	'b.b.0': 'foo',
	'b.b.1': '',
	'b.b.3': 'bar',
	'b.d': 'hello',
	'b.e.a': 'yo',
	'b.e.c': 'sup',
	'b.e.d': 0,
	'b.e.f.0.foo': 123,
	'b.e.f.0.bar': 123,
	'b.e.f.1.foo': 465,
	'b.e.f.1.bar': 456,
	'c': 'world'
};

console.log('\nLoad Time: ');

console.time('dset');
const dset = require('dset');
console.timeEnd('dset');

console.time('lodash/set');
const lodash = require('lodash/set');
console.timeEnd('lodash/set');

console.time('flat');
const { unflatten } = require('flat');
console.timeEnd('flat');

console.time('nestie');
const { nestie } = require('../dist');
console.timeEnd('nestie');

// Not 1:1 (nestie does more)
function mock(lib, value) {
	var k, output = {};
	for (k in value) lib(output, k);
	return output;
}

const contenders = {
	'lodash/set ≠': mock.bind(0, lodash),
	'dset ≠': mock.bind(0, dset),
	'flat.unflatten': unflatten,
	'nestie': nestie,
};

console.log('\nValidation: ');
Object.keys(contenders).forEach(name => {
	try {
		const input = klona(FIXTURE);
		const output = contenders[name](input);

		assert.is(input['b.b.0'], 'foo', 'no mutate');
		assert.is(output['b.b.0'], undefined, 'no direct');

		assert.type(output['b'], 'object', 'created "b" object');
		assert.instance(output['b']['b'], Array, 'created "b.b" array');
		assert.equal(output['b']['b'], ['foo', '', , 'bar'], 'array w/ holes');

		console.log('  ✔', name);
	} catch (err) {
		console.log('  ✘', name, `(FAILED) @ "${err.message}"`);
		// if (err.details) console.log(err.details);
	}
});


console.log('\nBenchmark:');
const bench = new Suite().on('cycle', e => {
	console.log('  ' + e.target);
});

Object.keys(contenders).forEach(name => {
	bench.add(name + ' '.repeat(16 - name.length), () => {
		contenders[name](FIXTURE);
	});
});

bench.run();
