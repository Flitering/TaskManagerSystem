from fastapi import APIRouter # type: ignore

router = APIRouter()

@router.get("/")
async def get_reports():
    return {"message": "List of reports"}
