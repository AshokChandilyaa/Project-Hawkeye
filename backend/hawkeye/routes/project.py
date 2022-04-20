from flask import Blueprint, jsonify, request, Response

from hawkeye.domain.model import Project
from hawkeye.repositories.databases import DataBase

projects = Blueprint("projects", __name__)
db=DataBase()

@projects.get("/projects")
def read_projects() -> Response:
    return jsonify(projects_to_dict(db.get_all_projects()))


@projects.post("/projects")
def create_project() -> Response:
    data = request.get_json()
    if data is None:
        return Response(status=400)
    if "name" not in data:
        return Response(status=400)
    try:
        db.add_project(data["name"])
    except:
        return Response(status=400)
    response = Response(status=201)
    return response


@projects.get("/projects/<id>")
def read_project(id: str) -> Response:
    if not id.isdigit():
        return Response(status=400)
    id = int(id)
    try:
        project = db.get_project(id)
    except:
        return Response(status=404)

    return jsonify(project_to_dict(project))


@projects.delete("/projects/<id>")
def delete_project(id: str) -> Response:
    if not id.isdigit():
        return Response(status=400)
    id = int(id)
    try:
        db.del_project(id)
    except:
        return Response(status=404)

    return Response(status=200)


def project_to_dict(project: Project) -> dict:
    return {
        "id": project[0],
        "name": project[1]
    }


def projects_to_dict(projects: list[Project]) -> list[dict]:
    return [project_to_dict(project) for project in projects]