import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { MoreVertical } from 'lucide-react'
import styled from 'styled-components'

interface MenuItem {
  text: string
  icon?: React.ReactNode
  onClick: () => void
}

type Direction = 'up' | 'down'

const Menu = ({
  label,
  icon,
  items,
  direction,
  className
}: {
  label: string
  icon?: React.ReactNode
  items: MenuItem[]
  direction: Direction
  className?: string
}) => {
  const [visible, setVisible] = useState(false)

  const directionSign = direction === 'up' ? '-' : '+'

  const handleBlur = () => {
    setVisible(false)
  }

  return (
    <MenuContainer
      onClick={() => setVisible(true)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={className}
      id="menu-container"
      onBlur={handleBlur}
      tabIndex={0}
    >
      <MenuCurrentContent>
        {icon && <IconContainer>{icon}</IconContainer>}
        <Label>{label}</Label>
        <MoreVertical size={15} />
      </MenuCurrentContent>
      <AnimatePresence>
        {visible && (
          <MenuItemsContainer
            initial={{ y: `${directionSign}95%`, opacity: 0 }}
            animate={{ y: `${directionSign}100%`, opacity: 1 }}
            exit={{ y: `${directionSign}95%`, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MenuItemsList
              style={{ marginBottom: direction === 'up' ? '8px' : 0, marginTop: direction === 'down' ? '8px' : 0 }}
            >
              {items.map((item, i) => (
                <div key={i}>
                  <MenuItem onClick={item.onClick}>
                    {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
                    <ItemText>{item.text}</ItemText>
                  </MenuItem>
                  {i !== items.length - 1 && <Divider />}
                </div>
              ))}
            </MenuItemsList>
          </MenuItemsContainer>
        )}
      </AnimatePresence>
    </MenuContainer>
  )
}

const MenuContainer = styled.div`
  position: relative;
  height: 47px;
  border-top: 1px solid ${({ theme }) => theme.borderSecondary};
  display: flex;
`

const MenuCurrentContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.borderSecondary};
  }
`

const Label = styled.span`
  color: ${({ theme }) => theme.textPrimary};
  flex: 1;
`

const IconContainer = styled.div`
  width: 23px;
  height: 23px;
  margin-right: 20px;
`

const MenuItemsContainer = styled(motion.div)`
  position: absolute;
  width: calc(100% - 10px);
  margin-left: 5px;
  z-index: 10000;
  overflow: hidden;
  border-radius: 7px;
`

const MenuItemsList = styled.div`
  overflow: hidden;
  border-radius: 7px;
  background-color: ${({ theme }) => theme.bgPrimary};
  border: 1px solid ${({ theme }) => theme.borderPrimary};
`

const ItemIcon = styled.div`
  width: 23px;
  height: 23px;

  margin-right: 20px;
  opacity: 0.8;
`

const MenuItem = styled.div`
  height: 47px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  color: ${({ theme }) => theme.textPrimary};

  &:hover {
    background-color: ${({ theme }) => theme.bgHover};
    color: ${({ theme }) => theme.link};

    ${ItemIcon} {
      opacity: 1;
    }
  }
`

const ItemText = styled.div``

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.borderSecondary};
`

export default Menu
