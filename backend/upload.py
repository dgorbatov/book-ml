from io import BytesIO
from PyPDF2 import PdfReader
import re

def extract_information_from_pdf(pdfstream):
    doc = PdfReader(pdfstream);

    sections = []
    current_section = None
    section_text = ""
    
    # Define a regex pattern for section headers (you can adjust it)
    section_pattern = re.compile(r"(Section\s+\d+|Chapter\s+\d+|Introduction)", re.IGNORECASE)

    metadata = doc.metadata
    print(f"Author: {metadata.author}")
    print(f"Title: {metadata.title}")
    print(f"Creation Date: {metadata.creation_date}")


    print(len(doc.pages));
    print(doc.pages[0].extract_text());
    
    # Iterate through each page
    for page in doc.pages:
        pageText = page.extract_text();

        print(pageText);
        
        # Split text by lines and analyze each line
        lines = pageText.split("\n")
        for line in lines:
            # Check if the line matches a section header
            if section_pattern.search(line):
                # If we already have a current section, save it
                if current_section:
                    sections.append((current_section, section_text.strip()))
                
                # Start a new section
                current_section = line.strip()
                section_text = ""  # Reset section text
            else:
                section_text += line + "\n"
        
    # After the loop, add the last section if it exists
    if current_section:
        sections.append((current_section, section_text.strip()))

    # Print the extracted sections
    for title, content in sections:
        print(f"Title: {title}")
        print(f"Content: {content[:300]}...")  # Print first 300 characters of the content
        print("-" * 50)