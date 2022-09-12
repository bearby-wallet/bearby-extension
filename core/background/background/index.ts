import { BackgroundState } from './state';
import { startBackground } from './handler';


(function(){
  const core = new BackgroundState();

  startBackground(core);
}());
