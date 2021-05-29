function empty(key) {
	var char = key.charCodeAt(0);
	return (char > 47 && char < 58) ? [] : {};
}

export function nestie(input, glue) {
	glue = glue || '.';
	var arr, tmp, output;
	var i=0, k, key;

	for (k in input) {
		tmp = output; // reset
		arr = k.split(glue);

		for (i=0; i < arr.length;) {
			key = arr[i++];

			if (tmp == null) {
				tmp = empty(''+key);
				output = output || tmp;
			}

			if (key == '__proto__') {
				break;
			}

			if (i < arr.length) {
				if (key in tmp) {
					tmp = tmp[key];
				} else {
					tmp = tmp[key] = empty(''+arr[i]);
				}
			} else {
				tmp[key] = input[k];
			}
		}
	}

	return output;
}
