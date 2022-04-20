from pathlib import Path
from struct import unpack

from flask import Blueprint, Response, jsonify, request, send_file, current_app
from werkzeug.datastructures import FileStorage

from hawkeye.domain.model import Image
from hawkeye.repositories.databases import DataBase

images = Blueprint("images", __name__)
db = DataBase()

#
@images.get("/projects/<project_id>/images")
def read_images_by_project(project_id: str) -> None:
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    try:
        images = db.get_project_images(project_id)
    except:
        return Response(status=404)
    return jsonify(images_to_dict(images))


@images.post("/projects/<project_id>/images")
def create_image(project_id: str) -> None:
    if "file" not in request.files:
        return Response(status=400)
    file = request.files["file"]
    if "." not in file.filename or file.filename[file.filename.rindex(".")+1:].lower() not in ["jpg", "jpeg"]:
        return Response(status=400)
    path = Path(current_app.config["IMAGE_PATH"]).absolute()
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    image_id = db.read_next_image_id()
    width, height = get_dimensions(file)
    try:
        file.save(path / (image_id + ".jpg"))
        file.close()
    except IOError:
        return Response(status=400)
    try:
        db.add_image(image_id,width, height, project_id, "train", 0)
    except:
        return Response(status=404)

    response = Response(status=201)
    return response

@images.post("/projects/<project_id>/images/test")
def create_test_image(project_id: str) -> None:
    if "file" not in request.files:
        return Response(status=400)
    file = request.files["file"]
    if "." not in file.filename or file.filename[file.filename.rindex(".")+1:].lower() not in ["jpg", "jpeg"]:
        return Response(status=400)
    path = Path(current_app.config["IMAGE_PATH"]).absolute()
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    image_id = db.read_next_image_id()
    width, height = get_dimensions(file)
    try:
        file.save(path / (image_id + ".jpg"))
        file.close()
    except IOError:
        return Response(status=400)
    try:
        db.add_image(image_id,width, height, project_id, "test", 0)
    except:
        return Response(status=404)

    response = Response(status=201)
    return response

@images.post("/projects/<project_id>/images/<id>/confirm")
def move_to_training_set(project_id: str, id: str) -> None:
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)

    db.confirm_regions(id)
    
    return Response(status=200)


@images.get("/projects/<project_id>/images/<id>")
def read_image(project_id: str, id: str) -> None:
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    path = Path(current_app.config["IMAGE_PATH"]).absolute() / (id + '.jpg')
    return send_file(path)

@images.get("/projects/<project_id>/images/labelled")
def get_labelled_image_ids(project_id) -> None:
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    images = db.get_labelled_images(project_id)

    return jsonify(images)


@images.delete("/projects/<project_id>/images/<id>")
def delete_image(project_id: str, id: str) -> None:
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)

    try:
        db.del_image(id)
    except:
        return Response(status=404)
    try:
        img_path = Path(current_app.config["IMAGE_PATH"]).absolute() / (id + ".jpg")
        img_path.unlink()
    except IOError:
        pass

    return Response(status=200)


def image_to_dict(image: Image) -> dict:
    return {
        "id": image[0],
        "src": "projects/{}/images/{}".format(image[3], image[0]),
        "width": image[1],
        "height": image[2],
        "dset": image[4],
        "labelled": image[5]
    }


def images_to_dict(images: Image) -> list[dict]:
    return [image_to_dict(image) for image in images]


def get_dimensions(input: FileStorage) -> tuple[int, int]:
    w = 0
    h = 0
    input.read(2)
    b = input.read(1)
    while (b and ord(b) != 0xDA):
        while (ord(b) != 0xFF):
            b = input.read(1)
        while (ord(b) == 0xFF):
            b = input.read(1)
        if (ord(b) >= 0xC0 and ord(b) <= 0xC3):
            input.read(3)
            h, w = unpack(">HH", input.read(4))
            break
        else:
            input.read(
                int(unpack(">H", input.read(2))[0]) - 2)
        b = input.read(1)
    input.seek(0)
    return (int(w), int(h))