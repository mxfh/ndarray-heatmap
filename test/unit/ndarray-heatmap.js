import { heatmap } from '../../src/ndarray-heatmap';
import colorbrewer from 'colorbrewer';
import pack from 'ndarray-pack';
import unpack from 'ndarray-unpack';

describe('heatmap', () => {
  let hm;

  beforeEach(() => {
    hm = heatmap();
  });

  it('should accept plain JS array', () => {
    hm.data([[1, 2], [3, 4]]);
    expect(unpack(hm.data())).to.deep.equal([[1, 2], [3, 4]]);
  });

  it('should provide domain accessor', () => {
    // default value
    expect(hm.domain()).to.equal(null);

    // setter and getter
    expect(hm.domain([0, 10])).to.equal(hm);
    expect(hm.domain()).to.deep.equal([0, 10]);
  });

  it('should provide data accessor', () => {
    // default value
    expect(unpack(hm.data())).to.deep.equal([[0]]);

    // setter and getter
    expect(hm.data(pack([[1, 2], [3, 4]]))).to.equal(hm);
    expect(unpack(hm.data())).to.deep.equal([[1, 2], [3, 4]]);
  });

  it('should provide colorSteps accessor', () => {
    // default value
    expect(hm.colorSteps()).to.equal(256);

    // setter and getter
    expect(hm.colorSteps(10)).to.equal(hm);
    expect(hm.colorSteps()).to.equal(10);
  });

  it('should provide colorRange accessor', () => {
    // default value
    expect(hm.colorRange()).to.deep.equal(colorbrewer.YlGnBu[5]);

    // setter and getter
    expect(hm.colorRange(['#FF0000', '#00FFFF'])).to.equal(hm);
    expect(hm.colorRange()).to.deep.equal(['#FF0000', '#00FFFF']);
  });

  it('should reject non-2d arrays', () => {
    let flat = pack([1])
    let threed = pack([[[1]]])

    expect(() => hm.data(flat)).to.throw(/Invalid rank/);
    expect(() => hm.data(threed)).to.throw(/Invalid rank/);
  });

  if(typeof window !== 'undefined') {
    it('should use shape[0] as a height', () => {
      hm.data(pack([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]));

      let canvas = hm();
      expect(canvas.width).to.equal(4);
      expect(canvas.height).to.equal(3);
    });
  }
});

