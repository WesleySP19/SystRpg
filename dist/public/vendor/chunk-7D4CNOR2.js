var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var create = () =>  new Map();
var copy = (m) => {
const r = create();
m.forEach((v, k) => {
r.set(k, v);
});
return r;
};
var setIfUndefined = (map3, key, createT) => {
let set = map3.get(key);
if (set === void 0) {
map3.set(key, set = createT());
}
return set;
};
var map = (m, f) => {
const res = [];
for (const [key, value] of m) {
res.push(f(value, key));
}
return res;
};
var any = (m, f) => {
for (const [key, value] of m) {
if (f(value, key)) {
return true;
}
}
return false;
};
var create2 = () =>  new Set();
var last = (arr) => arr[arr.length - 1];
var appendTo = (dest, src) => {
for (let i = 0; i < src.length; i++) {
dest.push(src[i]);
}
};
var from = Array.from;
var every = (arr, f) => {
for (let i = 0; i < arr.length; i++) {
if (!f(arr[i], i, arr)) {
return false;
}
}
return true;
};
var some = (arr, f) => {
for (let i = 0; i < arr.length; i++) {
if (f(arr[i], i, arr)) {
return true;
}
}
return false;
};
var unfold = (len, f) => {
const array = new Array(len);
for (let i = 0; i < len; i++) {
array[i] = f(i, array);
}
return array;
};
var isArray = Array.isArray;
var ObservableV2 = class {
constructor() {
this._observers = create();
}
on(name, f) {
setIfUndefined(
this._observers,
name,
create2
).add(f);
return f;
}
once(name, f) {
const _f = (...args2) => {
this.off(
name,
_f
);
f(...args2);
};
this.on(
name,
_f
);
}
off(name, f) {
const observers = this._observers.get(name);
if (observers !== void 0) {
observers.delete(f);
if (observers.size === 0) {
this._observers.delete(name);
}
}
}
emit(name, args2) {
return from((this._observers.get(name) || create()).values()).forEach((f) => f(...args2));
}
destroy() {
this._observers = create();
}
};
var Observable = class {
constructor() {
this._observers = create();
}
on(name, f) {
setIfUndefined(this._observers, name, create2).add(f);
}
once(name, f) {
const _f = (...args2) => {
this.off(name, _f);
f(...args2);
};
this.on(name, _f);
}
off(name, f) {
const observers = this._observers.get(name);
if (observers !== void 0) {
observers.delete(f);
if (observers.size === 0) {
this._observers.delete(name);
}
}
}
emit(name, args2) {
return from((this._observers.get(name) || create()).values()).forEach((f) => f(...args2));
}
destroy() {
this._observers = create();
}
};
var floor = Math.floor;
var abs = Math.abs;
var min = (a, b) => a < b ? a : b;
var max = (a, b) => a > b ? a : b;
var isNaN = Number.isNaN;
var pow = Math.pow;
var isNegativeZero = (n) => n !== 0 ? n < 0 : 1 / n < 0;
var BIT1 = 1;
var BIT2 = 2;
var BIT3 = 4;
var BIT4 = 8;
var BIT6 = 32;
var BIT7 = 64;
var BIT8 = 128;
var BIT18 = 1 << 17;
var BIT19 = 1 << 18;
var BIT20 = 1 << 19;
var BIT21 = 1 << 20;
var BIT22 = 1 << 21;
var BIT23 = 1 << 22;
var BIT24 = 1 << 23;
var BIT25 = 1 << 24;
var BIT26 = 1 << 25;
var BIT27 = 1 << 26;
var BIT28 = 1 << 27;
var BIT29 = 1 << 28;
var BIT30 = 1 << 29;
var BIT31 = 1 << 30;
var BIT32 = 1 << 31;
var BITS5 = 31;
var BITS6 = 63;
var BITS7 = 127;
var BITS17 = BIT18 - 1;
var BITS18 = BIT19 - 1;
var BITS19 = BIT20 - 1;
var BITS20 = BIT21 - 1;
var BITS21 = BIT22 - 1;
var BITS22 = BIT23 - 1;
var BITS23 = BIT24 - 1;
var BITS24 = BIT25 - 1;
var BITS25 = BIT26 - 1;
var BITS26 = BIT27 - 1;
var BITS27 = BIT28 - 1;
var BITS28 = BIT29 - 1;
var BITS29 = BIT30 - 1;
var BITS30 = BIT31 - 1;
var BITS31 = 2147483647;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
var MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
var LOWEST_INT32 = 1 << 31;
var isInteger = Number.isInteger || ((num) => typeof num === "number" && isFinite(num) && floor(num) === num);
var isNaN2 = Number.isNaN;
var parseInt = Number.parseInt;
var fromCharCode = String.fromCharCode;
var fromCodePoint = String.fromCodePoint;
var MAX_UTF16_CHARACTER = fromCharCode(65535);
var toLowerCase = (s) => s.toLowerCase();
var trimLeftRegex = /^\s*/g;
var trimLeft = (s) => s.replace(trimLeftRegex, "");
var fromCamelCaseRegex = /([A-Z])/g;
var fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, (match2) => `${separator}${toLowerCase(match2)}`));
var _encodeUtf8Polyfill = (str) => {
const encodedString = unescape(encodeURIComponent(str));
const len = encodedString.length;
const buf = new Uint8Array(len);
for (let i = 0; i < len; i++) {
buf[i] =
encodedString.codePointAt(i);
}
return buf;
};
var utf8TextEncoder = (
typeof TextEncoder !== "undefined" ? new TextEncoder() : null
);
var _encodeUtf8Native = (str) => utf8TextEncoder.encode(str);
var encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
utf8TextDecoder = null;
}
var repeat = (source, n) => unfold(n, () => source).join("");
var Encoder = class {
constructor() {
this.cpos = 0;
this.cbuf = new Uint8Array(100);
this.bufs = [];
}
};
var createEncoder = () => new Encoder();
var length = (encoder) => {
let len = encoder.cpos;
for (let i = 0; i < encoder.bufs.length; i++) {
len += encoder.bufs[i].length;
}
return len;
};
var toUint8Array = (encoder) => {
const uint8arr = new Uint8Array(length(encoder));
let curPos = 0;
for (let i = 0; i < encoder.bufs.length; i++) {
const d = encoder.bufs[i];
uint8arr.set(d, curPos);
curPos += d.length;
}
uint8arr.set(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
return uint8arr;
};
var verifyLen = (encoder, len) => {
const bufferLen = encoder.cbuf.length;
if (bufferLen - encoder.cpos < len) {
encoder.bufs.push(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos));
encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
encoder.cpos = 0;
}
};
var write = (encoder, num) => {
const bufferLen = encoder.cbuf.length;
if (encoder.cpos === bufferLen) {
encoder.bufs.push(encoder.cbuf);
encoder.cbuf = new Uint8Array(bufferLen * 2);
encoder.cpos = 0;
}
encoder.cbuf[encoder.cpos++] = num;
};
var writeUint8 = write;
var writeVarUint = (encoder, num) => {
while (num > BITS7) {
write(encoder, BIT8 | BITS7 & num);
num = floor(num / 128);
}
write(encoder, BITS7 & num);
};
var writeVarInt = (encoder, num) => {
const isNegative = isNegativeZero(num);
if (isNegative) {
num = -num;
}
write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | BITS6 & num);
num = floor(num / 64);
while (num > 0) {
write(encoder, (num > BITS7 ? BIT8 : 0) | BITS7 & num);
num = floor(num / 128);
}
};
var _strBuffer = new Uint8Array(3e4);
var _maxStrBSize = _strBuffer.length / 3;
var _writeVarStringNative = (encoder, str) => {
if (str.length < _maxStrBSize) {
const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
writeVarUint(encoder, written);
for (let i = 0; i < written; i++) {
write(encoder, _strBuffer[i]);
}
} else {
writeVarUint8Array(encoder, encodeUtf8(str));
}
};
var _writeVarStringPolyfill = (encoder, str) => {
const encodedString = unescape(encodeURIComponent(str));
const len = encodedString.length;
writeVarUint(encoder, len);
for (let i = 0; i < len; i++) {
write(
encoder,
encodedString.codePointAt(i)
);
}
};
var writeVarString = utf8TextEncoder &&
utf8TextEncoder.encodeInto ? _writeVarStringNative : _writeVarStringPolyfill;
var writeBinaryEncoder = (encoder, append2) => writeUint8Array(encoder, toUint8Array(append2));
var writeUint8Array = (encoder, uint8Array) => {
const bufferLen = encoder.cbuf.length;
const cpos = encoder.cpos;
const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
const rightCopyLen = uint8Array.length - leftCopyLen;
encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
encoder.cpos += leftCopyLen;
if (rightCopyLen > 0) {
encoder.bufs.push(encoder.cbuf);
encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
encoder.cpos = rightCopyLen;
}
};
var writeVarUint8Array = (encoder, uint8Array) => {
writeVarUint(encoder, uint8Array.byteLength);
writeUint8Array(encoder, uint8Array);
};
var writeOnDataView = (encoder, len) => {
verifyLen(encoder, len);
const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
encoder.cpos += len;
return dview;
};
var writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);
var writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);
var writeBigInt64 = (encoder, num) => (
writeOnDataView(encoder, 8).setBigInt64(0, num, false)
);
var floatTestBed = new DataView(new ArrayBuffer(4));
var isFloat32 = (num) => {
floatTestBed.setFloat32(0, num);
return floatTestBed.getFloat32(0) === num;
};
var writeAny = (encoder, data) => {
switch (typeof data) {
case "string":
write(encoder, 119);
writeVarString(encoder, data);
break;
case "number":
if (isInteger(data) && abs(data) <= BITS31) {
write(encoder, 125);
writeVarInt(encoder, data);
} else if (isFloat32(data)) {
write(encoder, 124);
writeFloat32(encoder, data);
} else {
write(encoder, 123);
writeFloat64(encoder, data);
}
break;
case "bigint":
write(encoder, 122);
writeBigInt64(encoder, data);
break;
case "object":
if (data === null) {
write(encoder, 126);
} else if (isArray(data)) {
write(encoder, 117);
writeVarUint(encoder, data.length);
for (let i = 0; i < data.length; i++) {
writeAny(encoder, data[i]);
}
} else if (data instanceof Uint8Array) {
write(encoder, 116);
writeVarUint8Array(encoder, data);
} else {
write(encoder, 118);
const keys2 = Object.keys(data);
writeVarUint(encoder, keys2.length);
for (let i = 0; i < keys2.length; i++) {
const key = keys2[i];
writeVarString(encoder, key);
writeAny(encoder, data[key]);
}
}
break;
case "boolean":
write(encoder, data ? 120 : 121);
break;
default:
write(encoder, 127);
}
};
var RleEncoder = class extends Encoder {
constructor(writer) {
super();
this.w = writer;
this.s = null;
this.count = 0;
}
write(v) {
if (this.s === v) {
this.count++;
} else {
if (this.count > 0) {
writeVarUint(this, this.count - 1);
}
this.count = 1;
this.w(this, v);
this.s = v;
}
}
};
var flushUintOptRleEncoder = (encoder) => {
if (encoder.count > 0) {
writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
if (encoder.count > 1) {
writeVarUint(encoder.encoder, encoder.count - 2);
}
}
};
var UintOptRleEncoder = class {
constructor() {
this.encoder = new Encoder();
this.s = 0;
this.count = 0;
}
write(v) {
if (this.s === v) {
this.count++;
} else {
flushUintOptRleEncoder(this);
this.count = 1;
this.s = v;
}
}
toUint8Array() {
flushUintOptRleEncoder(this);
return toUint8Array(this.encoder);
}
};
var flushIntDiffOptRleEncoder = (encoder) => {
if (encoder.count > 0) {
const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1);
writeVarInt(encoder.encoder, encodedDiff);
if (encoder.count > 1) {
writeVarUint(encoder.encoder, encoder.count - 2);
}
}
};
var IntDiffOptRleEncoder = class {
constructor() {
this.encoder = new Encoder();
this.s = 0;
this.count = 0;
this.diff = 0;
}
write(v) {
if (this.diff === v - this.s) {
this.s = v;
this.count++;
} else {
flushIntDiffOptRleEncoder(this);
this.count = 1;
this.diff = v - this.s;
this.s = v;
}
}
toUint8Array() {
flushIntDiffOptRleEncoder(this);
return toUint8Array(this.encoder);
}
};
var StringEncoder = class {
constructor() {
this.sarr = [];
this.s = "";
this.lensE = new UintOptRleEncoder();
}
write(string) {
this.s += string;
if (this.s.length > 19) {
this.sarr.push(this.s);
this.s = "";
}
this.lensE.write(string.length);
}
toUint8Array() {
const encoder = new Encoder();
this.sarr.push(this.s);
this.s = "";
writeVarString(encoder, this.sarr.join(""));
writeUint8Array(encoder, this.lensE.toUint8Array());
return toUint8Array(encoder);
}
};
var create3 = (s) => new Error(s);
var methodUnimplemented = () => {
throw create3("Method unimplemented");
};
var unexpectedCase = () => {
throw create3("Unexpected case");
};
var errorUnexpectedEndOfArray = create3("Unexpected end of array");
var errorIntegerOutOfRange = create3("Integer out of Range");
var Decoder = class {
constructor(uint8Array) {
this.arr = uint8Array;
this.pos = 0;
}
};
var createDecoder = (uint8Array) => new Decoder(uint8Array);
var hasContent = (decoder) => decoder.pos !== decoder.arr.length;
var readUint8Array = (decoder, len) => {
const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
decoder.pos += len;
return view;
};
var readVarUint8Array = (decoder) => readUint8Array(decoder, readVarUint(decoder));
var readUint8 = (decoder) => decoder.arr[decoder.pos++];
var readVarUint = (decoder) => {
let num = 0;
let mult = 1;
const len = decoder.arr.length;
while (decoder.pos < len) {
const r = decoder.arr[decoder.pos++];
num = num + (r & BITS7) * mult;
mult *= 128;
if (r < BIT8) {
return num;
}
if (num > MAX_SAFE_INTEGER) {
throw errorIntegerOutOfRange;
}
}
throw errorUnexpectedEndOfArray;
};
var readVarInt = (decoder) => {
let r = decoder.arr[decoder.pos++];
let num = r & BITS6;
let mult = 64;
const sign = (r & BIT7) > 0 ? -1 : 1;
if ((r & BIT8) === 0) {
return sign * num;
}
const len = decoder.arr.length;
while (decoder.pos < len) {
r = decoder.arr[decoder.pos++];
num = num + (r & BITS7) * mult;
mult *= 128;
if (r < BIT8) {
return sign * num;
}
if (num > MAX_SAFE_INTEGER) {
throw errorIntegerOutOfRange;
}
}
throw errorUnexpectedEndOfArray;
};
var _readVarStringPolyfill = (decoder) => {
let remainingLen = readVarUint(decoder);
if (remainingLen === 0) {
return "";
} else {
let encodedString = String.fromCodePoint(readUint8(decoder));
if (--remainingLen < 100) {
while (remainingLen--) {
encodedString += String.fromCodePoint(readUint8(decoder));
}
} else {
while (remainingLen > 0) {
const nextLen = remainingLen < 1e4 ? remainingLen : 1e4;
const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
decoder.pos += nextLen;
encodedString += String.fromCodePoint.apply(
null,
bytes
);
remainingLen -= nextLen;
}
}
return decodeURIComponent(escape(encodedString));
}
};
var _readVarStringNative = (decoder) => (
utf8TextDecoder.decode(readVarUint8Array(decoder))
);
var readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;
var readFromDataView = (decoder, len) => {
const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
decoder.pos += len;
return dv;
};
var readFloat32 = (decoder) => readFromDataView(decoder, 4).getFloat32(0, false);
var readFloat64 = (decoder) => readFromDataView(decoder, 8).getFloat64(0, false);
var readBigInt64 = (decoder) => (
readFromDataView(decoder, 8).getBigInt64(0, false)
);
var readAnyLookupTable = [
(decoder) => void 0,
(decoder) => null,
readVarInt,
readFloat32,
readFloat64,
readBigInt64,
(decoder) => false,
(decoder) => true,
readVarString,
(decoder) => {
const len = readVarUint(decoder);
const obj = {};
for (let i = 0; i < len; i++) {
const key = readVarString(decoder);
obj[key] = readAny(decoder);
}
return obj;
},
(decoder) => {
const len = readVarUint(decoder);
const arr = [];
for (let i = 0; i < len; i++) {
arr.push(readAny(decoder));
}
return arr;
},
readVarUint8Array
];
var readAny = (decoder) => readAnyLookupTable[127 - readUint8(decoder)](decoder);
var RleDecoder = class extends Decoder {
constructor(uint8Array, reader) {
super(uint8Array);
this.reader = reader;
this.s = null;
this.count = 0;
}
read() {
if (this.count === 0) {
this.s = this.reader(this);
if (hasContent(this)) {
this.count = readVarUint(this) + 1;
} else {
this.count = -1;
}
}
this.count--;
return (
this.s
);
}
};
var UintOptRleDecoder = class extends Decoder {
constructor(uint8Array) {
super(uint8Array);
this.s = 0;
this.count = 0;
}
read() {
if (this.count === 0) {
this.s = readVarInt(this);
const isNegative = isNegativeZero(this.s);
this.count = 1;
if (isNegative) {
this.s = -this.s;
this.count = readVarUint(this) + 2;
}
}
this.count--;
return (
this.s
);
}
};
var IntDiffOptRleDecoder = class extends Decoder {
constructor(uint8Array) {
super(uint8Array);
this.s = 0;
this.count = 0;
this.diff = 0;
}
read() {
if (this.count === 0) {
const diff = readVarInt(this);
const hasCount = diff & 1;
this.diff = floor(diff / 2);
this.count = 1;
if (hasCount) {
this.count = readVarUint(this) + 2;
}
}
this.s += this.diff;
this.count--;
return this.s;
}
};
var StringDecoder = class {
constructor(uint8Array) {
this.decoder = new UintOptRleDecoder(uint8Array);
this.str = readVarString(this.decoder);
this.spos = 0;
}
read() {
const end = this.spos + this.decoder.read();
const res = this.str.slice(this.spos, end);
this.spos = end;
return res;
}
};
var getUnixTime = Date.now;
var subtle = crypto.subtle;
var getRandomValues = crypto.getRandomValues.bind(crypto);
var uint32 = () => getRandomValues(new Uint32Array(1))[0];
var uuidv4Template = "10000000-1000-4000-8000" + -1e11;
var uuidv4 = () => uuidv4Template.replace(
/[018]/g,
(c) => (c ^ uint32() & 15 >> c / 4).toString(16)
);
var create4 = (f) => (
new Promise(f)
);
var all = Promise.all.bind(Promise);
var VarStoragePolyfill = class {
constructor() {
this.map =  new Map();
}
setItem(key, newValue) {
this.map.set(key, newValue);
}
getItem(key) {
return this.map.get(key);
}
};
var _localStorage = new VarStoragePolyfill();
var usePolyfill = true;
try {
if (typeof localStorage !== "undefined" && localStorage) {
_localStorage = localStorage;
usePolyfill = false;
}
} catch (e) {
}
var varStorage = _localStorage;
var onChange = (eventHandler) => usePolyfill || addEventListener(
"storage",
eventHandler
);
var offChange = (eventHandler) => usePolyfill || removeEventListener(
"storage",
eventHandler
);
var EqualityTraitSymbol = Symbol("Equality");
var equals = (a, b) => a === b || !!a?.[EqualityTraitSymbol]?.(b) || false;
var isObject = (o) => typeof o === "object";
var assign = Object.assign;
var keys = Object.keys;
var forEach = (obj, f) => {
for (const key in obj) {
f(obj[key], key);
}
};
var map2 = (obj, f) => {
const results = [];
for (const key in obj) {
results.push(f(obj[key], key));
}
return results;
};
var size = (obj) => keys(obj).length;
var isEmpty = (obj) => {
for (const _k in obj) {
return false;
}
return true;
};
var every2 = (obj, f) => {
for (const key in obj) {
if (!f(obj[key], key)) {
return false;
}
}
return true;
};
var hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
var equalFlat = (a, b) => a === b || size(a) === size(b) && every2(a, (val, key) => (val !== void 0 || hasProperty(b, key)) && equals(b[key], val));
var freeze = Object.freeze;
var deepFreeze = (o) => {
for (const key in o) {
const c = o[key];
if (typeof c === "object" || typeof c === "function") {
deepFreeze(o[key]);
}
}
return freeze(o);
};
var callAll = (fs, args2, i = 0) => {
try {
for (; i < fs.length; i++) {
fs[i](...args2);
}
} finally {
if (i < fs.length) {
callAll(fs, args2, i + 1);
}
}
};
var id = (a) => a;
var equalityDeep = (a, b) => {
if (a === b) {
return true;
}
if (a == null || b == null || a.constructor !== b.constructor && (a.constructor || Object) !== (b.constructor || Object)) {
return false;
}
if (a[EqualityTraitSymbol] != null) {
return a[EqualityTraitSymbol](b);
}
switch (a.constructor) {
case ArrayBuffer:
a = new Uint8Array(a);
b = new Uint8Array(b);
case Uint8Array: {
if (a.byteLength !== b.byteLength) {
return false;
}
for (let i = 0; i < a.length; i++) {
if (a[i] !== b[i]) {
return false;
}
}
break;
}
case Set: {
if (a.size !== b.size) {
return false;
}
for (const value of a) {
if (!b.has(value)) {
return false;
}
}
break;
}
case Map: {
if (a.size !== b.size) {
return false;
}
for (const key of a.keys()) {
if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
return false;
}
}
break;
}
case void 0:
case Object:
if (size(a) !== size(b)) {
return false;
}
for (const key in a) {
if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
return false;
}
}
break;
case Array:
if (a.length !== b.length) {
return false;
}
for (let i = 0; i < a.length; i++) {
if (!equalityDeep(a[i], b[i])) {
return false;
}
}
break;
default:
return false;
}
return true;
};
var isOneOf = (value, options) => options.includes(value);
var undefinedToNull = (v) => v === void 0 ? null : v;
var isNode = typeof process !== "undefined" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
var isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && !isNode;
var isMac = typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;
var params;
var args = [];
var computeParams = () => {
if (params === void 0) {
if (isNode) {
params = create();
const pargs = process.argv;
let currParamName = null;
for (let i = 0; i < pargs.length; i++) {
const parg = pargs[i];
if (parg[0] === "-") {
if (currParamName !== null) {
params.set(currParamName, "");
}
currParamName = parg;
} else {
if (currParamName !== null) {
params.set(currParamName, parg);
currParamName = null;
} else {
args.push(parg);
}
}
}
if (currParamName !== null) {
params.set(currParamName, "");
}
} else if (typeof location === "object") {
params = create();
(location.search || "?").slice(1).split("&").forEach((kv) => {
if (kv.length !== 0) {
const [key, value] = kv.split("=");
params.set(`--${fromCamelCase(key, "-")}`, value);
params.set(`-${fromCamelCase(key, "-")}`, value);
}
});
} else {
params = create();
}
}
return params;
};
var hasParam = (name) => computeParams().has(name);
var getVariable = (name) => isNode ? undefinedToNull(process.env[name.toUpperCase().replaceAll("-", "_")]) : undefinedToNull(varStorage.getItem(name));
var hasConf = (name) => hasParam("--" + name) || getVariable(name) !== null;
var production = hasConf("production");
var forceColor = isNode && isOneOf(process.env.FORCE_COLOR, ["true", "1", "2"]);
var supportsColor = forceColor || !hasParam("--no-colors") && // @todo deprecate --no-colors
!hasConf("no-color") && (!isNode || process.stdout.isTTY) && (!isNode || hasParam("--color") || getVariable("COLORTERM") !== null || (getVariable("TERM") || "").includes("color"));
var createUint8ArrayFromLen = (len) => new Uint8Array(len);
var createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length2) => new Uint8Array(buffer, byteOffset, length2);
var createUint8ArrayFromArrayBuffer = (buffer) => new Uint8Array(buffer);
var toBase64Browser = (bytes) => {
let s = "";
for (let i = 0; i < bytes.byteLength; i++) {
s += fromCharCode(bytes[i]);
}
return btoa(s);
};
var toBase64Node = (bytes) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64");
var fromBase64Browser = (s) => {
const a = atob(s);
const bytes = createUint8ArrayFromLen(a.length);
for (let i = 0; i < a.length; i++) {
bytes[i] = a.charCodeAt(i);
}
return bytes;
};
var fromBase64Node = (s) => {
const buf = Buffer.from(s, "base64");
return createUint8ArrayViewFromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength);
};
var toBase64 = isBrowser ? toBase64Browser : toBase64Node;
var fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;
var copyUint8Array = (uint8Array) => {
const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
newBuf.set(uint8Array);
return newBuf;
};
var create5 = Symbol;
var BOLD = create5();
var UNBOLD = create5();
var BLUE = create5();
var GREY = create5();
var GREEN = create5();
var RED = create5();
var PURPLE = create5();
var ORANGE = create5();
var UNCOLOR = create5();
var computeNoColorLoggingArgs = (args2) => {
if (args2.length === 1 && args2[0]?.constructor === Function) {
args2 =
args2[0]();
}
const strBuilder = [];
const logArgs = [];
let i = 0;
for (; i < args2.length; i++) {
const arg = args2[i];
if (arg === void 0) {
break;
} else if (arg.constructor === String || arg.constructor === Number) {
strBuilder.push(arg);
} else if (arg.constructor === Object) {
break;
}
}
if (i > 0) {
logArgs.push(strBuilder.join(""));
}
for (; i < args2.length; i++) {
const arg = args2[i];
if (!(arg instanceof Symbol)) {
logArgs.push(arg);
}
}
return logArgs;
};
var lastLoggingTime = getUnixTime();
var Pair = class {
constructor(left, right) {
this.left = left;
this.right = right;
}
};
var create6 = (left, right) => new Pair(left, right);
var bool = (gen) => gen.next() >= 0.5;
var int53 = (gen, min2, max2) => floor(gen.next() * (max2 + 1 - min2) + min2);
var int32 = (gen, min2, max2) => floor(gen.next() * (max2 + 1 - min2) + min2);
var int31 = (gen, min2, max2) => int32(gen, min2, max2);
var letter = (gen) => fromCharCode(int31(gen, 97, 122));
var word = (gen, minLen = 0, maxLen = 20) => {
const len = int31(gen, minLen, maxLen);
let str = "";
for (let i = 0; i < len; i++) {
str += letter(gen);
}
return str;
};
var oneOf = (gen, array) => array[int31(gen, 0, array.length - 1)];
var schemaSymbol = Symbol("0schema");
var ValidationError = class {
constructor() {
this._rerrs = [];
}
extend(path, expected, has, message = null) {
this._rerrs.push({ path, expected, has, message });
}
toString() {
const s = [];
for (let i = this._rerrs.length - 1; i > 0; i--) {
const r = this._rerrs[i];
s.push(repeat(" ", (this._rerrs.length - i) * 2) + `${r.path != null ? `[${r.path}] ` : ""}${r.has} doesn't match ${r.expected}. ${r.message}`);
}
return s.join("\n");
}
};
var shapeExtends = (a, b) => {
if (a === b) return true;
if (a == null || b == null || a.constructor !== b.constructor) return false;
if (a[EqualityTraitSymbol]) return equals(a, b);
if (isArray(a)) {
return every(
a,
(aitem) => some(b, (bitem) => shapeExtends(aitem, bitem))
);
} else if (isObject(a)) {
return every2(
a,
(aitem, akey) => shapeExtends(aitem, b[akey])
);
}
return false;
};
var Schema = class {
extends(other) {
let [a, b] = [
this.shape,
other.shape
];
if (
this.constructor._dilutes
) [b, a] = [a, b];
return shapeExtends(a, b);
}
equals(other) {
return this.constructor === other.constructor && equalityDeep(this.shape, other.shape);
}
[schemaSymbol]() {
return true;
}
[EqualityTraitSymbol](other) {
return this.equals(
other
);
}
validate(o) {
return this.check(o);
}
check(_o, _err) {
methodUnimplemented();
}
get nullable() {
return $union(this, $null);
}
get optional() {
return new $Optional(
this
);
}
cast(o) {
assert(o, this);
return (
o
);
}
expect(o) {
assert(o, this);
return o;
}
};
__publicField(Schema, "_dilutes", false);
var $ConstructedBy = class extends Schema {
constructor(c, check) {
super();
this.shape = c;
this._c = check;
}
check(o, err = void 0) {
const c = o?.constructor === this.shape && (this._c == null || this._c(o));
!c && err?.extend(null, this.shape.name, o?.constructor.name, o?.constructor !== this.shape ? "Constructor match failed" : "Check failed");
return c;
}
};
var $constructedBy = (c, check = null) => new $ConstructedBy(c, check);
var $$constructedBy = $constructedBy($ConstructedBy);
var $Custom = class extends Schema {
constructor(check) {
super();
this.shape = check;
}
check(o, err) {
const c = this.shape(o);
!c && err?.extend(null, "custom prop", o?.constructor.name, "failed to check custom prop");
return c;
}
};
var $custom = (check) => new $Custom(check);
var $$custom = $constructedBy($Custom);
var $Literal = class extends Schema {
constructor(literals) {
super();
this.shape = literals;
}
check(o, err) {
const c = this.shape.some((a) => a === o);
!c && err?.extend(null, this.shape.join(" | "), o.toString());
return c;
}
};
var $literal = (...literals) => new $Literal(literals);
var $$literal = $constructedBy($Literal);
var _regexEscape = (
RegExp.escape ||
((str) => str.replace(/[().|&,$^[\]]/g, (s) => "\\" + s))
);
var _schemaStringTemplateToRegex = (s) => {
if ($string.check(s)) {
return [_regexEscape(s)];
}
if ($$literal.check(s)) {
return (
s.shape.map((v) => v + "")
);
}
if ($$number.check(s)) {
return ["[+-]?\\d+.?\\d*"];
}
if ($$string.check(s)) {
return [".*"];
}
if ($$union.check(s)) {
return s.shape.map(_schemaStringTemplateToRegex).flat(1);
}
unexpectedCase();
};
var $StringTemplate = class extends Schema {
constructor(shape) {
super();
this.shape = shape;
this._r = new RegExp("^" + shape.map(_schemaStringTemplateToRegex).map((opts) => `(${opts.join("|")})`).join("") + "$");
}
check(o, err) {
const c = this._r.exec(o) != null;
!c && err?.extend(null, this._r.toString(), o.toString(), "String doesn't match string template.");
return c;
}
};
var $$stringTemplate = $constructedBy($StringTemplate);
var isOptionalSymbol = Symbol("optional");
var $Optional = class extends Schema {
constructor(shape) {
super();
this.shape = shape;
}
check(o, err) {
const c = o === void 0 || this.shape.check(o);
!c && err?.extend(null, "undefined (optional)", "()");
return c;
}
get [isOptionalSymbol]() {
return true;
}
};
var $$optional = $constructedBy($Optional);
var $Never = class extends Schema {
check(_o, err) {
err?.extend(null, "never", typeof _o);
return false;
}
};
var $never = new $Never();
var $$never = $constructedBy($Never);
var _$Object = class _$Object extends Schema {
constructor(shape, partial = false) {
super();
this.shape = shape;
this._isPartial = partial;
}
get partial() {
return new _$Object(this.shape, true);
}
check(o, err) {
if (o == null) {
err?.extend(null, "object", "null");
return false;
}
return every2(this.shape, (vv, vk) => {
const c = this._isPartial && !hasProperty(o, vk) || vv.check(o[vk], err);
!c && err?.extend(vk.toString(), vv.toString(), typeof o[vk], "Object property does not match");
return c;
});
}
};
__publicField(_$Object, "_dilutes", true);
var $Object = _$Object;
var $object = (def) => (
new $Object(def)
);
var $$object = $constructedBy($Object);
var $objectAny = $custom((o) => o != null && (o.constructor === Object || o.constructor == null));
var $Record = class extends Schema {
constructor(keys2, values) {
super();
this.shape = {
keys: keys2,
values
};
}
check(o, err) {
return o != null && every2(o, (vv, vk) => {
const ck = this.shape.keys.check(vk, err);
!ck && err?.extend(vk + "", "Record", typeof o, ck ? "Key doesn't match schema" : "Value doesn't match value");
return ck && this.shape.values.check(vv, err);
});
}
};
var $record = (keys2, values) => new $Record(keys2, values);
var $$record = $constructedBy($Record);
var $Tuple = class extends Schema {
constructor(shape) {
super();
this.shape = shape;
}
check(o, err) {
return o != null && every2(this.shape, (vv, vk) => {
const c = (
vv.check(o[vk], err)
);
!c && err?.extend(vk.toString(), "Tuple", typeof vv);
return c;
});
}
};
var $tuple = (...def) => new $Tuple(def);
var $$tuple = $constructedBy($Tuple);
var $Array = class extends Schema {
constructor(v) {
super();
this.shape = v.length === 1 ? v[0] : new $Union(v);
}
check(o, err) {
const c = isArray(o) && every(o, (oi) => this.shape.check(oi));
!c && err?.extend(null, "Array", "");
return c;
}
};
var $array = (...def) => new $Array(def);
var $$array = $constructedBy($Array);
var $arrayAny = $custom((o) => isArray(o));
var $InstanceOf = class extends Schema {
constructor(constructor, check) {
super();
this.shape = constructor;
this._c = check;
}
check(o, err) {
const c = o instanceof this.shape && (this._c == null || this._c(o));
!c && err?.extend(null, this.shape.name, o?.constructor.name);
return c;
}
};
var $instanceOf = (c, check = null) => new $InstanceOf(c, check);
var $$instanceOf = $constructedBy($InstanceOf);
var $$schema = $instanceOf(Schema);
var $Lambda = class extends Schema {
constructor(args2) {
super();
this.len = args2.length - 1;
this.args = $tuple(...args2.slice(-1));
this.res = args2[this.len];
}
check(f, err) {
const c = f.constructor === Function && f.length <= this.len;
!c && err?.extend(null, "function", typeof f);
return c;
}
};
var $$lambda = $constructedBy($Lambda);
var $function = $custom((o) => typeof o === "function");
var $Intersection = class extends Schema {
constructor(v) {
super();
this.shape = v;
}
check(o, err) {
const c = every(this.shape, (check) => check.check(o, err));
!c && err?.extend(null, "Intersectinon", typeof o);
return c;
}
};
var $$intersect = $constructedBy($Intersection, (o) => o.shape.length > 0);
var $Union = class extends Schema {
constructor(v) {
super();
this.shape = v;
}
check(o, err) {
const c = some(this.shape, (vv) => vv.check(o, err));
err?.extend(null, "Union", typeof o);
return c;
}
};
__publicField($Union, "_dilutes", true);
var $union = (...schemas) => schemas.findIndex(($s) => $$union.check($s)) >= 0 ? $union(...schemas.map(($s) => $($s)).map(($s) => $$union.check($s) ? $s.shape : [$s]).flat(1)) : schemas.length === 1 ? schemas[0] : new $Union(schemas);
var $$union = (
$constructedBy($Union)
);
var _t = () => true;
var $any = $custom(_t);
var $$any = (
$constructedBy($Custom, (o) => o.shape === _t)
);
var $bigint = $custom((o) => typeof o === "bigint");
var $$bigint = (
$custom((o) => o === $bigint)
);
var $symbol = $custom((o) => typeof o === "symbol");
var $$symbol = (
$custom((o) => o === $symbol)
);
var $number = $custom((o) => typeof o === "number");
var $$number = (
$custom((o) => o === $number)
);
var $string = $custom((o) => typeof o === "string");
var $$string = (
$custom((o) => o === $string)
);
var $boolean = $custom((o) => typeof o === "boolean");
var $$boolean = (
$custom((o) => o === $boolean)
);
var $undefined = $literal(void 0);
var $$undefined = (
$constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === void 0)
);
var $void = $literal(void 0);
var $null = $literal(null);
var $$null = (
$constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === null)
);
var $uint8Array = $constructedBy(Uint8Array);
var $$uint8Array = (
$constructedBy($ConstructedBy, (o) => o.shape === Uint8Array)
);
var $primitive = $union($number, $string, $null, $undefined, $bigint, $boolean, $symbol);
var $json = (() => {
const $jsonArr = (
$array($any)
);
const $jsonRecord = (
$record($string, $any)
);
const $json2 = $union($number, $string, $null, $boolean, $jsonArr, $jsonRecord);
$jsonArr.shape = $json2;
$jsonRecord.shape.values = $json2;
return $json2;
})();
var $ = (o) => {
if ($$schema.check(o)) {
return (
o
);
} else if ($objectAny.check(o)) {
const o2 = {};
for (const k in o) {
o2[k] = $(o[k]);
}
return (
$object(o2)
);
} else if ($arrayAny.check(o)) {
return (
$union(...o.map($))
);
} else if ($primitive.check(o)) {
return (
$literal(o)
);
} else if ($function.check(o)) {
return (
$constructedBy(
o
)
);
}
unexpectedCase();
};
var assert = production ? () => {
} : (o, schema) => {
const err = new ValidationError();
if (!schema.check(o, err)) {
throw create3(`Expected value to be of type ${schema.constructor.name}.
${err.toString()}`);
}
};
var PatternMatcher = class {
constructor($state) {
this.patterns = [];
this.$state = $state;
}
if(pattern, handler) {
this.patterns.push({ if: $(pattern), h: handler });
return this;
}
else(h) {
return this.if($any, h);
}
done() {
return (
(o, s) => {
for (let i = 0; i < this.patterns.length; i++) {
const p = this.patterns[i];
if (p.if.check(o)) {
return p.h(o, s);
}
}
throw create3("Unhandled pattern");
}
);
}
};
var match = (state) => new PatternMatcher(
state
);
var _random = (
match(
$any
).if($$number, (_o, gen) => int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER)).if($$string, (_o, gen) => word(gen)).if($$boolean, (_o, gen) => bool(gen)).if($$bigint, (_o, gen) => BigInt(int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER))).if($$union, (o, gen) => random(gen, oneOf(gen, o.shape))).if($$object, (o, gen) => {
const res = {};
for (const k in o.shape) {
let prop = o.shape[k];
if ($$optional.check(prop)) {
if (bool(gen)) {
continue;
}
prop = prop.shape;
}
res[k] = _random(prop, gen);
}
return res;
}).if($$array, (o, gen) => {
const arr = [];
const n = int32(gen, 0, 42);
for (let i = 0; i < n; i++) {
arr.push(random(gen, o.shape));
}
return arr;
}).if($$literal, (o, gen) => {
return oneOf(gen, o.shape);
}).if($$null, (o, gen) => {
return null;
}).if($$lambda, (o, gen) => {
const res = random(gen, o.res);
return () => res;
}).if($$any, (o, gen) => random(gen, oneOf(gen, [
$number,
$string,
$null,
$undefined,
$bigint,
$boolean,
$array($number),
$record($union("a", "b", "c"), $number)
]))).if($$record, (o, gen) => {
const res = {};
const keysN = int53(gen, 0, 3);
for (let i = 0; i < keysN; i++) {
const key = random(gen, o.shape.keys);
const val = random(gen, o.shape.values);
res[key] = val;
}
return res;
}).done()
);
var random = (gen, schema) => (
_random($(schema), gen)
);
var doc = (
typeof document !== "undefined" ? document : {}
);
var $fragment = $custom((el) => el.nodeType === DOCUMENT_FRAGMENT_NODE);
var domParser = (
typeof DOMParser !== "undefined" ? new DOMParser() : null
);
var $element = $custom((el) => el.nodeType === ELEMENT_NODE);
var $text = $custom((el) => el.nodeType === TEXT_NODE);
var mapToStyleString = (m) => map(m, (value, key) => `${key}:${value};`).join("");
var ELEMENT_NODE = doc.ELEMENT_NODE;
var TEXT_NODE = doc.TEXT_NODE;
var CDATA_SECTION_NODE = doc.CDATA_SECTION_NODE;
var COMMENT_NODE = doc.COMMENT_NODE;
var DOCUMENT_NODE = doc.DOCUMENT_NODE;
var DOCUMENT_TYPE_NODE = doc.DOCUMENT_TYPE_NODE;
var DOCUMENT_FRAGMENT_NODE = doc.DOCUMENT_FRAGMENT_NODE;
var $node = $custom((el) => el.nodeType === DOCUMENT_NODE);
var _browserStyleMap = {
[BOLD]: create6("font-weight", "bold"),
[UNBOLD]: create6("font-weight", "normal"),
[BLUE]: create6("color", "blue"),
[GREEN]: create6("color", "green"),
[GREY]: create6("color", "grey"),
[RED]: create6("color", "red"),
[PURPLE]: create6("color", "purple"),
[ORANGE]: create6("color", "orange"),
[UNCOLOR]: create6("color", "black")
};
var computeBrowserLoggingArgs = (args2) => {
if (args2.length === 1 && args2[0]?.constructor === Function) {
args2 =
args2[0]();
}
const strBuilder = [];
const styles = [];
const currentStyle = create();
let logArgs = [];
let i = 0;
for (; i < args2.length; i++) {
const arg = args2[i];
const style = _browserStyleMap[arg];
if (style !== void 0) {
currentStyle.set(style.left, style.right);
} else {
if (arg === void 0) {
break;
}
if (arg.constructor === String || arg.constructor === Number) {
const style2 = mapToStyleString(currentStyle);
if (i > 0 || style2.length > 0) {
strBuilder.push("%c" + arg);
styles.push(style2);
} else {
strBuilder.push(arg);
}
} else {
break;
}
}
}
if (i > 0) {
logArgs = styles;
logArgs.unshift(strBuilder.join(""));
}
for (; i < args2.length; i++) {
const arg = args2[i];
if (!(arg instanceof Symbol)) {
logArgs.push(arg);
}
}
return logArgs;
};
var computeLoggingArgs = supportsColor ? computeBrowserLoggingArgs : computeNoColorLoggingArgs;
var print = (...args2) => {
console.log(...computeLoggingArgs(args2));
vconsoles.forEach((vc) => vc.print(args2));
};
var warn = (...args2) => {
console.warn(...computeLoggingArgs(args2));
args2.unshift(ORANGE);
vconsoles.forEach((vc) => vc.print(args2));
};
var vconsoles = create2();
var createIterator = (next) => ({
[Symbol.iterator]() {
return this;
},
next
});
var iteratorFilter = (iterator, filter) => createIterator(() => {
let res;
do {
res = iterator.next();
} while (!res.done && !filter(res.value));
return res;
});
var iteratorMap = (iterator, fmap) => createIterator(() => {
const { done, value } = iterator.next();
return { done, value: done ? void 0 : fmap(value) };
});
export {
create,
copy,
setIfUndefined,
any,
create2,
last,
appendTo,
from,
some,
isArray,
ObservableV2,
Observable,
floor,
abs,
min,
max,
pow,
BIT1,
BIT2,
BIT3,
BIT4,
BIT6,
BIT7,
BIT8,
BITS5,
repeat,
createEncoder,
length,
toUint8Array,
writeUint8,
writeVarUint,
writeVarInt,
writeVarString,
writeBinaryEncoder,
writeUint8Array,
writeVarUint8Array,
writeAny,
RleEncoder,
UintOptRleEncoder,
IntDiffOptRleEncoder,
StringEncoder,
create3,
methodUnimplemented,
unexpectedCase,
createDecoder,
hasContent,
readVarUint8Array,
readUint8,
readVarUint,
readVarInt,
readVarString,
readAny,
RleDecoder,
UintOptRleDecoder,
IntDiffOptRleDecoder,
StringDecoder,
uint32,
uuidv4,
getUnixTime,
create4,
varStorage,
onChange,
offChange,
assign,
forEach,
map2 as map,
isEmpty,
equalFlat,
deepFreeze,
callAll,
id,
equalityDeep,
getVariable,
createUint8ArrayFromArrayBuffer,
toBase64,
fromBase64,
copyUint8Array,
BOLD,
UNBOLD,
RED,
ORANGE,
print,
warn,
iteratorFilter,
iteratorMap
};