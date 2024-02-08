<p align="center">
<img src="https://raw.githubusercontent.com/akashic-games/resurveil/main/img/akashic.png"/>
</p>

# resurveil

**resurveil** は、対象ファイルの内容を監査してルールと一致する文言を検出するツールです。

## Usage

```sh
resurveil [options] file1.txt file2.html file3.md ....
```

後述する検閲ルールと一致する内容が指定ファイル内に含まれていた場合、1 以上の exit code を返します。

### Arguments

検閲するファイル。

### Option

| オプション | 短縮名 | 概要 |
| -- | -- | -- |
| `--config <string>`  | `-c` | 設定ファイルのパス |
| `--ignore-no-config` |      | 設定ファイルが見つからない場合にエラーとすべきかどうか |

## Configuration

### Specification

[micromatch][micromatch] を使ったパターンをキー名として検閲ルールを指定します。

| キー名 | 形式 | 概要 |
| -- | -- | -- |
| `"pattern"`         | `String`           | [micromatch][micromatch] を使ったパターン。このパターンと一致したファイル名を検閲の対象とする。 |
| `"pattern".deny`    | `Array`            | 検閲のルール。 |
| `"pattern".deny[]`  | `String \| RegExp` | 検閲する文字列・正規表現。このルールが指定のファイル名の内容に含まれていた場合はリジェクトする。 |
| `"pattern".allow`   | `Array`            | 検閲から除外するルール。 |
| `"pattern".allow[]` | `String \| RegExp` | 検閲から除外する文字列・正規表現。`"pattern".deny` に該当した場合、このルールに一致した場合は例外的にリジェクトを取り消す。 |

### Example

```javascript
export default {
  "*.html": {
    deny: ["your.company.com"],
    allow: [/(?:www|public)\.your\.company\.com/],
  },
};
```

### Configuration Path

`--config` オプションを省略した場合、以下の優先度で設定ファイルを検索します。
設定ファイルが見つからなかった場合は 1 以上の exit code を返します。
(ただし `--ignore-no-config` を指定した場合は 0 の exit code を返します)

1. `<pwd>/resurveilrc.<ext>`
1. `<pwd>/resurveil-config.<ext>`
1. `$HOME/resurveilrc.<ext>`
1. `$HOME/resurveil-config.<ext>`

`<ext>` は以下の順番で優先されます。

1. `js`
1. `cjs`
1. `mjs`

## Developers

### Install

Node.js が必要です。次のコマンドでインストールできます。

```sh
npm i
```

### Build

```sh
npm run build
```

### License

本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](https://github.com/akashic-games/resurveil/blob/main/LICENSE) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。

[micromatch]: https://github.com/micromatch/micromatch
