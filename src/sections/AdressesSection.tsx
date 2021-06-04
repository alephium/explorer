import React from 'react'
import Section from '../components/Section'
import ComingSoon from '../components/ComingSoon'
import styled from 'styled-components'

const AddressesSection = () => {
  return (
    <StyledSection>
      <ComingSoon />
    </StyledSection>
  )
}

const StyledSection = styled(Section)`
  flex: 1;
  display: flex;
  flex-direction: column;
`

export default AddressesSection
