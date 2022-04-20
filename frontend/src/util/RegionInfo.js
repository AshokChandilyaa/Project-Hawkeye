export default class RegionInfo {

    constructor(x0, y0, x1, y1, label, zIndex,id) {

        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.label = label || '';
        this.zIndex = zIndex || 0;
        this.label_id= label;
        this.id=id

    }

    static fromPrediction(pred) {
        return new RegionInfo(pred.x0, pred.y0, pred.x1, pred.y1, pred.label, pred.zIndex, pred.id);
    }

}