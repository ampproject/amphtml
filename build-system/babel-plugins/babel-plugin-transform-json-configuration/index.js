// @ts-nocheck

/**
 * @interface {babel.PluginPass}
 * @param {babel} babel
 * @return {babel.PluginObj}
 */
module.exports = function ({template, types: t}) {
  /**
   * Produces a random number that is guaranteed not to be present in str.
   * @param {string} str
   * @return {number}
   */
  function uniqInString(str) {
    while (true) {
      const uniq = Math.floor(Math.random() * 2 ** 31);
      if (!str.includes(uniq)) {
        return uniq;
      }
    }
  }

  /**
   * Transforms a statically computable sourcetext path (aka an AST node) into
   * a JSON stringified value.
   *
   * Special "includes" may be used join multiple nested sections
   * into a single JSONified string.
   *
   * @param {!NodePath} path
   * @return {string}
   */
  function stringifyValue(path) {
    const arg = path.get('arguments.0');

    // sourceText now contains the actual source code written in the file. Eg,
    // `{foo: bar}` in the file is now `"{foo: bar}"`.
    const sourceText = arg.toString();

    // We use a unique number to represent inclusions of nested sections. We'll
    // be able to search the output JSON string for this exact number, and know
    // that we have an inclusion at that location.
    const uniq = uniqInString(sourceText);

    // We're going to build up a template string to replace the object literal
    // in source text. Eg, ({foo: 'bar'}) will turn into (`{"foo": "bar"}`).
    // Each inclusion will generate an expression (the included variable's
    // identifier) and a new quasi (the string part of a template string).
    const quasis = [];
    const expressions = [];

    try {
      // We're using a `with (proxy)` to evaluate the object's source code into
      // this JS environment. The with-proxy is necessary to allow inclusions
      // of nested sections into this section.
      // With statements allow you to inject a dynamic lexical scope into code.
      // Eg, `with (obj) { a = 1 }` will try to lookup/set the `obj.a`
      // property, if `obj` has an `a` property.
      // Proxies behave like meta-objects, allowing you to control get/set/has
      // operations on the object. Eg, `p.foo` looks up the `"foo"` property
      // from `p`.
      // So, using a with-proxy allows us to capture and control the lexical
      // scope of the evaluating code!
      const proxy = new Proxy(
        {},
        {
          has(target, prop) {
            // Anything not on the global is assumed to be an inclusion. This
            // includes the `includeJsonLiteral` function call and the
            // identifier it is passed as an argument.
            return !(prop in global);
          },
          get(target, prop) {
            // With statements first attempt to look up the
            // `Symbol.unscopables` from object. We're explicitly allowing any
            // references, so return nothing.
            if (prop === Symbol.unscopables) {
              return;
            }

            // The only other lookups are inclusions of the form
            // `includeJsonLiteral(foo)`. Both `includeJsonLiteral` and `foo`
            // will be trapped by the with-proxy, allowing us to control the
            // values they represent. For `includeJsonLiteral`, the prop
            // `"includeJsonLiteral"` will be looked up, and `foo` will lookup
            // `"foo"`.

            // `includeJsonLiteral` is being used as a function call, so we
            // must return a function.  We want to propagate its argument, so
            // we return that in the function.
            if (prop === 'includeJsonLiteral') {
              return (s) => s;
            }

            // The argument to `includeJsonLiteral`. We'll create a new
            // identifier reference to it for our template literal expression.
            expressions.push(t.identifier(prop));

            // Finally, we can't actually return the reference's real value
            // (because it may be runtime dynamic, or in another file, etc).
            // But we must return something that is representable in our
            // evaluated object, and that value must be JSON stringable. Our
            // unique number is both, and we can search the JSON string for the
            // unique number later on to figure out where the inclusion was
            // meant to be placed.
            return uniq;
          },
        }
      );

      // To explain the rest, imagine the following:
      // ```js
      // const obj = jsonConfiguration({ foo: 'foo', bar: includeJsonLiteral(bar) });
      // ```
      //
      // We're going to evaluate the source text
      // ```js
      // {foo: 'foo', bar: includeJsonLiteral(bar) }
      // ```
      const evaluate = new Function(
        'proxy',
        `with (proxy) return ${sourceText}`
      );

      // After evaluation, object will be (with 12345 being our unique number):
      // ```js
      // { foo: 'foo', bar: 12345 }
      // ```
      const obj = evaluate(proxy);

      // When we JSON stringify obj, we'll get the string
      // ```js
      // '{ "foo": "foo", "bar": 12345 }'
      // ```
      const json = JSON.stringify(obj);

      // Now, we can search for our unqiue number to find all our inclusions!
      const regex = new RegExp(`((?:(?!${uniq})[^])*)(${uniq}|$)`, 'g');
      let match;
      while ((match = regex.exec(json))) {
        const cooked = match[1];
        // If match[2] is not the unique number, it's the end of string.
        const endOfString = match[2] === '';

        // The first execution, cooked will be '{ "foo": "foo", "bar": ', and
        // endOfString will be false.
        // The second execution, cooked will be ' }', and endOfString will be
        // true.

        // We must escape any escape sequences (and any special template
        // interpolation strings) to generate the raw value (this is an AST
        // requirement).
        if (cooked || !endOfString) {
          const raw = cooked.replace(/\${|\\|`/g, '\\$&');
          quasis.push(t.templateElement({cooked, raw}));
        }

        // Our regex can execute forever (it's happy with empty matches). So,
        // explicitly check for the end of the string to break.
        if (endOfString) {
          break;
        }
      }

      // At this point, quasis will be all of our cooked strings, and
      // expressions will be all our our included sections. As source code, it'
      // looks like:
      // ```js
      // `{ "foo": "foo", "bar": ${bar} }`
      // ```
      return t.templateLiteral(quasis, expressions);
    } catch (e) {
      const ref = arg || path;
      throw ref.buildCodeFrameError(
        'failed to parse JSON value. Is this a statically computable value?'
      );
    }
  }

  const handlers = Object.assign(Object.create(null), {
    jsonConfiguration(path) {
      path.replaceWith(template.expression.ast`
        JSON.parse(${stringifyValue(path)})
      `);
    },

    includeJsonLiteral(path) {
      path.replaceWith(path.node.arguments[0]);
    },

    jsonLiteral(path) {
      path.replaceWith(stringifyValue(path));
    },
  });

  return {
    name: 'transform-json-configuration',

    visitor: {
      CallExpression(path) {
        const handler = handlers[path.node.callee.name];
        if (handler) {
          handler(path);
        }
      },
    },
  };
};
