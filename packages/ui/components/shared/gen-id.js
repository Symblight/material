export function* generateUniqueKey(name = "") {
  const key = `md-key-${name}`;
  let i = 0;
  while (true) {
    yield key + i++;
  }
}
