// type replacementFn = (key: string, value: any) => string

// function deepReplace(o: any, keys: string[] | string, replacement: replacementFn): any {
//   if (Array.isArray(o)) {
//     return o.map((item) => deepReplace(item, keys, replacement))
//   } else if (isObject(o) && !isUndefined(o)) {
//     // handle object
//     let result: any = {}
//     for (const prop in o) {
//       if (Array.isArray(keys)) {
//         if (keys.includes(prop)) {
//           // find the correct key in the array corresponding to the object key
//           const correctKey = keys.filter((k) => k === prop)[0]

//           const replacementStr = replacement(correctKey, o[prop])
//           result = { ...result, [correctKey]: replacementStr }
//         } else {
//           result[prop] = deepReplace(o[prop], keys, replacement)
//         }
//       } else {
//         if (keys === prop) {
//           const replacementStr = replacement(keys, o[prop])
//           result = { ...result, [keys]: replacementStr }
//         } else {
//           result[prop] = deepReplace(o[prop], keys, replacement)
//         }
//       }
//     }
//     return result
//   }
//   return o
// }

export type ReplacementFn = (key: string, value: any) => object

function deepReplace(o: any, key: string, replacement: ReplacementFn): any {
  if (Array.isArray(o)) {
    // handle array first, because array is an object too
    const result = []
    for (const item of o) {
      result.push(deepReplace(item, key, replacement))
    }
    return result
  } else if (typeof o === "object" && o !== null) {
    // handle object
    let result: any = {}
    for (const prop in o) {
      if (prop === key) {
        const replacementObj = replacement(key, o[prop])
        result = { ...result, ...replacementObj }
      } else {
        result[prop] = deepReplace(o[prop], key, replacement)
      }
    }
    return result
  }
  return o // handle number, string, function
}

export { deepReplace }
