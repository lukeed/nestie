import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { nestie } from '../src';

test('exports', () => {
	assert.type(nestie, 'function');
});

test('demo', () => {
	assert.equal(
		nestie({
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
		}),
		{
			a: 'hi',
			b: {
				b: ['foo', '', , 'bar'],
				d: 'hello',
				e: {
					a: 'yo',
					c: 'sup',
					d: 0,
					f: [
						{ foo: 123, bar: 123 },
						{ foo: 465, bar: 456 },
					]
				}
			},
			c: 'world'
		}
	);
});

test.run();
