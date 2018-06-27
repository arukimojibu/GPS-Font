// ref: https://ja.wikipedia.org/wiki/%E5%B9%B3%E4%BB%AE%E5%90%8D_(Unicode%E3%81%AE%E3%83%96%E3%83%AD%E3%83%83%E3%82%AF)

const hiraganaList = {
  '.notdef': 'notdef.geojson'
}

for (let code = 0x3041, end = 0x309F; code <= end; code++) {
  if (code === 0x3097 || code === 0x3098) {
    continue
  }
  const char = (code === 0x3099 || code === 0x309A)
    ? `U+${code.toString(16).toUpperCase()}`
    : String.fromCodePoint(code)
  hiraganaList[char] = `${char}.geojson`
}

console.log(JSON.stringify(hiraganaList, null, 2))
