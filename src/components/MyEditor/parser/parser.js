import { transforms } from './transforms';
import { ParseFunctionError } from './errors';

export const parser = (plugins = {}) => {
  const parsers = Object.assign({}, transforms, plugins);

  return {
    parse: ({ blocks }) => {
      if (!blocks) return;
      return blocks.map((block) => {
        return parsers[block.type]
          ? parsers[block.type](block)
          : ParseFunctionError(block.type);
      });
    },
    parseBlock: (block) => {
      return parsers[block.type]
        ? parsers[block.type](block)
        : ParseFunctionError(block.type);
    },
  };
};
