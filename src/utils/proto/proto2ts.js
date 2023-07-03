import * as protoParser from 'proto-parser';
const SyntaxType = protoParser.SyntaxType;
import { typeInt, typeFloat, typeBool, typeString } from './types';
import {
  addComment,
  indentString,
  EnumTypes,
  ArrayLiteral,
  EndOfLine,
  NextLine,
} from './utils';

function genCode(main, proto) {
  let code = '';
  const extraCode = [];
  for (const k in main.fields) {
    const field = main.fields[k];
    if (field.type.syntaxType === SyntaxType.BaseType) {
      // 普通类型
      code += indentString(genType(field));
    } else if (field.type.syntaxType === SyntaxType.Identifier) {
      // 复合类型
      code += indentString(genType(field));
      // 递归生成复合类型的定义
      const nested = main.nested[field.type.value];
      const { code: nestedCode, extraCode: nestedExtraCode } = genCode(
        nested,
        proto,
      );
      extraCode.push(nestedCode);
      extraCode.push(...nestedExtraCode);
    }
  }
  // 去除末尾换行符
  code = code.slice(0, -1);
  return { code: wrap(main.name, code), extraCode };
}

function genType(field) {
  let code = field.name + ':';
  // 是否是可选参数
  if (field.optional) {
    code = field.name + '?:';
  }

  // 获取类型
  if (
    typeInt.includes(field.type.value) ||
    typeFloat.includes(field.type.value)
  ) {
    code += EnumTypes.Number;
  } else if (typeBool.includes(field.type.value)) {
    code += EnumTypes.Bool;
  } else if (typeString.includes(field.type.value)) {
    code += EnumTypes.String;
  } else {
    code += field.type.value;
  }

  // 是否是数组
  if (field.repeated) {
    code += ArrayLiteral;
  }
  // 添加结束标志
  code += EndOfLine;

  // 是否有注释
  if (field.comment) {
    code += addComment(field.comment);
  } else {
    code += NextLine;
  }
  return code;
}

function wrap(typeName, code) {
  return `export interface ${typeName} {\n ${code} \n}`;
}

export default function process(opt) {
  const { main, proto } = opt;
  let finalCode = '';
  const { code, extraCode } = genCode(main, proto);
  finalCode += code;
  extraCode.forEach((extra) => {
    finalCode += NextLine + extra;
  });
  return finalCode;
}
