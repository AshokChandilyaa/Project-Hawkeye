import subprocess
from pathlib import Path

from flask import Blueprint, Response, jsonify, current_app
import json
import numpy as np
import glob
import os

from hawkeye.repositories.databases import DataBase

train = Blueprint("train", __name__)
db = DataBase()
@train.get("/projects/<project_id>/train")
def train_all(project_id: int) -> None:
    if not project_id.isdigit():
        return Response(status=400)
    
    project_id = int(project_id)
    checkpoints_path=glob.glob(f"data/models/{project_id}/*.ckpt")
    if len(checkpoints_path) == 0:
        checkpoint_path = ""    # Train from scratch
    else:
        checkpoint_path=f"--resume_ckpt {checkpoints_path[0]}"  # Resume checkpoint
    try:    
        images=db.get_labelled_images(project_id)
        labels=db.get_classes(project_id)
    except:
        return Response(status=400)

    lkup={} # Lookup table for labels
    for i, label in enumerate(labels):
        lkup[label[1]]=i+1
    num_classes=len(labels)+1 # Including background class
    
    # Create temporary json file for training
    f_train=[]
    f_val=[]
    train_split=0.8
    np.random.seed(42)
    for image in images:
        regions = db.get_regions(image)
        if np.random.rand()<train_split:
            f_train=f_train+[{"image_src":str(Path(current_app.config["IMAGE_PATH"]).absolute() / (image + ".jpg")), "bboxes":[[region[3], region[5], region[4], region[6]] for region in regions], "labels":[lkup[region[2]] for region in regions]}]
        else:
            f_val=f_val+[{"image_src":str(Path(current_app.config["IMAGE_PATH"]).absolute() / (image + ".jpg")), "bboxes":[[region[3], region[5], region[4], region[6]] for region in regions], "labels":[lkup[region[2]] for region in regions]}]
        
    with open("./data/temp/train.json","w") as j_train, open("./data/temp/val.json" ,"w") as j_val:
        json.dump(f_train, j_train)
        json.dump(f_val, j_val)
    
    # Train
    subprocess.call(
        f"python ./hawkeye/models/train.py --max_epochs 5 --batch_size 1 --train_path ./data/temp/train.json --val_path ./data/temp/val.json --num_classes {num_classes} {checkpoint_path}"
    )
    if len(glob.glob(f"data/models/{project_id}/*.ckpt")) > 1: 
        os.remove(checkpoints_path[0])  # Only leave one checkpoint
        
    # Delete outdated predictions
    db.del_predictions(project_id)
    return Response(status=200)

@train.get("/projects/<project_id>/train/metrics")
def get_metrics(project_id: int) -> None:
    checkpoints_path=glob.glob(f"data/models/{project_id}/*.ckpt")
    if len(checkpoints_path)==0:
        return jsonify({"model":False})
    # Parse metrics from file name
    
    fname=checkpoints_path[0].split("/")[-1]
    metrics=fname.split("--")
    output={}
    output["name"]="Default model"
    output["model"]=True
    output["mAP"]=100 * float(metrics[0].split("=")[-1])
    output["mAR"]=100 * float(metrics[4].split("=")[-1])
    return jsonify(output)
    