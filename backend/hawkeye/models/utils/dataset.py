import torch
from torch.utils.data import Dataset
import cv2
import json

class DetectionDataset(Dataset):
    """
    Inherits Pytorch Dataset class
    filepath : str, path to json file that contains dataset
    transform: Albumentations.Compose, list of transforms to apply to the images
    device : torch.device, device to use
    
    __getitem__ and __len__ must be implemented
    
    collate_fn() forms a batch of data that can be fed into the model from individual output from __getitem__
    """
    def __init__(self, filepath, transform=None, device=torch.device("cpu")):
        f=open(filepath, "r")
        self.json=json.load(f)
        f.close()
        self.transform=transform
        self.device=device    
    
    def __getitem__(self, index):
        meta=self.json[index]
        img=cv2.cvtColor(cv2.imread(meta["image_src"]), cv2.COLOR_BGR2RGB)/255.0
        height=img.shape[0]
        width=img.shape[1]
        labels=meta["labels"]
        boxes=meta["bboxes"]
        boxes=[[box[0]*width, box[1]*height, box[2]*width, box[3]*height] for box in boxes]
        boxes_concat=[box+[l] for box, l in zip(boxes, labels)]   
        imgs=[]
        targets=[]
        imgs=torch.as_tensor(img.transpose(2,0,1), dtype=torch.float32).unsqueeze(0)
        if len(boxes)>0:                    
            targets=targets+[{'labels':torch.as_tensor([t[4] for t in boxes_concat], dtype=torch.int64), 'boxes':torch.as_tensor([t[:4] for t in boxes_concat], dtype=torch.float16)}]
        else:
            targets=targets+[{'labels':torch.empty(0,dtype=torch.int64), 'boxes':torch.empty(0,4,dtype=torch.float16)}]

        return imgs, targets
    
    def __len__(self):
        return len(self.json)
    
    def collate_fn(self, batch):
        """
        Since each image may have a different number of objects, we need a collate function (to be passed to the DataLoader).
        This describes how to combine these tensors of different sizes. We use lists.
        Note: this need not be defined in this Class, can be standalone.
        :param batch: an iterable of N sets from __getitem__()
        :return: a tensor of images, lists of varying-size tensors of bounding boxes, labels, and difficulties
        """
        images = list()
        boxes = list()

        for b in batch:
            images.extend(b[0])
            boxes.extend(b[1])

        return images, boxes  # tensor (N, 3, 300, 300), 3 lists of N tensors each
    
