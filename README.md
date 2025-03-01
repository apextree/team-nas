# BokoHacks 2025

**An Application Security Challenge Platform**

BokoHacks 2025 is a deliberately vulnerable web application designed for educational purposes. It allows users to learn about and practice identifying common web security vulnerabilities through hands-on challenges. This project is developed as part of the 2025 BokoHacks event at Texas State University.

---
## Team Members

- **Anubhav Dhungana**
- **Nirjal K.C.**
- **Siddhartha Mishra**

---
## Tools and Resources Used

- **IDE / Code Editors:** VS Code, JetBrains WebStorm
- **AI Assistance:** Augment AI, Chat GPT, Claude AI
- **Development Resources:** Stack Overflow
- **Browsers:** Chrome Browser (recommended), Firefox
- **Additional Resources:** VS Code Setup Guides, Official Documentation for Python, SQLite, and Git

---
## Requirements

Before you begin, ensure you have the following installed:

- **Python 3.8 or higher**  
    [Download Python](https://www.python.org/downloads/)
- **Pip (Python package installer)**
- **SQLite** (Optional: [Download SQLite](https://www.sqlite.org/download.html))  
    _(Note: Dependencies will install automatically if you do not require binaries.)_
- **Modern Web Browser**  
    _(Chrome or Firefox recommended)_
- **Text Editor or IDE**  
    _(VS Code is recommended — [VS Code Setup](https://code.visualstudio.com/docs/python/environments))_

---
## Setup Instructions

1. **Clone the Repository**
    
    Open your terminal or command prompt and run:
    
    ```bash
    git clone https://github.com/](https://github.com/apextree/team-nas.git
    cd Boko-Hacks-2025
    ```
    
2. **Git Setup (For Beginners)**
    
    ### a) Install Git
    
    - Download and install Git from [git-scm.com](https://git-scm.com/downloads)
    - Verify the installation by running:
        
        ```bash
        git --version
        ```
        
    
    ### b) Configure Git (For First-Time Users)
    
    Run the following commands to set your username and email (required for commits):
    
    ```bash
    git config --global user.name "Your Name"
    git config --global user.email "youremail@example.com"
    ```
    
    To check your Git settings:
    
    ```bash
    git config --list
    ```
    
    ### c) Using Git with HTTPS (Easiest for Beginners)
    
    - Clone repositories using HTTPS:
        
        ```bash
        git clone https://github.com/Nick4453/Boko-Hacks-2025.git
        ```
        
    - If prompted for credentials frequently, enable the credential manager:
        
        ```bash
        git config --global credential.helper cache
        ```
        
    
    ### d) Setting Up Git in VS Code
    
    - Open VS Code and ensure the Git Extension is installed (it is built-in in most versions).
    - In the terminal, check that Git is recognized:
        
        ```bash
        git --version
        ```
        
    - Set VS Code as your default Git editor:
        
        ```bash
        git config --global core.editor "code --wait"
        ```
        
3. **Create and Activate a Virtual Environment** _(Recommended)_
    
    You can do this via the terminal or within VS Code:
    
    **For Windows:**
    
    ```bash
    python -m venv .venv
    .venv\Scripts\activate
    ```
    
    **For Mac/Linux:**
    
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```
    
    _(For more details, refer to the [VS Code Python environments guide](https://code.visualstudio.com/docs/python/environments))_
    
4. **Install Dependencies**
    
    With your virtual environment activated, install the required packages:
    
    ```bash
    pip install -r requirements.txt
    ```
    
5. **Initialize the Database**
    
    _Note: This step may not be necessary in all environments. If it doesn’t work, please check that your environment path is correct._
    
    ```bash
    python -c "from app import app, setup_database; app.app_context().push(); setup_database()"
    ```
    
6. **Start the Application**
    
    Run the Flask application:
    
    ```bash
    python app.py
    ```
    
7. **Access the Application**
    
    Open your web browser and navigate to:
    
    ```
    http://localhost:5000
    ```
    
8. **Shut Down the Application**
    
    To stop the application, return to the terminal where the Flask server is running and press:
    
    ```
    Ctrl + C
    ```
    
    This will safely terminate the server.
    

---
## Additional Notes

- **Security:**  
    This application contains intentional vulnerabilities for educational purposes. Do not deploy this application on public networks or use real credentials.
    
- **Feedback and Contributions:**  
    Contributions are welcome. Please submit issues or pull requests via the GitHub repository.
    
- **License:**  
    This project is licensed under the MIT License.
    
