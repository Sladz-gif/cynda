"""
File Processing API

Handles file uploads and schema-based data extraction for various departments.
Uses deterministic rules and pattern matching instead of AI.
"""

from __future__ import annotations

import io
import re
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/file-processing", tags=["file-processing"])


@router.post("/extract")
async def extract_data_from_file(
    file: UploadFile = File(...),
    department: str = "finance",
    business_id: str = "",
):
    """
    Extract structured data from uploaded files using schema-based rules.
    
    Supports: CSV, XLSX, PDF files
    Departments: finance, projects, crm, hr
    """
    if not business_id:
        raise HTTPException(status_code=400, detail="business_id is required")

    try:
        # Read file content
        content = await file.read()
        file_extension = file.filename.split(".")[-1].lower()

        # Extract structured data based on file type
        if file_extension == "csv":
            extracted_data = await _extract_csv_data(content, department)
        elif file_extension in ["xlsx", "xls"]:
            extracted_data = await _extract_excel_data(content, department)
        elif file_extension == "pdf":
            extracted_data = await _extract_pdf_data(content, department)
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file_extension}. Supported: CSV, XLSX, PDF"
            )

        return JSONResponse({
            "success": True,
            "file_name": file.filename,
            "file_type": file_extension,
            "department": department,
            "extracted_records": extracted_data,
            "summary": f"Successfully extracted {len(extracted_data)} records from {file.filename}"
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


async def _extract_csv_data(content: bytes, department: str) -> list[dict[str, Any]]:
    """Extract structured data from CSV file using schema mapping."""
    import csv
    from io import StringIO

    text_file = io.StringIO(content.decode("utf-8"))
    reader = csv.DictReader(text_file)
    rows = list(reader)
    
    if not rows:
        return []
    
    # Get schema for department
    schema = _get_department_schema(department)
    
    # Map columns to schema fields
    extracted_records = []
    for row in rows:
        record = _map_row_to_schema(row, schema)
        if record:
            extracted_records.append(record)
    
    return extracted_records


async def _extract_excel_data(content: bytes, department: str) -> list[dict[str, Any]]:
    """Extract structured data from Excel file using schema mapping."""
    import openpyxl

    workbook = openpyxl.load_workbook(io.BytesIO(content))
    sheet = workbook.active
    
    # Get header row
    headers = []
    for cell in sheet[1]:
        headers.append(str(cell.value) if cell.value else "")
    
    # Get schema for department
    schema = _get_department_schema(department)
    
    # Extract data rows
    extracted_records = []
    for row in sheet.iter_rows(min_row=2, values_only=True):
        row_dict = {}
        for i, cell_value in enumerate(row):
            if i < len(headers):
                row_dict[headers[i]] = str(cell_value) if cell_value is not None else ""
        
        record = _map_row_to_schema(row_dict, schema)
        if record:
            extracted_records.append(record)
    
    return extracted_records


async def _extract_pdf_data(content: bytes, department: str) -> list[dict[str, Any]]:
    """Extract structured data from PDF file using pattern matching."""
    import PyPDF2

    pdf_file = io.BytesIO(content)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    
    # Extract all text from PDF
    text_content = ""
    for page in pdf_reader.pages:
        text_content += page.extract_text() + "\n"
    
    # Use pattern-based extraction for PDF
    return _extract_from_text(text_content, department)


def _get_department_schema(department: str) -> dict[str, Any]:
    """Define schema mapping for each department."""
    schemas = {
        "finance": {
            "field_mappings": {
                "type": ["type", "category", "invoice/expense"],
                "client": ["client", "customer", "vendor", "company"],
                "amount": ["amount", "total", "price", "cost", "value"],
                "date": ["date", "due_date", "invoice_date", "created_at"],
                "description": ["description", "details", "notes", "memo"]
            },
            "required_fields": ["amount", "date"],
            "default_type": "Expense"
        },
        "projects": {
            "field_mappings": {
                "type": ["type", "category"],
                "name": ["name", "title", "project", "task"],
                "status": ["status", "state", "progress"],
                "assignee": ["assignee", "assigned_to", "owner", "responsible"],
                "due_date": ["due_date", "deadline", "due"],
                "priority": ["priority", "importance", "urgency"]
            },
            "required_fields": ["name"],
            "default_type": "Task"
        },
        "crm": {
            "field_mappings": {
                "type": ["type", "category"],
                "name": ["name", "contact", "person"],
                "email": ["email", "email_address"],
                "phone": ["phone", "telephone", "mobile"],
                "company": ["company", "organization", "business"],
                "status": ["status", "state", "stage"]
            },
            "required_fields": ["name"],
            "default_type": "Contact"
        },
        "hr": {
            "field_mappings": {
                "type": ["type", "category"],
                "name": ["name", "employee", "staff"],
                "email": ["email", "email_address"],
                "role": ["role", "position", "title", "job"],
                "department": ["department", "dept", "division"],
                "start_date": ["start_date", "hire_date", "joined"]
            },
            "required_fields": ["name"],
            "default_type": "Staff"
        }
    }
    return schemas.get(department, schemas["finance"])


def _map_row_to_schema(row: dict[str, str], schema: dict[str, Any]) -> dict[str, Any] | None:
    """Map a row's columns to the schema fields."""
    record = {}
    field_mappings = schema["field_mappings"]
    
    # Map each schema field to the best matching column
    for schema_field, possible_columns in field_mappings.items():
        value = None
        for col in possible_columns:
            if col in row and row[col]:
                value = row[col]
                break
        
        if value:
            record[schema_field] = value
    
    # Check if required fields are present
    missing_required = [f for f in schema["required_fields"] if f not in record]
    if missing_required:
        return None
    
    # Set default type if not present
    if "type" not in record and "default_type" in schema:
        record["type"] = schema["default_type"]
    
    return record


def _extract_from_text(text: str, department: str) -> list[dict[str, Any]]:
    """Extract structured data from unstructured text using pattern matching."""
    schema = _get_department_schema(department)
    records = []
    
    # Split text into potential records (by lines or patterns)
    lines = text.split("\n")
    
    # Simple pattern-based extraction for PDF text
    for line in lines:
        if not line.strip():
            continue
            
        record = {}
        
        # Try to extract data based on patterns
        if department == "finance":
            # Look for amount patterns
            amount_match = re.search(r'[\$€£]?\s*[\d,]+\.?\d*', line)
            if amount_match:
                record["amount"] = amount_match.group().replace('$', '').replace(',', '').strip()
            
            # Look for date patterns
            date_match = re.search(r'\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}', line)
            if date_match:
                record["date"] = date_match.group()
            
            # Rest of the line as description
            if line.strip():
                record["description"] = line.strip()
            
            record["type"] = "Expense"
        
        elif department == "projects":
            # Look for task/project patterns
            if any(keyword in line.lower() for keyword in ["task", "project", "deadline", "due"]):
                record["name"] = line.strip()
                record["type"] = "Task"
                record["status"] = "Pending"
        
        elif department == "crm":
            # Look for contact patterns
            email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
            if email_match:
                record["email"] = email_match.group()
                record["name"] = line.replace(email_match.group(), '').strip()
                record["type"] = "Contact"
        
        elif department == "hr":
            # Look for employee patterns
            if any(keyword in line.lower() for keyword in ["employee", "staff", "hire", "start"]):
                record["name"] = line.strip()
                record["type"] = "Staff"
        
        # Only add if we have some data
        if record and len(record) > 1:
            records.append(record)
    
    return records


@router.post("/validate")
async def validate_file_structure(
    file: UploadFile = File(...),
    department: str = "finance",
):
    """
    Validate file structure before processing.
    Returns information about the file and expected data structure.
    """
    try:
        content = await file.read()
        file_extension = file.filename.split(".")[-1].lower()
        
        # Get basic file info
        file_info = {
            "filename": file.filename,
            "size": len(content),
            "type": file_extension,
            "supported": file_extension in ["csv", "xlsx", "xls", "pdf"]
        }
        
        # Get expected structure based on department
        expected_structure = {
            "finance": {
                "expected_fields": ["type", "client/category", "amount", "date", "description"],
                "record_types": ["Invoice", "Expense"]
            },
            "projects": {
                "expected_fields": ["type", "name", "status", "assignee", "due_date"],
                "record_types": ["Project", "Task"]
            },
            "crm": {
                "expected_fields": ["type", "name", "email", "phone"],
                "record_types": ["Contact", "Company"]
            },
            "hr": {
                "expected_fields": ["type", "name", "email", "role", "department"],
                "record_types": ["Staff", "Employee"]
            }
        }
        
        return JSONResponse({
            "success": True,
            "file_info": file_info,
            "expected_structure": expected_structure.get(department, {}),
            "ready_to_process": file_info["supported"]
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating file: {str(e)}")
