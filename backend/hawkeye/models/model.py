import torch
from pytorch_lightning import LightningModule
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchmetrics.detection.map import MAP

try:
    from hawkeye.models.utils.metric import filter_boxes
    
except ModuleNotFoundError:
    from utils.metric import filter_boxes



class DroneDetector(LightningModule):
    """
    Inherits pytorch-lightning's LightningModule
    num_classes : int, number of classes
    device : torch.device, device to use
    trainable_backbone_layers : int, [0,1,2,3,4,5] 0 or 1 recommended
    
    For the List of required hooks and good-to-have hooks, refer to official documentation
    """
    def __init__(self, num_classes, device=torch.device("cpu"), trainable_backbone_layers=0):
        super().__init__()
        self.model=fasterrcnn_resnet50_fpn(pretrained_backbone=True, num_classes=num_classes,
                                           trainable_backbone_layers=trainable_backbone_layers)
        self.gpu=device
        self.num_classes=num_classes

    def forward(self, img):
        """
        Expects list[Tensor(C,H,W)] or Tensor(B,C,H,W)
        
        Outputs List[Dict("boxes": Tensor(N,4), "scores": Tensor(N), "labels": Tensor(N))]
        """
        return self.model.forward(img)


    def loss(self, img, target):
        """
        Expects list[Tensor(C,H,W)] or Tensor(B,C,H,W) for img
        Expects List[Dict("boxes": Tensor(N,4), "scores": Tensor(N), "labels": Tensor(N))] for target
        
        Outputs Dict("loss_*":Tensor(1))
        """
        return self.model(img, target)


    def configure_optimizers(self):
        opt=torch.optim.AdamW(self.parameters(),lr=0.001)
        lr_scheduler=torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer=opt,patience=200, verbose=True)
        return {"optimizer":opt,"lr_scheduler":{"scheduler":lr_scheduler,"monitor":"train_loss","interval":"step","frequency":1}}



    def training_step(self, batch,batch_idx):
        imgs, targets=batch
        l=self.loss(imgs,targets)
        l["loss"]=sum(v for v in l.values()) + l["loss_box_reg"] + l["loss_rpn_box_reg"]   # Or any linear combination of losses
        
        for k,v in l.items():
            self.log(f"train_{k}", v)

        return l["loss"]

    def validation_step(self, batch,batch_idx):
        imgs, targets=batch
        preds=self.model.forward(imgs, targets)
        boxes_filtered=[filter_boxes(boxes=pred["boxes"],scores=pred["scores"], labels=pred["labels"], confidence_threshold=0.0, iou_threshold=0.2, device=self.device) for pred in preds]
            
        return boxes_filtered, targets

    def validation_epoch_end(self, outputs) -> None:
        # Triggered when every round of validation finishes
        
        metric=MAP(box_format="xyxy", class_metrics=True)
        for output in outputs:
            pred=output[0]
            target=output[1]
            assert len(pred) == len(target)
            for i in range(len(output[0])):
                if len(pred[i]["boxes"])==0 or len(target[i]["boxes"])==0:
                    continue
                p=[dict(boxes=pred[i]["boxes"].cpu(),
                        scores=pred[i]["scores"].cpu(),
                        labels=pred[i]["labels"].cpu())]
                t=[dict(boxes=target[i]["boxes"].cpu(),
                        labels=target[i]["labels"].cpu())]
                metric.update(p,t)
        
        eval=metric.compute()
        for k,v in eval.items():
            self.log(f"val_{k}",v)