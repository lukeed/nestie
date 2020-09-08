export function nestie(input, glue) {
	glue = glue || '.';
	var arr, tmp, output;
	var i=0, k, key, char;

	for (k in input) {
		tmp = output; // reset
		arr = k.split(glue);

		for (i=0; i < arr.length;) {
			key = arr[i++];
			if (tmp == null) {
				char = (''+key).charCodeAt(0);
				tmp = (char > 47 && char < 58) ? [] : {};
				output = output || tmp;
			}

			if (i < arr.length) {
				if (key in tmp) {
					tmp = tmp[key];
				} else {
					char = (''+arr[i]).charCodeAt(0);
					tmp = tmp[key] = (char > 47 && char < 58) ? [] : {};
				}
			} else {
				tmp[key] = input[k];
			}
		}
	}

	return output;
}
