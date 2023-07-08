import React from 'react'
import { v4 as uuid } from 'uuid'

function ConversationList(props) {
  return (
    <div {...props}>
      <div data-testid="conversation">
        대화1
      </div>
      <div data-testid="conversation">
        대화2
      </div>
    </div>
  )
}

export default ConversationList