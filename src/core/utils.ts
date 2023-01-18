const deepmerge = require("deepmerge"); // eslint-disable-line  @typescript-eslint/no-require-imports

function isObject(val: object) {
  return val != null && typeof val === "object" && Object.prototype.toString.call(val) === "[object Object]";
}

function isPlainObject(o: object) {
  if (Array.isArray(o) === true) {
    return true;
  }

  if (isObject(o) === false) {
    return false;
  }

  // If has modified constructor
  const ctor = o.constructor;
  if (typeof ctor !== "function") {
    return false;
  }

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObject(prot) === false) {
    return false;
  }

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

function combineMerge(target: any[], source: any[]) {
  return target.concat(source);
}

function overwriteMerge(target: any[], source: any[]) {
  target = source;
  return target;
}

export function overrideProps(DefaultProps: object, userProps: object, concatArray: boolean = false): any {
  // Override the sensible defaults with user provided props
  if (concatArray) {
    return deepmerge(DefaultProps, userProps, {
      arrayMerge: combineMerge,
      isMergeableObject: isPlainObject,
    });
  } else {
    return deepmerge(DefaultProps, userProps, {
      arrayMerge: overwriteMerge,
      isMergeableObject: isPlainObject,
    });
  }
}

export function consolidateProps(
  defaultProps: object,
  clientProps?: object,
  constructProps?: object,
  concatArray: boolean = false,
): any {
  let result: object = defaultProps;

  if (clientProps) {
    result = overrideProps(result, clientProps, concatArray);
  }

  if (constructProps) {
    result = overrideProps(result, constructProps, concatArray);
  }

  return result;
}
