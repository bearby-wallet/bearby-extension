import { Guard, INCORRECT_PASSWORD } from './guard';
import { HDKey, MnemonicController } from 'lib/bip39';
import { assert } from 'lib/assert';
import { BrowserStorage } from 'lib/storage';
import { utils } from 'aes-js';
import { base58ToBinary, binaryToBase58 } from 'lib/crypto/base58';
import { base58Encode, base58Decode, addressFromPublicKey, base58PrivateKeyToBytes, publicKeyBytesFromPrivateKey } from 'lib/address';
import { Buffer } from 'buffer';
import { VarintDecode, VarintEncode } from 'lib/varint';
import { VERSION_NUMBER } from 'config/common';


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
  const words = mnemonic.entropyToMnemonic(utils.hex.toBytes(entropy));
  const password = 'test';

  assert(wordsSHouldBe === words, 'words are different');

  guard.setupVault(words, password);

  assert(utils.hex.fromBytes(guard.seed) === seedShouldBe, 'seed bytes are different');
  assert(guard.isEnable, 'guard.isEnable is false');
  assert(guard.isReady, 'guard.isReady is false');
  assert(guard.seed.length === 64, 'seed length should be 64');

  await guard.logout();

  assert(!guard.isEnable, 'guard.isEnable is true');
  assert(guard.isReady, 'guard.isReady is false');

  try {
    guard.unlock('wrong password');
  } catch (err) {
    assert((err as Error).message === INCORRECT_PASSWORD, 'incorrect error');
  }

  assert(!guard.isEnable, 'guard.isEnable is true');
  assert(guard.isReady, 'guard.isReady is false');

  guard.unlock(password);

  assert(guard.isEnable, 'guard.isEnable is false');
  assert(guard.isReady, 'guard.isReady is false');
  /// guard

  console.log('start testing HDKey');

  /// HDKey
  function testKeys(index: number) {
    const hdKey = new HDKey().fromMasterSeed(guard.seed);
    const childKey = hdKey.derive(mnemonic.getPath(index));
    const { pubKey, privKey, base58 } = childKey.keyPair;

    return {
      privateKey: utils.hex.fromBytes(privKey),
      publicKey: utils.hex.fromBytes(pubKey),
      base58
    };
  }

  const res0 = testKeys(0);

  assert('105ddfe5b4b01848ebd622b4dc6f4b352169bd2b1d8cace8fbc75570534b7b27' === res0.privateKey, 'Incorrect PrivateKey');
  assert('02dca24e533b4f2bf056f5d28514203097afdace1f1944b2fd1560debdebe188cd' === res0.publicKey, 'Incorrect PublicKey');
  assert('A12sh8pXSEAsaKZQP95BxhSDsiM8zgqL7otsENXhNdype6ebBGUq' === res0.base58, 'does not math address base58');

  const res1 = testKeys(1);

  assert('c6dd0714f63c7c781b83a9511041c369b8340cf2dc53de3395b76f268cae02d0' === res1.privateKey, 'Incorrect PrivateKey');
  assert('038f0953535041b7dba7c7965f589ba1f9b90c090b82eac8a3bddcf0aa0cd9b047' === res1.publicKey, 'Incorrect PublicKey');
  assert('A17oyhvP5h96mvto2nJvbRyv7nfY7CbNS2kavps2mFiPMS5sxLt' === res1.base58, 'does not math address base58');
  const res2 = testKeys(55);

  assert('5088f231d7930cf19677a368d96c62d85138f520466eb07f8390a464c661acf1' === res2.privateKey, 'Incorrect PrivateKey');
  assert('035b220764f92171c7210327856b5b8025ad3e79cc995f4ecec838d0acd7f44fa0' === res2.publicKey, 'Incorrect PublicKey');
  assert('A12HmLYCZeJdhdiGdntpyYzrxWwzHY4R4sRQS2UooLRi79Dr48T2' === res2.base58, 'does not math address base58');
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
  const testContent = Buffer.from('005b6ae2595c52f7ea02257582a4beacff65bc0753111ae5cbbb3eaacf18ad3abd', 'hex');
  const address0 = base58Encode(testContent);
  const test1Content = Buffer.from('00b6cda5e8b5995ffb2710839c74989c0b69249de330aced521f3c454cdef0f12c', 'hex');
  const address1 = base58Encode(test1Content);

  assert('1hG8zRRJF2v3qkwyZ2fnHJeaVw9uT4huCkwcWJVvgypEz6D2aR' === address0, 'does not math with right address');
  assert('12PWTzCKkkE9P5Supt3Fkb4QVZ3cdfB281TGaup7Nv1DY12a6F1' === address1, 'does not math with right address');

  assert(base58Decode(address0).toString('hex') === testContent.toString('hex'), 'does not math with right address bytes');
  assert(base58Decode(address1).toString('hex') === test1Content.toString('hex'), 'does not math with right address bytes');
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
  const privateKeyBytes =  base58PrivateKeyToBytes('S12tw4YShWtjWfy7YBQ9Erbcg6DYgWnMgb5hGjn9hAKGtgrLNa7L');

  assert(Buffer.from(privateKeyBytes).toString('hex') === 'f99d3fac98a9adb3b622500b50c020b05efe01408249aab3a25c8839f3c61b26', 'buf privatekeys is not equal');

  const pubKey = publicKeyBytesFromPrivateKey(privateKeyBytes);
  const address = addressFromPublicKey(pubKey);

  assert(pubKey.toString('hex') === '0378d75c840a3ae70a78d7b59c17cbd2989a070710ae7fc29fcb979866ad9088e8', 'pubKey is not equal');
  assert(address === 'A1naJqhUv1n3pz9Gvvza1JnjT79SC9b4boaF1SZ3jobpx2sdeDh', 'address is not equal');
  // addresses utils
}());
