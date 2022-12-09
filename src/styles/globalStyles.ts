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
import { colord } from 'colord'
import { createGlobalStyle, css } from 'styled-components'
import normalize from 'styled-normalize'

// Breakpoints

export const deviceSizes = {
  tiny: 370,
  mobile: 800,
  tablet: 1000,
  desktop: 1600
}

export const deviceBreakPoints = Object.entries(deviceSizes).reduce<{ [Key in keyof typeof deviceSizes]?: number }>(
  (a, s) => ({
    ...a,
    [s[0]]: `(max-width: ${s[1]}px)`
  }),
  {}
)

export default createGlobalStyle`
  ${normalize}

  * {
    box-sizing: border-box;
  }

  :root {
    font-size: 13px;

    @media ${deviceBreakPoints.tiny} {
      font-size: 12px;
    }
  }

  body {
    transition: background-color 0.2s ease;
    overflow-y: auto;
    overflow-x: hidden;
    
    color: ${({ theme }) => theme.textPrimary};
    background-color: ${({ theme }) => theme.body};
    margin: 0;
  }

  a {
    color: ${({ theme }) => theme.link};
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.linkHighlight};;
    }
  }

  // Titles
  h2 {
    font-weight: 600;
    font-size: 1.6rem;
    margin-bottom: 15px;
  }

  // Animations
  @keyframes spin {
    from {
        transform:rotate(0deg);
    }
    to {
        transform:rotate(360deg);
    }
  }

  /* Additional resets */

  button {
    outline: none;
    cursor: pointer;
    border: none;
  }

  a {
    text-decoration: none;
  }

  input {
    outline: none;
  }

  th {
    font-weight: normal;
  }

  /* Apex charts */
  .apexcharts-canvas {
    tspan {
      font-family: 'Inter' !important;
    }
    font-feature-settings: "tnum";
  }

  .apexcharts-tooltip {
    box-shadow: ${({ theme }) => theme.shadowPrimary} !important;
    border-radius: 9px !important;
    border: 1px solid ${({ theme }) => theme.borderPrimary};
  }
`

export const blurredBackground = (color: string) => css`
  background-color: ${colord(color).alpha(0.96).toRgbString()};

  @supports (backdrop-filter: blur(20px)) {
    backdrop-filter: blur(20px);
    background-color: ${colord(color).alpha(0.7).toRgbString()};
  }
`
