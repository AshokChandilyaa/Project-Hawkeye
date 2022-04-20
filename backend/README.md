# Introduction

This directory contains code for running Flask server, including database, domain model and machine learning model for detecting structural defects from drone footage.

# How to set up environment

1. Install [Python](https://www.python.org/downloads/) To set up identical environment, Python 3.9.9 is recommended.

2. If not using GPU, go to 5. Install appropriate version of [CUDA](https://developer.nvidia.com/cuda-downloads), depending on the GPU device.

3. Find appropriate version of [Pytorch](https://download.pytorch.org/whl/torch_stable.html), depending on the OS and CUDA version. Minimum version required is 1.10.0. In the command line, run: 

* ### `pip install (link_to_download)`

If SSL error, try downloading the wheel file locally and run:

* ### `pip install (path_to_file)`

4. Find appropriate version of [TorchVision](https://download.pytorch.org/whl/torch_stable.html), depending on the OS and CUDA version. Minimum version required is 0.11.0. In the command line, run: 

* ### `pip install (link_to_download)`

If SSL error, try downloading the wheel file locally and run:

* ### `pip install (path_to_file)`

5. ### `pip install -r requirements.txt`

6. ### `python server.py`

# Source code

### [server.py](server.py)
Starts the backend server process that listens to requests and executes the relevant code files.

### [hawkeye/domain](hawkeye/domain)
Contains domain models including projects, images, regions and labels

### [hawkeye/models](hawkeye/models)
Contains pytorch-based deep learning model for object detection, training script, prediction script and util functions such as metrics

### [hawkeye/repositories](hawkeye/repositories)
Contains database

### [hawkeye/routes](hawkeye/routes)
Contains backend APIs