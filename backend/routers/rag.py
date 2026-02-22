from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel
from simulation.chroma_service import upload_document, query_rag, upload_pdf

router = APIRouter()

class UploadRequest(BaseModel):
    document_text: str

class QueryRequest(BaseModel):
    query: str

@router.post("/upload")
async def rag_upload(data: UploadRequest):
    return upload_document(data.document_text)

@router.post("/upload_pdf")
async def rag_upload_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    return upload_pdf(contents)

@router.post("/query")
async def rag_query(data: QueryRequest):
    return query_rag(data.query)

@router.delete("/reset")
async def rag_reset():
    from simulation.chroma_service import reset_db
    return reset_db()
