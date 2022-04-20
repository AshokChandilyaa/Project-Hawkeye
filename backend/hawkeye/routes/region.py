from email.mime import image
from flask import Blueprint, jsonify, request, Response

from hawkeye.domain.model import Region
from hawkeye.repositories.databases import DataBase

regions = Blueprint("regions", __name__)
db = DataBase()

@regions.get("/projects/<project_id>/images/<image_id>/regions")
def read_regions_by_image(project_id: int, image_id: int) -> None:
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    try:
        regions = db.get_regions(image_id)
    except :
        return Response(status=404)
    return jsonify(regions_to_dict(regions))

@regions.get("/projects/<project_id>/images/<image_id>/predictions")
def read_preds_by_image(project_id: int, image_id: int) -> None:
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    try:
        regions = db.get_predictions(image_id)
    except:
        return Response(status=404)
    return jsonify(regions_to_dict(regions))


@regions.post("/projects/<project_id>/images/<image_id>/regions")
def create_regions(project_id: int, image_id: int) -> None:
    data = request.get_json()
    if not project_id.isdigit():
        return Response(status=400)
    project_id = int(project_id)
    if data is None:
        return Response(status=400)
    db.update_regions(project_id, image_id, data)
    db.update_image_status(image_id)          
    return Response(status=201)


def region_to_dict(region: Region) -> dict:
    return {
        "label": region[2],
        "id": region[0],
        "x0": region[3],
        "y0": region[5],
        "x1": region[4],
        "y1": region[6],
        "type": region[7],
        "conf":region[8]
    }


def regions_to_dict(regions: list[Region]) -> list[dict]:
    return [region_to_dict(region) for region in regions]