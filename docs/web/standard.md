# 规范

```js
var newArray = [];
var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ] ] ], 10];

if(typeof Array.prototype.flat !== 'function') {
	Array.prototype.flat = function (){
		return [].concat(...this.map(item => (Array.isArray(item) ? item.flat() : [item])))
	}
}

function _new(fn) {
    var obj = Object.create(fn.prototype);
    fn.apply(obj, arguments);
    return obj;
}
```