import styled from 'styled-components'
import ComingSoon from '../components/ComingSoon'
import Section from '../components/Section'

const TransactionsSection = () => {
  return (
    <StyledSection>
      <ComingSoon text="Coming soon." />
    </StyledSection>
  )
}

const StyledSection = styled(Section)`
  flex: 1;
  display: flex;
  flex-direction: column;
`

export default TransactionsSection
