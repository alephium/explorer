// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { AlephClient } from "./client";
import { useEffect, useRef } from 'react';

export function createClient() {
  let address = process.env.REACT_APP_ALEPHIUM_HOST;
  if (!address) { address = 'localhost'; }

  let port = process.env.REACT_APP_ALEPHIUM_PORT;
  if (!port) { port = '9090' }

  const client = new AlephClient(address, port);

  console.log('Connecting to: ' + client.host + ':' + client.port);

  return client;
}

export function useInterval(callback: () => any, delay: number, shouldPause = false) {
  const savedCallback = useRef(() => null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null && !shouldPause) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay, shouldPause]);
}

// MATHS

var MONEY_SYMBOL = ["", "k", "M", "B", "T", "Q"];

export const abbreviateAmount = (number: number | bigint) => {
  let num: number = Number(number)

  const isNeg = num < 0
  if (isNeg) num = num * -1

  
  // what tier? (determines SI symbol)
  let tier = Math.log10(Number(num)) / 3 | 0
  
  // if zero, we don't need a suffix
  if(tier === 0) return num
  if(tier > 5) tier = 5
  
  // get suffix and determine scale
  const suffix = MONEY_SYMBOL[tier]
  const scale = Math.pow(10, tier * 3)

  // scale the bigNum
  let scaled = num / scale

  // format bigNum and add suffix
  if (isNeg) scaled = scaled * -1
  
  return scaled.toFixed(2) + suffix
}