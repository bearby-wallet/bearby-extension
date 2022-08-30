import { Guard, INCORRECT_PASSWORD } from './guard';
import { HDKey, MnemonicController } from 'lib/bip39';
import { assert } from 'lib/assert';
import { BrowserStorage } from 'lib/storage';
import { utils } from 'aes-js';
import { base58ToBinary, binaryToBase58 } from 'lib/crypto/base58';
import { base58Encode, base58Decode, addressFromPublicKey, publicKeyBytesFromPrivateKey } from 'lib/address';
import { Buffer } from 'buffer';
import { VarintDecode, VarintEncode } from 'lib/varint';
import { VERSION_NUMBER } from 'config/common';
import { AccountController } from 'core/background/account/account';
import { randomBytes } from 'lib/crypto/random';
import { AccountTypes } from 'config/account-type';
import { ACCOUNT_MUST_UNIQUE, INCORRECT_ACCOUNT } from './account/errors';
import { privateKeyBytesToBase58, base58PrivateKeyToBytes } from 'lib/validator';


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
  const testContent = Buffer.from('5b6ae2595c52f7ea02257582a4beacff65bc0753111ae5cbbb3eaacf18ad3abd', 'hex');
  const address0 = await base58Encode(testContent);
  const test1Content = Buffer.from('b6cda5e8b5995ffb2710839c74989c0b69249de330aced521f3c454cdef0f12c', 'hex');
  const address1 = await base58Encode(test1Content);

  assert('hG8zRRJF2v3qkwyZ2fnHJeaVw9uT4huCkwcWJVvgypEwMNHVC' === address0, 'does not math with right address');
  assert('2PWTzCKkkE9P5Supt3Fkb4QVZ3cdfB281TGaup7Nv1DY1is9fL' === address1, 'does not math with right address');

  assert(utils.hex.fromBytes(await base58Decode(address0)) === testContent.toString('hex'), 'does not math with right address bytes');
  assert(utils.hex.fromBytes(await base58Decode(address1)) === test1Content.toString('hex'), 'does not math with right address bytes');
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

  const version = Buffer.from(new VarintEncode().encode(VERSION_NUMBER));

  assert(version.toString('hex') === '00', 'version encoded is not equal version');

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


}());
