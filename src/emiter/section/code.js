import { u8 } from 'wasm-types';
import { varuint32 } from '../numbers';
import OutputStream from '../../utils/output-stream';
import opcode from '../opcode';

// TODO
const emitLocal = (stream, local) => {};

const emitFunctionBody = (stream, { locals, code }) => {
  // write bytecode into a clean buffer
  const body = new OutputStream();
  code.forEach(({ kind, params }) => {
    switch(kind) {
      case opcode.GetGlobal.code:
        body.push(u8, kind, opcode.GetGlobal.text);
        body.push(varuint32, params[0], 'global index');
        break;
      case opcode.SetGlobal.code:
        body.push(u8, kind, opcode.SetGlobal.text);
        body.push(varuint32, params[0], 'global index');
        body.push(varuint32, params[1], `value (${params[1]})`);
        break;
      case opcode.i32Const.code:
        body.push(u8, kind, opcode.i32Const.text);
        body.push(varuint32, params[0], `value (${params[0]})`);
        break;
    };
  });

  // output locals to the stream
  const localsStream = new OutputStream();
  locals.forEach(local => emitLocal(localsStream, local));

  // body size is
  stream.push(varuint32, body.size + localsStream.size + 2, 'body size in bytes');
  stream.push(varuint32, locals.length, 'locals count');

  stream.write(body);
  stream.push(u8, opcode.End.code, 'end');
};

const emit = (functions) => {
  // do stuff with ast
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, 'function count');
  functions.forEach(func => emitFunctionBody(stream, func));

  return stream;
}

export default emit;
