import React from 'react'
import styled from 'styled-components'
import logo from '../images/alephium-logo-gradient-stroke.svg'

const ComingSoon = () => {
  return (
    <ComingSoonWrapper>
      <ComingSoonLogo />
      <ComingSoonText>Dashboard coming soon.</ComingSoonText>
    </ComingSoonWrapper>
  )
}

const ComingSoonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const ComingSoonLogo = styled.div`
  background-image: url(${logo});
  background-repeat: none;
  background-size: contain;

  height: 50%;
  width: 30%;
`

const ComingSoonText = styled.p`
  text-align: center;
`

export default ComingSoon
