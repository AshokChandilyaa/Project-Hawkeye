export default class MathUtils {

    static iou(r1, r2) {

        if (r1.x0 > r2.x1 || r2.x0 > r1.x1 || r1.y0 > r2.y1 || r1.y1 < r2.y0) {
            // not overlapping
            return 0;
        }

        const xA = Math.max(r1.x0, r2.x0)
        const yA = Math.max(r1.y0, r2.y0)
        const xB = Math.min(r1.x1, r2.x1)
        const yB = Math.min(r1.y1, r2.y1)
    
        const interArea = (xB - xA) * (yB - yA)
    
        const r1Area = (r1.x1 - r1.x0) * (r1.y1 - r1.y0)
        const r2Area = (r2.x1 - r2.x0) * (r2.y1 - r2.y0)

        return interArea / (r1Area + r2Area - interArea)

    }

}