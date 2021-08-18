import {createContext} from '#preact';

const LightboxGalleryContext = createContext(
  /** @type {LightboxGalleryDef.ContextProps} */ ({
    deregister: () => {},
    register: () => {},
    open: () => {},
  })
);
export {LightboxGalleryContext};
