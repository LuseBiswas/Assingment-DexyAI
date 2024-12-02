from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scraper import scrape_jobs

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://assingment-dexyai.onrender.com/"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/scrape/{role}")
async def scrape(role: str):
    """
    API endpoint to scrape jobs for a given role.
    
    :param role: Job role to scrape (e.g., 'react-developer').
    :return: JSON response with job details.
    """
    jobs = scrape_jobs(role)
    if jobs:
        return {"jobs": jobs}
    else:
        return {"error": "No jobs found or scraping failed"}
