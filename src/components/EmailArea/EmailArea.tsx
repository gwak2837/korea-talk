import React from 'react'
import { v4 as uuid } from 'uuid'

function EmailArea(props) {
  return (
    <div {...props}>
      <div data-testid="email">
        이메일1
      </div>
      <div data-testid="email">
        이메일2
      </div>
    </div>
  )
}

export default EmailArea