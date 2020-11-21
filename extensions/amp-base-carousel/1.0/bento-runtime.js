/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import 'preact/debug';
import * as Preact from 'preact';
import {useCallback, useContext, useEffect} from 'preact/hooks';
import * as carouselConfig from './amp-base-carousel-config';
import {useState} from 'react';
const h = Preact.createElement;
window.h = h;

/**
 * Server Side Rendering:
 * - Need help with ideas here.
 * - So far what I've come up with is that we can compute HTML Partials for
 *   each extension (with variable interpolation). AMP Cache can replace the CE tags
 *   with these partials.
 * - Does this need to sync up perfectly with what Preact generates? I don't see using
 *   Preact.hydrate() in our future :(.
 * - Also not sure how to handle separating out fully static trees to create multiple Mount
 *   points. Especially for complex state cases where the same state/context
 *   is shared above/below a static tree.
 * 
 *
 * Extension Registration / Loading:
 * - We can keep the same general pattern AFAIK that we have now in AMP.
 * - Ensure that runtime / extensions can load in any order via
 *   a window global extensions array.
 * - Maintain a map from tag --> Preact Component.
 * - Resource prioritization: none?
 *
 * <amp-bind> and <amp-state>
 * Caveats:
 * - Calculations no longer performed within a Worker. All on main thread.
 * - If we want to we could keep exact current implementation and create a new messaging channel for Preact
 *   to communicate state changes with the Worker bind implementation. This would let us cut a major corner
 *   by reusing the existing parser. Downside is of course that parsing bind expressions on client aint fast.
 *
 * DSL Major Edgecase:
 * - Parsing AMP DSL (actions, bind) expressions on server means we also need to
 *   handle DSL expressions contained within mustache templates. Is this feasible?
 *   Otherwise the solution is incomplete.
 */

const BindState = Preact.createContext({});
function BindProvider({children}) {
  const [state, setState] = useState({});
  const mergeState = (newState) => setState({...state, ...newState});
  return (
    <BindState.Provider value={{state, mergeState }}>
      {children}
    </BindState.Provider>
  );
}

function AmpState({id, children}) {
  const {mergeState} = useContext(BindState);
  useEffect(() => {
    mergeState({[id]: children});
  }, [id, children]);
}

// Hypothetically, we could grab all of the mappings off the Class object.
// For this demo, I've lifted into a new file without AMP Dependencies.
// import AmpBaseCarousel from './amp-base-carousel';
const ampStateConfig = {
  Component: AmpState,
  props: {
    'id': {attr: 'id', type: 'string'},
  },
};
const localNamesMap = {
  'amp-base-carousel': carouselConfig,
  'amp-state': ampStateConfig,
};

window.AmpComponentTranslation = function AmpComponentTranslation(props) {
  const apiRefCallback = useCallback((apiRef) => {
    // Handle exposing AMP Actions, like .close() / .open().
    // Event handlers should be handled at compile time (e.g. onClick/onTouch).
  }, []);

  // Handle bind setup
  const {state} = useContext(BindState);
  const boundProps = Object.keys(props)
    .filter((k) => k.startsWith('data-amp-bind'))
    .map((key) => [key.replace('data-amp-bind-', ''), state[props[key]]]);
  const boundAttrs = Object.fromEntries(boundProps);

  // Finally, process props
  const config = localNamesMap[props.localName];
  const parsedProps = parsePropDefs(config.props, {...props, ...boundAttrs});
  const Component = config.Component;
  const mergedProps = {
    ...parsedProps,
    style: {width: props.width, height: props.height},
  };
  return (
    <Component {...mergedProps} ref={apiRefCallback}>
      {props.children}
    </Component>
  );
};

function PassAlongBind({OneChild}) {
  const {state, mergeState} = useContext(BindState);
  return <OneChild state={state} mergeState={mergeState} />;
}

// Copy/pasted from PreactBaseElement.
// If we pursue this, can extract to a shared location since the
// AmpComponentTranslation needs it.
function parsePropDefs(propDefs, attrs) {
  const props = {};
  for (const name in propDefs) {
    const def = /** @type {!AmpElementPropDef} */ (propDefs[name]);
    let value;
    if (def.attr) {
      value = attrs[def.attr];
    } else if (def.parseAttrs) {
      devAssert(def.attrs);
      value = def.parseAttrs(element);
    } else if (def.attrPrefix) {
      const currObj = {};
      let objContains = false;
      const attrs = element.attributes;
      Object.entries(attrs).forEach(([attrName, attrVal]) => {
        if (matchesAttrPrefix(attrName, def.attrPrefix)) {
          currObj[
            dashToCamelCase(attrName.slice(def.attrPrefix.length))
          ] = attrVal;
          objContains = true;
        }
      });
      if (objContains) {
        value = currObj;
      }
    }
    if (value == null) {
      if (def.default != null) {
        props[name] = def.default;
      }
    } else {
      const v =
        def.type == 'number'
          ? parseFloat(value)
          : def.type == 'boolean'
          ? parseBooleanAttribute(/** @type {string} */ (value))
          : def.type == 'date'
          ? getDate(value)
          : value;
      props[name] = v;
    }
  }
  return props;
}
function parseBooleanAttribute(s) {
  return s == null ? undefined : s !== 'false';
}

function bootstrap() {
  if (window.PREACT_ROOT) {
    render(window.PREACT_ROOT[0]);
  }

  window.PREACT_ROOT = {
    push(component) {
      render(component);
    },
  };
}

function render(component) {
  const root = document.querySelector('#AMP_ROOT');
  Preact.render(
    <>
      <BindProvider>
        {/* Current hacky restriction that can only have a single node at window.PREACT_ROOT. */}
        <PassAlongBind OneChild={component} />
      </BindProvider>
    </>,
    root
  );
}

bootstrap();
