import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { atom, useRecoilState } from 'recoil'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'

interface Conversation {
  id: string
  userName: string
  userAvatarUrl: string
  title: string
  createdAt: number
  updatedAt: number
}

export const selectedConversationAtom = atom<Conversation>({
  key: 'selectedConversationAtom',
  default: null,
})

async function getConversations() {
  const response = await fetch('https://front-assignment.exp.channel.io/conversations')
  return (await response.json()) as Conversation[]
}

export default function ConversationList(props) {
  // Selected
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)

  // Fetch
  const [conversations, setConversations] = useState<Conversation[]>()

  useEffect(() => {
    getConversations().then((conversations) =>
      setConversations(conversations.sort((a, b) => b.updatedAt - a.updatedAt)),
    )
  }, [])

  return (
    <Overflow {...props}>
      {conversations ? (
        conversations.map((conversation) => (
          <Flex
            key={conversation.id}
            data-testid="conversation"
            isSelected={selectedConversation?.id === conversation.id}
            onClick={() => setSelectedConversation(conversation)}
          >
            <Img src={conversation.userAvatarUrl} />
            <MinWidth>
              <Ellipsis>{conversation.title}</Ellipsis>
              <FlexBetween>
                <div>{conversation.userName}</div>
                <div>{conversation.updatedAt}</div>
              </FlexBetween>
            </MinWidth>
          </Flex>
        ))
      ) : (
        <div>loading</div>
      )}
    </Overflow>
  )
}

const Overflow = styled.div`
  overflow-y: scroll;
`

const Flex = styled.div<{ isSelected: boolean }>`
  width: 100%;
  padding: 6px;

  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px;
  align-items: center;

  ${(p) =>
    p.isSelected
      ? `
   background-color: #dde;`
      : `
  :hover {
    background-color: #eee;
    cursor: pointer;
  }
  `}
`

const FlexBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-size: 0.8em;
  color: #555;
`

const MinWidth = styled.div`
  min-width: 0;
`

export const Img = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 100%;
`

const Ellipsis = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
