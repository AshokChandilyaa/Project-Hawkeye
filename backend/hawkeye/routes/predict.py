from pathlib import Path

from flask import Blueprint, jsonify, Response, current_app
import glob
import cv2
import torch

from hawkeye.models import model
from hawkeye.domain.model import Region
from hawkeye.models.utils.metric import filter_boxes
from hawkeye.repositories.databases import DataBase

predict = Blueprint("predict", __name__)
device=torch.device("cuda" if torch.cuda.is_available() else "cpu")
db = DataBase()

@predict.get("/projects/<project_id>/predict/<image_id>")
def predict_image(project_id:int, image_id: int):
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    existing_predictions = db.get_predictions(image_id)
    if len(existing_predictions) > 0:
        # If there is already existing predictions, do not run the model
        return jsonify(regions_to_dict(existing_predictions))
    try:
        classes = db.get_classes(project_id)
    except:
        return Response(status=400)
    
    image_path = Path(current_app.config["IMAGE_PATH"]).absolute() / (image_id + ".jpg")
    num_classes=len(classes)+1  # Including background class
    detector=model.DroneDetector(num_classes=num_classes, device=device)
    try:
        checkpoint_path=glob.glob(f"data/models/{project_id}/*.ckpt")[0]
    except IndexError:
        # If there is no trained models, do not return anything
        return jsonify([])
    
    detector=detector.load_from_checkpoint(checkpoint_path=checkpoint_path, num_classes=num_classes)    # Instantiate the model from checkpoint
    img=cv2.cvtColor(cv2.imread(str(image_path)),cv2.COLOR_BGR2RGB)/255.0   # Read the image and convert from uint8 to float
    height, width, _ = img.shape
    img=torch.Tensor(img.transpose(2,0,1)).unsqueeze(0) # (H,W,C) to (C,H,W)
    
    detector.eval()
    with torch.no_grad():
        
        preds=detector(img) # Model forward
        boxes_filtered=[filter_boxes(boxes=pred["boxes"],scores=pred["scores"], labels=pred["labels"], confidence_threshold=0.1, iou_threshold=0.3) for pred in preds]  # Filter boxes using NMS
        
        boxes=boxes_filtered[0]["boxes"].cpu().detach().numpy()
        labels=boxes_filtered[0]["labels"].cpu().detach().numpy()
        scores=boxes_filtered[0]["scores"].cpu().detach().numpy()
                
    
    predictions = [{"label":int(classes[labels[i]-1][0]), "x0": float(boxes[i][0]/width), "y0": float(boxes[i][1]/height),
                    "x1": float(boxes[i][2]/width), "y1": float(boxes[i][3]/height), "conf": float(scores[i])} for i in range(len(labels))]
    db.add_predictions(project_id, image_id, predictions)
    predictions = [{"label":classes[labels[i]-1][1], "x0": float(boxes[i][0]/width), "y0": float(boxes[i][1]/height),
                    "x1": float(boxes[i][2]/width), "y1": float(boxes[i][3]/height), "conf": float(scores[i])} for i in range(len(labels))]
    
    return jsonify(predictions)

def region_to_dict(region: Region) -> dict:
    return {
        "label": region[2],
        "id": region[0],
        "x0": region[3],
        "y0": region[5],
        "x1": region[4],
        "y1": region[6],
        "type": region[7],
        "conf":region[8]
    }


def regions_to_dict(regions: list[Region]) -> list[dict]:
    return [region_to_dict(region) for region in regions]