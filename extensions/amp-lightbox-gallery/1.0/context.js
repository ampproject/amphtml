import {createContext} from '#preact';

const BentoLightboxGalleryContext = createContext(
  /** @type {BentoLightboxGalleryDef.ContextProps} */ ({
    deregister: () => {},
    register: () => {},
    open: () => {},
  })
);
export {BentoLightboxGalleryContext};
