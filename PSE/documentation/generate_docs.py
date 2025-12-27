from openai import OpenAI
import sys
import os

def read_python_file(file_path):
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return None

    # Check if file extension is '.py'
    if not file_path.endswith('.py'):
        print(f"Error: File '{file_path}' is not a Python file.")
        return None

    try:
        with open(file_path, 'r') as f:
            python_code = f.read()
        return python_code
    except IOError as e:
        print(f"Error reading file '{file_path}': {e}")
        return None

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <python_file.py>")
        return
    
    python_file_path = sys.argv[1]
    python_code = read_python_file(python_file_path)

    if not python_code: exit()

    markdown_format = ""
    with open("FORMAT.md", "r") as f:
        markdown_format = f.read()

    query = "I want docs for a flask backend, which this file is a part of: \n\n" + python_code + "\n\nI want it in this format: \n\n" + markdown_format


    client = OpenAI(api_key="sk-proj-F7FngqAjYkkNhEM9qSD6T3BlbkFJnK7W7vGUOJQa5V6SXKNg")
    result = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "system", "content": query}]
                    )
    
    with open("docs_result.md", "w") as f:
        f.write(result.choices[0].message.content)

if __name__ == "__main__":
    main()