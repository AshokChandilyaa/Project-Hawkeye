import RegionInfo from './RegionInfo.js';

export default class PredictionInfo extends RegionInfo {

    constructor(x0, y0, x1, y1, label, conf, zIndex) {
        super(x0, y0, x1, y1, label, zIndex);
        this.conf = conf;
    }

}