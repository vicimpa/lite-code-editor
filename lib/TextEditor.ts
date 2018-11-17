import { EventEmitter } from "events";

const syms = [
  `()`,
  `''`,
  `[]`,
  `""`,
  `{}`,
  `\`\``
]

export class TextEditor extends EventEmitter {
  get rows() {
    return this._r.map(e => e)
  }

  _x: number = 0
  _y: number = 0
  _r: string[] = []
  _c: number = 0
  _px: number = 0

  get row() {
    let { y, _r } = this

    return _r[y] || ''
  }

  set row(v: string) {
    let { y, _r } = this

    _r[y] = v
  }

  get x() {
    return this._x
  }

  set x(v: number) {
    let { length } = this.row

    this._px = v

    v < 0 && (v = 0)
    v > length && (v = length)

    this._x = v
  }

  get y() {
    return this._y
  }

  set y(v: number) {
    let { length } = this.rows

    v < 0 && (v = 0)
    v > length - 1 && (v = length - 1)

    this._y = v
  }

  get pre() {
    let { x } = this
    return this.row.slice(0, x)
  }


  get post() {
    let { x } = this
    return this.row.slice(x)
  }

  constructor(text: string = '', x: number, y: number) {
    super()

    this._r = text.split('\n')

    this.y = y || 0
    this.x = x || 0

    setTimeout(() =>
      this.emit('render'))
  }

  addChar(char: string) {
    let { pre, post } = this

    for (let sym of syms)
      if (sym[1] === char && post[0] === char)
        char = ''

    for (let sym of syms)
      if (sym[0] === char)
        char = sym

    this.row = `${pre}${char}${post}`
    this.x++

    this.emit('render')
  }

  preDel() {
    let { x, y, _r } = this

    if (x !== 0 || y === 0)
      return 0

    let [pre] = _r.splice(y, 1)

    this.y--

    let { row } = this

    this.row = `${row} ${pre}`
    this.x = `${row} `.length

    this.emit('render')
  }

  postDel() {
    let { row, x, y, _r } = this
    let { rows: { length } } = this

    if (y >= length || row.length > x)
      return null

    let [del = ''] = _r.splice(y + 1, 1)

    this.row = `${row} ${del}`

    this.emit('render')
  }

  del(toUp = false) {
    if (!toUp)
      this.preDel()
    else
      this.postDel()

    let delta = toUp ? 0 : -1
    let { pre, post } = this

    !toUp && (pre = pre.slice(0, -1))
    toUp && (post = post.slice(1))

    this.x += delta
    this.row = `${pre}${post}`

    this.emit('render')
  }

  up() {
    let { _px } = this
    this.y--
    this.x = _px

    this.emit('render')
  }

  left() {
    this.x--

    this.emit('render')
  }

  right() {
    this.x++

    this.emit('render')
  }

  down() {
    let { _px } = this
    this.y++
    this.x = _px

    this.emit('render')
  }

  enter() {
    let { pre, post, y } = this

    let res = /^(\s+)/.exec(pre)

    this.row = pre
    pre = (res ? res[1] : '')
    this._r.splice(y + 1, 0, pre + post)
    this.y++
    this.x = pre.length

    this.emit('render')
  }

  tab(up = false) {
    if (up) {
      let { row } = this
      let r = /^(\s+)/.exec(row)

      if(!r)
        return null

      let [, rs] = r
      let rc = +(rs.length / 2).toFixed(0) - 1

      rc < 0 && (rc = 0)

      row = row.slice(rs.length)

      this.x -= rs.length - rc * 2

      this.row = ' '.repeat(rc*2) + row

      return this.emit('render')
    }

    let { pre, post } = this
    let { length } = pre
    let cur = parseInt(length / 2 + '') + 1

    while (pre.length < cur * 2)
      pre += ' '

    this.row = pre + post
    this.x = pre.length

    this.emit('render')
  }

  setCursor(x: number, y: number) {
    this.y = y
    this.x = x

    this.emit('render')
  }
}