# BearBy Browser Extension of Massa blockchain

Massa's plugin of Chrome and FireFox.

## Installation:
 
* Download the extension using git: git clone `https://github.com/bearby-wallet/bearby-extension.git` or as a zip file.
* You can download ready from [realeses page](https://github.com/bearby-wallet/bearby-extension/releases)
* Install extension into browser.

```bash
$ git clone https://github.com/bearby-wallet/bearby-extension.git
$ cd bearby-extension
$ yarn # or npm install
$ yarn build # or npm run build
$ # after build you will see `dist` folder.
```

 - Firefox:
    Type about:debugging in the adress bar
    Click on "This Firefox"
    Click on "Load Temporary Add-on..."
    Select the file manifest.json in the massa-wallet folder

 - Chrome:
    Type chrome://extensions in the adress bar
    Click on "Load Unpacked"
    Select the massa-wallet folder

## build as develop

## Developing
```bash
yarn dev # run serve
yarn check # check types
```

## building
```bash
yarn build
```
