import "./index.scss";
import { TextEditor } from "./lib/TextEditor";

import { tokenize, parseScript, Program } from "esprima";

console.log = () => { }

const input = document.getElementById('input')
const size = document.getElementById('size')
const debug = document.getElementById('debug')

const { x, y } = JSON.parse(localStorage.getItem('cursor') || `{"x": 0, "y": 0}`)
const text = new TextEditor(localStorage.getItem('text') || '', x, y)
const cursor = document.createElement('b')

cursor.className = 'cursor'

async function delay(n = 0) {
  return new Promise(r => setTimeout(r, n))
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
  e.preventDefault()

  if (e.ctrlKey)
    return null

  let { key, keyCode } = e

  if (key.length === 1)
    text.addChar(key)
  else
    switch (keyCode) {
      case 8: text.del(); break
      case 37: text.left(); break
      case 39: text.right(); break
      case 46: text.del(true); break
      case 13: text.enter(); break
      case 38: text.up(); break
      case 40: text.down(); break
      case 9: text.tab(e.shiftKey); break

      default:
        console.log(keyCode)
    }
})

function setRow(y: number) {
  return async function (this: HTMLElement, e: MouseEvent) {
    let x = 0

    if (e.target === cursor)
      return null

    size.innerText = ''

    while (e.offsetX > size.offsetWidth)
      size.innerText = `a`.repeat(++x)

    return text.setCursor(x, y)
  }
}

function search(object: object, array: any[], pres: string[] = new Array()) {
  if (!object || typeof object !== 'object')
    return null

  if (typeof object['type'] === 'string' && object['loc']) {
    let { start: { column: x, line: xL }, end: { column: y, line: yL } } = object['loc']

    if (xL === yL) {
      let arb = array[xL-1] || (array[xL-1] = [])
      let arr = arb[x] || (arb[x] = [])
      let arr2: string[] = arr[y] || (arr[y] = [])

      if (arr2.indexOf(object['type']) === -1)
        arr2.push(object['type'])

      for(let pr of pres)
      if (arr2.indexOf(pr) === -1)
        arr2.push(pr)
    }else {
      pres = []
    }
  }

  for (let key in object) {
    if (/id|type|range|name/.test(key))
      continue;

    let f = object[key]

    if (pres.indexOf(key) === -1)
      pres.push(key)

    if (typeof f === 'object')
      search(object[key], array, pres.map(e=>e))
  }
}

function syntax(code: string, program: any[] = null) {
  let tokens = tokenize(code, { comment: true, range: true })
  let skip = 0

  for (let token of tokens) {
    let { type } = token
    let [start, end] = token['range']

    let pre = code.slice(0, start + skip)
    let value = code.slice(start + skip, end + skip)
    let post = code.slice(end + skip)
    let lastValue = value
    let arr: string[] = []

    try {
      arr = program[start][end] || []
    } catch (e) { }

    value = `<span class="${[type, ...arr].join(' ')}">${value}</span>`

    skip += value.length - lastValue.length

    code = `${pre}${value}${post}`
  }

  return code;
}

let array: string[][][] = []

text.on('render', () => {
  let { x, y, rows, row } = text

  let code = rows.join('\n')

  try {
    array = []

    parseScript(code, { loc: true, tolerant: true }, (node) => {
      if(node.constructor.name === 'Identifier')
        return null
        
      search(node, array)
    })

  } catch (e) { console.dir(e) }

  debug.innerText = `x: ${x}, y: ${y}, rows: ${rows.length}, row: ${row.length}`

  localStorage.setItem('text', rows.join('\n'))
  localStorage.setItem('cursor', JSON.stringify({ x, y }))

  input.querySelectorAll('div').forEach((node, i) => {
    if (i >= rows.length) {
      delete node.onclick
      node.remove()
    }
  })

  rows.forEach((row, i) => {
    let childNodes = input.querySelectorAll('div')
    let node = childNodes[i] ||
      document.createElement('div')

    {
      let className = i === text.y ? 'cur' : ''

      if (className !== node.className)
        node.className = className
    }

    cursor.className = ''

    setTimeout(() =>
      cursor.className = 'cursor')

    if (!node['add']) {
      node['add'] = true
      input.appendChild(node)
      node.onclick = setRow(i)
    }

    if (node['innerText'] !== row)
      node['innerHTML'] = syntax(row, array[i])

    size.innerText = text.row.slice(0, x)

    cursor.style.left = `${size.offsetWidth}px`

    if (text.y === i)
      node.appendChild(cursor)
  })
})