const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const sha1 = require('sha1');
var bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
var convert = require('xml-js');
const fetch = require('node-fetch');
const koaStatic = require('koa-static');
const FormData = require('form-data');

const app = new Koa();

const APPID = 'wxa99d5752aef57cf6';
const APPSECRET = '925dd76b2e0e4cab24383ed7f6e3286a';
const TOKEN = 'WECHAT';

const API = {
  GET_ACCESS_TOKEN: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`,
  MENU: {
    CREATE: ACCESS_TOKEN => `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${ACCESS_TOKEN}`,
    LIST: ACCESS_TOKEN => `https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=${ACCESS_TOKEN}`,
    DELETE: ACCESS_TOKEN => `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${ACCESS_TOKEN}`
  },
  MEDIA: {
    TEMP: {
      UPLOAD: (ACCESS_TOKEN, TYPE) => `https https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${ACCESS_TOKEN}&type=${TYPE}`
    }
  }
}

const ACCESS_TOKEN = '65_iGWvq9ikI-SY68BRmbnYNbJZ-EyQifiEFXcQo2-M6fukb2txvDKq2Bpg0t49g3tXdr-QEIkOFH1K361JTN77nfKyU92pVE2sULUqWkllu6EaTRQXnqJn-lovjL8HHSaAIASSD'

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

  const content = `当前接收到的消息为：${msgType}消息
全部支持的消息有：
1. 文本消息
2. 图片消息
3. 语音消息
4. 视频消息
5. 小视频消息
6. 地理位置消息
7. 链接消息`;
  ctx.body = `<xml>
      <ToUserName><![CDATA[${fromUser}]]></ToUserName>
      <FromUserName><![CDATA[${toUser}]]></FromUserName>
      <CreateTime>${Date.now()}</CreateTime>
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[${content}]]></Content>
    </xml>`;
});


router.get('/get_access_token', async(ctx, next) => {
  console.log(API.GET_ACCESS_TOKEN)

  const response = await fetch(API.GET_ACCESS_TOKEN)
  const body = await response.json();
  console.log(body)
  ctx.body = body;
});

router.get('/menu/create', async(ctx, next) => {

  const data = {
    "button": [
        {
            "name": "扫码", 
            "sub_button": [
                {
                    "type": "scancode_waitmsg", 
                    "name": "扫码带提示", 
                    "key": "rselfmenu_0_0", 
                    "sub_button": [ ]
                }, 
                {
                    "type": "scancode_push", 
                    "name": "扫码推事件", 
                    "key": "rselfmenu_0_1", 
                    "sub_button": [ ]
                }
            ]
        }, 
        {
            "name": "发图", 
            "sub_button": [
                {
                    "type": "pic_sysphoto", 
                    "name": "系统拍照发图", 
                    "key": "rselfmenu_1_0", 
                   "sub_button": [ ]
                 }, 
                {
                    "type": "pic_photo_or_album", 
                    "name": "拍照或者相册发图", 
                    "key": "rselfmenu_1_1", 
                    "sub_button": [ ]
                }, 
                {
                    "type": "pic_weixin", 
                    "name": "微信相册发图", 
                    "key": "rselfmenu_1_2", 
                    "sub_button": [ ]
                }
            ]
        }, 
        {
            "name": "发送位置", 
            "type": "location_select", 
            "key": "rselfmenu_2_0"
        },
    ]
}

  const response = await fetch(API.MENU.CREATE(ACCESS_TOKEN), {
    method: 'post',
	  body: JSON.stringify(data),
	  headers: {'Content-Type': 'application/json'}
  })

  const result = await response.json();

  ctx.body = result;
});
router.get('/menu/list', async(ctx, next) => {
  const response = await fetch(API.MENU.LIST(ACCESS_TOKEN))

  const result = await response.json();

  ctx.body = result;
})

router.get('/menu/delete', async(ctx, next) => {
  const response = await fetch(API.MENU.DELETE(ACCESS_TOKEN))

  const result = await response.json();

  ctx.body = result;
})

router.get('/menu/delete', async(ctx, next) => {
  const response = await fetch(API.MENU.DELETE(ACCESS_TOKEN))

  const result = await response.json();

  ctx.body = result;
})


router.get('/upload', async(ctx,next) => {
  let fileStream = fs.readFileSync(path.join(__dirname, './static/test.jpg'));//读取文件
  let formdata = new FormData();
  formdata.append("file", fileStream, {
      filename: "./test.png",//上传的文件名
      // filepath: 'test.jpg',
      contentType: 'image/png',//文件类型标识
    //knownLength: fileStream.length
  });
  console.log(API.MEDIA.TEMP.UPLOAD(ACCESS_TOKEN, 'image'))
const result = await fetch(API.MEDIA.TEMP.UPLOAD(ACCESS_TOKEN, 'image'), {
    body: formdata,
    method: "POST",//请求方式
    headers: formdata.getHeaders()
})
  ctx.body = result
})

app.use(koaStatic(path.join(__dirname, '../static'), {}));

app.use(bodyParser({
  enableTypes: ['json','form','text','xml']
}));

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8899);