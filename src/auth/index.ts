import { Auth } from '../types/auth';
import MsPowerBi from './msPowerBi';
import NoAuth from './noAuth';

/**
 * Please register new auths if needed here
 * #TODO: validate if this is a nice valid solution
 */
export default (name: string): Auth => {
  switch (name) {
    case 'msPowerBi':
      return new MsPowerBi();

    default:
      return new NoAuth();
  }
};