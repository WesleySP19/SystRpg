import {
BIT1,
BIT2,
BIT3,
BIT4,
BIT6,
BIT7,
BIT8,
BITS5,
BOLD,
IntDiffOptRleDecoder,
IntDiffOptRleEncoder,
ORANGE,
Observable,
ObservableV2,
RED,
RleDecoder,
RleEncoder,
StringDecoder,
StringEncoder,
UNBOLD,
UintOptRleDecoder,
UintOptRleEncoder,
abs,
any,
appendTo,
assign,
callAll,
copy,
copyUint8Array,
create,
create2,
create3,
create4,
createDecoder,
createEncoder,
createUint8ArrayFromArrayBuffer,
deepFreeze,
equalFlat,
equalityDeep,
floor,
forEach,
from,
fromBase64,
getUnixTime,
getVariable,
id,
isEmpty,
iteratorFilter,
iteratorMap,
last,
length,
map,
max,
methodUnimplemented,
min,
offChange,
onChange,
pow,
print,
readAny,
readUint8,
readVarString,
readVarUint,
readVarUint8Array,
setIfUndefined,
toBase64,
toUint8Array,
uint32,
unexpectedCase,
uuidv4,
varStorage,
warn,
writeAny,
writeUint8,
writeUint8Array,
writeVarString,
writeVarUint,
writeVarUint8Array
} from "./chunk-7D4CNOR2.js";
var DeleteItem = class {
constructor(clock, len) {
this.clock = clock;
this.len = len;
}
};
var DeleteSet = class {
constructor() {
this.clients =  new Map();
}
};
var iterateDeletedStructs = (transaction, ds, f) => ds.clients.forEach((deletes, clientid) => {
const structs = (
transaction.doc.store.clients.get(clientid)
);
if (structs != null) {
const lastStruct = structs[structs.length - 1];
const clockState = lastStruct.id.clock + lastStruct.length;
for (let i = 0, del = deletes[i]; i < deletes.length && del.clock < clockState; del = deletes[++i]) {
iterateStructs(transaction, structs, del.clock, del.len, f);
}
}
});
var findIndexDS = (dis, clock) => {
let left = 0;
let right = dis.length - 1;
while (left <= right) {
const midindex = floor((left + right) / 2);
const mid = dis[midindex];
const midclock = mid.clock;
if (midclock <= clock) {
if (clock < midclock + mid.len) {
return midindex;
}
left = midindex + 1;
} else {
right = midindex - 1;
}
}
return null;
};
var isDeleted = (ds, id2) => {
const dis = ds.clients.get(id2.client);
return dis !== void 0 && findIndexDS(dis, id2.clock) !== null;
};
var sortAndMergeDeleteSet = (ds) => {
ds.clients.forEach((dels) => {
dels.sort((a, b) => a.clock - b.clock);
let i, j;
for (i = 1, j = 1; i < dels.length; i++) {
const left = dels[j - 1];
const right = dels[i];
if (left.clock + left.len >= right.clock) {
dels[j - 1] = new DeleteItem(left.clock, max(left.len, right.clock + right.len - left.clock));
} else {
if (j < i) {
dels[j] = right;
}
j++;
}
}
dels.length = j;
});
};
var mergeDeleteSets = (dss) => {
const merged = new DeleteSet();
for (let dssI = 0; dssI < dss.length; dssI++) {
dss[dssI].clients.forEach((delsLeft, client) => {
if (!merged.clients.has(client)) {
const dels = delsLeft.slice();
for (let i = dssI + 1; i < dss.length; i++) {
appendTo(dels, dss[i].clients.get(client) || []);
}
merged.clients.set(client, dels);
}
});
}
sortAndMergeDeleteSet(merged);
return merged;
};
var addToDeleteSet = (ds, client, clock, length2) => {
setIfUndefined(ds.clients, client, () => (
[]
)).push(new DeleteItem(clock, length2));
};
var createDeleteSet = () => new DeleteSet();
var createDeleteSetFromStructStore = (ss) => {
const ds = createDeleteSet();
ss.clients.forEach((structs, client) => {
const dsitems = [];
for (let i = 0; i < structs.length; i++) {
const struct = structs[i];
if (struct.deleted) {
const clock = struct.id.clock;
let len = struct.length;
if (i + 1 < structs.length) {
for (let next = structs[i + 1]; i + 1 < structs.length && next.deleted; next = structs[++i + 1]) {
len += next.length;
}
}
dsitems.push(new DeleteItem(clock, len));
}
}
if (dsitems.length > 0) {
ds.clients.set(client, dsitems);
}
});
return ds;
};
var writeDeleteSet = (encoder, ds) => {
writeVarUint(encoder.restEncoder, ds.clients.size);
from(ds.clients.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, dsitems]) => {
encoder.resetDsCurVal();
writeVarUint(encoder.restEncoder, client);
const len = dsitems.length;
writeVarUint(encoder.restEncoder, len);
for (let i = 0; i < len; i++) {
const item = dsitems[i];
encoder.writeDsClock(item.clock);
encoder.writeDsLen(item.len);
}
});
};
var readDeleteSet = (decoder) => {
const ds = new DeleteSet();
const numClients = readVarUint(decoder.restDecoder);
for (let i = 0; i < numClients; i++) {
decoder.resetDsCurVal();
const client = readVarUint(decoder.restDecoder);
const numberOfDeletes = readVarUint(decoder.restDecoder);
if (numberOfDeletes > 0) {
const dsField = setIfUndefined(ds.clients, client, () => (
[]
));
for (let i2 = 0; i2 < numberOfDeletes; i2++) {
dsField.push(new DeleteItem(decoder.readDsClock(), decoder.readDsLen()));
}
}
}
return ds;
};
var readAndApplyDeleteSet = (decoder, transaction, store) => {
const unappliedDS = new DeleteSet();
const numClients = readVarUint(decoder.restDecoder);
for (let i = 0; i < numClients; i++) {
decoder.resetDsCurVal();
const client = readVarUint(decoder.restDecoder);
const numberOfDeletes = readVarUint(decoder.restDecoder);
const structs = store.clients.get(client) || [];
const state = getState(store, client);
for (let i2 = 0; i2 < numberOfDeletes; i2++) {
const clock = decoder.readDsClock();
const clockEnd = clock + decoder.readDsLen();
if (clock < state) {
if (state < clockEnd) {
addToDeleteSet(unappliedDS, client, state, clockEnd - state);
}
let index = findIndexSS(structs, clock);
let struct = structs[index];
if (!struct.deleted && struct.id.clock < clock) {
structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
index++;
}
while (index < structs.length) {
struct = structs[index++];
if (struct.id.clock < clockEnd) {
if (!struct.deleted) {
if (clockEnd < struct.id.clock + struct.length) {
structs.splice(index, 0, splitItem(transaction, struct, clockEnd - struct.id.clock));
}
struct.delete(transaction);
}
} else {
break;
}
}
} else {
addToDeleteSet(unappliedDS, client, clock, clockEnd - clock);
}
}
}
if (unappliedDS.clients.size > 0) {
const ds = new UpdateEncoderV2();
writeVarUint(ds.restEncoder, 0);
writeDeleteSet(ds, unappliedDS);
return ds.toUint8Array();
}
return null;
};
var generateNewClientId = uint32;
var Doc = class _Doc extends ObservableV2 {
constructor({ guid = uuidv4(), collectionid = null, gc = true, gcFilter = () => true, meta = null, autoLoad = false, shouldLoad = true } = {}) {
super();
this.gc = gc;
this.gcFilter = gcFilter;
this.clientID = generateNewClientId();
this.guid = guid;
this.collectionid = collectionid;
this.share =  new Map();
this.store = new StructStore();
this._transaction = null;
this._transactionCleanups = [];
this.subdocs =  new Set();
this._item = null;
this.shouldLoad = shouldLoad;
this.autoLoad = autoLoad;
this.meta = meta;
this.isLoaded = false;
this.isSynced = false;
this.isDestroyed = false;
this.whenLoaded = create4((resolve) => {
this.on("load", () => {
this.isLoaded = true;
resolve(this);
});
});
const provideSyncedPromise = () => create4((resolve) => {
const eventHandler = (isSynced) => {
if (isSynced === void 0 || isSynced === true) {
this.off("sync", eventHandler);
resolve();
}
};
this.on("sync", eventHandler);
});
this.on("sync", (isSynced) => {
if (isSynced === false && this.isSynced) {
this.whenSynced = provideSyncedPromise();
}
this.isSynced = isSynced === void 0 || isSynced === true;
if (this.isSynced && !this.isLoaded) {
this.emit("load", [this]);
}
});
this.whenSynced = provideSyncedPromise();
}
load() {
const item = this._item;
if (item !== null && !this.shouldLoad) {
transact(
item.parent.doc,
(transaction) => {
transaction.subdocsLoaded.add(this);
},
null,
true
);
}
this.shouldLoad = true;
}
getSubdocs() {
return this.subdocs;
}
getSubdocGuids() {
return new Set(from(this.subdocs).map((doc) => doc.guid));
}
transact(f, origin = null) {
return transact(this, f, origin);
}
get(name, TypeConstructor = (
AbstractType
)) {
const type = setIfUndefined(this.share, name, () => {
const t = new TypeConstructor();
t._integrate(this, null);
return t;
});
const Constr = type.constructor;
if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
if (Constr === AbstractType) {
const t = new TypeConstructor();
t._map = type._map;
type._map.forEach(
(n) => {
for (; n !== null; n = n.left) {
n.parent = t;
}
}
);
t._start = type._start;
for (let n = t._start; n !== null; n = n.right) {
n.parent = t;
}
t._length = type._length;
this.share.set(name, t);
t._integrate(this, null);
return (
t
);
} else {
throw new Error(`Type with the name ${name} has already been defined with a different constructor`);
}
}
return (
type
);
}
getArray(name = "") {
return (
this.get(name, YArray)
);
}
getText(name = "") {
return this.get(name, YText);
}
getMap(name = "") {
return (
this.get(name, YMap)
);
}
getXmlElement(name = "") {
return (
this.get(name, YXmlElement)
);
}
getXmlFragment(name = "") {
return this.get(name, YXmlFragment);
}
toJSON() {
const doc = {};
this.share.forEach((value, key) => {
doc[key] = value.toJSON();
});
return doc;
}
destroy() {
this.isDestroyed = true;
from(this.subdocs).forEach((subdoc) => subdoc.destroy());
const item = this._item;
if (item !== null) {
this._item = null;
const content = (
item.content
);
content.doc = new _Doc({ guid: this.guid, ...content.opts, shouldLoad: false });
content.doc._item = item;
transact(
item.parent.doc,
(transaction) => {
const doc = content.doc;
if (!item.deleted) {
transaction.subdocsAdded.add(doc);
}
transaction.subdocsRemoved.add(this);
},
null,
true
);
}
this.emit("destroyed", [true]);
this.emit("destroy", [this]);
super.destroy();
}
};
var DSDecoderV1 = class {
constructor(decoder) {
this.restDecoder = decoder;
}
resetDsCurVal() {
}
readDsClock() {
return readVarUint(this.restDecoder);
}
readDsLen() {
return readVarUint(this.restDecoder);
}
};
var UpdateDecoderV1 = class extends DSDecoderV1 {
readLeftID() {
return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
}
readRightID() {
return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
}
readClient() {
return readVarUint(this.restDecoder);
}
readInfo() {
return readUint8(this.restDecoder);
}
readString() {
return readVarString(this.restDecoder);
}
readParentInfo() {
return readVarUint(this.restDecoder) === 1;
}
readTypeRef() {
return readVarUint(this.restDecoder);
}
readLen() {
return readVarUint(this.restDecoder);
}
readAny() {
return readAny(this.restDecoder);
}
readBuf() {
return copyUint8Array(readVarUint8Array(this.restDecoder));
}
readJSON() {
return JSON.parse(readVarString(this.restDecoder));
}
readKey() {
return readVarString(this.restDecoder);
}
};
var DSDecoderV2 = class {
constructor(decoder) {
this.dsCurrVal = 0;
this.restDecoder = decoder;
}
resetDsCurVal() {
this.dsCurrVal = 0;
}
readDsClock() {
this.dsCurrVal += readVarUint(this.restDecoder);
return this.dsCurrVal;
}
readDsLen() {
const diff = readVarUint(this.restDecoder) + 1;
this.dsCurrVal += diff;
return diff;
}
};
var UpdateDecoderV2 = class extends DSDecoderV2 {
constructor(decoder) {
super(decoder);
this.keys = [];
readVarUint(decoder);
this.keyClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
this.clientDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
this.leftClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
this.rightClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
this.infoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
this.stringDecoder = new StringDecoder(readVarUint8Array(decoder));
this.parentInfoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
this.typeRefDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
this.lenDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
}
readLeftID() {
return new ID(this.clientDecoder.read(), this.leftClockDecoder.read());
}
readRightID() {
return new ID(this.clientDecoder.read(), this.rightClockDecoder.read());
}
readClient() {
return this.clientDecoder.read();
}
readInfo() {
return (
this.infoDecoder.read()
);
}
readString() {
return this.stringDecoder.read();
}
readParentInfo() {
return this.parentInfoDecoder.read() === 1;
}
readTypeRef() {
return this.typeRefDecoder.read();
}
readLen() {
return this.lenDecoder.read();
}
readAny() {
return readAny(this.restDecoder);
}
readBuf() {
return readVarUint8Array(this.restDecoder);
}
readJSON() {
return readAny(this.restDecoder);
}
readKey() {
const keyClock = this.keyClockDecoder.read();
if (keyClock < this.keys.length) {
return this.keys[keyClock];
} else {
const key = this.stringDecoder.read();
this.keys.push(key);
return key;
}
}
};
var DSEncoderV1 = class {
constructor() {
this.restEncoder = createEncoder();
}
toUint8Array() {
return toUint8Array(this.restEncoder);
}
resetDsCurVal() {
}
writeDsClock(clock) {
writeVarUint(this.restEncoder, clock);
}
writeDsLen(len) {
writeVarUint(this.restEncoder, len);
}
};
var UpdateEncoderV1 = class extends DSEncoderV1 {
writeLeftID(id2) {
writeVarUint(this.restEncoder, id2.client);
writeVarUint(this.restEncoder, id2.clock);
}
writeRightID(id2) {
writeVarUint(this.restEncoder, id2.client);
writeVarUint(this.restEncoder, id2.clock);
}
writeClient(client) {
writeVarUint(this.restEncoder, client);
}
writeInfo(info) {
writeUint8(this.restEncoder, info);
}
writeString(s) {
writeVarString(this.restEncoder, s);
}
writeParentInfo(isYKey) {
writeVarUint(this.restEncoder, isYKey ? 1 : 0);
}
writeTypeRef(info) {
writeVarUint(this.restEncoder, info);
}
writeLen(len) {
writeVarUint(this.restEncoder, len);
}
writeAny(any2) {
writeAny(this.restEncoder, any2);
}
writeBuf(buf) {
writeVarUint8Array(this.restEncoder, buf);
}
writeJSON(embed) {
writeVarString(this.restEncoder, JSON.stringify(embed));
}
writeKey(key) {
writeVarString(this.restEncoder, key);
}
};
var DSEncoderV2 = class {
constructor() {
this.restEncoder = createEncoder();
this.dsCurrVal = 0;
}
toUint8Array() {
return toUint8Array(this.restEncoder);
}
resetDsCurVal() {
this.dsCurrVal = 0;
}
writeDsClock(clock) {
const diff = clock - this.dsCurrVal;
this.dsCurrVal = clock;
writeVarUint(this.restEncoder, diff);
}
writeDsLen(len) {
if (len === 0) {
unexpectedCase();
}
writeVarUint(this.restEncoder, len - 1);
this.dsCurrVal += len;
}
};
var UpdateEncoderV2 = class extends DSEncoderV2 {
constructor() {
super();
this.keyMap =  new Map();
this.keyClock = 0;
this.keyClockEncoder = new IntDiffOptRleEncoder();
this.clientEncoder = new UintOptRleEncoder();
this.leftClockEncoder = new IntDiffOptRleEncoder();
this.rightClockEncoder = new IntDiffOptRleEncoder();
this.infoEncoder = new RleEncoder(writeUint8);
this.stringEncoder = new StringEncoder();
this.parentInfoEncoder = new RleEncoder(writeUint8);
this.typeRefEncoder = new UintOptRleEncoder();
this.lenEncoder = new UintOptRleEncoder();
}
toUint8Array() {
const encoder = createEncoder();
writeVarUint(encoder, 0);
writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
writeVarUint8Array(encoder, toUint8Array(this.infoEncoder));
writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
writeVarUint8Array(encoder, toUint8Array(this.parentInfoEncoder));
writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
writeUint8Array(encoder, toUint8Array(this.restEncoder));
return toUint8Array(encoder);
}
writeLeftID(id2) {
this.clientEncoder.write(id2.client);
this.leftClockEncoder.write(id2.clock);
}
writeRightID(id2) {
this.clientEncoder.write(id2.client);
this.rightClockEncoder.write(id2.clock);
}
writeClient(client) {
this.clientEncoder.write(client);
}
writeInfo(info) {
this.infoEncoder.write(info);
}
writeString(s) {
this.stringEncoder.write(s);
}
writeParentInfo(isYKey) {
this.parentInfoEncoder.write(isYKey ? 1 : 0);
}
writeTypeRef(info) {
this.typeRefEncoder.write(info);
}
writeLen(len) {
this.lenEncoder.write(len);
}
writeAny(any2) {
writeAny(this.restEncoder, any2);
}
writeBuf(buf) {
writeVarUint8Array(this.restEncoder, buf);
}
writeJSON(embed) {
writeAny(this.restEncoder, embed);
}
writeKey(key) {
const clock = this.keyMap.get(key);
if (clock === void 0) {
this.keyClockEncoder.write(this.keyClock++);
this.stringEncoder.write(key);
} else {
this.keyClockEncoder.write(clock);
}
}
};
var writeStructs = (encoder, structs, client, clock) => {
clock = max(clock, structs[0].id.clock);
const startNewStructs = findIndexSS(structs, clock);
writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
encoder.writeClient(client);
writeVarUint(encoder.restEncoder, clock);
const firstStruct = structs[startNewStructs];
firstStruct.write(encoder, clock - firstStruct.id.clock);
for (let i = startNewStructs + 1; i < structs.length; i++) {
structs[i].write(encoder, 0);
}
};
var writeClientsStructs = (encoder, store, _sm) => {
const sm =  new Map();
_sm.forEach((clock, client) => {
if (getState(store, client) > clock) {
sm.set(client, clock);
}
});
getStateVector(store).forEach((_clock, client) => {
if (!_sm.has(client)) {
sm.set(client, 0);
}
});
writeVarUint(encoder.restEncoder, sm.size);
from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
writeStructs(
encoder,
store.clients.get(client),
client,
clock
);
});
};
var readClientsStructRefs = (decoder, doc) => {
const clientRefs = create();
const numOfStateUpdates = readVarUint(decoder.restDecoder);
for (let i = 0; i < numOfStateUpdates; i++) {
const numberOfStructs = readVarUint(decoder.restDecoder);
const refs = new Array(numberOfStructs);
const client = decoder.readClient();
let clock = readVarUint(decoder.restDecoder);
clientRefs.set(client, { i: 0, refs });
for (let i2 = 0; i2 < numberOfStructs; i2++) {
const info = decoder.readInfo();
switch (BITS5 & info) {
case 0: {
const len = decoder.readLen();
refs[i2] = new GC(createID(client, clock), len);
clock += len;
break;
}
case 10: {
const len = readVarUint(decoder.restDecoder);
refs[i2] = new Skip(createID(client, clock), len);
clock += len;
break;
}
default: {
const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
const struct = new Item(
createID(client, clock),
null,
(info & BIT8) === BIT8 ? decoder.readLeftID() : null,
null,
(info & BIT7) === BIT7 ? decoder.readRightID() : null,
cantCopyParentInfo ? decoder.readParentInfo() ? doc.get(decoder.readString()) : decoder.readLeftID() : null,
cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null,
readItemContent(decoder, info)
);
refs[i2] = struct;
clock += struct.length;
}
}
}
}
return clientRefs;
};
var integrateStructs = (transaction, store, clientsStructRefs) => {
const stack = [];
let clientsStructRefsIds = from(clientsStructRefs.keys()).sort((a, b) => a - b);
if (clientsStructRefsIds.length === 0) {
return null;
}
const getNextStructTarget = () => {
if (clientsStructRefsIds.length === 0) {
return null;
}
let nextStructsTarget = (
clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1])
);
while (nextStructsTarget.refs.length === nextStructsTarget.i) {
clientsStructRefsIds.pop();
if (clientsStructRefsIds.length > 0) {
nextStructsTarget =
clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
} else {
return null;
}
}
return nextStructsTarget;
};
let curStructsTarget = getNextStructTarget();
if (curStructsTarget === null) {
return null;
}
const restStructs = new StructStore();
const missingSV =  new Map();
const updateMissingSv = (client, clock) => {
const mclock = missingSV.get(client);
if (mclock == null || mclock > clock) {
missingSV.set(client, clock);
}
};
let stackHead = (
curStructsTarget.refs[
curStructsTarget.i++
]
);
const state =  new Map();
const addStackToRestSS = () => {
for (const item of stack) {
const client = item.id.client;
const inapplicableItems = clientsStructRefs.get(client);
if (inapplicableItems) {
inapplicableItems.i--;
restStructs.clients.set(client, inapplicableItems.refs.slice(inapplicableItems.i));
clientsStructRefs.delete(client);
inapplicableItems.i = 0;
inapplicableItems.refs = [];
} else {
restStructs.clients.set(client, [item]);
}
clientsStructRefsIds = clientsStructRefsIds.filter((c) => c !== client);
}
stack.length = 0;
};
while (true) {
if (stackHead.constructor !== Skip) {
const localClock = setIfUndefined(state, stackHead.id.client, () => getState(store, stackHead.id.client));
const offset = localClock - stackHead.id.clock;
if (offset < 0) {
stack.push(stackHead);
updateMissingSv(stackHead.id.client, stackHead.id.clock - 1);
addStackToRestSS();
} else {
const missing = stackHead.getMissing(transaction, store);
if (missing !== null) {
stack.push(stackHead);
const structRefs = clientsStructRefs.get(
missing
) || { refs: [], i: 0 };
if (structRefs.refs.length === structRefs.i) {
updateMissingSv(
missing,
getState(store, missing)
);
addStackToRestSS();
} else {
stackHead = structRefs.refs[structRefs.i++];
continue;
}
} else if (offset === 0 || offset < stackHead.length) {
stackHead.integrate(transaction, offset);
state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
}
}
}
if (stack.length > 0) {
stackHead =
stack.pop();
} else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) {
stackHead =
curStructsTarget.refs[curStructsTarget.i++];
} else {
curStructsTarget = getNextStructTarget();
if (curStructsTarget === null) {
break;
} else {
stackHead =
curStructsTarget.refs[curStructsTarget.i++];
}
}
}
if (restStructs.clients.size > 0) {
const encoder = new UpdateEncoderV2();
writeClientsStructs(encoder, restStructs,  new Map());
writeVarUint(encoder.restEncoder, 0);
return { missing: missingSV, update: encoder.toUint8Array() };
}
return null;
};
var writeStructsFromTransaction = (encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState);
var readUpdateV2 = (decoder, ydoc, transactionOrigin, structDecoder = new UpdateDecoderV2(decoder)) => transact(ydoc, (transaction) => {
transaction.local = false;
let retry = false;
const doc = transaction.doc;
const store = doc.store;
const ss = readClientsStructRefs(structDecoder, doc);
const restStructs = integrateStructs(transaction, store, ss);
const pending = store.pendingStructs;
if (pending) {
for (const [client, clock] of pending.missing) {
if (clock < getState(store, client)) {
retry = true;
break;
}
}
if (restStructs) {
for (const [client, clock] of restStructs.missing) {
const mclock = pending.missing.get(client);
if (mclock == null || mclock > clock) {
pending.missing.set(client, clock);
}
}
pending.update = mergeUpdatesV2([pending.update, restStructs.update]);
}
} else {
store.pendingStructs = restStructs;
}
const dsRest = readAndApplyDeleteSet(structDecoder, transaction, store);
if (store.pendingDs) {
const pendingDSUpdate = new UpdateDecoderV2(createDecoder(store.pendingDs));
readVarUint(pendingDSUpdate.restDecoder);
const dsRest2 = readAndApplyDeleteSet(pendingDSUpdate, transaction, store);
if (dsRest && dsRest2) {
store.pendingDs = mergeUpdatesV2([dsRest, dsRest2]);
} else {
store.pendingDs = dsRest || dsRest2;
}
} else {
store.pendingDs = dsRest;
}
if (retry) {
const update = (
store.pendingStructs.update
);
store.pendingStructs = null;
applyUpdateV2(transaction.doc, update);
}
}, transactionOrigin, false);
var applyUpdateV2 = (ydoc, update, transactionOrigin, YDecoder = UpdateDecoderV2) => {
const decoder = createDecoder(update);
readUpdateV2(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
};
var applyUpdate = (ydoc, update, transactionOrigin) => applyUpdateV2(ydoc, update, transactionOrigin, UpdateDecoderV1);
var writeStateAsUpdate = (encoder, doc, targetStateVector =  new Map()) => {
writeClientsStructs(encoder, doc.store, targetStateVector);
writeDeleteSet(encoder, createDeleteSetFromStructStore(doc.store));
};
var encodeStateAsUpdateV2 = (doc, encodedTargetStateVector = new Uint8Array([0]), encoder = new UpdateEncoderV2()) => {
const targetStateVector = decodeStateVector(encodedTargetStateVector);
writeStateAsUpdate(encoder, doc, targetStateVector);
const updates = [encoder.toUint8Array()];
if (doc.store.pendingDs) {
updates.push(doc.store.pendingDs);
}
if (doc.store.pendingStructs) {
updates.push(diffUpdateV2(doc.store.pendingStructs.update, encodedTargetStateVector));
}
if (updates.length > 1) {
if (encoder.constructor === UpdateEncoderV1) {
return mergeUpdates(updates.map((update, i) => i === 0 ? update : convertUpdateFormatV2ToV1(update)));
} else if (encoder.constructor === UpdateEncoderV2) {
return mergeUpdatesV2(updates);
}
}
return updates[0];
};
var encodeStateAsUpdate = (doc, encodedTargetStateVector) => encodeStateAsUpdateV2(doc, encodedTargetStateVector, new UpdateEncoderV1());
var readStateVector = (decoder) => {
const ss =  new Map();
const ssLength = readVarUint(decoder.restDecoder);
for (let i = 0; i < ssLength; i++) {
const client = readVarUint(decoder.restDecoder);
const clock = readVarUint(decoder.restDecoder);
ss.set(client, clock);
}
return ss;
};
var decodeStateVector = (decodedState) => readStateVector(new DSDecoderV1(createDecoder(decodedState)));
var writeStateVector = (encoder, sv) => {
writeVarUint(encoder.restEncoder, sv.size);
from(sv.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
writeVarUint(encoder.restEncoder, client);
writeVarUint(encoder.restEncoder, clock);
});
return encoder;
};
var writeDocumentStateVector = (encoder, doc) => writeStateVector(encoder, getStateVector(doc.store));
var encodeStateVectorV2 = (doc, encoder = new DSEncoderV2()) => {
if (doc instanceof Map) {
writeStateVector(encoder, doc);
} else {
writeDocumentStateVector(encoder, doc);
}
return encoder.toUint8Array();
};
var encodeStateVector = (doc) => encodeStateVectorV2(doc, new DSEncoderV1());
var EventHandler = class {
constructor() {
this.l = [];
}
};
var createEventHandler = () => new EventHandler();
var addEventHandlerListener = (eventHandler, f) => eventHandler.l.push(f);
var removeEventHandlerListener = (eventHandler, f) => {
const l = eventHandler.l;
const len = l.length;
eventHandler.l = l.filter((g) => f !== g);
if (len === eventHandler.l.length) {
console.error("[yjs] Tried to remove event handler that doesn't exist.");
}
};
var callEventHandlerListeners = (eventHandler, arg0, arg1) => callAll(eventHandler.l, [arg0, arg1]);
var ID = class {
constructor(client, clock) {
this.client = client;
this.clock = clock;
}
};
var compareIDs = (a, b) => a === b || a !== null && b !== null && a.client === b.client && a.clock === b.clock;
var createID = (client, clock) => new ID(client, clock);
var findRootTypeKey = (type) => {
for (const [key, value] of type.doc.share.entries()) {
if (value === type) {
return key;
}
}
throw unexpectedCase();
};
var Snapshot = class {
constructor(ds, sv) {
this.ds = ds;
this.sv = sv;
}
};
var createSnapshot = (ds, sm) => new Snapshot(ds, sm);
var emptySnapshot = createSnapshot(createDeleteSet(),  new Map());
var isVisible = (item, snapshot) => snapshot === void 0 ? !item.deleted : snapshot.sv.has(item.id.client) && (snapshot.sv.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot.ds, item.id);
var splitSnapshotAffectedStructs = (transaction, snapshot) => {
const meta = setIfUndefined(transaction.meta, splitSnapshotAffectedStructs, create2);
const store = transaction.doc.store;
if (!meta.has(snapshot)) {
snapshot.sv.forEach((clock, client) => {
if (clock < getState(store, client)) {
getItemCleanStart(transaction, createID(client, clock));
}
});
iterateDeletedStructs(transaction, snapshot.ds, (_item) => {
});
meta.add(snapshot);
}
};
var StructStore = class {
constructor() {
this.clients =  new Map();
this.pendingStructs = null;
this.pendingDs = null;
}
};
var getStateVector = (store) => {
const sm =  new Map();
store.clients.forEach((structs, client) => {
const struct = structs[structs.length - 1];
sm.set(client, struct.id.clock + struct.length);
});
return sm;
};
var getState = (store, client) => {
const structs = store.clients.get(client);
if (structs === void 0) {
return 0;
}
const lastStruct = structs[structs.length - 1];
return lastStruct.id.clock + lastStruct.length;
};
var addStruct = (store, struct) => {
let structs = store.clients.get(struct.id.client);
if (structs === void 0) {
structs = [];
store.clients.set(struct.id.client, structs);
} else {
const lastStruct = structs[structs.length - 1];
if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) {
throw unexpectedCase();
}
}
structs.push(struct);
};
var findIndexSS = (structs, clock) => {
let left = 0;
let right = structs.length - 1;
let mid = structs[right];
let midclock = mid.id.clock;
if (midclock === clock) {
return right;
}
let midindex = floor(clock / (midclock + mid.length - 1) * right);
while (left <= right) {
mid = structs[midindex];
midclock = mid.id.clock;
if (midclock <= clock) {
if (clock < midclock + mid.length) {
return midindex;
}
left = midindex + 1;
} else {
right = midindex - 1;
}
midindex = floor((left + right) / 2);
}
throw unexpectedCase();
};
var find = (store, id2) => {
const structs = store.clients.get(id2.client);
return structs[findIndexSS(structs, id2.clock)];
};
var getItem = (
find
);
var findIndexCleanStart = (transaction, structs, clock) => {
const index = findIndexSS(structs, clock);
const struct = structs[index];
if (struct.id.clock < clock && struct instanceof Item) {
structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
return index + 1;
}
return index;
};
var getItemCleanStart = (transaction, id2) => {
const structs = (
transaction.doc.store.clients.get(id2.client)
);
return structs[findIndexCleanStart(transaction, structs, id2.clock)];
};
var getItemCleanEnd = (transaction, store, id2) => {
const structs = store.clients.get(id2.client);
const index = findIndexSS(structs, id2.clock);
const struct = structs[index];
if (id2.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) {
structs.splice(index + 1, 0, splitItem(transaction, struct, id2.clock - struct.id.clock + 1));
}
return struct;
};
var replaceStruct = (store, struct, newStruct) => {
const structs = (
store.clients.get(struct.id.client)
);
structs[findIndexSS(structs, struct.id.clock)] = newStruct;
};
var iterateStructs = (transaction, structs, clockStart, len, f) => {
if (len === 0) {
return;
}
const clockEnd = clockStart + len;
let index = findIndexCleanStart(transaction, structs, clockStart);
let struct;
do {
struct = structs[index++];
if (clockEnd < struct.id.clock + struct.length) {
findIndexCleanStart(transaction, structs, clockEnd);
}
f(struct);
} while (index < structs.length && structs[index].id.clock < clockEnd);
};
var Transaction = class {
constructor(doc, origin, local) {
this.doc = doc;
this.deleteSet = new DeleteSet();
this.beforeState = getStateVector(doc.store);
this.afterState =  new Map();
this.changed =  new Map();
this.changedParentTypes =  new Map();
this._mergeStructs = [];
this.origin = origin;
this.meta =  new Map();
this.local = local;
this.subdocsAdded =  new Set();
this.subdocsRemoved =  new Set();
this.subdocsLoaded =  new Set();
this._needFormattingCleanup = false;
}
};
var writeUpdateMessageFromTransaction = (encoder, transaction) => {
if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) {
return false;
}
sortAndMergeDeleteSet(transaction.deleteSet);
writeStructsFromTransaction(encoder, transaction);
writeDeleteSet(encoder, transaction.deleteSet);
return true;
};
var addChangedTypeToTransaction = (transaction, type, parentSub) => {
const item = type._item;
if (item === null || item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted) {
setIfUndefined(transaction.changed, type, create2).add(parentSub);
}
};
var tryToMergeWithLefts = (structs, pos) => {
let right = structs[pos];
let left = structs[pos - 1];
let i = pos;
for (; i > 0; right = left, left = structs[--i - 1]) {
if (left.deleted === right.deleted && left.constructor === right.constructor) {
if (left.mergeWith(right)) {
if (right instanceof Item && right.parentSub !== null &&
right.parent._map.get(right.parentSub) === right) {
right.parent._map.set(
right.parentSub,
left
);
}
continue;
}
}
break;
}
const merged = pos - i;
if (merged) {
structs.splice(pos + 1 - merged, merged);
}
return merged;
};
var tryGcDeleteSet = (ds, store, gcFilter) => {
for (const [client, deleteItems] of ds.clients.entries()) {
const structs = (
store.clients.get(client)
);
for (let di = deleteItems.length - 1; di >= 0; di--) {
const deleteItem = deleteItems[di];
const endDeleteItemClock = deleteItem.clock + deleteItem.len;
for (let si = findIndexSS(structs, deleteItem.clock), struct = structs[si]; si < structs.length && struct.id.clock < endDeleteItemClock; struct = structs[++si]) {
const struct2 = structs[si];
if (deleteItem.clock + deleteItem.len <= struct2.id.clock) {
break;
}
if (struct2 instanceof Item && struct2.deleted && !struct2.keep && gcFilter(struct2)) {
struct2.gc(store, false);
}
}
}
}
};
var tryMergeDeleteSet = (ds, store) => {
ds.clients.forEach((deleteItems, client) => {
const structs = (
store.clients.get(client)
);
for (let di = deleteItems.length - 1; di >= 0; di--) {
const deleteItem = deleteItems[di];
const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
for (let si = mostRightIndexToCheck, struct = structs[si]; si > 0 && struct.id.clock >= deleteItem.clock; struct = structs[si]) {
si -= 1 + tryToMergeWithLefts(structs, si);
}
}
});
};
var cleanupTransactions = (transactionCleanups, i) => {
if (i < transactionCleanups.length) {
const transaction = transactionCleanups[i];
const doc = transaction.doc;
const store = doc.store;
const ds = transaction.deleteSet;
const mergeStructs = transaction._mergeStructs;
try {
sortAndMergeDeleteSet(ds);
transaction.afterState = getStateVector(transaction.doc.store);
doc.emit("beforeObserverCalls", [transaction, doc]);
const fs = [];
transaction.changed.forEach(
(subs, itemtype) => fs.push(() => {
if (itemtype._item === null || !itemtype._item.deleted) {
itemtype._callObserver(transaction, subs);
}
})
);
fs.push(() => {
transaction.changedParentTypes.forEach((events, type) => {
if (type._dEH.l.length > 0 && (type._item === null || !type._item.deleted)) {
events = events.filter(
(event) => event.target._item === null || !event.target._item.deleted
);
events.forEach((event) => {
event.currentTarget = type;
event._path = null;
});
events.sort((event1, event2) => event1.path.length - event2.path.length);
fs.push(() => {
callEventHandlerListeners(type._dEH, events, transaction);
});
}
});
fs.push(() => doc.emit("afterTransaction", [transaction, doc]));
fs.push(() => {
if (transaction._needFormattingCleanup) {
cleanupYTextAfterTransaction(transaction);
}
});
});
callAll(fs, []);
} finally {
if (doc.gc) {
tryGcDeleteSet(ds, store, doc.gcFilter);
}
tryMergeDeleteSet(ds, store);
transaction.afterState.forEach((clock, client) => {
const beforeClock = transaction.beforeState.get(client) || 0;
if (beforeClock !== clock) {
const structs = (
store.clients.get(client)
);
const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
for (let i2 = structs.length - 1; i2 >= firstChangePos; ) {
i2 -= 1 + tryToMergeWithLefts(structs, i2);
}
}
});
for (let i2 = mergeStructs.length - 1; i2 >= 0; i2--) {
const { client, clock } = mergeStructs[i2].id;
const structs = (
store.clients.get(client)
);
const replacedStructPos = findIndexSS(structs, clock);
if (replacedStructPos + 1 < structs.length) {
if (tryToMergeWithLefts(structs, replacedStructPos + 1) > 1) {
continue;
}
}
if (replacedStructPos > 0) {
tryToMergeWithLefts(structs, replacedStructPos);
}
}
if (!transaction.local && transaction.afterState.get(doc.clientID) !== transaction.beforeState.get(doc.clientID)) {
print(ORANGE, BOLD, "[yjs] ", UNBOLD, RED, "Changed the client-id because another client seems to be using it.");
doc.clientID = generateNewClientId();
}
doc.emit("afterTransactionCleanup", [transaction, doc]);
if (doc._observers.has("update")) {
const encoder = new UpdateEncoderV1();
const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
if (hasContent2) {
doc.emit("update", [encoder.toUint8Array(), transaction.origin, doc, transaction]);
}
}
if (doc._observers.has("updateV2")) {
const encoder = new UpdateEncoderV2();
const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
if (hasContent2) {
doc.emit("updateV2", [encoder.toUint8Array(), transaction.origin, doc, transaction]);
}
}
const { subdocsAdded, subdocsLoaded, subdocsRemoved } = transaction;
if (subdocsAdded.size > 0 || subdocsRemoved.size > 0 || subdocsLoaded.size > 0) {
subdocsAdded.forEach((subdoc) => {
subdoc.clientID = doc.clientID;
if (subdoc.collectionid == null) {
subdoc.collectionid = doc.collectionid;
}
doc.subdocs.add(subdoc);
});
subdocsRemoved.forEach((subdoc) => doc.subdocs.delete(subdoc));
doc.emit("subdocs", [{ loaded: subdocsLoaded, added: subdocsAdded, removed: subdocsRemoved }, doc, transaction]);
subdocsRemoved.forEach((subdoc) => subdoc.destroy());
}
if (transactionCleanups.length <= i + 1) {
doc._transactionCleanups = [];
doc.emit("afterAllTransactions", [doc, transactionCleanups]);
} else {
cleanupTransactions(transactionCleanups, i + 1);
}
}
}
};
var transact = (doc, f, origin = null, local = true) => {
const transactionCleanups = doc._transactionCleanups;
let initialCall = false;
let result = null;
if (doc._transaction === null) {
initialCall = true;
doc._transaction = new Transaction(doc, origin, local);
transactionCleanups.push(doc._transaction);
if (transactionCleanups.length === 1) {
doc.emit("beforeAllTransactions", [doc]);
}
doc.emit("beforeTransaction", [doc._transaction, doc]);
}
try {
result = f(doc._transaction);
} finally {
if (initialCall) {
const finishCleanup = doc._transaction === transactionCleanups[0];
doc._transaction = null;
if (finishCleanup) {
cleanupTransactions(transactionCleanups, 0);
}
}
}
return result;
};
function* lazyStructReaderGenerator(decoder) {
const numOfStateUpdates = readVarUint(decoder.restDecoder);
for (let i = 0; i < numOfStateUpdates; i++) {
const numberOfStructs = readVarUint(decoder.restDecoder);
const client = decoder.readClient();
let clock = readVarUint(decoder.restDecoder);
for (let i2 = 0; i2 < numberOfStructs; i2++) {
const info = decoder.readInfo();
if (info === 10) {
const len = readVarUint(decoder.restDecoder);
yield new Skip(createID(client, clock), len);
clock += len;
} else if ((BITS5 & info) !== 0) {
const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
const struct = new Item(
createID(client, clock),
null,
(info & BIT8) === BIT8 ? decoder.readLeftID() : null,
null,
(info & BIT7) === BIT7 ? decoder.readRightID() : null,
cantCopyParentInfo ? decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID() : null,
cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null,
readItemContent(decoder, info)
);
yield struct;
clock += struct.length;
} else {
const len = decoder.readLen();
yield new GC(createID(client, clock), len);
clock += len;
}
}
}
}
var LazyStructReader = class {
constructor(decoder, filterSkips) {
this.gen = lazyStructReaderGenerator(decoder);
this.curr = null;
this.done = false;
this.filterSkips = filterSkips;
this.next();
}
next() {
do {
this.curr = this.gen.next().value || null;
} while (this.filterSkips && this.curr !== null && this.curr.constructor === Skip);
return this.curr;
}
};
var LazyStructWriter = class {
constructor(encoder) {
this.currClient = 0;
this.startClock = 0;
this.written = 0;
this.encoder = encoder;
this.clientStructs = [];
}
};
var mergeUpdates = (updates) => mergeUpdatesV2(updates, UpdateDecoderV1, UpdateEncoderV1);
var sliceStruct = (left, diff) => {
if (left.constructor === GC) {
const { client, clock } = left.id;
return new GC(createID(client, clock + diff), left.length - diff);
} else if (left.constructor === Skip) {
const { client, clock } = left.id;
return new Skip(createID(client, clock + diff), left.length - diff);
} else {
const leftItem = (
left
);
const { client, clock } = leftItem.id;
return new Item(
createID(client, clock + diff),
null,
createID(client, clock + diff - 1),
null,
leftItem.rightOrigin,
leftItem.parent,
leftItem.parentSub,
leftItem.content.splice(diff)
);
}
};
var mergeUpdatesV2 = (updates, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
if (updates.length === 1) {
return updates[0];
}
const updateDecoders = updates.map((update) => new YDecoder(createDecoder(update)));
let lazyStructDecoders = updateDecoders.map((decoder) => new LazyStructReader(decoder, true));
let currWrite = null;
const updateEncoder = new YEncoder();
const lazyStructEncoder = new LazyStructWriter(updateEncoder);
while (true) {
lazyStructDecoders = lazyStructDecoders.filter((dec) => dec.curr !== null);
lazyStructDecoders.sort(
(dec1, dec2) => {
if (dec1.curr.id.client === dec2.curr.id.client) {
const clockDiff = dec1.curr.id.clock - dec2.curr.id.clock;
if (clockDiff === 0) {
return dec1.curr.constructor === dec2.curr.constructor ? 0 : dec1.curr.constructor === Skip ? 1 : -1;
} else {
return clockDiff;
}
} else {
return dec2.curr.id.client - dec1.curr.id.client;
}
}
);
if (lazyStructDecoders.length === 0) {
break;
}
const currDecoder = lazyStructDecoders[0];
const firstClient = (
currDecoder.curr.id.client
);
if (currWrite !== null) {
let curr = (
currDecoder.curr
);
let iterated = false;
while (curr !== null && curr.id.clock + curr.length <= currWrite.struct.id.clock + currWrite.struct.length && curr.id.client >= currWrite.struct.id.client) {
curr = currDecoder.next();
iterated = true;
}
if (curr === null || // current decoder is empty
curr.id.client !== firstClient || // check whether there is another decoder that has has updates from `firstClient`
iterated && curr.id.clock > currWrite.struct.id.clock + currWrite.struct.length) {
continue;
}
if (firstClient !== currWrite.struct.id.client) {
writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
currWrite = { struct: curr, offset: 0 };
currDecoder.next();
} else {
if (currWrite.struct.id.clock + currWrite.struct.length < curr.id.clock) {
if (currWrite.struct.constructor === Skip) {
currWrite.struct.length = curr.id.clock + curr.length - currWrite.struct.id.clock;
} else {
writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
const diff = curr.id.clock - currWrite.struct.id.clock - currWrite.struct.length;
const struct = new Skip(createID(firstClient, currWrite.struct.id.clock + currWrite.struct.length), diff);
currWrite = { struct, offset: 0 };
}
} else {
const diff = currWrite.struct.id.clock + currWrite.struct.length - curr.id.clock;
if (diff > 0) {
if (currWrite.struct.constructor === Skip) {
currWrite.struct.length -= diff;
} else {
curr = sliceStruct(curr, diff);
}
}
if (!currWrite.struct.mergeWith(
curr
)) {
writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
currWrite = { struct: curr, offset: 0 };
currDecoder.next();
}
}
}
} else {
currWrite = { struct: (
currDecoder.curr
), offset: 0 };
currDecoder.next();
}
for (let next = currDecoder.curr; next !== null && next.id.client === firstClient && next.id.clock === currWrite.struct.id.clock + currWrite.struct.length && next.constructor !== Skip; next = currDecoder.next()) {
writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
currWrite = { struct: next, offset: 0 };
}
}
if (currWrite !== null) {
writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
currWrite = null;
}
finishLazyStructWriting(lazyStructEncoder);
const dss = updateDecoders.map((decoder) => readDeleteSet(decoder));
const ds = mergeDeleteSets(dss);
writeDeleteSet(updateEncoder, ds);
return updateEncoder.toUint8Array();
};
var diffUpdateV2 = (update, sv, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
const state = decodeStateVector(sv);
const encoder = new YEncoder();
const lazyStructWriter = new LazyStructWriter(encoder);
const decoder = new YDecoder(createDecoder(update));
const reader = new LazyStructReader(decoder, false);
while (reader.curr) {
const curr = reader.curr;
const currClient = curr.id.client;
const svClock = state.get(currClient) || 0;
if (reader.curr.constructor === Skip) {
reader.next();
continue;
}
if (curr.id.clock + curr.length > svClock) {
writeStructToLazyStructWriter(lazyStructWriter, curr, max(svClock - curr.id.clock, 0));
reader.next();
while (reader.curr && reader.curr.id.client === currClient) {
writeStructToLazyStructWriter(lazyStructWriter, reader.curr, 0);
reader.next();
}
} else {
while (reader.curr && reader.curr.id.client === currClient && reader.curr.id.clock + reader.curr.length <= svClock) {
reader.next();
}
}
}
finishLazyStructWriting(lazyStructWriter);
const ds = readDeleteSet(decoder);
writeDeleteSet(encoder, ds);
return encoder.toUint8Array();
};
var flushLazyStructWriter = (lazyWriter) => {
if (lazyWriter.written > 0) {
lazyWriter.clientStructs.push({ written: lazyWriter.written, restEncoder: toUint8Array(lazyWriter.encoder.restEncoder) });
lazyWriter.encoder.restEncoder = createEncoder();
lazyWriter.written = 0;
}
};
var writeStructToLazyStructWriter = (lazyWriter, struct, offset) => {
if (lazyWriter.written > 0 && lazyWriter.currClient !== struct.id.client) {
flushLazyStructWriter(lazyWriter);
}
if (lazyWriter.written === 0) {
lazyWriter.currClient = struct.id.client;
lazyWriter.encoder.writeClient(struct.id.client);
writeVarUint(lazyWriter.encoder.restEncoder, struct.id.clock + offset);
}
struct.write(lazyWriter.encoder, offset);
lazyWriter.written++;
};
var finishLazyStructWriting = (lazyWriter) => {
flushLazyStructWriter(lazyWriter);
const restEncoder = lazyWriter.encoder.restEncoder;
writeVarUint(restEncoder, lazyWriter.clientStructs.length);
for (let i = 0; i < lazyWriter.clientStructs.length; i++) {
const partStructs = lazyWriter.clientStructs[i];
writeVarUint(restEncoder, partStructs.written);
writeUint8Array(restEncoder, partStructs.restEncoder);
}
};
var convertUpdateFormat = (update, blockTransformer, YDecoder, YEncoder) => {
const updateDecoder = new YDecoder(createDecoder(update));
const lazyDecoder = new LazyStructReader(updateDecoder, false);
const updateEncoder = new YEncoder();
const lazyWriter = new LazyStructWriter(updateEncoder);
for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
writeStructToLazyStructWriter(lazyWriter, blockTransformer(curr), 0);
}
finishLazyStructWriting(lazyWriter);
const ds = readDeleteSet(updateDecoder);
writeDeleteSet(updateEncoder, ds);
return updateEncoder.toUint8Array();
};
var convertUpdateFormatV2ToV1 = (update) => convertUpdateFormat(update, id, UpdateDecoderV2, UpdateEncoderV1);
var errorComputeChanges = "You must not compute changes after the event-handler fired.";
var YEvent = class {
constructor(target, transaction) {
this.target = target;
this.currentTarget = target;
this.transaction = transaction;
this._changes = null;
this._keys = null;
this._delta = null;
this._path = null;
}
get path() {
return this._path || (this._path = getPathTo(this.currentTarget, this.target));
}
deletes(struct) {
return isDeleted(this.transaction.deleteSet, struct.id);
}
get keys() {
if (this._keys === null) {
if (this.transaction.doc._transactionCleanups.length === 0) {
throw create3(errorComputeChanges);
}
const keys =  new Map();
const target = this.target;
const changed = (
this.transaction.changed.get(target)
);
changed.forEach((key) => {
if (key !== null) {
const item = (
target._map.get(key)
);
let action;
let oldValue;
if (this.adds(item)) {
let prev = item.left;
while (prev !== null && this.adds(prev)) {
prev = prev.left;
}
if (this.deletes(item)) {
if (prev !== null && this.deletes(prev)) {
action = "delete";
oldValue = last(prev.content.getContent());
} else {
return;
}
} else {
if (prev !== null && this.deletes(prev)) {
action = "update";
oldValue = last(prev.content.getContent());
} else {
action = "add";
oldValue = void 0;
}
}
} else {
if (this.deletes(item)) {
action = "delete";
oldValue = last(
item.content.getContent()
);
} else {
return;
}
}
keys.set(key, { action, oldValue });
}
});
this._keys = keys;
}
return this._keys;
}
get delta() {
return this.changes.delta;
}
adds(struct) {
return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0);
}
get changes() {
let changes = this._changes;
if (changes === null) {
if (this.transaction.doc._transactionCleanups.length === 0) {
throw create3(errorComputeChanges);
}
const target = this.target;
const added = create2();
const deleted = create2();
const delta = [];
changes = {
added,
deleted,
delta,
keys: this.keys
};
const changed = (
this.transaction.changed.get(target)
);
if (changed.has(null)) {
let lastOp = null;
const packOp = () => {
if (lastOp) {
delta.push(lastOp);
}
};
for (let item = target._start; item !== null; item = item.right) {
if (item.deleted) {
if (this.deletes(item) && !this.adds(item)) {
if (lastOp === null || lastOp.delete === void 0) {
packOp();
lastOp = { delete: 0 };
}
lastOp.delete += item.length;
deleted.add(item);
}
} else {
if (this.adds(item)) {
if (lastOp === null || lastOp.insert === void 0) {
packOp();
lastOp = { insert: [] };
}
lastOp.insert = lastOp.insert.concat(item.content.getContent());
added.add(item);
} else {
if (lastOp === null || lastOp.retain === void 0) {
packOp();
lastOp = { retain: 0 };
}
lastOp.retain += item.length;
}
}
}
if (lastOp !== null && lastOp.retain === void 0) {
packOp();
}
}
this._changes = changes;
}
return (
changes
);
}
};
var getPathTo = (parent, child) => {
const path = [];
while (child._item !== null && child !== parent) {
if (child._item.parentSub !== null) {
path.unshift(child._item.parentSub);
} else {
let i = 0;
let c = (
child._item.parent._start
);
while (c !== child._item && c !== null) {
if (!c.deleted && c.countable) {
i += c.length;
}
c = c.right;
}
path.unshift(i);
}
child =
child._item.parent;
}
return path;
};
var warnPrematureAccess = () => {
warn("Invalid access: Add Yjs type to a document before reading data.");
};
var maxSearchMarker = 80;
var globalSearchMarkerTimestamp = 0;
var ArraySearchMarker = class {
constructor(p, index) {
p.marker = true;
this.p = p;
this.index = index;
this.timestamp = globalSearchMarkerTimestamp++;
}
};
var refreshMarkerTimestamp = (marker) => {
marker.timestamp = globalSearchMarkerTimestamp++;
};
var overwriteMarker = (marker, p, index) => {
marker.p.marker = false;
marker.p = p;
p.marker = true;
marker.index = index;
marker.timestamp = globalSearchMarkerTimestamp++;
};
var markPosition = (searchMarker, p, index) => {
if (searchMarker.length >= maxSearchMarker) {
const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
overwriteMarker(marker, p, index);
return marker;
} else {
const pm = new ArraySearchMarker(p, index);
searchMarker.push(pm);
return pm;
}
};
var findMarker = (yarray, index) => {
if (yarray._start === null || index === 0 || yarray._searchMarker === null) {
return null;
}
const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => abs(index - a.index) < abs(index - b.index) ? a : b);
let p = yarray._start;
let pindex = 0;
if (marker !== null) {
p = marker.p;
pindex = marker.index;
refreshMarkerTimestamp(marker);
}
while (p.right !== null && pindex < index) {
if (!p.deleted && p.countable) {
if (index < pindex + p.length) {
break;
}
pindex += p.length;
}
p = p.right;
}
while (p.left !== null && pindex > index) {
p = p.left;
if (!p.deleted && p.countable) {
pindex -= p.length;
}
}
while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
p = p.left;
if (!p.deleted && p.countable) {
pindex -= p.length;
}
}
if (marker !== null && abs(marker.index - pindex) <
p.parent.length / maxSearchMarker) {
overwriteMarker(marker, p, pindex);
return marker;
} else {
return markPosition(yarray._searchMarker, p, pindex);
}
};
var updateMarkerChanges = (searchMarker, index, len) => {
for (let i = searchMarker.length - 1; i >= 0; i--) {
const m = searchMarker[i];
if (len > 0) {
let p = m.p;
p.marker = false;
while (p && (p.deleted || !p.countable)) {
p = p.left;
if (p && !p.deleted && p.countable) {
m.index -= p.length;
}
}
if (p === null || p.marker === true) {
searchMarker.splice(i, 1);
continue;
}
m.p = p;
p.marker = true;
}
if (index < m.index || len > 0 && index === m.index) {
m.index = max(index, m.index + len);
}
}
};
var callTypeObservers = (type, transaction, event) => {
const changedType = type;
const changedParentTypes = transaction.changedParentTypes;
while (true) {
setIfUndefined(changedParentTypes, type, () => []).push(event);
if (type._item === null) {
break;
}
type =
type._item.parent;
}
callEventHandlerListeners(changedType._eH, event, transaction);
};
var AbstractType = class {
constructor() {
this._item = null;
this._map =  new Map();
this._start = null;
this.doc = null;
this._length = 0;
this._eH = createEventHandler();
this._dEH = createEventHandler();
this._searchMarker = null;
}
get parent() {
return this._item ? (
this._item.parent
) : null;
}
_integrate(y, item) {
this.doc = y;
this._item = item;
}
_copy() {
throw methodUnimplemented();
}
clone() {
throw methodUnimplemented();
}
_write(_encoder) {
}
get _first() {
let n = this._start;
while (n !== null && n.deleted) {
n = n.right;
}
return n;
}
_callObserver(transaction, _parentSubs) {
if (!transaction.local && this._searchMarker) {
this._searchMarker.length = 0;
}
}
observe(f) {
addEventHandlerListener(this._eH, f);
}
observeDeep(f) {
addEventHandlerListener(this._dEH, f);
}
unobserve(f) {
removeEventHandlerListener(this._eH, f);
}
unobserveDeep(f) {
removeEventHandlerListener(this._dEH, f);
}
toJSON() {
}
};
var typeListSlice = (type, start, end) => {
type.doc ?? warnPrematureAccess();
if (start < 0) {
start = type._length + start;
}
if (end < 0) {
end = type._length + end;
}
let len = end - start;
const cs = [];
let n = type._start;
while (n !== null && len > 0) {
if (n.countable && !n.deleted) {
const c = n.content.getContent();
if (c.length <= start) {
start -= c.length;
} else {
for (let i = start; i < c.length && len > 0; i++) {
cs.push(c[i]);
len--;
}
start = 0;
}
}
n = n.right;
}
return cs;
};
var typeListToArray = (type) => {
type.doc ?? warnPrematureAccess();
const cs = [];
let n = type._start;
while (n !== null) {
if (n.countable && !n.deleted) {
const c = n.content.getContent();
for (let i = 0; i < c.length; i++) {
cs.push(c[i]);
}
}
n = n.right;
}
return cs;
};
var typeListForEach = (type, f) => {
let index = 0;
let n = type._start;
type.doc ?? warnPrematureAccess();
while (n !== null) {
if (n.countable && !n.deleted) {
const c = n.content.getContent();
for (let i = 0; i < c.length; i++) {
f(c[i], index++, type);
}
}
n = n.right;
}
};
var typeListMap = (type, f) => {
const result = [];
typeListForEach(type, (c, i) => {
result.push(f(c, i, type));
});
return result;
};
var typeListCreateIterator = (type) => {
let n = type._start;
let currentContent = null;
let currentContentIndex = 0;
return {
[Symbol.iterator]() {
return this;
},
next: () => {
if (currentContent === null) {
while (n !== null && n.deleted) {
n = n.right;
}
if (n === null) {
return {
done: true,
value: void 0
};
}
currentContent = n.content.getContent();
currentContentIndex = 0;
n = n.right;
}
const value = currentContent[currentContentIndex++];
if (currentContent.length <= currentContentIndex) {
currentContent = null;
}
return {
done: false,
value
};
}
};
};
var typeListGet = (type, index) => {
type.doc ?? warnPrematureAccess();
const marker = findMarker(type, index);
let n = type._start;
if (marker !== null) {
n = marker.p;
index -= marker.index;
}
for (; n !== null; n = n.right) {
if (!n.deleted && n.countable) {
if (index < n.length) {
return n.content.getContent()[index];
}
index -= n.length;
}
}
};
var typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
let left = referenceItem;
const doc = transaction.doc;
const ownClientId = doc.clientID;
const store = doc.store;
const right = referenceItem === null ? parent._start : referenceItem.right;
let jsonContent = [];
const packJsonContent = () => {
if (jsonContent.length > 0) {
left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentAny(jsonContent));
left.integrate(transaction, 0);
jsonContent = [];
}
};
content.forEach((c) => {
if (c === null) {
jsonContent.push(c);
} else {
switch (c.constructor) {
case Number:
case Object:
case Boolean:
case Array:
case String:
jsonContent.push(c);
break;
default:
packJsonContent();
switch (c.constructor) {
case Uint8Array:
case ArrayBuffer:
left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentBinary(new Uint8Array(
c
)));
left.integrate(transaction, 0);
break;
case Doc:
left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentDoc(
c
));
left.integrate(transaction, 0);
break;
default:
if (c instanceof AbstractType) {
left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentType(c));
left.integrate(transaction, 0);
} else {
throw new Error("Unexpected content type in insert operation");
}
}
}
}
});
packJsonContent();
};
var lengthExceeded = () => create3("Length exceeded!");
var typeListInsertGenerics = (transaction, parent, index, content) => {
if (index > parent._length) {
throw lengthExceeded();
}
if (index === 0) {
if (parent._searchMarker) {
updateMarkerChanges(parent._searchMarker, index, content.length);
}
return typeListInsertGenericsAfter(transaction, parent, null, content);
}
const startIndex = index;
const marker = findMarker(parent, index);
let n = parent._start;
if (marker !== null) {
n = marker.p;
index -= marker.index;
if (index === 0) {
n = n.prev;
index += n && n.countable && !n.deleted ? n.length : 0;
}
}
for (; n !== null; n = n.right) {
if (!n.deleted && n.countable) {
if (index <= n.length) {
if (index < n.length) {
getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
}
break;
}
index -= n.length;
}
}
if (parent._searchMarker) {
updateMarkerChanges(parent._searchMarker, startIndex, content.length);
}
return typeListInsertGenericsAfter(transaction, parent, n, content);
};
var typeListPushGenerics = (transaction, parent, content) => {
const marker = (parent._searchMarker || []).reduce((maxMarker, currMarker) => currMarker.index > maxMarker.index ? currMarker : maxMarker, { index: 0, p: parent._start });
let n = marker.p;
if (n) {
while (n.right) {
n = n.right;
}
}
return typeListInsertGenericsAfter(transaction, parent, n, content);
};
var typeListDelete = (transaction, parent, index, length2) => {
if (length2 === 0) {
return;
}
const startIndex = index;
const startLength = length2;
const marker = findMarker(parent, index);
let n = parent._start;
if (marker !== null) {
n = marker.p;
index -= marker.index;
}
for (; n !== null && index > 0; n = n.right) {
if (!n.deleted && n.countable) {
if (index < n.length) {
getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
}
index -= n.length;
}
}
while (length2 > 0 && n !== null) {
if (!n.deleted) {
if (length2 < n.length) {
getItemCleanStart(transaction, createID(n.id.client, n.id.clock + length2));
}
n.delete(transaction);
length2 -= n.length;
}
n = n.right;
}
if (length2 > 0) {
throw lengthExceeded();
}
if (parent._searchMarker) {
updateMarkerChanges(
parent._searchMarker,
startIndex,
-startLength + length2
);
}
};
var typeMapDelete = (transaction, parent, key) => {
const c = parent._map.get(key);
if (c !== void 0) {
c.delete(transaction);
}
};
var typeMapSet = (transaction, parent, key, value) => {
const left = parent._map.get(key) || null;
const doc = transaction.doc;
const ownClientId = doc.clientID;
let content;
if (value == null) {
content = new ContentAny([value]);
} else {
switch (value.constructor) {
case Number:
case Object:
case Boolean:
case Array:
case String:
case Date:
case BigInt:
content = new ContentAny([value]);
break;
case Uint8Array:
content = new ContentBinary(
value
);
break;
case Doc:
content = new ContentDoc(
value
);
break;
default:
if (value instanceof AbstractType) {
content = new ContentType(value);
} else {
throw new Error("Unexpected content type");
}
}
}
new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
};
var typeMapGet = (parent, key) => {
parent.doc ?? warnPrematureAccess();
const val = parent._map.get(key);
return val !== void 0 && !val.deleted ? val.content.getContent()[val.length - 1] : void 0;
};
var typeMapGetAll = (parent) => {
const res = {};
parent.doc ?? warnPrematureAccess();
parent._map.forEach((value, key) => {
if (!value.deleted) {
res[key] = value.content.getContent()[value.length - 1];
}
});
return res;
};
var typeMapHas = (parent, key) => {
parent.doc ?? warnPrematureAccess();
const val = parent._map.get(key);
return val !== void 0 && !val.deleted;
};
var typeMapGetAllSnapshot = (parent, snapshot) => {
const res = {};
parent._map.forEach((value, key) => {
let v = value;
while (v !== null && (!snapshot.sv.has(v.id.client) || v.id.clock >= (snapshot.sv.get(v.id.client) || 0))) {
v = v.left;
}
if (v !== null && isVisible(v, snapshot)) {
res[key] = v.content.getContent()[v.length - 1];
}
});
return res;
};
var createMapIterator = (type) => {
type.doc ?? warnPrematureAccess();
return iteratorFilter(
type._map.entries(),
(entry) => !entry[1].deleted
);
};
var YArrayEvent = class extends YEvent {
};
var YArray = class _YArray extends AbstractType {
constructor() {
super();
this._prelimContent = [];
this._searchMarker = [];
}
static from(items) {
const a = new _YArray();
a.push(items);
return a;
}
_integrate(y, item) {
super._integrate(y, item);
this.insert(
0,
this._prelimContent
);
this._prelimContent = null;
}
_copy() {
return new _YArray();
}
clone() {
const arr = new _YArray();
arr.insert(0, this.toArray().map(
(el) => el instanceof AbstractType ? (
el.clone()
) : el
));
return arr;
}
get length() {
this.doc ?? warnPrematureAccess();
return this._length;
}
_callObserver(transaction, parentSubs) {
super._callObserver(transaction, parentSubs);
callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
}
insert(index, content) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeListInsertGenerics(
transaction,
this,
index,
content
);
});
} else {
this._prelimContent.splice(index, 0, ...content);
}
}
push(content) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeListPushGenerics(
transaction,
this,
content
);
});
} else {
this._prelimContent.push(...content);
}
}
unshift(content) {
this.insert(0, content);
}
delete(index, length2 = 1) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeListDelete(transaction, this, index, length2);
});
} else {
this._prelimContent.splice(index, length2);
}
}
get(index) {
return typeListGet(this, index);
}
toArray() {
return typeListToArray(this);
}
slice(start = 0, end = this.length) {
return typeListSlice(this, start, end);
}
toJSON() {
return this.map((c) => c instanceof AbstractType ? c.toJSON() : c);
}
map(f) {
return typeListMap(
this,
f
);
}
forEach(f) {
typeListForEach(this, f);
}
[Symbol.iterator]() {
return typeListCreateIterator(this);
}
_write(encoder) {
encoder.writeTypeRef(YArrayRefID);
}
};
var readYArray = (_decoder) => new YArray();
var YMapEvent = class extends YEvent {
constructor(ymap, transaction, subs) {
super(ymap, transaction);
this.keysChanged = subs;
}
};
var YMap = class _YMap extends AbstractType {
constructor(entries) {
super();
this._prelimContent = null;
if (entries === void 0) {
this._prelimContent =  new Map();
} else {
this._prelimContent = new Map(entries);
}
}
_integrate(y, item) {
super._integrate(y, item);
this._prelimContent.forEach((value, key) => {
this.set(key, value);
});
this._prelimContent = null;
}
_copy() {
return new _YMap();
}
clone() {
const map2 = new _YMap();
this.forEach((value, key) => {
map2.set(key, value instanceof AbstractType ? (
value.clone()
) : value);
});
return map2;
}
_callObserver(transaction, parentSubs) {
callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
}
toJSON() {
this.doc ?? warnPrematureAccess();
const map2 = {};
this._map.forEach((item, key) => {
if (!item.deleted) {
const v = item.content.getContent()[item.length - 1];
map2[key] = v instanceof AbstractType ? v.toJSON() : v;
}
});
return map2;
}
get size() {
return [...createMapIterator(this)].length;
}
keys() {
return iteratorMap(
createMapIterator(this),
(v) => v[0]
);
}
values() {
return iteratorMap(
createMapIterator(this),
(v) => v[1].content.getContent()[v[1].length - 1]
);
}
entries() {
return iteratorMap(
createMapIterator(this),
(v) => (
[v[0], v[1].content.getContent()[v[1].length - 1]]
)
);
}
forEach(f) {
this.doc ?? warnPrematureAccess();
this._map.forEach((item, key) => {
if (!item.deleted) {
f(item.content.getContent()[item.length - 1], key, this);
}
});
}
[Symbol.iterator]() {
return this.entries();
}
delete(key) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeMapDelete(transaction, this, key);
});
} else {
this._prelimContent.delete(key);
}
}
set(key, value) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeMapSet(
transaction,
this,
key,
value
);
});
} else {
this._prelimContent.set(key, value);
}
return value;
}
get(key) {
return (
typeMapGet(this, key)
);
}
has(key) {
return typeMapHas(this, key);
}
clear() {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
this.forEach(function(_value, key, map2) {
typeMapDelete(transaction, map2, key);
});
});
} else {
this._prelimContent.clear();
}
}
_write(encoder) {
encoder.writeTypeRef(YMapRefID);
}
};
var readYMap = (_decoder) => new YMap();
var equalAttrs = (a, b) => a === b || typeof a === "object" && typeof b === "object" && a && b && equalFlat(a, b);
var ItemTextListPosition = class {
constructor(left, right, index, currentAttributes) {
this.left = left;
this.right = right;
this.index = index;
this.currentAttributes = currentAttributes;
}
forward() {
if (this.right === null) {
unexpectedCase();
}
switch (this.right.content.constructor) {
case ContentFormat:
if (!this.right.deleted) {
updateCurrentAttributes(
this.currentAttributes,
this.right.content
);
}
break;
default:
if (!this.right.deleted) {
this.index += this.right.length;
}
break;
}
this.left = this.right;
this.right = this.right.right;
}
};
var findNextPosition = (transaction, pos, count) => {
while (pos.right !== null && count > 0) {
switch (pos.right.content.constructor) {
case ContentFormat:
if (!pos.right.deleted) {
updateCurrentAttributes(
pos.currentAttributes,
pos.right.content
);
}
break;
default:
if (!pos.right.deleted) {
if (count < pos.right.length) {
getItemCleanStart(transaction, createID(pos.right.id.client, pos.right.id.clock + count));
}
pos.index += pos.right.length;
count -= pos.right.length;
}
break;
}
pos.left = pos.right;
pos.right = pos.right.right;
}
return pos;
};
var findPosition = (transaction, parent, index, useSearchMarker) => {
const currentAttributes =  new Map();
const marker = useSearchMarker ? findMarker(parent, index) : null;
if (marker) {
const pos = new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes);
return findNextPosition(transaction, pos, index - marker.index);
} else {
const pos = new ItemTextListPosition(null, parent._start, 0, currentAttributes);
return findNextPosition(transaction, pos, index);
}
};
var insertNegatedAttributes = (transaction, parent, currPos, negatedAttributes) => {
while (currPos.right !== null && (currPos.right.deleted === true || currPos.right.content.constructor === ContentFormat && equalAttrs(
negatedAttributes.get(
currPos.right.content.key
),
currPos.right.content.value
))) {
if (!currPos.right.deleted) {
negatedAttributes.delete(
currPos.right.content.key
);
}
currPos.forward();
}
const doc = transaction.doc;
const ownClientId = doc.clientID;
negatedAttributes.forEach((val, key) => {
const left = currPos.left;
const right = currPos.right;
const nextFormat = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
nextFormat.integrate(transaction, 0);
currPos.right = nextFormat;
currPos.forward();
});
};
var updateCurrentAttributes = (currentAttributes, format) => {
const { key, value } = format;
if (value === null) {
currentAttributes.delete(key);
} else {
currentAttributes.set(key, value);
}
};
var minimizeAttributeChanges = (currPos, attributes) => {
while (true) {
if (currPos.right === null) {
break;
} else if (currPos.right.deleted || currPos.right.content.constructor === ContentFormat && equalAttrs(
attributes[
currPos.right.content.key
] ?? null,
currPos.right.content.value
)) ;
else {
break;
}
currPos.forward();
}
};
var insertAttributes = (transaction, parent, currPos, attributes) => {
const doc = transaction.doc;
const ownClientId = doc.clientID;
const negatedAttributes =  new Map();
for (const key in attributes) {
const val = attributes[key];
const currentVal = currPos.currentAttributes.get(key) ?? null;
if (!equalAttrs(currentVal, val)) {
negatedAttributes.set(key, currentVal);
const { left, right } = currPos;
currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
currPos.right.integrate(transaction, 0);
currPos.forward();
}
}
return negatedAttributes;
};
var insertText = (transaction, parent, currPos, text, attributes) => {
currPos.currentAttributes.forEach((_val, key) => {
if (attributes[key] === void 0) {
attributes[key] = null;
}
});
const doc = transaction.doc;
const ownClientId = doc.clientID;
minimizeAttributeChanges(currPos, attributes);
const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
const content = text.constructor === String ? new ContentString(
text
) : text instanceof AbstractType ? new ContentType(text) : new ContentEmbed(text);
let { left, right, index } = currPos;
if (parent._searchMarker) {
updateMarkerChanges(parent._searchMarker, currPos.index, content.getLength());
}
right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
right.integrate(transaction, 0);
currPos.right = right;
currPos.index = index;
currPos.forward();
insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
};
var formatText = (transaction, parent, currPos, length2, attributes) => {
const doc = transaction.doc;
const ownClientId = doc.clientID;
minimizeAttributeChanges(currPos, attributes);
const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
iterationLoop: while (currPos.right !== null && (length2 > 0 || negatedAttributes.size > 0 && (currPos.right.deleted || currPos.right.content.constructor === ContentFormat))) {
if (!currPos.right.deleted) {
switch (currPos.right.content.constructor) {
case ContentFormat: {
const { key, value } = (
currPos.right.content
);
const attr = attributes[key];
if (attr !== void 0) {
if (equalAttrs(attr, value)) {
negatedAttributes.delete(key);
} else {
if (length2 === 0) {
break iterationLoop;
}
negatedAttributes.set(key, value);
}
currPos.right.delete(transaction);
} else {
currPos.currentAttributes.set(key, value);
}
break;
}
default:
if (length2 < currPos.right.length) {
getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
}
length2 -= currPos.right.length;
break;
}
}
currPos.forward();
}
if (length2 > 0) {
let newlines = "";
for (; length2 > 0; length2--) {
newlines += "\n";
}
currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new ContentString(newlines));
currPos.right.integrate(transaction, 0);
currPos.forward();
}
insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
};
var cleanupFormattingGap = (transaction, start, curr, startAttributes, currAttributes) => {
let end = start;
const endFormats = create();
while (end && (!end.countable || end.deleted)) {
if (!end.deleted && end.content.constructor === ContentFormat) {
const cf = (
end.content
);
endFormats.set(cf.key, cf);
}
end = end.right;
}
let cleanups = 0;
let reachedCurr = false;
while (start !== end) {
if (curr === start) {
reachedCurr = true;
}
if (!start.deleted) {
const content = start.content;
switch (content.constructor) {
case ContentFormat: {
const { key, value } = (
content
);
const startAttrValue = startAttributes.get(key) ?? null;
if (endFormats.get(key) !== content || startAttrValue === value) {
start.delete(transaction);
cleanups++;
if (!reachedCurr && (currAttributes.get(key) ?? null) === value && startAttrValue !== value) {
if (startAttrValue === null) {
currAttributes.delete(key);
} else {
currAttributes.set(key, startAttrValue);
}
}
}
if (!reachedCurr && !start.deleted) {
updateCurrentAttributes(
currAttributes,
content
);
}
break;
}
}
}
start =
start.right;
}
return cleanups;
};
var cleanupContextlessFormattingGap = (transaction, item) => {
while (item && item.right && (item.right.deleted || !item.right.countable)) {
item = item.right;
}
const attrs =  new Set();
while (item && (item.deleted || !item.countable)) {
if (!item.deleted && item.content.constructor === ContentFormat) {
const key = (
item.content.key
);
if (attrs.has(key)) {
item.delete(transaction);
} else {
attrs.add(key);
}
}
item = item.left;
}
};
var cleanupYTextFormatting = (type) => {
let res = 0;
transact(
type.doc,
(transaction) => {
let start = (
type._start
);
let end = type._start;
let startAttributes = create();
const currentAttributes = copy(startAttributes);
while (end) {
if (end.deleted === false) {
switch (end.content.constructor) {
case ContentFormat:
updateCurrentAttributes(
currentAttributes,
end.content
);
break;
default:
res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
startAttributes = copy(currentAttributes);
start = end;
break;
}
}
end = end.right;
}
}
);
return res;
};
var cleanupYTextAfterTransaction = (transaction) => {
const needFullCleanup =  new Set();
const doc = transaction.doc;
for (const [client, afterClock] of transaction.afterState.entries()) {
const clock = transaction.beforeState.get(client) || 0;
if (afterClock === clock) {
continue;
}
iterateStructs(
transaction,
doc.store.clients.get(client),
clock,
afterClock,
(item) => {
if (!item.deleted &&
item.content.constructor === ContentFormat && item.constructor !== GC) {
needFullCleanup.add(
item.parent
);
}
}
);
}
transact(doc, (t) => {
iterateDeletedStructs(transaction, transaction.deleteSet, (item) => {
if (item instanceof GC || !
item.parent._hasFormatting || needFullCleanup.has(
item.parent
)) {
return;
}
const parent = (
item.parent
);
if (item.content.constructor === ContentFormat) {
needFullCleanup.add(parent);
} else {
cleanupContextlessFormattingGap(t, item);
}
});
for (const yText of needFullCleanup) {
cleanupYTextFormatting(yText);
}
});
};
var deleteText = (transaction, currPos, length2) => {
const startLength = length2;
const startAttrs = copy(currPos.currentAttributes);
const start = currPos.right;
while (length2 > 0 && currPos.right !== null) {
if (currPos.right.deleted === false) {
switch (currPos.right.content.constructor) {
case ContentType:
case ContentEmbed:
case ContentString:
if (length2 < currPos.right.length) {
getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
}
length2 -= currPos.right.length;
currPos.right.delete(transaction);
break;
}
}
currPos.forward();
}
if (start) {
cleanupFormattingGap(transaction, start, currPos.right, startAttrs, currPos.currentAttributes);
}
const parent = (
(currPos.left || currPos.right).parent
);
if (parent._searchMarker) {
updateMarkerChanges(parent._searchMarker, currPos.index, -startLength + length2);
}
return currPos;
};
var YTextEvent = class extends YEvent {
constructor(ytext, transaction, subs) {
super(ytext, transaction);
this.childListChanged = false;
this.keysChanged =  new Set();
subs.forEach((sub) => {
if (sub === null) {
this.childListChanged = true;
} else {
this.keysChanged.add(sub);
}
});
}
get changes() {
if (this._changes === null) {
const changes = {
keys: this.keys,
delta: this.delta,
added:  new Set(),
deleted:  new Set()
};
this._changes = changes;
}
return (
this._changes
);
}
get delta() {
if (this._delta === null) {
const y = (
this.target.doc
);
const delta = [];
transact(y, (transaction) => {
const currentAttributes =  new Map();
const oldAttributes =  new Map();
let item = this.target._start;
let action = null;
const attributes = {};
let insert = "";
let retain = 0;
let deleteLen = 0;
const addOp = () => {
if (action !== null) {
let op = null;
switch (action) {
case "delete":
if (deleteLen > 0) {
op = { delete: deleteLen };
}
deleteLen = 0;
break;
case "insert":
if (typeof insert === "object" || insert.length > 0) {
op = { insert };
if (currentAttributes.size > 0) {
op.attributes = {};
currentAttributes.forEach((value, key) => {
if (value !== null) {
op.attributes[key] = value;
}
});
}
}
insert = "";
break;
case "retain":
if (retain > 0) {
op = { retain };
if (!isEmpty(attributes)) {
op.attributes = assign({}, attributes);
}
}
retain = 0;
break;
}
if (op) delta.push(op);
action = null;
}
};
while (item !== null) {
switch (item.content.constructor) {
case ContentType:
case ContentEmbed:
if (this.adds(item)) {
if (!this.deletes(item)) {
addOp();
action = "insert";
insert = item.content.getContent()[0];
addOp();
}
} else if (this.deletes(item)) {
if (action !== "delete") {
addOp();
action = "delete";
}
deleteLen += 1;
} else if (!item.deleted) {
if (action !== "retain") {
addOp();
action = "retain";
}
retain += 1;
}
break;
case ContentString:
if (this.adds(item)) {
if (!this.deletes(item)) {
if (action !== "insert") {
addOp();
action = "insert";
}
insert +=
item.content.str;
}
} else if (this.deletes(item)) {
if (action !== "delete") {
addOp();
action = "delete";
}
deleteLen += item.length;
} else if (!item.deleted) {
if (action !== "retain") {
addOp();
action = "retain";
}
retain += item.length;
}
break;
case ContentFormat: {
const { key, value } = (
item.content
);
if (this.adds(item)) {
if (!this.deletes(item)) {
const curVal = currentAttributes.get(key) ?? null;
if (!equalAttrs(curVal, value)) {
if (action === "retain") {
addOp();
}
if (equalAttrs(value, oldAttributes.get(key) ?? null)) {
delete attributes[key];
} else {
attributes[key] = value;
}
} else if (value !== null) {
item.delete(transaction);
}
}
} else if (this.deletes(item)) {
oldAttributes.set(key, value);
const curVal = currentAttributes.get(key) ?? null;
if (!equalAttrs(curVal, value)) {
if (action === "retain") {
addOp();
}
attributes[key] = curVal;
}
} else if (!item.deleted) {
oldAttributes.set(key, value);
const attr = attributes[key];
if (attr !== void 0) {
if (!equalAttrs(attr, value)) {
if (action === "retain") {
addOp();
}
if (value === null) {
delete attributes[key];
} else {
attributes[key] = value;
}
} else if (attr !== null) {
item.delete(transaction);
}
}
}
if (!item.deleted) {
if (action === "insert") {
addOp();
}
updateCurrentAttributes(
currentAttributes,
item.content
);
}
break;
}
}
item = item.right;
}
addOp();
while (delta.length > 0) {
const lastOp = delta[delta.length - 1];
if (lastOp.retain !== void 0 && lastOp.attributes === void 0) {
delta.pop();
} else {
break;
}
}
});
this._delta = delta;
}
return (
this._delta
);
}
};
var YText = class _YText extends AbstractType {
constructor(string) {
super();
this._pending = string !== void 0 ? [() => this.insert(0, string)] : [];
this._searchMarker = [];
this._hasFormatting = false;
}
get length() {
this.doc ?? warnPrematureAccess();
return this._length;
}
_integrate(y, item) {
super._integrate(y, item);
try {
this._pending.forEach((f) => f());
} catch (e) {
console.error(e);
}
this._pending = null;
}
_copy() {
return new _YText();
}
clone() {
const text = new _YText();
text.applyDelta(this.toDelta());
return text;
}
_callObserver(transaction, parentSubs) {
super._callObserver(transaction, parentSubs);
const event = new YTextEvent(this, transaction, parentSubs);
callTypeObservers(this, transaction, event);
if (!transaction.local && this._hasFormatting) {
transaction._needFormattingCleanup = true;
}
}
toString() {
this.doc ?? warnPrematureAccess();
let str = "";
let n = this._start;
while (n !== null) {
if (!n.deleted && n.countable && n.content.constructor === ContentString) {
str +=
n.content.str;
}
n = n.right;
}
return str;
}
toJSON() {
return this.toString();
}
applyDelta(delta, { sanitize = true } = {}) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
const currPos = new ItemTextListPosition(null, this._start, 0,  new Map());
for (let i = 0; i < delta.length; i++) {
const op = delta[i];
if (op.insert !== void 0) {
const ins = !sanitize && typeof op.insert === "string" && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === "\n" ? op.insert.slice(0, -1) : op.insert;
if (typeof ins !== "string" || ins.length > 0) {
insertText(transaction, this, currPos, ins, op.attributes || {});
}
} else if (op.retain !== void 0) {
formatText(transaction, this, currPos, op.retain, op.attributes || {});
} else if (op.delete !== void 0) {
deleteText(transaction, currPos, op.delete);
}
}
});
} else {
this._pending.push(() => this.applyDelta(delta));
}
}
toDelta(snapshot, prevSnapshot, computeYChange) {
this.doc ?? warnPrematureAccess();
const ops = [];
const currentAttributes =  new Map();
const doc = (
this.doc
);
let str = "";
let n = this._start;
function packStr() {
if (str.length > 0) {
const attributes = {};
let addAttributes = false;
currentAttributes.forEach((value, key) => {
addAttributes = true;
attributes[key] = value;
});
const op = { insert: str };
if (addAttributes) {
op.attributes = attributes;
}
ops.push(op);
str = "";
}
}
const computeDelta = () => {
while (n !== null) {
if (isVisible(n, snapshot) || prevSnapshot !== void 0 && isVisible(n, prevSnapshot)) {
switch (n.content.constructor) {
case ContentString: {
const cur = currentAttributes.get("ychange");
if (snapshot !== void 0 && !isVisible(n, snapshot)) {
if (cur === void 0 || cur.user !== n.id.client || cur.type !== "removed") {
packStr();
currentAttributes.set("ychange", computeYChange ? computeYChange("removed", n.id) : { type: "removed" });
}
} else if (prevSnapshot !== void 0 && !isVisible(n, prevSnapshot)) {
if (cur === void 0 || cur.user !== n.id.client || cur.type !== "added") {
packStr();
currentAttributes.set("ychange", computeYChange ? computeYChange("added", n.id) : { type: "added" });
}
} else if (cur !== void 0) {
packStr();
currentAttributes.delete("ychange");
}
str +=
n.content.str;
break;
}
case ContentType:
case ContentEmbed: {
packStr();
const op = {
insert: n.content.getContent()[0]
};
if (currentAttributes.size > 0) {
const attrs = (
{}
);
op.attributes = attrs;
currentAttributes.forEach((value, key) => {
attrs[key] = value;
});
}
ops.push(op);
break;
}
case ContentFormat:
if (isVisible(n, snapshot)) {
packStr();
updateCurrentAttributes(
currentAttributes,
n.content
);
}
break;
}
}
n = n.right;
}
packStr();
};
if (snapshot || prevSnapshot) {
transact(doc, (transaction) => {
if (snapshot) {
splitSnapshotAffectedStructs(transaction, snapshot);
}
if (prevSnapshot) {
splitSnapshotAffectedStructs(transaction, prevSnapshot);
}
computeDelta();
}, "cleanup");
} else {
computeDelta();
}
return ops;
}
insert(index, text, attributes) {
if (text.length <= 0) {
return;
}
const y = this.doc;
if (y !== null) {
transact(y, (transaction) => {
const pos = findPosition(transaction, this, index, !attributes);
if (!attributes) {
attributes = {};
pos.currentAttributes.forEach((v, k) => {
attributes[k] = v;
});
}
insertText(transaction, this, pos, text, attributes);
});
} else {
this._pending.push(() => this.insert(index, text, attributes));
}
}
insertEmbed(index, embed, attributes) {
const y = this.doc;
if (y !== null) {
transact(y, (transaction) => {
const pos = findPosition(transaction, this, index, !attributes);
insertText(transaction, this, pos, embed, attributes || {});
});
} else {
this._pending.push(() => this.insertEmbed(index, embed, attributes || {}));
}
}
delete(index, length2) {
if (length2 === 0) {
return;
}
const y = this.doc;
if (y !== null) {
transact(y, (transaction) => {
deleteText(transaction, findPosition(transaction, this, index, true), length2);
});
} else {
this._pending.push(() => this.delete(index, length2));
}
}
format(index, length2, attributes) {
if (length2 === 0) {
return;
}
const y = this.doc;
if (y !== null) {
transact(y, (transaction) => {
const pos = findPosition(transaction, this, index, false);
if (pos.right === null) {
return;
}
formatText(transaction, this, pos, length2, attributes);
});
} else {
this._pending.push(() => this.format(index, length2, attributes));
}
}
removeAttribute(attributeName) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeMapDelete(transaction, this, attributeName);
});
} else {
this._pending.push(() => this.removeAttribute(attributeName));
}
}
setAttribute(attributeName, attributeValue) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeMapSet(transaction, this, attributeName, attributeValue);
});
} else {
this._pending.push(() => this.setAttribute(attributeName, attributeValue));
}
}
getAttribute(attributeName) {
return (
typeMapGet(this, attributeName)
);
}
getAttributes() {
return typeMapGetAll(this);
}
_write(encoder) {
encoder.writeTypeRef(YTextRefID);
}
};
var readYText = (_decoder) => new YText();
var YXmlTreeWalker = class {
constructor(root, f = () => true) {
this._filter = f;
this._root = root;
this._currentNode =
root._start;
this._firstCall = true;
root.doc ?? warnPrematureAccess();
}
[Symbol.iterator]() {
return this;
}
next() {
let n = this._currentNode;
let type = n && n.content &&
n.content.type;
if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) {
do {
type =
n.content.type;
if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) {
n = type._start;
} else {
while (n !== null) {
const nxt = n.next;
if (nxt !== null) {
n = nxt;
break;
} else if (n.parent === this._root) {
n = null;
} else {
n =
n.parent._item;
}
}
}
} while (n !== null && (n.deleted || !this._filter(
n.content.type
)));
}
this._firstCall = false;
if (n === null) {
return { value: void 0, done: true };
}
this._currentNode = n;
return { value: (
n.content.type
), done: false };
}
};
var YXmlFragment = class _YXmlFragment extends AbstractType {
constructor() {
super();
this._prelimContent = [];
}
get firstChild() {
const first = this._first;
return first ? first.content.getContent()[0] : null;
}
_integrate(y, item) {
super._integrate(y, item);
this.insert(
0,
this._prelimContent
);
this._prelimContent = null;
}
_copy() {
return new _YXmlFragment();
}
clone() {
const el = new _YXmlFragment();
el.insert(0, this.toArray().map((item) => item instanceof AbstractType ? item.clone() : item));
return el;
}
get length() {
this.doc ?? warnPrematureAccess();
return this._prelimContent === null ? this._length : this._prelimContent.length;
}
createTreeWalker(filter) {
return new YXmlTreeWalker(this, filter);
}
querySelector(query) {
query = query.toUpperCase();
const iterator = new YXmlTreeWalker(this, (element) => element.nodeName && element.nodeName.toUpperCase() === query);
const next = iterator.next();
if (next.done) {
return null;
} else {
return next.value;
}
}
querySelectorAll(query) {
query = query.toUpperCase();
return from(new YXmlTreeWalker(this, (element) => element.nodeName && element.nodeName.toUpperCase() === query));
}
_callObserver(transaction, parentSubs) {
callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
}
toString() {
return typeListMap(this, (xml) => xml.toString()).join("");
}
toJSON() {
return this.toString();
}
toDOM(_document = document, hooks = {}, binding) {
const fragment = _document.createDocumentFragment();
if (binding !== void 0) {
binding._createAssociation(fragment, this);
}
typeListForEach(this, (xmlType) => {
fragment.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
});
return fragment;
}
insert(index, content) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeListInsertGenerics(transaction, this, index, content);
});
} else {
this._prelimContent.splice(index, 0, ...content);
}
}
insertAfter(ref, content) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
const refItem = ref && ref instanceof AbstractType ? ref._item : ref;
typeListInsertGenericsAfter(transaction, this, refItem, content);
});
} else {
const pc = (
this._prelimContent
);
const index = ref === null ? 0 : pc.findIndex((el) => el === ref) + 1;
if (index === 0 && ref !== null) {
throw create3("Reference item not found");
}
pc.splice(index, 0, ...content);
}
}
delete(index, length2 = 1) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeListDelete(transaction, this, index, length2);
});
} else {
this._prelimContent.splice(index, length2);
}
}
toArray() {
return typeListToArray(this);
}
push(content) {
this.insert(this.length, content);
}
unshift(content) {
this.insert(0, content);
}
get(index) {
return typeListGet(this, index);
}
slice(start = 0, end = this.length) {
return typeListSlice(this, start, end);
}
forEach(f) {
typeListForEach(this, f);
}
_write(encoder) {
encoder.writeTypeRef(YXmlFragmentRefID);
}
};
var readYXmlFragment = (_decoder) => new YXmlFragment();
var YXmlElement = class _YXmlElement extends YXmlFragment {
constructor(nodeName = "UNDEFINED") {
super();
this.nodeName = nodeName;
this._prelimAttrs =  new Map();
}
get nextSibling() {
const n = this._item ? this._item.next : null;
return n ? (
n.content.type
) : null;
}
get prevSibling() {
const n = this._item ? this._item.prev : null;
return n ? (
n.content.type
) : null;
}
_integrate(y, item) {
super._integrate(y, item);
this._prelimAttrs.forEach((value, key) => {
this.setAttribute(key, value);
});
this._prelimAttrs = null;
}
_copy() {
return new _YXmlElement(this.nodeName);
}
clone() {
const el = new _YXmlElement(this.nodeName);
const attrs = this.getAttributes();
forEach(attrs, (value, key) => {
el.setAttribute(
key,
value
);
});
el.insert(0, this.toArray().map((v) => v instanceof AbstractType ? v.clone() : v));
return el;
}
toString() {
const attrs = this.getAttributes();
const stringBuilder = [];
const keys = [];
for (const key in attrs) {
keys.push(key);
}
keys.sort();
const keysLen = keys.length;
for (let i = 0; i < keysLen; i++) {
const key = keys[i];
stringBuilder.push(key + '="' + attrs[key] + '"');
}
const nodeName = this.nodeName.toLocaleLowerCase();
const attrsString = stringBuilder.length > 0 ? " " + stringBuilder.join(" ") : "";
return `<${nodeName}${attrsString}>${super.toString()}</${nodeName}>`;
}
removeAttribute(attributeName) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeMapDelete(transaction, this, attributeName);
});
} else {
this._prelimAttrs.delete(attributeName);
}
}
setAttribute(attributeName, attributeValue) {
if (this.doc !== null) {
transact(this.doc, (transaction) => {
typeMapSet(transaction, this, attributeName, attributeValue);
});
} else {
this._prelimAttrs.set(attributeName, attributeValue);
}
}
getAttribute(attributeName) {
return (
typeMapGet(this, attributeName)
);
}
hasAttribute(attributeName) {
return (
typeMapHas(this, attributeName)
);
}
getAttributes(snapshot) {
return (
snapshot ? typeMapGetAllSnapshot(this, snapshot) : typeMapGetAll(this)
);
}
toDOM(_document = document, hooks = {}, binding) {
const dom = _document.createElement(this.nodeName);
const attrs = this.getAttributes();
for (const key in attrs) {
const value = attrs[key];
if (typeof value === "string") {
dom.setAttribute(key, value);
}
}
typeListForEach(this, (yxml) => {
dom.appendChild(yxml.toDOM(_document, hooks, binding));
});
if (binding !== void 0) {
binding._createAssociation(dom, this);
}
return dom;
}
_write(encoder) {
encoder.writeTypeRef(YXmlElementRefID);
encoder.writeKey(this.nodeName);
}
};
var readYXmlElement = (decoder) => new YXmlElement(decoder.readKey());
var YXmlEvent = class extends YEvent {
constructor(target, subs, transaction) {
super(target, transaction);
this.childListChanged = false;
this.attributesChanged =  new Set();
subs.forEach((sub) => {
if (sub === null) {
this.childListChanged = true;
} else {
this.attributesChanged.add(sub);
}
});
}
};
var YXmlHook = class _YXmlHook extends YMap {
constructor(hookName) {
super();
this.hookName = hookName;
}
_copy() {
return new _YXmlHook(this.hookName);
}
clone() {
const el = new _YXmlHook(this.hookName);
this.forEach((value, key) => {
el.set(key, value);
});
return el;
}
toDOM(_document = document, hooks = {}, binding) {
const hook = hooks[this.hookName];
let dom;
if (hook !== void 0) {
dom = hook.createDom(this);
} else {
dom = document.createElement(this.hookName);
}
dom.setAttribute("data-yjs-hook", this.hookName);
if (binding !== void 0) {
binding._createAssociation(dom, this);
}
return dom;
}
_write(encoder) {
encoder.writeTypeRef(YXmlHookRefID);
encoder.writeKey(this.hookName);
}
};
var readYXmlHook = (decoder) => new YXmlHook(decoder.readKey());
var YXmlText = class _YXmlText extends YText {
get nextSibling() {
const n = this._item ? this._item.next : null;
return n ? (
n.content.type
) : null;
}
get prevSibling() {
const n = this._item ? this._item.prev : null;
return n ? (
n.content.type
) : null;
}
_copy() {
return new _YXmlText();
}
clone() {
const text = new _YXmlText();
text.applyDelta(this.toDelta());
return text;
}
toDOM(_document = document, hooks, binding) {
const dom = _document.createTextNode(this.toString());
if (binding !== void 0) {
binding._createAssociation(dom, this);
}
return dom;
}
toString() {
return this.toDelta().map((delta) => {
const nestedNodes = [];
for (const nodeName in delta.attributes) {
const attrs = [];
for (const key in delta.attributes[nodeName]) {
attrs.push({ key, value: delta.attributes[nodeName][key] });
}
attrs.sort((a, b) => a.key < b.key ? -1 : 1);
nestedNodes.push({ nodeName, attrs });
}
nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
let str = "";
for (let i = 0; i < nestedNodes.length; i++) {
const node = nestedNodes[i];
str += `<${node.nodeName}`;
for (let j = 0; j < node.attrs.length; j++) {
const attr = node.attrs[j];
str += ` ${attr.key}="${attr.value}"`;
}
str += ">";
}
str += delta.insert;
for (let i = nestedNodes.length - 1; i >= 0; i--) {
str += `</${nestedNodes[i].nodeName}>`;
}
return str;
}).join("");
}
toJSON() {
return this.toString();
}
_write(encoder) {
encoder.writeTypeRef(YXmlTextRefID);
}
};
var readYXmlText = (decoder) => new YXmlText();
var AbstractStruct = class {
constructor(id2, length2) {
this.id = id2;
this.length = length2;
}
get deleted() {
throw methodUnimplemented();
}
mergeWith(right) {
return false;
}
write(encoder, offset, encodingRef) {
throw methodUnimplemented();
}
integrate(transaction, offset) {
throw methodUnimplemented();
}
};
var structGCRefNumber = 0;
var GC = class extends AbstractStruct {
get deleted() {
return true;
}
delete() {
}
mergeWith(right) {
if (this.constructor !== right.constructor) {
return false;
}
this.length += right.length;
return true;
}
integrate(transaction, offset) {
if (offset > 0) {
this.id.clock += offset;
this.length -= offset;
}
addStruct(transaction.doc.store, this);
}
write(encoder, offset) {
encoder.writeInfo(structGCRefNumber);
encoder.writeLen(this.length - offset);
}
getMissing(transaction, store) {
return null;
}
};
var ContentBinary = class _ContentBinary {
constructor(content) {
this.content = content;
}
getLength() {
return 1;
}
getContent() {
return [this.content];
}
isCountable() {
return true;
}
copy() {
return new _ContentBinary(this.content);
}
splice(offset) {
throw methodUnimplemented();
}
mergeWith(right) {
return false;
}
integrate(transaction, item) {
}
delete(transaction) {
}
gc(store) {
}
write(encoder, offset) {
encoder.writeBuf(this.content);
}
getRef() {
return 3;
}
};
var readContentBinary = (decoder) => new ContentBinary(decoder.readBuf());
var ContentDeleted = class _ContentDeleted {
constructor(len) {
this.len = len;
}
getLength() {
return this.len;
}
getContent() {
return [];
}
isCountable() {
return false;
}
copy() {
return new _ContentDeleted(this.len);
}
splice(offset) {
const right = new _ContentDeleted(this.len - offset);
this.len = offset;
return right;
}
mergeWith(right) {
this.len += right.len;
return true;
}
integrate(transaction, item) {
addToDeleteSet(transaction.deleteSet, item.id.client, item.id.clock, this.len);
item.markDeleted();
}
delete(transaction) {
}
gc(store) {
}
write(encoder, offset) {
encoder.writeLen(this.len - offset);
}
getRef() {
return 1;
}
};
var readContentDeleted = (decoder) => new ContentDeleted(decoder.readLen());
var createDocFromOpts = (guid, opts) => new Doc({ guid, ...opts, shouldLoad: opts.shouldLoad || opts.autoLoad || false });
var ContentDoc = class _ContentDoc {
constructor(doc) {
if (doc._item) {
console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid.");
}
this.doc = doc;
const opts = {};
this.opts = opts;
if (!doc.gc) {
opts.gc = false;
}
if (doc.autoLoad) {
opts.autoLoad = true;
}
if (doc.meta !== null) {
opts.meta = doc.meta;
}
}
getLength() {
return 1;
}
getContent() {
return [this.doc];
}
isCountable() {
return true;
}
copy() {
return new _ContentDoc(createDocFromOpts(this.doc.guid, this.opts));
}
splice(offset) {
throw methodUnimplemented();
}
mergeWith(right) {
return false;
}
integrate(transaction, item) {
this.doc._item = item;
transaction.subdocsAdded.add(this.doc);
if (this.doc.shouldLoad) {
transaction.subdocsLoaded.add(this.doc);
}
}
delete(transaction) {
if (transaction.subdocsAdded.has(this.doc)) {
transaction.subdocsAdded.delete(this.doc);
} else {
transaction.subdocsRemoved.add(this.doc);
}
}
gc(store) {
}
write(encoder, offset) {
encoder.writeString(this.doc.guid);
encoder.writeAny(this.opts);
}
getRef() {
return 9;
}
};
var readContentDoc = (decoder) => new ContentDoc(createDocFromOpts(decoder.readString(), decoder.readAny()));
var ContentEmbed = class _ContentEmbed {
constructor(embed) {
this.embed = embed;
}
getLength() {
return 1;
}
getContent() {
return [this.embed];
}
isCountable() {
return true;
}
copy() {
return new _ContentEmbed(this.embed);
}
splice(offset) {
throw methodUnimplemented();
}
mergeWith(right) {
return false;
}
integrate(transaction, item) {
}
delete(transaction) {
}
gc(store) {
}
write(encoder, offset) {
encoder.writeJSON(this.embed);
}
getRef() {
return 5;
}
};
var readContentEmbed = (decoder) => new ContentEmbed(decoder.readJSON());
var ContentFormat = class _ContentFormat {
constructor(key, value) {
this.key = key;
this.value = value;
}
getLength() {
return 1;
}
getContent() {
return [];
}
isCountable() {
return false;
}
copy() {
return new _ContentFormat(this.key, this.value);
}
splice(_offset) {
throw methodUnimplemented();
}
mergeWith(_right) {
return false;
}
integrate(_transaction, item) {
const p = (
item.parent
);
p._searchMarker = null;
p._hasFormatting = true;
}
delete(transaction) {
}
gc(store) {
}
write(encoder, offset) {
encoder.writeKey(this.key);
encoder.writeJSON(this.value);
}
getRef() {
return 6;
}
};
var readContentFormat = (decoder) => new ContentFormat(decoder.readKey(), decoder.readJSON());
var ContentJSON = class _ContentJSON {
constructor(arr) {
this.arr = arr;
}
getLength() {
return this.arr.length;
}
getContent() {
return this.arr;
}
isCountable() {
return true;
}
copy() {
return new _ContentJSON(this.arr);
}
splice(offset) {
const right = new _ContentJSON(this.arr.slice(offset));
this.arr = this.arr.slice(0, offset);
return right;
}
mergeWith(right) {
this.arr = this.arr.concat(right.arr);
return true;
}
integrate(transaction, item) {
}
delete(transaction) {
}
gc(store) {
}
write(encoder, offset) {
const len = this.arr.length;
encoder.writeLen(len - offset);
for (let i = offset; i < len; i++) {
const c = this.arr[i];
encoder.writeString(c === void 0 ? "undefined" : JSON.stringify(c));
}
}
getRef() {
return 2;
}
};
var readContentJSON = (decoder) => {
const len = decoder.readLen();
const cs = [];
for (let i = 0; i < len; i++) {
const c = decoder.readString();
if (c === "undefined") {
cs.push(void 0);
} else {
cs.push(JSON.parse(c));
}
}
return new ContentJSON(cs);
};
var isDevMode = getVariable("node_env") === "development";
var ContentAny = class _ContentAny {
constructor(arr) {
this.arr = arr;
isDevMode && deepFreeze(arr);
}
getLength() {
return this.arr.length;
}
getContent() {
return this.arr;
}
isCountable() {
return true;
}
copy() {
return new _ContentAny(this.arr);
}
splice(offset) {
const right = new _ContentAny(this.arr.slice(offset));
this.arr = this.arr.slice(0, offset);
return right;
}
mergeWith(right) {
this.arr = this.arr.concat(right.arr);
return true;
}
integrate(transaction, item) {
}
delete(transaction) {
}
gc(store) {
}
write(encoder, offset) {
const len = this.arr.length;
encoder.writeLen(len - offset);
for (let i = offset; i < len; i++) {
const c = this.arr[i];
encoder.writeAny(c);
}
}
getRef() {
return 8;
}
};
var readContentAny = (decoder) => {
const len = decoder.readLen();
const cs = [];
for (let i = 0; i < len; i++) {
cs.push(decoder.readAny());
}
return new ContentAny(cs);
};
var ContentString = class _ContentString {
constructor(str) {
this.str = str;
}
getLength() {
return this.str.length;
}
getContent() {
return this.str.split("");
}
isCountable() {
return true;
}
copy() {
return new _ContentString(this.str);
}
splice(offset) {
const right = new _ContentString(this.str.slice(offset));
this.str = this.str.slice(0, offset);
const firstCharCode = this.str.charCodeAt(offset - 1);
if (firstCharCode >= 55296 && firstCharCode <= 56319) {
this.str = this.str.slice(0, offset - 1) + "\uFFFD";
right.str = "\uFFFD" + right.str.slice(1);
}
return right;
}
mergeWith(right) {
this.str += right.str;
return true;
}
integrate(transaction, item) {
}
delete(transaction) {
}
gc(store) {
}
write(encoder, offset) {
encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
}
getRef() {
return 4;
}
};
var readContentString = (decoder) => new ContentString(decoder.readString());
var typeRefs = [
readYArray,
readYMap,
readYText,
readYXmlElement,
readYXmlFragment,
readYXmlHook,
readYXmlText
];
var YArrayRefID = 0;
var YMapRefID = 1;
var YTextRefID = 2;
var YXmlElementRefID = 3;
var YXmlFragmentRefID = 4;
var YXmlHookRefID = 5;
var YXmlTextRefID = 6;
var ContentType = class _ContentType {
constructor(type) {
this.type = type;
}
getLength() {
return 1;
}
getContent() {
return [this.type];
}
isCountable() {
return true;
}
copy() {
return new _ContentType(this.type._copy());
}
splice(offset) {
throw methodUnimplemented();
}
mergeWith(right) {
return false;
}
integrate(transaction, item) {
this.type._integrate(transaction.doc, item);
}
delete(transaction) {
let item = this.type._start;
while (item !== null) {
if (!item.deleted) {
item.delete(transaction);
} else if (item.id.clock < (transaction.beforeState.get(item.id.client) || 0)) {
transaction._mergeStructs.push(item);
}
item = item.right;
}
this.type._map.forEach((item2) => {
if (!item2.deleted) {
item2.delete(transaction);
} else if (item2.id.clock < (transaction.beforeState.get(item2.id.client) || 0)) {
transaction._mergeStructs.push(item2);
}
});
transaction.changed.delete(this.type);
}
gc(store) {
let item = this.type._start;
while (item !== null) {
item.gc(store, true);
item = item.right;
}
this.type._start = null;
this.type._map.forEach(
(item2) => {
while (item2 !== null) {
item2.gc(store, true);
item2 = item2.left;
}
}
);
this.type._map =  new Map();
}
write(encoder, offset) {
this.type._write(encoder);
}
getRef() {
return 7;
}
};
var readContentType = (decoder) => new ContentType(typeRefs[decoder.readTypeRef()](decoder));
var splitItem = (transaction, leftItem, diff) => {
const { client, clock } = leftItem.id;
const rightItem = new Item(
createID(client, clock + diff),
leftItem,
createID(client, clock + diff - 1),
leftItem.right,
leftItem.rightOrigin,
leftItem.parent,
leftItem.parentSub,
leftItem.content.splice(diff)
);
if (leftItem.deleted) {
rightItem.markDeleted();
}
if (leftItem.keep) {
rightItem.keep = true;
}
if (leftItem.redone !== null) {
rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
}
leftItem.right = rightItem;
if (rightItem.right !== null) {
rightItem.right.left = rightItem;
}
transaction._mergeStructs.push(rightItem);
if (rightItem.parentSub !== null && rightItem.right === null) {
rightItem.parent._map.set(rightItem.parentSub, rightItem);
}
leftItem.length = diff;
return rightItem;
};
var Item = class _Item extends AbstractStruct {
constructor(id2, left, origin, right, rightOrigin, parent, parentSub, content) {
super(id2, content.getLength());
this.origin = origin;
this.left = left;
this.right = right;
this.rightOrigin = rightOrigin;
this.parent = parent;
this.parentSub = parentSub;
this.redone = null;
this.content = content;
this.info = this.content.isCountable() ? BIT2 : 0;
}
set marker(isMarked) {
if ((this.info & BIT4) > 0 !== isMarked) {
this.info ^= BIT4;
}
}
get marker() {
return (this.info & BIT4) > 0;
}
get keep() {
return (this.info & BIT1) > 0;
}
set keep(doKeep) {
if (this.keep !== doKeep) {
this.info ^= BIT1;
}
}
get countable() {
return (this.info & BIT2) > 0;
}
get deleted() {
return (this.info & BIT3) > 0;
}
set deleted(doDelete) {
if (this.deleted !== doDelete) {
this.info ^= BIT3;
}
}
markDeleted() {
this.info |= BIT3;
}
getMissing(transaction, store) {
if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= getState(store, this.origin.client)) {
return this.origin.client;
}
if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= getState(store, this.rightOrigin.client)) {
return this.rightOrigin.client;
}
if (this.parent && this.parent.constructor === ID && this.id.client !== this.parent.client && this.parent.clock >= getState(store, this.parent.client)) {
return this.parent.client;
}
if (this.origin) {
this.left = getItemCleanEnd(transaction, store, this.origin);
this.origin = this.left.lastId;
}
if (this.rightOrigin) {
this.right = getItemCleanStart(transaction, this.rightOrigin);
this.rightOrigin = this.right.id;
}
if (this.left && this.left.constructor === GC || this.right && this.right.constructor === GC) {
this.parent = null;
} else if (!this.parent) {
if (this.left && this.left.constructor === _Item) {
this.parent = this.left.parent;
this.parentSub = this.left.parentSub;
} else if (this.right && this.right.constructor === _Item) {
this.parent = this.right.parent;
this.parentSub = this.right.parentSub;
}
} else if (this.parent.constructor === ID) {
const parentItem = getItem(store, this.parent);
if (parentItem.constructor === GC) {
this.parent = null;
} else {
this.parent =
parentItem.content.type;
}
}
return null;
}
integrate(transaction, offset) {
if (offset > 0) {
this.id.clock += offset;
this.left = getItemCleanEnd(transaction, transaction.doc.store, createID(this.id.client, this.id.clock - 1));
this.origin = this.left.lastId;
this.content = this.content.splice(offset);
this.length -= offset;
}
if (this.parent) {
if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
let left = this.left;
let o;
if (left !== null) {
o = left.right;
} else if (this.parentSub !== null) {
o =
this.parent._map.get(this.parentSub) || null;
while (o !== null && o.left !== null) {
o = o.left;
}
} else {
o =
this.parent._start;
}
const conflictingItems =  new Set();
const itemsBeforeOrigin =  new Set();
while (o !== null && o !== this.right) {
itemsBeforeOrigin.add(o);
conflictingItems.add(o);
if (compareIDs(this.origin, o.origin)) {
if (o.id.client < this.id.client) {
left = o;
conflictingItems.clear();
} else if (compareIDs(this.rightOrigin, o.rightOrigin)) {
break;
}
} else if (o.origin !== null && itemsBeforeOrigin.has(getItem(transaction.doc.store, o.origin))) {
if (!conflictingItems.has(getItem(transaction.doc.store, o.origin))) {
left = o;
conflictingItems.clear();
}
} else {
break;
}
o = o.right;
}
this.left = left;
}
if (this.left !== null) {
const right = this.left.right;
this.right = right;
this.left.right = this;
} else {
let r;
if (this.parentSub !== null) {
r =
this.parent._map.get(this.parentSub) || null;
while (r !== null && r.left !== null) {
r = r.left;
}
} else {
r =
this.parent._start;
this.parent._start = this;
}
this.right = r;
}
if (this.right !== null) {
this.right.left = this;
} else if (this.parentSub !== null) {
this.parent._map.set(this.parentSub, this);
if (this.left !== null) {
this.left.delete(transaction);
}
}
if (this.parentSub === null && this.countable && !this.deleted) {
this.parent._length += this.length;
}
addStruct(transaction.doc.store, this);
this.content.integrate(transaction, this);
addChangedTypeToTransaction(
transaction,
this.parent,
this.parentSub
);
if (
this.parent._item !== null &&
this.parent._item.deleted || this.parentSub !== null && this.right !== null
) {
this.delete(transaction);
}
} else {
new GC(this.id, this.length).integrate(transaction, 0);
}
}
get next() {
let n = this.right;
while (n !== null && n.deleted) {
n = n.right;
}
return n;
}
get prev() {
let n = this.left;
while (n !== null && n.deleted) {
n = n.left;
}
return n;
}
get lastId() {
return this.length === 1 ? this.id : createID(this.id.client, this.id.clock + this.length - 1);
}
mergeWith(right) {
if (this.constructor === right.constructor && compareIDs(right.origin, this.lastId) && this.right === right && compareIDs(this.rightOrigin, right.rightOrigin) && this.id.client === right.id.client && this.id.clock + this.length === right.id.clock && this.deleted === right.deleted && this.redone === null && right.redone === null && this.content.constructor === right.content.constructor && this.content.mergeWith(right.content)) {
const searchMarker = (
this.parent._searchMarker
);
if (searchMarker) {
searchMarker.forEach((marker) => {
if (marker.p === right) {
marker.p = this;
if (!this.deleted && this.countable) {
marker.index -= this.length;
}
}
});
}
if (right.keep) {
this.keep = true;
}
this.right = right.right;
if (this.right !== null) {
this.right.left = this;
}
this.length += right.length;
return true;
}
return false;
}
delete(transaction) {
if (!this.deleted) {
const parent = (
this.parent
);
if (this.countable && this.parentSub === null) {
parent._length -= this.length;
}
this.markDeleted();
addToDeleteSet(transaction.deleteSet, this.id.client, this.id.clock, this.length);
addChangedTypeToTransaction(transaction, parent, this.parentSub);
this.content.delete(transaction);
}
}
gc(store, parentGCd) {
if (!this.deleted) {
throw unexpectedCase();
}
this.content.gc(store);
if (parentGCd) {
replaceStruct(store, this, new GC(this.id, this.length));
} else {
this.content = new ContentDeleted(this.length);
}
}
write(encoder, offset) {
const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
const rightOrigin = this.rightOrigin;
const parentSub = this.parentSub;
const info = this.content.getRef() & BITS5 | (origin === null ? 0 : BIT8) | // origin is defined
(rightOrigin === null ? 0 : BIT7) | // right origin is defined
(parentSub === null ? 0 : BIT6);
encoder.writeInfo(info);
if (origin !== null) {
encoder.writeLeftID(origin);
}
if (rightOrigin !== null) {
encoder.writeRightID(rightOrigin);
}
if (origin === null && rightOrigin === null) {
const parent = (
this.parent
);
if (parent._item !== void 0) {
const parentItem = parent._item;
if (parentItem === null) {
const ykey = findRootTypeKey(parent);
encoder.writeParentInfo(true);
encoder.writeString(ykey);
} else {
encoder.writeParentInfo(false);
encoder.writeLeftID(parentItem.id);
}
} else if (parent.constructor === String) {
encoder.writeParentInfo(true);
encoder.writeString(parent);
} else if (parent.constructor === ID) {
encoder.writeParentInfo(false);
encoder.writeLeftID(parent);
} else {
unexpectedCase();
}
if (parentSub !== null) {
encoder.writeString(parentSub);
}
}
this.content.write(encoder, offset);
}
};
var readItemContent = (decoder, info) => contentRefs[info & BITS5](decoder);
var contentRefs = [
() => {
unexpectedCase();
},
readContentDeleted,
readContentJSON,
readContentBinary,
readContentString,
readContentEmbed,
readContentFormat,
readContentType,
readContentAny,
readContentDoc,
() => {
unexpectedCase();
}
];
var structSkipRefNumber = 10;
var Skip = class extends AbstractStruct {
get deleted() {
return true;
}
delete() {
}
mergeWith(right) {
if (this.constructor !== right.constructor) {
return false;
}
this.length += right.length;
return true;
}
integrate(transaction, offset) {
unexpectedCase();
}
write(encoder, offset) {
encoder.writeInfo(structSkipRefNumber);
writeVarUint(encoder.restEncoder, this.length - offset);
}
getMissing(transaction, store) {
return null;
}
};
var glo = (
typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}
);
var importIdentifier = "__ $YJS$ __";
if (glo[importIdentifier] === true) {
console.debug("[Yjs] Vendor bundle shared memory initialized.");
}
glo[importIdentifier] = true;
var channels =  new Map();
var LocalStoragePolyfill = class {
constructor(room) {
this.room = room;
this.onmessage = null;
this._onChange = (e) => e.key === room && this.onmessage !== null && this.onmessage({ data: fromBase64(e.newValue || "") });
onChange(this._onChange);
}
postMessage(buf) {
varStorage.setItem(this.room, toBase64(createUint8ArrayFromArrayBuffer(buf)));
}
close() {
offChange(this._onChange);
}
};
var BC = typeof BroadcastChannel === "undefined" ? LocalStoragePolyfill : BroadcastChannel;
var getChannel = (room) => setIfUndefined(channels, room, () => {
const subs = create2();
const bc = new BC(room);
bc.onmessage = (e) => subs.forEach((sub) => sub(e.data, "broadcastchannel"));
return {
bc,
subs
};
});
var subscribe = (room, f) => {
getChannel(room).subs.add(f);
return f;
};
var unsubscribe = (room, f) => {
const channel = getChannel(room);
const unsubscribed = channel.subs.delete(f);
if (unsubscribed && channel.subs.size === 0) {
channel.bc.close();
channels.delete(room);
}
return unsubscribed;
};
var publish = (room, data, origin = null) => {
const c = getChannel(room);
c.bc.postMessage(data);
c.subs.forEach((sub) => sub(data, origin));
};
var messageYjsSyncStep1 = 0;
var messageYjsSyncStep2 = 1;
var messageYjsUpdate = 2;
var writeSyncStep1 = (encoder, doc) => {
writeVarUint(encoder, messageYjsSyncStep1);
const sv = encodeStateVector(doc);
writeVarUint8Array(encoder, sv);
};
var writeSyncStep2 = (encoder, doc, encodedStateVector) => {
writeVarUint(encoder, messageYjsSyncStep2);
writeVarUint8Array(encoder, encodeStateAsUpdate(doc, encodedStateVector));
};
var readSyncStep1 = (decoder, encoder, doc) => writeSyncStep2(encoder, doc, readVarUint8Array(decoder));
var readSyncStep2 = (decoder, doc, transactionOrigin, errorHandler) => {
try {
applyUpdate(doc, readVarUint8Array(decoder), transactionOrigin);
} catch (error) {
if (errorHandler != null) errorHandler(
error
);
console.error("Caught error while handling a Yjs update", error);
}
};
var writeUpdate = (encoder, update) => {
writeVarUint(encoder, messageYjsUpdate);
writeVarUint8Array(encoder, update);
};
var readUpdate = readSyncStep2;
var readSyncMessage = (decoder, encoder, doc, transactionOrigin, errorHandler) => {
const messageType = readVarUint(decoder);
switch (messageType) {
case messageYjsSyncStep1:
readSyncStep1(decoder, encoder, doc);
break;
case messageYjsSyncStep2:
readSyncStep2(decoder, doc, transactionOrigin, errorHandler);
break;
case messageYjsUpdate:
readUpdate(decoder, doc, transactionOrigin, errorHandler);
break;
default:
throw new Error("Unknown message type");
}
return messageType;
};
var messagePermissionDenied = 0;
var readAuthMessage = (decoder, y, permissionDeniedHandler2) => {
switch (readVarUint(decoder)) {
case messagePermissionDenied:
permissionDeniedHandler2(y, readVarString(decoder));
}
};
var outdatedTimeout = 3e4;
var Awareness = class extends Observable {
constructor(doc) {
super();
this.doc = doc;
this.clientID = doc.clientID;
this.states =  new Map();
this.meta =  new Map();
this._checkInterval =
setInterval(() => {
const now = getUnixTime();
if (this.getLocalState() !== null && outdatedTimeout / 2 <= now -
this.meta.get(this.clientID).lastUpdated) {
this.setLocalState(this.getLocalState());
}
const remove = [];
this.meta.forEach((meta, clientid) => {
if (clientid !== this.clientID && outdatedTimeout <= now - meta.lastUpdated && this.states.has(clientid)) {
remove.push(clientid);
}
});
if (remove.length > 0) {
removeAwarenessStates(this, remove, "timeout");
}
}, floor(outdatedTimeout / 10));
doc.on("destroy", () => {
this.destroy();
});
this.setLocalState({});
}
destroy() {
this.emit("destroy", [this]);
this.setLocalState(null);
super.destroy();
clearInterval(this._checkInterval);
}
getLocalState() {
return this.states.get(this.clientID) || null;
}
setLocalState(state) {
const clientID = this.clientID;
const currLocalMeta = this.meta.get(clientID);
const clock = currLocalMeta === void 0 ? 0 : currLocalMeta.clock + 1;
const prevState = this.states.get(clientID);
if (state === null) {
this.states.delete(clientID);
} else {
this.states.set(clientID, state);
}
this.meta.set(clientID, {
clock,
lastUpdated: getUnixTime()
});
const added = [];
const updated = [];
const filteredUpdated = [];
const removed = [];
if (state === null) {
removed.push(clientID);
} else if (prevState == null) {
if (state != null) {
added.push(clientID);
}
} else {
updated.push(clientID);
if (!equalityDeep(prevState, state)) {
filteredUpdated.push(clientID);
}
}
if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
this.emit("change", [{ added, updated: filteredUpdated, removed }, "local"]);
}
this.emit("update", [{ added, updated, removed }, "local"]);
}
setLocalStateField(field, value) {
const state = this.getLocalState();
if (state !== null) {
this.setLocalState({
...state,
[field]: value
});
}
}
getStates() {
return this.states;
}
};
var removeAwarenessStates = (awareness, clients, origin) => {
const removed = [];
for (let i = 0; i < clients.length; i++) {
const clientID = clients[i];
if (awareness.states.has(clientID)) {
awareness.states.delete(clientID);
if (clientID === awareness.clientID) {
const curMeta = (
awareness.meta.get(clientID)
);
awareness.meta.set(clientID, {
clock: curMeta.clock + 1,
lastUpdated: getUnixTime()
});
}
removed.push(clientID);
}
}
if (removed.length > 0) {
awareness.emit("change", [{ added: [], updated: [], removed }, origin]);
awareness.emit("update", [{ added: [], updated: [], removed }, origin]);
}
};
var encodeAwarenessUpdate = (awareness, clients, states = awareness.states) => {
const len = clients.length;
const encoder = createEncoder();
writeVarUint(encoder, len);
for (let i = 0; i < len; i++) {
const clientID = clients[i];
const state = states.get(clientID) || null;
const clock = (
awareness.meta.get(clientID).clock
);
writeVarUint(encoder, clientID);
writeVarUint(encoder, clock);
writeVarString(encoder, JSON.stringify(state));
}
return toUint8Array(encoder);
};
var applyAwarenessUpdate = (awareness, update, origin) => {
const decoder = createDecoder(update);
const timestamp = getUnixTime();
const added = [];
const updated = [];
const filteredUpdated = [];
const removed = [];
const len = readVarUint(decoder);
for (let i = 0; i < len; i++) {
const clientID = readVarUint(decoder);
let clock = readVarUint(decoder);
const state = JSON.parse(readVarString(decoder));
const clientMeta = awareness.meta.get(clientID);
const prevState = awareness.states.get(clientID);
const currClock = clientMeta === void 0 ? 0 : clientMeta.clock;
if (currClock < clock || currClock === clock && state === null && awareness.states.has(clientID)) {
if (state === null) {
if (clientID === awareness.clientID && awareness.getLocalState() != null) {
clock++;
} else {
awareness.states.delete(clientID);
}
} else {
awareness.states.set(clientID, state);
}
awareness.meta.set(clientID, {
clock,
lastUpdated: timestamp
});
if (clientMeta === void 0 && state !== null) {
added.push(clientID);
} else if (clientMeta !== void 0 && state === null) {
removed.push(clientID);
} else if (state !== null) {
if (!equalityDeep(state, prevState)) {
filteredUpdated.push(clientID);
}
updated.push(clientID);
}
}
}
if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
awareness.emit("change", [{
added,
updated: filteredUpdated,
removed
}, origin]);
}
if (added.length > 0 || updated.length > 0 || removed.length > 0) {
awareness.emit("update", [{
added,
updated,
removed
}, origin]);
}
};
var encodeQueryParams = (params) => map(params, (val, key) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join("&");
var messageSync = 0;
var messageQueryAwareness = 3;
var messageAwareness = 1;
var messageAuth = 2;
var messageHandlers = [];
messageHandlers[messageSync] = (encoder, decoder, provider, emitSynced, _messageType) => {
writeVarUint(encoder, messageSync);
const syncMessageType = readSyncMessage(
decoder,
encoder,
provider.doc,
provider
);
if (emitSynced && syncMessageType === messageYjsSyncStep2 && !provider.synced) {
provider.synced = true;
}
};
messageHandlers[messageQueryAwareness] = (encoder, _decoder, provider, _emitSynced, _messageType) => {
writeVarUint(encoder, messageAwareness);
writeVarUint8Array(
encoder,
encodeAwarenessUpdate(
provider.awareness,
Array.from(provider.awareness.getStates().keys())
)
);
};
messageHandlers[messageAwareness] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
applyAwarenessUpdate(
provider.awareness,
readVarUint8Array(decoder),
provider
);
};
messageHandlers[messageAuth] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
readAuthMessage(
decoder,
provider.doc,
(_ydoc, reason) => permissionDeniedHandler(provider, reason)
);
};
var messageReconnectTimeout = 3e4;
var permissionDeniedHandler = (provider, reason) => console.warn(`Permission denied to access ${provider.url}.
${reason}`);
var readMessage = (provider, buf, emitSynced) => {
const decoder = createDecoder(buf);
const encoder = createEncoder();
const messageType = readVarUint(decoder);
const messageHandler = provider.messageHandlers[messageType];
if (
messageHandler
) {
messageHandler(encoder, decoder, provider, emitSynced, messageType);
} else {
console.error("Unable to compute message");
}
return encoder;
};
var setupWS = (provider) => {
if (provider.shouldConnect && provider.ws === null) {
const websocket = new provider._WS(provider.url);
websocket.binaryType = "arraybuffer";
provider.ws = websocket;
provider.wsconnecting = true;
provider.wsconnected = false;
provider.synced = false;
websocket.onmessage = (event) => {
provider.wsLastMessageReceived = getUnixTime();
const encoder = readMessage(provider, new Uint8Array(event.data), true);
if (length(encoder) > 1) {
websocket.send(toUint8Array(encoder));
}
};
websocket.onerror = (event) => {
provider.emit("connection-error", [event, provider]);
};
websocket.onclose = (event) => {
provider.emit("connection-close", [event, provider]);
provider.ws = null;
provider.wsconnecting = false;
if (provider.wsconnected) {
provider.wsconnected = false;
provider.synced = false;
removeAwarenessStates(
provider.awareness,
Array.from(provider.awareness.getStates().keys()).filter(
(client) => client !== provider.doc.clientID
),
provider
);
provider.emit("status", [{
status: "disconnected"
}]);
} else {
provider.wsUnsuccessfulReconnects++;
}
setTimeout(
setupWS,
min(
pow(2, provider.wsUnsuccessfulReconnects) * 100,
provider.maxBackoffTime
),
provider
);
};
websocket.onopen = () => {
provider.wsLastMessageReceived = getUnixTime();
provider.wsconnecting = false;
provider.wsconnected = true;
provider.wsUnsuccessfulReconnects = 0;
provider.emit("status", [{
status: "connected"
}]);
const encoder = createEncoder();
writeVarUint(encoder, messageSync);
writeSyncStep1(encoder, provider.doc);
websocket.send(toUint8Array(encoder));
if (provider.awareness.getLocalState() !== null) {
const encoderAwarenessState = createEncoder();
writeVarUint(encoderAwarenessState, messageAwareness);
writeVarUint8Array(
encoderAwarenessState,
encodeAwarenessUpdate(provider.awareness, [
provider.doc.clientID
])
);
websocket.send(toUint8Array(encoderAwarenessState));
}
};
provider.emit("status", [{
status: "connecting"
}]);
}
};
var broadcastMessage = (provider, buf) => {
const ws = provider.ws;
if (provider.wsconnected && ws && ws.readyState === ws.OPEN) {
ws.send(buf);
}
if (provider.bcconnected) {
publish(provider.bcChannel, buf, provider);
}
};
var WebsocketProvider = class extends Observable {
constructor(serverUrl, roomname, doc, {
connect = true,
awareness = new Awareness(doc),
params = {},
WebSocketPolyfill = WebSocket,
resyncInterval = -1,
maxBackoffTime = 2500,
disableBc = false
} = {}) {
super();
while (serverUrl[serverUrl.length - 1] === "/") {
serverUrl = serverUrl.slice(0, serverUrl.length - 1);
}
const encodedParams = encodeQueryParams(params);
this.maxBackoffTime = maxBackoffTime;
this.bcChannel = serverUrl + "/" + roomname;
this.url = serverUrl + "/" + roomname + (encodedParams.length === 0 ? "" : "?" + encodedParams);
this.roomname = roomname;
this.doc = doc;
this._WS = WebSocketPolyfill;
this.awareness = awareness;
this.wsconnected = false;
this.wsconnecting = false;
this.bcconnected = false;
this.disableBc = disableBc;
this.wsUnsuccessfulReconnects = 0;
this.messageHandlers = messageHandlers.slice();
this._synced = false;
this.ws = null;
this.wsLastMessageReceived = 0;
this.shouldConnect = connect;
this._resyncInterval = 0;
if (resyncInterval > 0) {
this._resyncInterval =
setInterval(() => {
if (this.ws && this.ws.readyState === WebSocket.OPEN) {
const encoder = createEncoder();
writeVarUint(encoder, messageSync);
writeSyncStep1(encoder, doc);
this.ws.send(toUint8Array(encoder));
}
}, resyncInterval);
}
this._bcSubscriber = (data, origin) => {
if (origin !== this) {
const encoder = readMessage(this, new Uint8Array(data), false);
if (length(encoder) > 1) {
publish(this.bcChannel, toUint8Array(encoder), this);
}
}
};
this._updateHandler = (update, origin) => {
if (origin !== this) {
const encoder = createEncoder();
writeVarUint(encoder, messageSync);
writeUpdate(encoder, update);
broadcastMessage(this, toUint8Array(encoder));
}
};
this.doc.on("update", this._updateHandler);
this._awarenessUpdateHandler = ({ added, updated, removed }, _origin) => {
const changedClients = added.concat(updated).concat(removed);
const encoder = createEncoder();
writeVarUint(encoder, messageAwareness);
writeVarUint8Array(
encoder,
encodeAwarenessUpdate(awareness, changedClients)
);
broadcastMessage(this, toUint8Array(encoder));
};
this._unloadHandler = () => {
removeAwarenessStates(
this.awareness,
[doc.clientID],
"window unload"
);
};
if (typeof window !== "undefined") {
window.addEventListener("unload", this._unloadHandler);
} else if (typeof process !== "undefined") {
process.on("exit", this._unloadHandler);
}
awareness.on("update", this._awarenessUpdateHandler);
this._checkInterval =
setInterval(() => {
if (this.wsconnected && messageReconnectTimeout < getUnixTime() - this.wsLastMessageReceived) {
this.ws.close();
}
}, messageReconnectTimeout / 10);
if (connect) {
this.connect();
}
}
get synced() {
return this._synced;
}
set synced(state) {
if (this._synced !== state) {
this._synced = state;
this.emit("synced", [state]);
this.emit("sync", [state]);
}
}
destroy() {
if (this._resyncInterval !== 0) {
clearInterval(this._resyncInterval);
}
clearInterval(this._checkInterval);
this.disconnect();
if (typeof window !== "undefined") {
window.removeEventListener("unload", this._unloadHandler);
} else if (typeof process !== "undefined") {
process.off("exit", this._unloadHandler);
}
this.awareness.off("update", this._awarenessUpdateHandler);
this.doc.off("update", this._updateHandler);
super.destroy();
}
connectBc() {
if (this.disableBc) {
return;
}
if (!this.bcconnected) {
subscribe(this.bcChannel, this._bcSubscriber);
this.bcconnected = true;
}
const encoderSync = createEncoder();
writeVarUint(encoderSync, messageSync);
writeSyncStep1(encoderSync, this.doc);
publish(this.bcChannel, toUint8Array(encoderSync), this);
const encoderState = createEncoder();
writeVarUint(encoderState, messageSync);
writeSyncStep2(encoderState, this.doc);
publish(this.bcChannel, toUint8Array(encoderState), this);
const encoderAwarenessQuery = createEncoder();
writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
publish(
this.bcChannel,
toUint8Array(encoderAwarenessQuery),
this
);
const encoderAwarenessState = createEncoder();
writeVarUint(encoderAwarenessState, messageAwareness);
writeVarUint8Array(
encoderAwarenessState,
encodeAwarenessUpdate(this.awareness, [
this.doc.clientID
])
);
publish(
this.bcChannel,
toUint8Array(encoderAwarenessState),
this
);
}
disconnectBc() {
const encoder = createEncoder();
writeVarUint(encoder, messageAwareness);
writeVarUint8Array(
encoder,
encodeAwarenessUpdate(this.awareness, [
this.doc.clientID
],  new Map())
);
broadcastMessage(this, toUint8Array(encoder));
if (this.bcconnected) {
unsubscribe(this.bcChannel, this._bcSubscriber);
this.bcconnected = false;
}
}
disconnect() {
this.shouldConnect = false;
this.disconnectBc();
if (this.ws !== null) {
this.ws.close();
}
}
connect() {
this.shouldConnect = true;
if (!this.wsconnected && this.ws === null) {
setupWS(this);
this.connectBc();
}
}
};
export {
WebsocketProvider,
messageAuth,
messageAwareness,
messageQueryAwareness,
messageSync
};