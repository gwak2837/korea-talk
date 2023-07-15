import React, { FormEvent, Fragment, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { atom, useRecoilState, useRecoilValue } from 'recoil'
import styled from 'styled-components'

import Socket from '../../socket/socket'
import {
  Img,
  newConversationIdsAtom,
  selectedConversationAtom,
} from '../ConversationList/ConversationList'
import PaperAirplane from '../PaperAirplane'

export interface Email {
  id: string
  conversationId: string
  text: string
  createdAt: number
  fromUser: boolean
}

interface TempEmail extends Email {
  status: EmailStatus
}

enum EmailStatus {
  loading,
  error,
  success,
}

export const emailsAtom = atom<Record<string, Email[]>>({
  key: 'emailsAtom',
  default: null,
})

async function getEmails(conversationId: string) {
  const response = await fetch(
    `https://front-assignment.exp.channel.io/conversations/${conversationId}/emails`,
  )
  return (await response.json()) as Email[]
}

async function createEmail(conversationId: string, newEmail: string) {
  const response = await fetch(
    `https://front-assignment.exp.channel.io/conversations/${conversationId}/email`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newEmail }),
    },
  )

  if (!response.ok) throw new Error(await response.text())

  return (await response.json()) as Email
}

export default function EmailArea(props) {
  // Recoil
  const selectedConversation = useRecoilValue(selectedConversationAtom)

  const [newConversationIds, setNewConversationIds] = useRecoilState(newConversationIdsAtom)

  // Fetch
  const [emails, setEmails] = useRecoilState(emailsAtom)

  useEffect(() => {
    if (!selectedConversation) return
    if (!newConversationIds.has(selectedConversation.id)) return

    newConversationIds.delete(selectedConversation.id)
    setNewConversationIds(newConversationIds)

    getEmails(selectedConversation.id).then((emails) =>
      setEmails((prev) => ({
        ...prev,
        [selectedConversation.id]: emails.sort((a, b) => a.createdAt - b.createdAt),
      })),
    )
  }, [selectedConversation])

  // Scroll to last email
  const lastEmailRef = useRef(null)

  useEffect(() => {
    if (!lastEmailRef.current) return

    lastEmailRef.current.scrollIntoView()
  }, [emails])

  // Create email
  const formRef = useRef(null)
  const preEmail = useRef('')

  const [emailInput, setEmailInput] = useState('')

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    preEmail.current = emailInput
    setEmailInput('')

    const tempEmailId = String(Date.now())

    setEmails((prev) => ({
      ...prev,
      [selectedConversation.id]: [
        ...prev[selectedConversation.id],
        { id: tempEmailId, text: emailInput, status: EmailStatus.loading } as TempEmail,
      ],
    }))

    try {
      const newEmailResponse = await createEmail(selectedConversation.id, emailInput)
      setEmails((prev) => ({
        ...prev,
        [selectedConversation.id]: [
          ...prev[selectedConversation.id].filter((email) => email.id !== tempEmailId),
          newEmailResponse,
        ],
      }))
    } catch (error) {
      alert(error.message)
      setEmails((prev) => ({
        ...prev,
        [selectedConversation.id]: [
          ...prev[selectedConversation.id].filter((email) => email.id !== tempEmailId),
          { id: tempEmailId, text: emailInput, status: EmailStatus.error } as TempEmail,
        ],
      }))
    }
  }

  async function submitWhenShiftEnter(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter' || !e.shiftKey || !formRef.current) return

    e.preventDefault()
    submit(e as any)
  }

  // Socket
  useEffect(() => {
    function receiveEmail(email: Email) {
      if (selectedConversation?.id !== email.conversationId) return
      if (preEmail.current === email.text) return

      preEmail.current = ''
      setEmails((prev) => ({
        ...prev,
        [selectedConversation.id]: [...prev[selectedConversation.id], email].sort(
          (a, b) => a.createdAt - b.createdAt,
        ),
      }))
    }

    Socket.on(receiveEmail)

    return () => {
      Socket.off(receiveEmail)
    }
  }, [selectedConversation?.id])

  // Email with error
  function removeEmail(emailId: string) {
    setEmails((prev) => ({
      ...prev,
      [selectedConversation.id]: [
        ...prev[selectedConversation.id].filter((email: TempEmail) => email.id !== emailId),
      ],
    }))
  }

  async function resend(tempEmail: TempEmail) {
    const tempEmailId = String(Date.now())

    setEmails((prev) => ({
      ...prev,
      [selectedConversation.id]: [
        ...prev[selectedConversation.id].filter((email) => email.id !== tempEmail.id),
        { id: tempEmailId, text: emailInput, status: EmailStatus.loading } as TempEmail,
      ],
    }))

    try {
      const newEmailResponse = await createEmail(selectedConversation.id, emailInput)
      setEmails((prev) => ({
        ...prev,
        [selectedConversation.id]: [
          ...prev[selectedConversation.id].filter((email) => email.id !== tempEmailId),
          newEmailResponse,
        ],
      }))
    } catch (error) {
      alert(error.message)
      setEmails((prev) => ({
        ...prev,
        [selectedConversation.id]: [
          ...prev[selectedConversation.id].filter((email) => email.id !== tempEmailId),
          { id: tempEmailId, text: emailInput, status: EmailStatus.error } as TempEmail,
        ],
      }))
    }
  }

  return selectedConversation ? (
    <GridGap {...props}>
      {emails[selectedConversation.id] ? (
        emails[selectedConversation.id].map((email, i) => (
          <Grid key={email.id} data-testid="email" fromUser={email.fromUser}>
            {email.fromUser && <Img src={selectedConversation.userAvatarUrl} />}
            <Width fromUser={email.fromUser}>
              {(email as TempEmail).status === EmailStatus.loading ? (
                <PaperAirplane />
              ) : (
                (email as TempEmail).status === EmailStatus.error && (
                  <Grid11>
                    <button onClick={() => removeEmail(email.id)}>삭제</button>
                    <button onClick={() => resend(email as TempEmail)}>재전송</button>
                  </Grid11>
                )
              )}
              {email.fromUser && <div>{selectedConversation.userName}</div>}
              <Gray
                fromUser={email.fromUser}
                ref={i === emails[selectedConversation.id].length - 1 ? lastEmailRef : undefined}
              >
                {email.fromUser && <Triangle />}
                {applyLineBreak(email.text)}
              </Gray>
            </Width>
          </Grid>
        ))
      ) : (
        <div>loading</div>
      )}

      <Padding />
      <Absolute ref={formRef} onSubmit={submit}>
        <Textarea
          data-testid="textarea"
          onKeyDown={submitWhenShiftEnter}
          onChange={(e) => {
            setEmailInput(e.target.value)
            localStorage.setItem(`conversation-${selectedConversation.id}`, e.target.value)
          }}
          value={emailInput}
        />
        <button disabled={emailInput.length === 0} data-testid="submit">
          제출
        </button>
      </Absolute>
    </GridGap>
  ) : (
    <div>대화를 선택해주세요</div>
  )
}

const GridGap = styled.div`
  display: grid;
  gap: 20px;
  padding: 1rem;

  overflow-y: auto;
`

const Grid = styled.div<{ fromUser: boolean }>`
  gap: 10px;

  ${(p) =>
    p.fromUser
      ? 'display: grid; grid-template-columns: auto 1fr;'
      : 'display: flex; flex-direction: row-reverse;'}

  height: fit-content;
`

const Triangle = styled.div`
  width: 0;
  height: 0;
  border-top: 8px solid #eee;
  border-right: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid transparent;

  position: absolute;
  top: 0;
  left: -8px;
`

const Width = styled.div<{ fromUser: boolean }>`
  width: fit-content;
  ${(p) => !p.fromUser && 'display: flex; gap: 0.5rem; align-items: center;'}
`

const Gray = styled.div<{ fromUser: boolean }>`
  max-width: 300px;
  padding: 8px 12px;
  position: relative;
  text-align: ${(p) => (p.fromUser ? 'left' : 'right')};

  background: #eee;
  border-radius: 8px;
  margin-right: 0;
`

const Absolute = styled.form`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 558px;
  height: 65px;

  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  padding: 6px;
  background: #fff;
`

const Textarea = styled.textarea`
  resize: none;
`

const Padding = styled.div`
  padding-bottom: 42px;
`

const Grid11 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;

  height: 1.5rem;
  border-radius: 4px;
`

function applyLineBreak(line: string) {
  return line.split('\n').map((sentence, i) => (
    <Fragment key={i}>
      <>{sentence}</>
      <br />
    </Fragment>
  ))
}
