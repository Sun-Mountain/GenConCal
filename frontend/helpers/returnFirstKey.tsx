export default function returnFirstKey (object: any) {
  var keys = Object.keys(object);
  return keys[0]
}