※ 현재 과제의 저작권은 (주)채널코퍼레이션에 있습니다. 공정한 과제를 위하여 불법 복제 및 재배포는 금지됩니다. 과제 결과물을 GitHub에 올리는 것도 자제해주시면 감사하겠습니다.

## 제출시 확인해야 할 사항
- 문서 하단의 `## 선택 구현 여부` 란을 수정하여 선택 구현 사항중 구현된 사항을 표시하여야 합니다.
- 과제는 zip 파일로 압축하여 이메일로 제출되어야 합니다.
- node_modules 폴더를 삭제 후 제출 부탁드립니다.

## 선택 구현 여부
(구현 완료시 `[ ]`를 `[x]`로 변경)
- [ ] 한 대화를 클릭한 상태에서, 다른 대화를 클릭했다가 다시 이전에 보던 대화를 클릭해서 돌아왔을 경우에는 해당되는 대화의 updatedAt이 변경되지 않은 이상 GET emails API를 호출하지 않아야 합니다.
- [ ] 이메일 전송 후 응답이 올때까지는 사용자가 입력한 내용을 바탕으로 임시 Email 모델을 만들어서 이메일 영역에 표시되어야 합니다. 임시 정보이므로 서버 Response가 도달할 경우 삭제되어야 하는 점, 2개 이상의 메시지를 동시에 전송시에도 문제가 없어야 하는 점을 숙지해야 합니다.
- [ ] 화면 좌측의 대화 목록은 10개 단위로 렌더링되어야 하며, 스크롤을 대화 목록의 최하단까지 내리면 다음 대화 목록을 렌더링해주어야 합니다. 이는 많은 요소가 한번에 렌더링되는 시점에 끊기지 않게 하기 위함입니다. (구현시에는 스크롤 이벤트 처리에 debounce, throttle 중 하나를 적용해야 합니다.)
- [ ] 현재 보고있는 대화의 id를 주소에 hash routing으로 저장하고, url에 반영된 상태로 새로고침을 할 경우에 최초에 대화를 누른 상태가 되도록 보여주어야 합니다. (react-router와 같은 라이브러리를 사용하지 않고 직접 구현하여야 합니다.)