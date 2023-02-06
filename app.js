const Koa = require('koa');
const sha1 = require('sha1');
var bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
var convert = require('xml-js');
const axios = require('axios');

const app = new Koa();

const APPID = 'wxa99d5752aef57cf6';
const APPSECRET = '925dd76b2e0e4cab24383ed7f6e3286a';
const TOKEN = 'WECHAT';

const API = {
  GET_ACCESS_TOKEN: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`,
  MENU: {
    CREATE: (ACCESS_TOKEN) => `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${ACCESS_TOKEN}`
  }
}

const router = new Router();

router.get('/', (ctx, next) => {

  // signature: 'a2008c45a495ff9f41c971096b957bd7a40afd87',
  // timestamp: '1675675934',
  // nonce: '498594609'
  // echostr: '5962285567897824574',
  console.log(ctx)
  const {signature,echostr,timestamp,nonce} = ctx.query;

  const args = [TOKEN,timestamp,nonce]
  args.sort()
  if (sha1(args.join('')) === signature) {
    ctx.body = echostr;
  } else {
    ctx.body = echostr;
  }

});

router.post('/', (ctx, next) => {

  console.log(ctx.request.body)
  const { xml } = convert.xml2js(ctx.request.body, {compact: true,spaces: 2});
  console.log(xml)

  const fromUser = xml?.FromUserName?._cdata;
  const toUser = xml?.ToUserName?._cdata;
  const msgType = xml?.MsgType?._cdata;
  const picUrl = xml?.PicUrl?._cdata;
  const msgContent = xml?.Content?._cdata;
  const mediaId = xml?.MediaId?._cdata;
  

  if(msgType === 'text') {
    ctx.body = `<xml>
      <ToUserName><![CDATA[${fromUser}]]></ToUserName>
      <FromUserName><![CDATA[${toUser}]]></FromUserName>
      <CreateTime>${Date.now()}</CreateTime>
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[${JSON.stringify(xml, null, 2)}]]></Content>
    </xml>`;
  } else if (msgType === 'image') {
    ctx.body = `<xml>
    <ToUserName><![CDATA[${fromUser}]]></ToUserName>
    <FromUserName><![CDATA[${toUser}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[${msgType}]]></MsgType>
    <Image>
      <MediaId><![CDATA[${mediaId}]]></MediaId>
    </Image>
  </xml>`;
  }else if (msgType === 'voice') {
    ctx.body = `<xml>
    <ToUserName><![CDATA[${fromUser}]]></ToUserName>
    <FromUserName><![CDATA[${toUser}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[${msgType}]]></MsgType>
    <Voice>
      <MediaId><![CDATA[${mediaId}]]></MediaId>
    </Voice>
  </xml>`;
  }else if (msgType === 'video') {
    ctx.body = `<xml>
    <ToUserName><![CDATA[${fromUser}]]></ToUserName>
    <FromUserName><![CDATA[${toUser}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[${msgType}]]></MsgType>
    <Video>
      <MediaId><![CDATA[${mediaId}]]></MediaId>
      <Title><![CDATA[${msgType}]]></Title>
      <Description><![CDATA[${msgType}描述]]></Description>
    </Video>
  </xml>`;
  }else if (msgType === 'music') {
    ctx.body = `<xml>
    <ToUserName><![CDATA[${fromUser}]]></ToUserName>
    <FromUserName><![CDATA[${toUser}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[${msgType}]]></MsgType>
    <Music>
      <Title><![CDATA[TITLE]]></Title>
      <Description><![CDATA[DESCRIPTION]]></Description>
      <MusicUrl><![CDATA[MUSIC_Url]]></MusicUrl>
      <HQMusicUrl><![CDATA[HQ_MUSIC_Url]]></HQMusicUrl>
      <ThumbMediaId><![CDATA[media_id]]></ThumbMediaId>
    </Music>
  </xml>`;
  }else if (msgType === 'voice') {
    ctx.body = `<xml>
    <ToUserName><![CDATA[${fromUser}]]></ToUserName>
    <FromUserName><![CDATA[${toUser}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[${msgType}]]></MsgType>
    <Voice>
      <MediaId><![CDATA[${mediaId}]]></MediaId>
    </Voice>
  </xml>`;
  }else {
    ctx.body = `<xml>
      <ToUserName><![CDATA[${fromUser}]]></ToUserName>
      <FromUserName><![CDATA[${toUser}]]></FromUserName>
      <CreateTime>${Date.now()}</CreateTime>
      <MsgType><![CDATA[${msgType}]]></MsgType>
      <Content><![CDATA[${JSON.stringify(xml, null, 2)}]]></Content>
    </xml>`;
  }


});


router.get('/get_access_token', async(ctx, next) => {
  console.log(API.GET_ACCESS_TOKEN)

  const response = await axios.get(API.GET_ACCESS_TOKEN)
  // const response = await fetch('https://github.com/');
  // ctx.body = response.json();
  // console.log(result);
  ctx.body = response.data;
});

router.get('/menu/create', async(ctx, next) => {

  const data = {
    "button":[
    {	
         "type":"click",
         "name":"今日歌曲",
         "key":"V1001_TODAY_MUSIC"
     },
     {
          "name":"菜单",
          "sub_button":[
          {	
              "type":"view",
              "name":"搜索",
              "url":"http://www.soso.com/"
           },
           {
                "type":"miniprogram",
                "name":"wxa",
                "url":"http://mp.weixin.qq.com",
                "appid":"wx286b93c14bbf93aa",
                "pagepath":"pages/lunar/index"
            },
           {
              "type":"click",
              "name":"赞一下我们",
              "key":"V1001_GOOD"
           }]
      }]
}

  const response = await axios.post(API.MENU.CREATE('65_MTsZhxTqN1lQWGOSb-LzDnj1eJZxXriIeb6mGgZd9YwPjkqrf6r6GEKvs4afH6QXsefAAPHGntYIMVZ6zQqS1wweZH-QdYbQTStBG1RvTS4FmHrqInNF9hWfYPEGZHiABABUC'), data)
  // const response = await fetch('https://github.com/');
  // ctx.body = response.json();
  // console.log(result);
  ctx.body = response.data;
});

app.use(bodyParser({
  enableTypes: ['json','form','text','xml']
}));

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8899);