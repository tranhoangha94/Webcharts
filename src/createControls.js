import { select } from 'd3';
import controls from './controls/index';

export default function createControls(element = 'body', config = {}) {
  const thisControls = Object.create(controls);

  thisControls.div = element;

  thisControls.config = Object.create(config);
  thisControls.config.inputs = thisControls.config.inputs || [];

  thisControls.targets = [];

  if (config.location === 'bottom') {
    thisControls.wrap = select(element).append('div');
  }
  else {
    thisControls.wrap = select(element).insert('div', ':first-child');
  }

  return thisControls;
}
