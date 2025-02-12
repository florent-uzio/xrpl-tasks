/**
 * Generates a random number between the min and max values
 * @param min The minimum value
 * @param max The maximum value
 * @returns An integer
 */
export const random = (min: number, max: number) =>
  Math.round((Math.random() * (max - min) + min) * 1000)
