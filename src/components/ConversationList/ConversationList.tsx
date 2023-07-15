import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { atom, useRecoilState, useSetRecoilState } from 'recoil'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'

import Socket from '../../socket/socket'
import { Email, emailsAtom } from '../EmailArea/EmailArea'

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

export const conversationsAtom = atom<Conversation[]>({
  key: 'conversationsAtom',
  default: null,
})

export const newConversationIdsAtom = atom<Set<string>>({
  key: 'newConversationIdsAtom',
  default: null,
})

async function getConversations() {
  const response = await fetch('https://front-assignment.exp.channel.io/conversations')
  return (await response.json()) as Conversation[]
}

export default function ConversationList(props) {
  // Recoil
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
  const setNewConversationIds = useSetRecoilState(newConversationIdsAtom)
  const setEmails = useSetRecoilState(emailsAtom)

  // Fetch
  const [conversations, setConversations] = useRecoilState(conversationsAtom)

  useEffect(() => {
    getConversations().then((newConversations) => {
      setConversations(newConversations.sort((a, b) => b.updatedAt - a.updatedAt))
      setNewConversationIds(new Set(newConversations.map((conversation) => conversation.id)))

      const a = {}
      newConversations.forEach((newConversation) => (a[newConversation.id] = []))
      setEmails(a)
    })
  }, [])

  // Socket
  useEffect(() => {
    function receiveEmail(newEmail: Email) {
      setConversations((pre) =>
        pre
          .map((conversation) =>
            conversation.id === newEmail.conversationId
              ? { ...conversation, updatedAt: newEmail.createdAt }
              : conversation,
          )
          .sort((a, b) => b.updatedAt - a.updatedAt),
      )

      setNewConversationIds((pre) => pre.add(newEmail.conversationId))
    }

    Socket.on(receiveEmail)

    return () => {
      Socket.off(receiveEmail)
    }
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
                <div>{formatDate(conversation.updatedAt)}</div>
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

function formatDate(date: number) {
  const d = new Date(date)
  const now = new Date()

  const hhmm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padEnd(2, '0')

  return d.toLocaleDateString() === now.toLocaleDateString()
    ? hhmm
    : `${d.toLocaleDateString()} ${hhmm}`
}
