import React from 'react'
import ReactDom from 'react-dom'
import { RecoilRoot } from 'recoil'

import Main from './components/Main/Main'
import GlobalStyle from './GlobalStyle'

ReactDom.render(
  <RecoilRoot>
    <GlobalStyle />
    <Main />
  </RecoilRoot>,
  window.document.getElementById('main'),
)
