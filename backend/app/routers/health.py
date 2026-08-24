from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=dict)
def health_check():
    return {"status": "ok"}
