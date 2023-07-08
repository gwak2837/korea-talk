// 현재 파일은 기본 제공 디자인입니다. 수정하지 말아주세요.
import styled from 'styled-components'

import BaseConversationList from 'components/ConversationList/ConversationList'
import BaseEmailArea from 'components/EmailArea/EmailArea'

const Main = styled.div`
  display: flex;
  width: 800px;
  height: 600px;
  margin: 20px auto;
  border: 1px solid #ddd;
`

const ConversationList = styled(BaseConversationList)`
  width: 240px;
  background: #fcfcfc;
`

const EmailArea = styled(BaseEmailArea)`
  flex: 1;
`

export default {
  Main,
  ConversationList,
  EmailArea,
}
