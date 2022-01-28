/* eslint-env node */

import { readFileSync } from 'fs';
import Benchmark from 'benchmark';
import { decode } from 'sourcemap-codec';
import TraceMap from './dist/trace-mapping.mjs';
import { SourceMapConsumer as SourceMapConsumerJs } from 'source-map-js';
import { SourceMapConsumer as SourceMapConsumer061 } from 'source-map';

const map = JSON.parse(readFileSync(`dist/trace-mapping.umd.js.map`));

const encodedMapData = map;
const encodedMapDataJson = JSON.stringify(map);
const decodedMapData = { ...map, mappings: decode(map.mappings) };
const decodedMapDataJson = JSON.stringify(decodedMapData);

console.log(`node ${process.version}\n`);

new Benchmark.Suite()
  .add('trace-mapping: decoded JSON input', () => {
    new TraceMap(decodedMapDataJson).originalPositionFor({ line: 1, column: 0 });
  })
  .add('trace-mapping: encoded JSON input', () => {
    new TraceMap(encodedMapDataJson).originalPositionFor({ line: 1, column: 0 });
  })
  .add('trace-mapping: decoded Object input', () => {
    new TraceMap(decodedMapData).originalPositionFor({ line: 1, column: 0 });
  })
  .add('trace-mapping: encoded Object input', () => {
    new TraceMap(encodedMapData).originalPositionFor({ line: 1, column: 0 });
  })
  .add('source-map-js: encoded Object input', () => {
    new SourceMapConsumerJs(map).originalPositionFor({ line: 1, column: 0 });
  })
  .add('source-map:    encoded Object input', () => {
    new SourceMapConsumer061(map).originalPositionFor({ line: 1, column: 0 });
  })
  // add listeners
  .on('error', ({error}) => console.error(error))
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({});

console.log('');

const encoded = new TraceMap(encodedMapData);
const decoded = new TraceMap(decodedMapData);
const smcjs = new SourceMapConsumerJs(map);
const smc061 = new SourceMapConsumer061(map);

const lines = decoded.decodedMappings();

new Benchmark.Suite()
  .add('trace-mapping: encoded originalPositionFor', () => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const index = Math.floor(Math.random() * line.length);
        const column = line[index][0];
        encoded.originalPositionFor({ line: i + 1, column });
      }
    }
  })
  .add('trace-mapping: decoded originalPositionFor', () => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const index = Math.floor(Math.random() * line.length);
        const column = line[index][0];
        decoded.originalPositionFor({ line: i + 1, column });
      }
    }
  })
  .add('source-map-js: encoded originalPositionFor', () => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const index = Math.floor(Math.random() * line.length);
        const column = line[index][0];
        smcjs.originalPositionFor({ line: i + 1, column });
      }
    }
  })
  .add('source-map:    encoded originalPositionFor', () => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const index = Math.floor(Math.random() * line.length);
        const column = line[index][0];
        smc061.originalPositionFor({ line: i + 1, column });
      }
    }
  })
  // add listeners
  .on('error', ({error}) => console.error(error))
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({});