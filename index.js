const fs = require('fs')
const path = require('path')
const pixelaNode = require('pixela-node')
const setting = require('./setting.json')

// pixela-nodeの初期化処理
const client = new pixelaNode.default()
client.username = setting.username
client.token = setting.token

// 集計フォルダの決定
let basePath = '.'
if (process.argv[2]) {
  basePath = process.argv[2]
}
// 日付別ディレクトリ一覧の取得
fs.readdir(basePath, function(err, list){
  if (err) throw err
  let dirList = list.filter(function(item){
    return fs.statSync(path.join(basePath, item)).isDirectory() && /^[^\\.].*$/.test(item)
  })
  // 新しい順に処理
  dirList.sort().reverse()
  for(var i = 0; i < dirList.length; i++){
    // 設定ファイルに保存した日付と比較し、一致したら処理終了（新しい順に処理するので、一致した時点でそれより前の日付は処理が終わっているはず）
    if (processedDate === dirList[i]) {
      break;
    }

    // 日付別ディレクトリ内のファイル名一覧を取得
    let targetPath = path.join(basePath, dirList[i])
    fs.readdir(targetPath, function(err, list){
      if (err) throw err
      let fileList = list.filter(function(item){
        return fs.statSync(path.join(targetPath, item)).isFile()
      })

      // ファイルの数をpixelaに送信
      let date = new Date(dirList[i])
      client.createPixel(
        setting.id,
        {
          date: (date.getFullYear()+'')+(('0' + (date.getMonth() + 1)).slice(-2))+(('0' + date.getDate()).slice(-2)),
          quantity: fileList.length.toString()
        }
      ).then(res => console.log(res))
      .catch(e => console.log(e.response.data))
    })
  }

  // 一番新しい日付を設定ファイルに保存
  setting.processedDate = dirList[0]
  fs.writeFileSync('./setting.json', JSON.stringify(setting, null, '    '))
})