import { Guard, INCORRECT_PASSWORD } from './guard';
import { HDKey, MnemonicController } from 'lib/bip39';
import { assert } from 'lib/assert';
import { BrowserStorage } from 'lib/storage';
import { utils } from 'aes-js';
import { base58ToBinary, binaryToBase58 } from 'lib/crypto/base58';
import { base58Encode, base58Decode, addressFromPublicKey, publicKeyBytesFromPrivateKey, pubKeyFromBytes } from 'lib/address';
import { VarintDecode, VarintEncode } from 'lib/varint';
import { COUNT_NODES, PERIOD_OFFSET, VERSION_NUMBER } from 'config/common';
import { AccountController } from 'core/background/account/account';
import { randomBytes } from 'lib/crypto/random';
import { AccountTypes } from 'config/account-type';
import { ACCOUNT_MUST_UNIQUE, INCORRECT_ACCOUNT } from './account/errors';
import { privateKeyBytesToBase58, base58PrivateKeyToBytes } from 'lib/validator';
import { NetworkControl } from './network';
import { MassaControl } from './provider';
import { NETWORK } from 'config/network';
import { BadgeControl } from './notifications';
import { CurrenciesController, INVALID_CURREENCY, INVALID_THEME, LocaleSettings, PhishingDetection, ThemeSettings } from './settings';
import { DEFAULT_CURRENCIES } from 'config/currencies';
import { Locales } from 'config/locale';
import { Themes } from 'config/theme';
import { ContactController } from 'core/background/contacts';
import { SettingsControl } from './settings/settings';
import { INVALID_BASE58, UINIQE_ADDRESS, UINIQE_NAME } from './contacts/errors';
import { CallSmartContractBuild, ExecuteSmartContractBuild, PaymentBuild } from './provider/transaction';
import { fromByteArray, toByteArray } from 'base64-js';


(async function start() {
  /// start testing.
  console.log('reset storage');
  await BrowserStorage.clear();

  /// guard
  console.log('start guard testing');
  const mnemonic = new MnemonicController();
  const guard = new Guard();

  await guard.sync();

  assert(!guard.isEnable, 'guard.isEnable is true');
  assert(!guard.isReady, 'guard.isReady is true');

  const wordsSHouldBe = 'insect harsh unable fog damp together skin eager clutch pyramid travel budget flat flag ten bone whisper carbon addict siren elegant legend mandate cover';
  const seedShouldBe = '9de4324c250bc7f98aac98eb10e13f523fd68df6dbe4fd36b552a80de07ffaa91aaa521f88d4502e98719002462e4fb4f348196a695ac78ad8afa3ebf0e03dd4';
  const entropy = '750d2bb12d2373c772a2272c95e39e0ec588b077b8cafa844c0d64b478ff21c1';
  const words = await mnemonic.entropyToMnemonic(utils.hex.toBytes(entropy));
  const password = 'test';

  assert(wordsSHouldBe === words, 'words are different');

  await guard.setupVault(words, password);

  assert(utils.hex.fromBytes(guard.seed) === seedShouldBe, 'seed bytes are different');
  assert(guard.isEnable, 'guard.isEnable is false');
  assert(guard.isReady, 'guard.isReady is false');
  assert(guard.seed.length === 64, 'seed length should be 64');

  await guard.logout();

  assert(!guard.isEnable, 'guard.isEnable is true');
  assert(guard.isReady, 'guard.isReady is false');

  try {
    await guard.unlock('wrong password');
  } catch (err) {
    assert((err as Error).message === INCORRECT_PASSWORD, 'incorrect error');
  }

  assert(!guard.isEnable, 'guard.isEnable is true');
  assert(guard.isReady, 'guard.isReady is false');

  await guard.unlock(password);

  assert(guard.isEnable, 'guard.isEnable is false');
  assert(guard.isReady, 'guard.isReady is false');
  /// guard

  console.log('start testing HDKey');

  /// HDKey
  async function testKeys(index: number) {
    const hdKey = new HDKey();
    const path = mnemonic.getPath(index);
  
    await hdKey.derivePath(path, guard.seed);

    const { pubKey, privKey, base58 } = await hdKey.keyPair();

    return {
      privateKey: utils.hex.fromBytes(privKey),
      publicKey: utils.hex.fromBytes(pubKey),
      base58
    };
  }

  const res0 = await testKeys(0);

  assert('522de2457f50b0e87a065a77e081a33db7ef2735d7152fad44e4ed6fdf08e93e' === res0.privateKey, 'Incorrect PrivateKey');
  assert('90184d44d4b49ccbca26dda160f3ef1cd53696b90e4eb72f621404aa5183304a' === res0.publicKey, 'Incorrect PublicKey');
  assert("A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW" === res0.base58, 'does not math address base58');

  const res1 = await testKeys(1);

  assert('9f4131037adc3e450eb39383df9c5759427c142b4660f19760a4e9d6f450fef7' === res1.privateKey, 'Incorrect PrivateKey');
  assert('c80b48b9f0de125c5af33632e52b63e423bcd6bcf7c403ce265847098d200684' === res1.publicKey, 'Incorrect PublicKey');
  assert("A12jRXS6cnGms86qwqFNm8Atca7bEQNSp5P4Dnsyra95iURMyCAA" === res1.base58, 'does not math address base58');

  const res2 = await testKeys(55);

  assert('b85b2fc3dd250ffe41f8d06b2746fd6c000551db30cad1b1f5c3ae69cef4437e' === res2.privateKey, 'Incorrect PrivateKey');
  assert('dd5c0a051848eb1693b4a1a035353328ac2bab46cdad1b91c120148db0e02842' === res2.publicKey, 'Incorrect PublicKey');
  assert("A12ZcmhKnGCWuEcxuXrw8P16Cj8XYNAc6FbMHzoa39cBo4UQ9VpN" === res2.base58, 'does not math address base58');
  /// HDKey

  // base58
  console.log('start testing base58 decoder, encoder');
  const base58Str = '6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
  const fromBase58 = base58ToBinary(base58Str);
  const toBase58 = binaryToBase58(fromBase58);

  assert(utils.hex.fromBytes(fromBase58) === '02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cfeb05f9d2', 'incorrect base58ToBinary');
  assert(toBase58 === base58Str, 'incorrect binaryToBase58');
  // base58

  // address encoder
  console.log('start testing address decoder, encoder');
  const testContent = utils.hex.toBytes('5b6ae2595c52f7ea02257582a4beacff65bc0753111ae5cbbb3eaacf18ad3abd');
  const address0 = await base58Encode(testContent);
  const test1Content = utils.hex.toBytes('b6cda5e8b5995ffb2710839c74989c0b69249de330aced521f3c454cdef0f12c');
  const address1 = await base58Encode(test1Content);

  assert('hG8zRRJF2v3qkwyZ2fnHJeaVw9uT4huCkwcWJVvgypEwMNHVC' === address0, 'does not math with right address');
  assert('2PWTzCKkkE9P5Supt3Fkb4QVZ3cdfB281TGaup7Nv1DY1is9fL' === address1, 'does not math with right address');

  assert(utils.hex.fromBytes(await base58Decode(address0)) === utils.hex.fromBytes(testContent), 'does not math with right address bytes');
  assert(utils.hex.fromBytes(await base58Decode(address1)) === utils.hex.fromBytes(test1Content), 'does not math with right address bytes');
  // address encoder

  // varint
  console.log('start testing varint');

  function randint(range: number) {
    return Math.floor(Math.random() * range);
  }

  function varintTest0() {
    var expect, encoded;

    for(var i = 0, len = 100; i < len; ++i) {
      expect = randint(0x7FFFFFFF);
      const decoder = new VarintDecode();
      encoded = new VarintEncode().encode(expect);

      const data = decoder.decode(encoded);

      assert(expect === data, 'expect and data is not equal');
      assert(decoder.bytes === encoded.length, 'bytes is not equal encoded.length');
    }
  }

  const version = new VarintEncode().encode(VERSION_NUMBER);

  assert(utils.hex.fromBytes(version) === '00', 'version encoded is not equal version');

  varintTest0();
  // varint

  // addresses utils
  console.log('start addreses utils testing');
  const base58PrivKey = 'S12tw4YShWtjWfy7YBQ9Erbcg6DYgWnMgb5hGjn9hAKGtgrLNa7L';
  const privateKeyBytes = await base58PrivateKeyToBytes(base58PrivKey);
  const privateKeyBase58 = await privateKeyBytesToBase58(privateKeyBytes);

  assert(privateKeyBase58 === base58PrivKey, 'Incorrect base58 privateKey');
  assert(utils.hex.fromBytes(privateKeyBytes) === 'f99d3fac98a9adb3b622500b50c020b05efe01408249aab3a25c8839f3c61b26', 'buf privatekeys is not equal');

  const pubKey = publicKeyBytesFromPrivateKey(privateKeyBytes);
  const address = await addressFromPublicKey(pubKey);

  assert(utils.hex.fromBytes(pubKey) === '5b6ae2595c52f7ea02257582a4beacff65bc0753111ae5cbbb3eaacf18ad3abd', 'pubKey is not equal');
  assert(address === 'A12PWTzCKkkE9P5Supt3Fkb4QVZ3cdfB281TGaup7Nv1DY12a6F1', 'address is not equal');
  // addresses utils

  // Account controller
  console.log('start testing AccountController');
  
  const account = new AccountController(guard);

  await account.sync();

  assert(account.lastIndexLedger === 0, 'Incorrect ledger index');
  assert(account.lastIndexPrivKey === 0, 'Incorrect privateKey index');
  assert(account.lastIndexSeed === 0, 'Incorrect seed index');
  assert(account.lastIndexTrezor === 0, 'Incorrect trezor index');

  const accountName = utils.hex.fromBytes(randomBytes(8));
  await account.addAccountFromSeed(guard.seed, accountName);

  assert(account.lastIndexLedger === 0, 'Incorrect ledger index');
  assert(account.lastIndexPrivKey === 0, 'Incorrect privateKey index');
  assert(account.lastIndexTrezor === 0, 'Incorrect trezor index');
  assert(account.lastIndexSeed === 1, 'Incorrect seed index');
  assert(account.selectedAccount?.type === AccountTypes.Seed, 'Incorrect account type');
  assert(account.selectedAccount?.name === accountName, 'Incorrect account name');
  assert(account.selectedAccount?.index === 0, 'Incorrect account index');
  assert(account.selectedAccount?.pubKey === '90184d44d4b49ccbca26dda160f3ef1cd53696b90e4eb72f621404aa5183304a', 'Incorrect account pubKey');
  assert(account.selectedAccount?.base58 === 'A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW', 'Incorrect account address');

  try {
    const accountName = utils.hex.fromBytes(randomBytes(8));
    const privateKey = 'S1dCABJCm1Ms3m6y6sf2JQvkhRn1VP8TaLBxzjeADxurDGB77Zt';
    await account.addAccountFromPrivateKey(privateKey, accountName);
    throw new Error('added already have account');
  } catch (err) {
    assert((err as Error).message === ACCOUNT_MUST_UNIQUE, `Incorrect error message: ${(err as Error).message}`);
  }

  const accountName55 = utils.hex.fromBytes(randomBytes(8));
  const privateKey55 = 'S12jtn2WJ3R89DBitafREHgXa1tcEJc28Kd3yqoEcMVpjYpJ1CQY';
  await account.addAccountFromPrivateKey(privateKey55, accountName55);

  assert(account.lastIndexLedger === 0, 'Incorrect ledger index');
  assert(account.lastIndexPrivKey === 1, 'Incorrect privateKey index');
  assert(account.lastIndexSeed === 1, 'Incorrect seed index');
  assert(account.lastIndexTrezor === 0, 'Incorrect trezor index');
  
  assert(account.wallet.selectedAddress === 1, 'Incorrect selectedAddress index');

  assert(account.selectedAccount?.type === AccountTypes.PrivateKey, 'Incorrect account type');
  assert(account.selectedAccount?.name === accountName55, 'Incorrect account name');
  assert(account.selectedAccount?.index === 0, 'Incorrect account index');
  assert(account.selectedAccount?.pubKey === 'b9f7fe423a31008e17bccf6a9c96b94bb1c11de0fd0184e3770a40c72c553113', 'Incorrect account pubKey');
  assert(account.selectedAccount?.base58 === 'A12BXgeMYsiCPQKFUoLpsx2U7Zr1TkFTQXa6PRwEKjdz9WVCvYGL', 'Incorrect account address');
  
  const base58PubKeyTest = await pubKeyFromBytes(
    utils.hex.toBytes('b9f7fe423a31008e17bccf6a9c96b94bb1c11de0fd0184e3770a40c72c553113')
  );

  assert(base58PubKeyTest === 'P12QuKeLW7VBjHz95y1zBhSx32nRFSnxLuyBY3crJiMwzFphEymq', 'invalid pubKey base58');

  await account.select(0);

  assert(account.selectedAccount?.base58 === 'A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW', 'Incorrect account address');

  const newAccountName = utils.hex.fromBytes(randomBytes(8));

  await account.changeAccountName(0, newAccountName);

  assert(account.selectedAccount?.name === newAccountName, 'Incorrect account name');
  
  try {
    await account.remove(0);
  } catch (err) {
    assert((err as Error).message === INCORRECT_ACCOUNT, `Incorrect error message: ${(err as Error).message}`);
  }

  const secondSeedAccountName = utils.hex.fromBytes(randomBytes(8));
  await account.addAccountFromSeed(guard.seed, secondSeedAccountName);

  assert(account.wallet.identities.length === 3, 'Incorrect length of accounts');
  assert(account.wallet.selectedAddress === 2, 'Incorrect selectedAddress account');

  await account.remove(2);

  assert(account.wallet.identities.length === 2, 'Incorrect length of accounts');
  assert(account.wallet.selectedAddress === 1, 'Incorrect selectedAddress account');

  await account.remove(1);

  assert(account.wallet.identities.length === 1, 'Incorrect length of accounts');
  assert(account.wallet.selectedAddress === 0, 'Incorrect selectedAddress account');
  // Account controller

  // NetworkControl
  console.log('start testing NetworkControl');
  const netwrok = new NetworkControl();

  assert(netwrok.selected === "mainnet", 'Incorrect selected netwrok');
  assert(netwrok.providers[0] === NETWORK['mainnet'].PROVIDERS[0], 'Incorrect http provider');
  assert(netwrok.version === 0, 'Incorrect netwrok version');
  assert(netwrok.count === COUNT_NODES, 'Incorrect nodes counter');
  assert(netwrok.providers.length === 1, 'Incorrect number of providers');


  await netwrok.sync();
  await netwrok.setNetwork('testnet');

  assert(netwrok.selected === "testnet", 'Incorrect selected netwrok');
  assert(netwrok.providers[0] === "https://test.massa.net/api/v2", 'Incorrect http provider');
  assert(netwrok.version === 0, 'Incorrect netwrok version');
  assert(netwrok.providers.length === 1, 'Incorrect number of providers');
  assert(netwrok.count === COUNT_NODES, 'Incorrect nodes counter');

  await netwrok.setConfig({
    ...netwrok.config,
    'custom': {
      PROVIDERS: ['localhost:3333', 'localhost:2355', 'localhost:634', '127.0.0.1:80'],
      VERSION: 1
    }
  });

  await netwrok.setNetwork('custom');

  assert(netwrok.selected === "custom", 'Incorrect selected netwrok');
  assert(netwrok.providers[0] === "localhost:3333", 'Incorrect http provider');
  assert(netwrok.providers.length === 3, 'Incorrect number of providers');
  assert(netwrok.version === 1, 'Incorrect netwrok version');

  await netwrok.downgradeNodeStatus('localhost:3333');

  assert(netwrok.providers[0] === "localhost:2355", 'Incorrect http provider');
  assert(netwrok.providers[netwrok.providers.length - 1] === "localhost:3333", 'Incorrect http provider');

  await netwrok.setNodesCount(2);

  assert(netwrok.providers.length === 2, 'Incorrect number of providers');

  const newNetwrok = new NetworkControl();

  assert(newNetwrok.selected === "mainnet", 'Incorrect selected netwrok');
  assert(newNetwrok.providers[0] === NETWORK['mainnet'].PROVIDERS[0], 'Incorrect http provider');
  assert(newNetwrok.version === 0, 'Incorrect netwrok version');
  assert(newNetwrok.count === COUNT_NODES, 'Incorrect nodes counter');
  assert(newNetwrok.providers.length === 1, 'Incorrect number of providers');

  await newNetwrok.sync();

  assert(newNetwrok.selected === "custom", 'Incorrect selected netwrok');
  assert(newNetwrok.providers[0] === "localhost:2355", 'Incorrect http provider');
  assert(newNetwrok.version === 1, 'Incorrect netwrok version');
  assert(newNetwrok.providers.length === 2, 'Incorrect number of providers');
  assert(newNetwrok.count === 2, 'Incorrect nodes counter');
  // NetworkControl

  // Massa Provider
  console.log('start testing MassaControl');
  await netwrok.setConfig({
    ...netwrok.config,
    'custom': {
      PROVIDERS: ['https://labnet.massa.net/api/v2'],
      VERSION: 1
    }
  });
  const provider = new MassaControl(netwrok, account);

  const msg = utils.utf8.toBytes('sign me');
  const pair1 = await account.getKeyPair();
  const sig = await provider.sign(msg, pair1);
  const shoulbeSig = 'cd5600f739c40c2c1d665c0d1cb2d946697423fd2c17b83aa70983394bfb40acf76a1645b1559eb4985c66223c56cb05e4863dd3ea4cffe5fb03032bab5c5a08';

  assert(sig.length === 64, 'incorrect signautre');

  assert(utils.hex.fromBytes(sig) === shoulbeSig, 'invalid sig');
  // Massa Provider


  /// BadgeControl
  console.log('start testing BadgeControl');
  let badge = new BadgeControl();

  assert(badge.counter === 0, 'invalid badge counter');

  await badge.sync();

  assert(badge.counter === 0, 'invalid badge counter');

  await badge.increase();

  assert(badge.counter === 1, 'invalid badge counter');

  await badge.increase(22);

  assert(badge.counter === 23, 'invalid badge counter');

  await badge.decrease(10);

  assert(badge.counter === 13, 'invalid badge counter');

  badge = new BadgeControl();

  assert(badge.counter === 0, 'invalid badge counter');

  await badge.sync();

  assert(badge.counter === 13, 'invalid badge counter');

  await badge.decrease();

  assert(badge.counter === 12, 'invalid badge counter');

  await badge.reset();

  assert(badge.counter === 0, 'invalid badge counter');
  /// BadgeControl

  /// CurrenciesController
  console.log('start testing CurrenciesController');
  let currencies = new CurrenciesController();

  assert(currencies.selected === DEFAULT_CURRENCIES[0], 'incorrect started selected');

  await currencies.sync(DEFAULT_CURRENCIES[5]);

  assert(currencies.selected === DEFAULT_CURRENCIES[5], 'incorrect selected');

  await currencies.reset();

  assert(currencies.selected === DEFAULT_CURRENCIES[0], 'incorrect selected');

  try {
    await currencies.update('incorrect');
  } catch (err) {
    assert((err as Error).message === INVALID_CURREENCY, 'invlid error');
  }

  await currencies.update(DEFAULT_CURRENCIES[10]);

  currencies = new CurrenciesController();

  assert(currencies.selected === DEFAULT_CURRENCIES[0], 'incorrect selected');

  await currencies.sync(DEFAULT_CURRENCIES[10]);

  assert(currencies.selected === DEFAULT_CURRENCIES[10], 'incorrect selected');

  await currencies.sync(null);

  assert(currencies.selected === DEFAULT_CURRENCIES[0], 'incorrect selected');

  await currencies.sync('random');

  assert(currencies.selected === DEFAULT_CURRENCIES[0], 'incorrect selected');
  /// CurrenciesController


  /// LocaleSettings
  console.log('start testing LocaleSettings');
  const locale = new LocaleSettings();

  assert(locale.selected === Locales.Auto, 'incorrect locale selected');

  await locale.sync(Locales.EN);

  assert(locale.selected === Locales.EN, 'incorrect locale selected');

  await locale.setLocale(Locales.Auto);

  assert(locale.selected === Locales.Auto, 'incorrect locale selected');
  /// LocaleSettings

  /// PhishingDetection
  console.log('start testing PhishingDetection');
  const phishing = new PhishingDetection();

  assert(phishing.phishingDetectionEnabled, 'incorrect phishingDetectionEnabled is false');

  await phishing.sync('true');

  assert(phishing.phishingDetectionEnabled, 'incorrect phishingDetectionEnabled is false');

  await phishing.sync('false');

  assert(!phishing.phishingDetectionEnabled, 'incorrect phishingDetectionEnabled is ture');

  await phishing.reset();

  assert(phishing.phishingDetectionEnabled, 'incorrect phishingDetectionEnabled is false');

  await phishing.togglePhishing();

  assert(!phishing.phishingDetectionEnabled, 'incorrect phishingDetectionEnabled is ture');
  /// PhishingDetection

  /// ThemeSettings
  console.log('start testing ThemeSettings');
  const theme = new ThemeSettings();

  assert(theme.selected === Themes.System, 'incorrect selected theme is not System');

  await theme.sync(Themes.Dark);

  assert(theme.selected === Themes.Dark, 'incorrect selected theme is not Dark');

  await theme.setTheme(Themes.Light);

  assert(theme.selected === Themes.Light, 'incorrect selected theme is not Light');

  await theme.sync('');

  assert(theme.selected === Themes.System, 'incorrect selected theme is not System');

  await theme.sync(Themes.Dark);

  assert(theme.selected === Themes.Dark, 'incorrect selected theme is not Dark');

  await theme.sync('incorrect theme');

  assert(theme.selected === Themes.System, 'incorrect selected theme is not System');

  try {
    await theme.setTheme('incorrect theme' as Themes);
  } catch (err) {
    assert((err as Error).message === INVALID_THEME, 'incorrect error');
  }
  /// ThemeSettings

  /// SettingsControl
  console.log('start testing SettingsControl');
  const settings = new SettingsControl();

  assert(settings.state.currency === DEFAULT_CURRENCIES[0], 'incorrect selected currency');
  assert(settings.state.locale === Locales.Auto, 'incorrect selected locale');
  assert(settings.state.theme === Themes.System, 'incorrect selected themes');
  assert(settings.state.periodOffset === PERIOD_OFFSET, 'incorrect selected periodOffset');

  await settings.sync();

  assert(settings.state.currency === DEFAULT_CURRENCIES[0], 'incorrect selected currency');
  assert(settings.state.locale === Locales.Auto, 'incorrect selected locale');
  assert(settings.state.theme === Themes.System, 'incorrect selected themes');
  assert(settings.state.periodOffset === PERIOD_OFFSET, 'incorrect selected periodOffset');

  await settings.currencies.update(DEFAULT_CURRENCIES[11]);
  await settings.locale.setLocale(Locales.EN);
  await settings.phishing.togglePhishing();
  await settings.theme.setTheme(Themes.Light);
  await settings.period.setPeriodOffset(10);

  assert(settings.state.currency === DEFAULT_CURRENCIES[11], 'incorrect selected currency');
  assert(settings.state.locale === Locales.EN, 'incorrect selected locale');
  assert(settings.state.theme === Themes.Light, 'incorrect selected themes');
  assert(settings.state.periodOffset === 10, 'incorrect selected periodOffset');

  await settings.reset();

  assert(settings.state.currency === DEFAULT_CURRENCIES[0], 'incorrect selected currency');
  assert(settings.state.locale === Locales.Auto, 'incorrect selected locale');
  assert(settings.state.theme === Themes.System, 'incorrect selected themes');
  /// SettingsControl

  /// ContactController
  console.log('start testing ContactController');
  let contacts = new ContactController();

  assert(contacts.list.length === 0, 'incorrect contacts length');

  await contacts.sync();

  assert(contacts.list.length === 0, 'incorrect contacts length');

  try {
    await contacts.add({
      name: 'test',
      address: 'incorrect address'
    });
  } catch (err) {
    assert((err as Error).message === INVALID_BASE58, 'incorrect error message');
  }

  await contacts.add({
    name: 'test',
    address: 'A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW'
  });

  assert(contacts.list.length === 1, 'incorrect contacts length');
  assert(contacts.list[0].name === 'test', 'incorrect contact name');
  assert(contacts.list[0].address === 'A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW', 'incorrect contact address');

  try {
    await contacts.add({
      name: 'test1',
      address: 'A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW'
    });
  } catch (err) {
    assert((err as Error).message === UINIQE_ADDRESS, 'incorrect error message');
  }

  try {
    await contacts.add({
      name: 'test',
      address: 'A1mphtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW'
    });
  } catch (err) {
    assert((err as Error).message === UINIQE_NAME, 'incorrect error message');
  }

  contacts = new ContactController();

  assert(contacts.list.length === 0, 'incorrect contacts length');

  await contacts.sync();

  assert(contacts.list.length === 1, 'incorrect contacts length');
  assert(contacts.list[0].name === 'test', 'incorrect contact name');
  assert(contacts.list[0].address === 'A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW', 'incorrect contact address');

  await contacts.remove(0);

  assert(contacts.list.length === 0, 'incorrect contacts length');
  /// ContactController

  /// PaymentBuild
  console.log('start testing PaymentBuild');
  const operation0 = new PaymentBuild(
    100000000000,
    1000000000,
    'A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW',
    1000
  );
  const bytes0 = await operation0.bytes();
  const shouldBeBytes0 = '80d0dbc3f402e8070065f8808410080d020e07b6023a92cd68d4c275eb9e32c2f582fa5e5fd602aee88094ebdc03';

  assert(shouldBeBytes0 === utils.hex.fromBytes(bytes0), 'invalid bytes for Payment operation');
  /// PaymentBuild

  /// ExecuteSmartContractBuild
  console.log('start testing ExecuteSmartContractBuild');
  const contractBytesArray = utils.hex.toBytes('80d0dbc3f402e8070065f8808410080d020e07b6023a92cd68d4c275eb9e32c2f582fa5e5fd602aee88094ebdc03');
  const contractBase64 = fromByteArray(contractBytesArray);
  const bytes1 = await new ExecuteSmartContractBuild(
    100000000000,
    1000,
    contractBase64,
    10000000,
    10000000000000,
    10
  ).bytes();
  const shouldBeBytes1 = '80d0dbc3f402e8070380ade20480c0caf384a3020a2e80d0dbc3f402e8070065f8808410080d020e07b6023a92cd68d4c275eb9e32c2f582fa5e5fd602aee88094ebdc03';

  assert(shouldBeBytes1 === utils.hex.fromBytes(bytes1), 'invalid bytes res for ExecuteSmartContractBuild');
  /// ExecuteSmartContractBuild

  /// CallSmartContractBuild
  console.log('start testing CallSmartContractBuild');
  const bytes2 = await new CallSmartContractBuild(
    'test',
    'parameter',
    100000000000,
    1000,
    10000000,
    20000000000000,
    20000000000000,
    10,
    'A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW'
  ).bytes();
  const shouldBeBytes2 = '80d0dbc3f402e8070480ade204808095e789c604808095e789c6040a65f8808410080d020e07b6023a92cd68d4c275eb9e32c2f582fa5e5fd602aee8047465737409706172616d65746572';
  assert(shouldBeBytes2 === utils.hex.fromBytes(bytes2), 'invalid CallSmartContractBuild bytes');
  /// CallSmartContractBuild

  /// Sign and send transaction
  console.log('Sign and send transaction testing');
  await account.addAccountFromPrivateKey('S1nDemFSELvbn67dKZBKNNu9ZmmSxY5jvRZmSKcK9AXc3Am8i4V', 'lab');
  // const result = await provider.getAddresses(pair.base58);
  const [{ result }] = await provider.getNodesStatus();

  assert(Boolean(result), 'node is down');

  const expiryPeriod = Number(result?.next_slot.period) + settings.period.periodOffset;
  const bytesCompact = await new PaymentBuild(
    0,
    1,
    'A1muhtTqVkpzDJgwASYGya9XaY1GmVYfNeJwpobdmtDACTRTBpW',
    expiryPeriod
  ).bytes();
  const pari = await account.getKeyPair();
  const txBytes = Uint8Array.from([
    ...pari.pubKey,
    ...bytesCompact
  ]);
  const sigTest1 = await provider.sign(txBytes, pari);
  const txDataObject = await provider.getTransactionData(bytesCompact, sigTest1, pari.pubKey);
  const [tx] = await provider.sendTransaction(txDataObject);

  console.log(tx.result);

  assert(Boolean(tx.result), 'invalid resonse from node');

  const hash0 = tx.result ? tx.result[0] : '';

  setTimeout(async() => {
    const op = await provider.getOperations(hash0);

    console.log(op);
  }, 5000);

  /// Sign and send transaction
}());
