# Tail

## Description

A simple script to watch a file and output file change when append new line.

## Usage

```ts
import { Tail } from '@akrc/tail'

const tail = new Tail('path/to/file')
tail.on('data', (line: string[]) => {
  console.log(line)
})
```
