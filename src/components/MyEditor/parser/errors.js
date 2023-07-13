export function ParseFunctionError(type){
    return new Error(`\x1b[31m The Parser function of type "${type}" is not defined. `);
  }