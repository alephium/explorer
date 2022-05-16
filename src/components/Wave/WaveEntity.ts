/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

class WaveEntity {
  private waveLength: number[]
  private color: string

  constructor(waveLength: number[], color: string) {
    this.waveLength = waveLength
    this.color = color
  }

  public set waveColor(color: string) {
    this.color = color
  }

  public draw = (ctx: CanvasRenderingContext2D, width: number, height: number, frequency: number): void => {
    ctx.beginPath()
    ctx.moveTo(0, height)
    if (this.waveLength.length < 3) {
      return
    }
    for (let i = 0; i < width; i++) {
      const wave1 = Math.sin(i * this.waveLength[0] - frequency)
      const wave2 = Math.sin(i * this.waveLength[1] - frequency)
      const wave3 = Math.sin(i * this.waveLength[2] - frequency)

      ctx.lineTo(i * 2.5, height - 400 + wave1 * wave2 * wave3 * 200)
    }
    ctx.lineTo(width, height)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
  }
}

export default WaveEntity
