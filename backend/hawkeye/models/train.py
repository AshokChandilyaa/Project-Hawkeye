import torch
import argparse
import pytorch_lightning as pl
from pytorch_lightning import Trainer
from pytorch_lightning.callbacks import ModelCheckpoint, EarlyStopping
from pytorch_lightning.utilities import rank_zero_info

from utils.dataloader import DetectionDataLoader
import model


class LoggingCallback(pl.Callback):
    """
    Callback for printing results in the console
    """
    def on_validation_end(self, trainer: "pl.Trainer", pl_module: "pl.LightningModule") -> None:
        rank_zero_info("*** Validation results ***")
        metrics=trainer.callback_metrics
        
        for key in sorted(metrics):
            if key not in ["log", "progress_bar"]:
                rank_zero_info("{} = {}\n".format(key, str(metrics[key].item())))
                
    def on_test_end(self, trainer: "pl.Trainer", pl_module: "pl.LightningModule") -> None:
        rank_zero_info("\n*** Test results ***")
        metrics=trainer.callback_metrics
        
        for key in sorted(metrics):
            if key not in ["log", "progress_bar"]:
                rank_zero_info("{} = {}\n".format(key, str(metrics[key].item())))

                      

def train(train_json, val_json, num_classes, max_epochs=1, batch_size=1, resume_ckpt=None, device=torch.device("cpu")):
    """
    Pytorch-lightning script for training
    
    train_json : str, path to json file that contains training dataset
    val_json : str, path to json file that contains validation dataset
    num_classes : int, number of classes
    max_epochs : int, maximum number of epochs
    batch_size : int, size of each batch
    resume_ckpt : str, path to the checkpoint file. If None, train from scratch
    device : torch.device, device to use
    """
    dm=DetectionDataLoader(train_json, val_json, batch_size=batch_size, device=device)
    model_trained=model.DroneDetector(num_classes=num_classes, device=device, trainable_backbone_layers=1)  # 0 or 1 trainbale backbone layers recommended  
    model_trained.to(device)
    if device!=torch.device("cpu"):
        gpus=1
    else:
        gpus=None
        
    logging_callback=LoggingCallback()
    val_check_interval=0.5
    
    # Checkpoint directory, policy and file name
    ckpt=ModelCheckpoint("data/models/1/", save_top_k=1, monitor="val_map", filename="{val_map:.3f}--{val_map_small:.3f}--{val_map_medium:.3f}--{val_map_large:.3f}--{val_mar_1:.3f}--{val_mar_small:.3f}--{val_mar_medium:.3f}--{val_mar_large:.3f}", mode="max")
    
    # Early stopping callback to prevent overfitting
    early_stopping=EarlyStopping("val_map",patience=2, mode="max")
    
    # Instantiate Pytorch-lightning Trainer class
    trainer=Trainer(max_epochs=max_epochs, gradient_clip_val=5.0,callbacks=[logging_callback, ckpt, early_stopping],
                    val_check_interval=val_check_interval, num_sanity_val_steps=2
                    ,gpus=gpus)
    
    # Run training
    trainer.fit(model_trained,datamodule=dm, ckpt_path=resume_ckpt)
    
def add_args(parser):
    parser.add_argument(
        "--max_epochs",
        default=1,
        type=int
    )
    
    parser.add_argument(
        "--batch_size",
        default=1,
        type=int
    )    
    
    parser.add_argument(
        "--train_path",
        required=True,
        type=str
    )
    
    parser.add_argument(
        "--val_path",
        required=True,
        type=str
    )
    
    parser.add_argument(
        "--resume_ckpt",
        required=False,
        default=None,
        type=str
    )
    
    parser.add_argument(
        "--num_classes",
        required=True,
        type=int
    )
        
    return parser

    

if __name__=="__main__":
    
    parser=argparse.ArgumentParser()
    parser=add_args(parser)
    args=parser.parse_args()
    device=torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train(args.train_path, args.val_path, args.num_classes, max_epochs=args.max_epochs, batch_size=args.batch_size, resume_ckpt= args.resume_ckpt, device=device)
    
    # python train.py --train_json ./train_file.json --val_json ./val_file.json --max_epochs 5 --batch_size 1 --resume_ckpt ckpt/last_training.ckpt