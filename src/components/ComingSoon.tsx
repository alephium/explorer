import React from 'react'
import styled from 'styled-components'
import logo from '../images/alephium-logo-gradient-stroke.svg'

const ComingSoon = ({ text }: { text: string }) => {
  return (
    <ComingSoonWrapper>
      <ComingSoonLogo />
      <ComingSoonText>{text}</ComingSoonText>
    </ComingSoonWrapper>
  )
}

const ComingSoonWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 100px;
`

const ComingSoonLogo = styled.div`
  background-image: url(${logo});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  min-height: 150px;
  max-height: 300px;
  height: 25%;
  width: 100%;
  margin-bottom: 25px;
`

const ComingSoonText = styled.p`
  text-align: center;
`

export default ComingSoon
