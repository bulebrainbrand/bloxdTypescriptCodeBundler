このレポジトリはbloxd.io codeのtypescript ESM環境を提供します

## 使い方

`npm i bloxdtypescriptcodebundler -D`を実行します。

`npx ts-bloxdBuild`を実行すると特定のファイルがトランスパイルされ、バンドルされます。

## bloxdBundler.config.json

これは、バンドルのコンフィグです。
以下の設定ができます。

```
{
  rootDir: string; # バンドルするディレクトリを指定します。初期値は`./src`です
  outDir: string; # バンドル後の結果を出力するディレクトリを指定します。初期値は`./dist`です
  worldcodeDir: string;　# ワールドコードとして扱うディレクトリを指定します。これは、rootDirからみたパスになります。初期値は`./worldcode`で、これは`/src/worldcode`を意味します
  minify: boolean; # ミニファイの設定です。trueなら、ミニファイを行います。

  codeblockDir: string;　# コードブロックとして扱うディレクトリを指定します。このディレクトリ内のコードは1ファイルずつバンドルされます。これは、rootDirからみたパスになります。初期値は`./codeblock`で、これは`/src/codeblock`を意味します
}
```

## バンドルの挙動

rootDir下にあるファイルを全てjavascriptにトランスパイルします。
その後、worldcodeDirとcodeblockDirをバンドルし、それ以外のファイルを削除します。

## 例

### 1

```
src/
  worldcode/
    index.ts # add.tsに依存している
  module/
    add.ts
```

この時、バンドルを実行すると

```
dist/
  worldcode/
    worldcode.ts # add.tsとindex.tsを内蔵している
```

となります

### 2

```
src/
  worldcode/
    foo.ts
    bar.ts
```

この時、バンドルを実行すると

```
dist/
  worldcode/
    worldcode.ts # foo.tsとbar.tsが合体している
```

となります

### 3

```
src/
  codeblock/
    index.ts # add.tsに依存している
  module/
    add.ts
```

この時、バンドルを実行すると

```
dist/
  codeblock/
    index.ts # add.tsを内蔵している
```

となります

### 4

これはベストプラクティスではないです

```
src/
  worldcode/
    index.ts # foo.tsに依存している
  codeblock/
    foo.ts # add.tsに依存している
    bar.ts # index.tsに依存している
  module/
    add.ts
```

この時、バンドルを実行すると

```
dist/
  worldcode/
    worldcode.ts # foo.tsとadd.tsを内蔵している
  codeblock/
    foo.ts # add.tsを内蔵している
    bar.ts # foo.tsとadd.tsとindex.tsを内蔵している
```

となります。

## tsconfig.json

このバンドルの実行時、tsconfigはあってもなくてもかまいませんが、tsconfigをトランスパイル時に読み込み、利用します。そのため、tsconfigでの設定は反映されます。しかし実行時のみ以下のように上書きします。

```
rootDir: tstempDir, # 実行時の仮ディレクトリ
outDir: tempDir, # 実行時の仮ディレクトリ
noEmit: false,
```
