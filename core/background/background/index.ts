import { BackgroundState } from './state';
import { startBackground } from './handler';


(async function(){
  const core = new BackgroundState();

  await core.sync();

  startBackground(core);
}());
