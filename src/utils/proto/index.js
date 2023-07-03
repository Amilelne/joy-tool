import * as protoParser from 'proto-parser';
const SyntaxType = protoParser.SyntaxType;
import proto2mail from './proto2mail';
import proto2ts from './proto2ts';

export default function protoTransform(opt) {
  if (!opt.proto) {
    return {
      error: `proto不能为空`,
    };
  }
  const proto = protoParser.parse(opt.proto);
  if (proto.syntaxType === SyntaxType.ProtoError) {
    // parse error
    return {
      error: JSON.stringify(proto),
    };
  }
  if (!opt.main) {
    opt.main = Object.keys(proto.root.nested)[0];
  }
  const main = proto.root.nested[opt.main];
  if (!main) {
    return {
      error: `没有${opt.main}字段`,
    };
  }
  let code;
  if (opt.type) {
    code = proto2mail({
      proto,
      main,
    });
  } else {
    code = proto2ts({
      proto,
      main,
    });
  }
  return {
    error: false,
    main: opt.main,
    code,
  };
}
