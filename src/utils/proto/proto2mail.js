import * as protoParser from 'proto-parser';
const SyntaxType = protoParser.SyntaxType;
import { typeInt, typeFloat, typeBool } from './types';
import { addComment, indentString } from './utils';

function genBaseType(field, simple = false) {
  let code = `<%${field.name}%>\n  ${field.name}: `;
  if (simple) {
    code = `${field.name}: `;
  }

  if (field.rule === 'repeated') {
    code = `${field.name}: [\n  <%${field.name}%>\n`;
  }

  if (typeInt.includes(field.type.value)) {
    code += `'$DATA$' * 1,`;
  } else if (typeFloat.includes(field.type.value)) {
    code += `'$DATA$' * 1.0,`;
  } else if (typeBool.includes(field.type.value)) {
    code += `$DATA$,`;
  } else {
    code +=
      field.comment && /^@\w+$/.test(field.comment)
        ? `'<%${field.comment}($DATA$)%>',`
        : `'$DATA$',`;
  }

  // 添加注释
  if (field.comment) {
    code += addComment(field.comment);
  }

  if (field.rule === 'repeated') {
    code += `\n<%/${field.name}%>\n],\n`;
  } else {
    if (simple) {
      code += `,\n`;
    } else {
      code += `\n<%/${field.name}%>\n`;
    }
  }
  return code;
}

function genIdentifier(field, proto, hasLoop = false, simple = false) {
  let code = `<%${field.name}%>\n  ${field.name}: {\n`;

  if (field.rule === 'repeated') {
    code = `${field.name}: [\n  <%${field.name}%>\n  {\n`;
  }

  const resolvedValue = field.type.resolvedValue.split('.').filter((k) => !!k);

  let message = proto.root.nested[resolvedValue[0]];

  for (let i = 1; i < resolvedValue.length; i++) {
    message = message.nested[resolvedValue[i]];
  }

  for (const k in message.fields) {
    const sfield = message.fields[k];
    if (sfield.type.syntaxType === SyntaxType.BaseType) {
      code += indentString(genBaseType(sfield, simple), 4);
    } else if (sfield.type.syntaxType === SyntaxType.Identifier && !hasLoop) {
      code += indentString(
        genIdentifier(
          sfield,
          proto,
          sfield.type.value === message.name,
          simple,
        ),
        4,
      );
    }
  }

  if (field.rule === 'repeated') {
    code += `  },\n  <%/${field.name}%>\n],\n`;
  } else {
    code += `  },\n<%/${field.name}%>\n`;
  }

  return code;
}

function wrap(code) {
  return `<script type="text/javascript">
    (function() {
      try {
        window.cgiData = {
  ${indentString(code, 8)}
        };
      } catch (e) {
        window.cgiError = e;
      }
    })();
  </script>`;
}

export default function process(opt) {
  const { main, proto } = opt;
  let code = '';
  for (const k in main.fields) {
    const field = main.fields[k];
    if (field.type.syntaxType === SyntaxType.BaseType) {
      code += indentString(genBaseType(field, opt.simple), 0);
    } else if (field.type.syntaxType === SyntaxType.Identifier) {
      code += indentString(genIdentifier(field, proto, false, opt.simple), 0);
    }
  }
  code = code.slice(0, -1); // 去除末尾的换行符
  return wrap(code);
}
