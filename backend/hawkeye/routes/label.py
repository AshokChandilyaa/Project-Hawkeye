from flask import Blueprint, jsonify, request, Response

from hawkeye.domain.model import Label
from hawkeye.repositories.databases import DataBase


labels = Blueprint("labels", __name__)
db = DataBase()

@labels.get("/projects/<project_id>/labels")
def read_labels_by_project(project_id: int) -> None:
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    try:
        labels = db.get_classes(project_id)
    except:
        return Response(status=404)
    return jsonify(labels_to_dict(labels))

@labels.post("/projects/<project_id>/labels")
def create_labels(project_id: int) -> None:
    data = request.get_json()
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    if data is None:
        return Response(status=400)
    for l in data:
        if "text" not in l:
            return Response(status=400)
        db.add_label(l["text"], project_id)
    response = Response(status=201)
    return response





@labels.get("/projects/<project_id>/labels/<id>")
def read_label(project_id: int, id: int) -> None:
    if not project_id.isdigit() or not id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    id = int(id)
    try:
        label = db.get_label(id, project_id)
    except:
        return Response(status=404)

    return jsonify(label_to_dict(label))

@labels.delete("/projects/<project_id>/labels")
def delete_labels(project_id:int) -> None:
    data = request.get_json()
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    for label in data:
        try:
            db.del_label(label)
        except:
            return Response(status=404)

    return Response(status=200)
    
@labels.delete("/projects/<project_id>/labels/<id>")
def delete_label(project_id: int, id: int) -> None:
    if not project_id.isdigit() or not id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    id = int(id)
    try:
        db.del_label(id)
    except:
        return Response(status=404)

    return Response(status=200)


def label_to_dict(label: Label) -> dict:
    return {
        "id": label[0],
        "text": label[1]
    }


def labels_to_dict(labels: list[Label]) -> list[dict]:
    return [label_to_dict(label) for label in labels]