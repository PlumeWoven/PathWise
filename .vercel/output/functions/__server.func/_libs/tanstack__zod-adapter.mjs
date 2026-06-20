import { c as custom } from "./zod.mjs";
var zodValidator = (options) => {
  const input = "input" in options ? options.input : "input";
  const output = "output" in options ? options.output : "output";
  const _input = "schema" in options ? options.schema._input : options._input;
  const _output = "schema" in options ? options.schema._output : options._output;
  return {
    types: {
      input: input === "output" ? _output : _input,
      output: output === "input" ? _input : _output
    },
    parse: (input2) => "schema" in options ? options.schema.parse(input2) : options.parse(input2)
  };
};
var fallback = (schema, fallback2) => {
  return custom().pipe(schema.catch(fallback2));
};
export {
  fallback as f,
  zodValidator as z
};
