from pytorch_lightning import LightningDataModule
from torch.utils.data import DataLoader
from torch import device

from .dataset import DetectionDataset

class DetectionDataLoader(LightningDataModule):
    """
    LightningDataModule for loading dataset
    train : str, path to json file that contains training data
    val : str, path to json file that contains validation data
    batch_size : int, batch size
    device : torch.device, device to use
    """
    def __init__(self, train, val, batch_size=1, device=device("cpu")):
        super().__init__()
        self.train=train
        self.val=val
        self.batch_size=batch_size
        self.device=device
        self.training_transform=None    # Can be customised
        self.val_transform=None         # Can be customised

    def setup(self, stage="fit"):
        self.train_dataset=DetectionDataset(self.train, transform=self.training_transform, device=self.device)
        self.val_dataset=DetectionDataset(self.val, transform=self.val_transform, device=self.device)
        
    
    def train_dataloader(self):
        return DataLoader(self.train_dataset, batch_size=self.batch_size, shuffle=True, num_workers=4, collate_fn=self.train_dataset.collate_fn)
    
    def val_dataloader(self):
        return DataLoader(self.val_dataset, batch_size=self.batch_size, shuffle=False, num_workers=4, collate_fn=self.val_dataset.collate_fn)