# BearBy Browser Extension of Massa blockchain

[![Chrome](https://img.shields.io/chrome-web-store/v/papngmkmknnmfhabbckobgfpihpdgplk)](https://chrome.google.com/webstore/detail/bearby/papngmkmknnmfhabbckobgfpihpdgplk?utm_source=chrome-ntp-icon)
[![FireFox](https://img.shields.io/amo/v/bearby)](https://addons.mozilla.org/en-GB/firefox/addon/bearby/)

Massa's plugin of Chrome and FireFox.

<p align="center" style="border-radius: 16px;">
  <a href="https://beabry.io"><img style="max-width: 100%;" src="https://github.com/bearby-wallet/bearby-extension/blob/master/preview.png"></a>
</p>

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
make clean
make
```
