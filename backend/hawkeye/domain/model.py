from cProfile import label
from pathlib import Path
from xml.sax.handler import property_declaration_handler
import numpy as np

class Project:
    """
    Domain model for projects
    
    "id" : int, project id
    "name" : str,project name
    """
    __slots__ = ["__id", "__name"]

    def __init__(self, id: int, name: str) -> None:
        self.__id = None
        self.__name = None

        if not isinstance(id, int):
            raise TypeError
        if id < 0:
            raise ValueError
        self.__id = id

        self.name = name

    @property
    def id(self) -> int:
        return self.__id

    @property
    def name(self) -> str:
        return self.__name

    @name.setter
    def name(self, value: str) -> None:
        if not isinstance(value, str):
            raise TypeError
        value = value.strip()
        if value == "":
            raise ValueError
        self.__name = value

class Image:
    """
    Domain model for images
    
    "project" : int, project id which the image belongs to
    "id" : int, image id
    "path" : Path, path when being uploaded
    "width" : int, width of the original image
    "height" : int, height of the original image
    "dset" : str, ["train", "test"] dataset
    "labelled" : bool, whether the image has been labelled or not
    """

    __slots__ = ["__project", "__id", "__path", "__width", "__height", "__dset", "__labelled"]

    def __init__(self, project: Project, id: int, path: Path, width: int, height: int, dset: str = "train", labelled: bool = False) -> None:
        self.__project = None
        self.__id = None
        self.__path = None
        self.__width = None
        self.__height = None
        self.__dset = None

        if not isinstance(project, Project):
            raise TypeError
        self.__project = project

        # if not isinstance(id, int):
        #     raise TypeError
        # if id < 0:
        #     raise ValueError
        self.__id = id

        if not isinstance(path, Path):
            raise TypeError
        self.__path = path
        if ".jpg" not in str(path):
            self.__path = self.__path / (str(id) + ".jpg")

        self.__width = width

        self.__height = height
        
        self.__dset = dset
        
        self.__labelled = labelled

    @property
    def project(self) -> Project:
        return self.__project

    @property
    def id(self) -> int:
        return self.__id

    @property
    def path(self) -> Path:
        return self.__path

    @property
    def width(self) -> int:
        return self.__width

    @property
    def height(self) -> int:
        return self.__height
    
    @property
    def dset(self) -> str:
        return self.__dset
    
    @property
    def labelled(self) -> bool:
        return self.__labelled


class Label:
    """
    Domain model for labels/classes
    
    id : int, label id
    text : str, label
    """

    __slots__ = ["__project", "__id", "__text"]

    def __init__(self, project: Project, id: int, text: str) -> None:
        self.__project = None
        self.__id = None
        self.__text = None

        if not isinstance(project, Project):
            raise TypeError
        self.__project = project

        if not isinstance(id, int):
            raise TypeError
        if id < 0:
            raise ValueError
        self.__id = id

        self.text = text

    @property
    def project(self) -> Project:
        return self.__project

    @property
    def id(self) -> int:
        return self.__id

    @property
    def text(self) -> str:
        return self.__text

    @text.setter
    def text(self, value: str) -> None:
        if not isinstance(value, str):
            raise TypeError
        value = value.strip().title()
        if value == "":
            raise ValueError
        self.__text = value


class Region:
    """
    Domain model for regions/boxes
    
    image : Image, which image the region belongs to
    label : Label, its corresponding label
    id : int, region id
    x0 , y0 : float, relative left-top corner of the box
    x1, y1 : float, relative right-bottom corner of the box
    type : str, ["human", "pred"] "human" indicates it is human-annotated and "pred" indicates it is prediction from the model
    conf : float, confidence from the model. Only valid when type == "pred" 
    
    """

    __slots__ = ["__image", "__label", "__id", "__x0", "__y0", "__x1", "__y1", "__type","__conf"]

    def __init__(self, image: Image, label: Label, id: int, x0: float, y0: float, x1: float, y1: float, type="human", conf=1.0) -> None:
        self.__image = None
        self.__label = None
        self.__id = None
        self.__x0 = None
        self.__y0 = None
        self.__x1 = None
        self.__y1 = None
        self.__type=None
        self.__conf=None
        
        if not isinstance(image, Image):
            raise TypeError
        self.__image = image

        self.label = label
        if not isinstance(id, int):
            raise TypeError
        if id < 0:
            raise ValueError
        self.__id = id
        self.x1 = x1
        self.y1 = y1
        self.x0 = x0
        self.y0 = y0
        self.type=type
        self.conf=conf

    @property
    def image(self) -> Image:
        return self.__image

    @property
    def label(self) -> Label:
        return self.__label

    @label.setter
    def label(self, value: Label) -> None:
        if not isinstance(value, Label):
            raise TypeError
        self.__label = value

    @property
    def id(self) -> int:
        return self.__id

    @property
    def x0(self) -> int:
        return self.__x0

    @x0.setter
    def x0(self, value: float) -> None:
        if isinstance(value, np.float32):
            value=float(value)
        if not isinstance(value, float):
            raise TypeError
        if value < 0 or value > 1:
            raise ValueError
        self.__x0 = value

    @property
    def y0(self) -> int:
        return self.__y0

    @y0.setter
    def y0(self, value: float) -> None:
        if isinstance(value, np.float32):
            value=float(value)
        if not isinstance(value, float):
            raise TypeError
        if value < 0 or value > 1:
            raise ValueError
        self.__y0 = value

    @property
    def x1(self) -> int:
        return self.__x1

    @x1.setter
    def x1(self, value: float) -> None:
        if isinstance(value, np.float32):
            value=float(value)
        if not isinstance(value, float):
            raise TypeError
        if value < 0 or value > 1:
            raise ValueError
        self.__x1 = value

    @property
    def y1(self) -> int:
        return self.__y1

    @y1.setter
    def y1(self, value: float) -> None:
        if isinstance(value, np.float32):
            value=float(value)
        if not isinstance(value, float):
            raise TypeError
        if value < 0 or value > 1:
            raise ValueError
        self.__y1 = value
        
    @property
    def type(self) -> str:
        return self.__type
    
    @type.setter
    def type(self, value: str) -> None:
        if not isinstance(value, str):
            raise TypeError

        self.__type = value
    
    @property
    def conf(self) -> float:
        return self.__conf
    
    @conf.setter
    def conf(self, value: float) -> None:
        if isinstance(value, np.float32):
            value=float(value)
        if not isinstance(value, float):
            raise TypeError
        if value < 0 or value > 1:
            raise ValueError
        self.__conf = value