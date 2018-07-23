/**
 * 钉钉微应用 企业开发
 * https://open-doc.dingtalk.com/microapp/serverapi2
 */
const extend = require('extend2')
const request = require('request-promise-native')
const Cache = require('lru-cache')
const { sha1 } = require('./crypto')

async function ding(cfg) {
  return request(cfg).then(result => {
    if (result && 0 === result.errcode) {
      return result
    } else {
      throw new Error(result ? `${result.errcode}: ${result.errmsg}` : `请求${cfg.url}失败`)
    }
  })
}

class DingCrop {
  constructor(options={}) {
    options = extend(true, {
      apiServer: 'https://oapi.dingtalk.com',
      corpId: '',
      corpSecret: '',
      agentId: ''
    }, options)

    this.corpId = options.corpId
    this.corpSecret = options.corpSecret
    this.agentId = options.agentId
    this.apiServer = options.apiServer

    this.ding = ding
    this.cache = new Cache({
      max: 100,
      maxAge: 1000 * 60 * 10
    })
  }

  /**
   * 获取accessToken
   */
  async getAccessToken() {
    const key = 'ding_access_token'
    const { cache, corpId, corpSecret, apiServer } = this
  
    let token = cache.get(key)
    if (token) {
      return token
    }
  
    const result = await ding({
      url: `${apiServer}/gettoken`,
      qs: {
        corpid: corpId,
        corpsecret: corpSecret
      },
      json: true
    })
  
    // 考虑到网络传输延迟，过期时间减去一点
    cache.set(key, result.access_token, (result.expires_in - 5) * 1000)
    return result.access_token
  }

  /**
   * 获取js ticket
   */
  async getJSTicket() {
    const key = 'ding_js_ticket'
    const { cache, apiServer } = this
  
    let ticket = cache.get(key)
    if (ticket) {
      return ticket
    }
  
    const result = await ding({
      url: `${apiServer}/get_jsapi_ticket`,
      qs: {
        type: 'jsapi',
        access_token: await this.getAccessToken()
      },
      json: true
    })
  
    // 考虑到网络传输延迟，过期时间减去一点
    cache.set(key, result.ticket, (result.expires_in - 5) * 1000)
    return result.ticket
  }

  /**
   * 通过免登码获取userid
   */
  async getUserId(code) {
    const result = await ding({
      url: `${this.apiServer}/user/getuserinfo`,
      qs: {
        code,
        access_token: await this.getAccessToken()
      },
      json: true
    })

    return result.userid
  }

  /**
   * 再通过userid获取用户信息
   * 建议用户信息保存在session中，避免多次调用该接口
   */
  async getUserDetail(userid) {
    const result = await ding({
      url: `${this.apiServer}/user/get`,
      qs: {
        userid,
        access_token: await this.getAccessToken()
      },
      json: true
    })

    return result
  }

  /**
   * 发送企业通知消息
   */
  async sendCropMessage(msg={}) {
    const { agentId, apiServer } = this
    msg.agent_id = agentId

    const result = await ding({
      method: 'POST',
      url:  `${apiServer}/topapi/message/corpconversation/asyncsend`,
      qs: {
        access_token: await this.getAccessToken()
      },
      body: msg,
      json: true
    })

    return result
  }

  signTicket(ticket, url) {
    const { corpId, agentId } = this
    const nonceStr = Math.random().toString(36).substring(2)
    const timeStamp = Date.now()

    const ret = {
      ticket,
      url,
      corpId,
      agentId,
      nonceStr,
      timeStamp
    }
  
    const plain = [
      'jsapi_ticket=' + ticket,
      'noncestr=' + nonceStr,
      'timestamp=' + timeStamp,
      'url=' + url
    ].join('&')
    
    ret.signature = sha1(plain)  
    return ret
  }
}

module.exports = DingCrop