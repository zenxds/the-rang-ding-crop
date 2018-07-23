const config = require('config')

const DingCrop = require('../lib/DingCrop')
const dingCrop = new DingCrop(config.get('ding'))

describe('dingCrop', () => {

  test('it should init', () => {
    expect(dingCrop.apiServer).toBe('https://oapi.dingtalk.com')
    expect(dingCrop.cache).toBeTruthy()
  })

  // test('it should get access token', async() => {
  //   let token = await dingCrop.getAccessToken()

  //   expect(token).toBeTruthy()
  // })

  // test('it should get js ticket', async() => {
  //   let ticket = await dingCrop.getJSTicket()

  //   expect(ticket).toBeTruthy()
  // })

  // test('it should send crop message', async() => {
  //   const result = await dingCrop.sendCropMessage({
  //     msgtype: 'action_card',
  //     msgcontent: {
  //       title: '新人成长任务解锁',
  //       markdown: '你解锁了一个新的新人成长任务' + Math.random(),
  //       "single_title": "查看详情",
  //       "single_url": "https://growth.dingxiang-inc.com"
  //     },
  //     userid_list: 'manager8995'
  //   })

  //   expect(result.errcode).toBe(0)
  //   expect(result.task_id).toBeTruthy()
  // })

  // test('it should sign ticket', async() => {
  //   let ticket = await dingCrop.getJSTicket()
  //   let sign = dingCrop.signTicket(ticket, 'https://growth.dingxiang-inc.com')

  //   expect(sign.ticket).toBe(ticket)
  //   expect(sign.signature).toBeTruthy()
  // })
})