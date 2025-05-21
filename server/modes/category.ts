export function categoryOptions(array:string[], length:number):string[] {
  if (array.length <= length || array.length < 1) {
    return array
  }
  let unused = [...array];
  const GENERAL = unused.shift() || '';
  let used:string[] = [];
  for (let i = 1; i < length; i++) {
    const IND = Math.floor(Math.random() * unused.length);
    const val = unused.splice(IND, 1);
    used.push(val[0]);
  }
  for (let i = used.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [used[i], used[j]] = [used[j], used[i]];
  }
  used.unshift(GENERAL);
  return used;
}
