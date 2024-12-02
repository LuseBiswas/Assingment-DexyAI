import requests
from bs4 import BeautifulSoup
import re

def scrape_jobs(role):
    """
    Scrapes job data from Wellfound for the given role.
    
    :param role: The job role to scrape (e.g., 'react-developer').
    :return: A list of dictionaries containing job details.
    """
    # Construct the URL based on the role
    url = f"https://wellfound.com/role/{role}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }

    try:
        # Fetch the page content
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        soup = BeautifulSoup(response.text, "html.parser")

        # Find job cards in the page
        job_cards = soup.find_all("div", class_="mb-6 w-full rounded border border-gray-400 bg-white")

        jobs = []
        for card in job_cards:
            # Extract job title
            title = card.find("a", class_="mr-2 text-sm font-semibold text-brand-burgandy hover:underline")
            title = title.text.strip() if title else "N/A"

            # Extract company name
            company = card.find("h2", class_="inline text-md font-semibold")
            company = company.text.strip() if company else "N/A"

            # Extract additional details (if needed)
            details = card.find("div", class_="sm:flex sm:space-x-2")
            details = details.text.strip() if details else "N/A"

            # Organize details into structured fields
            salary, equity, experience = extract_details(details)


            jobs.append({
                "title": title,
                "company": company,
                "salary": salary,
                "equity": equity,
                "experience": experience,
            })

        return jobs

    except Exception as e:
        print(f"Error occurred while scraping: {e}")
        return []
    
def extract_details(details):
    """
    Extract and organize the details field into separate components.
    
    :param details: The raw details string to be parsed.
    :return: Tuple containing salary, equity, location, and experience.
    """
    # Default values in case parsing fails
    salary = equity = location = experience = "N/A"

    # Extract salary (e.g., "₹8L – ₹15L")
    salary_match = re.search(r"₹([\d,]+[K|L|M]+(?:\s*–\s*₹[\d,]+[K|L|M]+)?)", details)
    if salary_match:
        salary = salary_match.group(0)

    # Extract equity (e.g., "No equity")
    equity_match = re.search(r"(No equity|[0-9]+% equity)", details)
    if equity_match:
        equity = equity_match.group(0)


    # Extract experience (e.g., "1 year of exp")
    experience_match = re.search(r"(\d+ year[s]?\s*of\s*exp|\d+ years?\s*experience)", details)
    if experience_match:
        experience = experience_match.group(0)

    return salary, equity, experience
