var fs = require('fs'),
    path = require('path'),
    opts = require('opts'),
    mkdirp = require('mkdirp'),
    _s = require('underscore.string'),
    async = require('async');
require('string.fromcodepoint');
require('string.prototype.codepointat');

module.exports = function() {

  var files = [];

  var options = [
    { 
      short       : 'u',
      long        : 'unicode',
      description : 'UNICODEのコードポイント 例） -u U+3071',
      'value': true
    },
    {
      short       : 'c',
      long        : 'char',
      description  : '文字を直に指定',
      value: true,
    },
    {
      short       : 'd',
      long        : 'dir',
      description : '出力先ディレクトリ',
      value: true,
    }
  ];

  var args = [
   {
     name: 'GPS-JSONfile ...',
     description: 'GPS JSONファイル',
     required: true,
     callback: function(value) {
      var isArgs = false;
      for (var i = 0, l = process.argv.length; i < l; i++) {
        var arg = process.argv[i];
        if (arg === value) {
          isArgs = true;
        }
        if (isArgs) {
          files.push(arg); 
        }
      }
     }
   }
  ];
   
  opts.parse(options, args, true);

  var dir = opts.get('dir') || 'gps-glyph';
  var unicode = opts.get('unicode') || null;
  var codepoint = (typeof unicode == 'string' && unicode.match(/^U\+[0-9]*$/)) ? parseInt(unicode.replace('U+', ''), 16) : null;
  var charactor = codepoint ? String.fromCodePoint(codepoint) : (opts.get('char') || null);

  if (!unicode && !charactor) {
    console.error('-u か -c オプションを指定して下さい');
    process.exit(1);
  }

  if (unicode === null && charactor) {
    codepoint = charactor.codePointAt(0);
    unicode = 'U+' + _s.pad(codepoint.toString(16), 4, '0');
  }

  // ファイルを読み込み
  async.map(files, fs.readFile, function (err, results) {
    // JSONをパース
    var gps = results.map(function(item) {
      return JSON.parse(item.toString());
    });

    // 出力先のディレクトリを作成
    var outputDir = path.join(dir, unicode.substr(0, 4));
    mkdirp(outputDir, function (err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      var json = JSON.stringify({
        unicode: unicode,
        'char': charactor,
        gps: gps
      }, null, 2);
      
      // ファイルを出力
      fs.writeFile(path.join(outputDir, unicode + '.json'), json, function (err) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        process.exit(0);
      });
    });

  });

};

