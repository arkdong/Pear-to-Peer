from openai import OpenAI
import os
import json

class LLMCodeReviewer:
    """
    Class for handling openAI API requests.
    Usage: import and call get_LLM_response.
    The output will be in the JSON format:

    }
        "summary": "A summary",
        "hints": {
            "critical": [
                {"lines": [linenumber(s)], "hint": "*Hint*"},
            ],
            "structure": [
                {"lines": [linenumber(s)], "hint": "*Hint*"},
            ],
            "styling": [
                {"lines": [linenumber(s)], "hint": "*Hint*"},
            ]
        }
    }

    """
    def __init__(self, input_file, api_key, top_p=0.05, frequency_penalty=0.4):
        self.api_key = api_key
        self.numbered_file = self.__add_line_numbers(input_file)
        self.client = OpenAI(api_key=api_key)
        self.output_file_path = os.path.splitext(os.path.basename(input_file))[0] + "_output.json"
        self.max_queries = 3

        # GPT Parameters
        self.model = "gpt-3.5-turbo"
        self.top_p = top_p
        self.frequency_penalty = frequency_penalty

    def set_params(self, top_p, frequency_penalty):
        if top_p > 0 and top_p <= 1 and frequency_penalty >= -2 and frequency_penalty <= 2:
            self.top_p = top_p
            self.frequency_penalty = frequency_penalty
        else:
            print("Invalid input. Parameters were not changed.")

    def is_valid_json(self, json_string):
        """Validate a json string."""
        try:
            json_object = json.loads(json_string)
            return True
        except ValueError as e:
            return False

    def __add_line_numbers(self, file):
        """
        Adds line numbers to each line of the input file and concatenates it to a string.
        This is necessary for the LLM to correctly refer to line numbers.
        """
        try:
            with open(file, 'r') as file:
                lines = file.readlines()

            numbered_string = ""
            for i, line in enumerate(lines, start=1):
                numbered_line = f'# {i} {line}'
                numbered_string += numbered_line
            return numbered_string
        except FileNotFoundError:
            print(f"Error: {file} not found.")
            return None

    def __create_openai_query(self, file_content):
        """
        Creates a query for the OpenAI API based on the file content.
        """
        return [
            {"role": "system", "content": """
You are an assistant designed to help users peer-review code by providing a summary and hints.
Your goal is to facilitate learning and improvement by pointing out potential issues related to
three different classes: critical errors, structure errors, and styling errors.

Critical errors include syntax errors, runtime errors, and logical errors.
Structure errors include poor modularization, inefficient data structures or algorithms, and improper use of control structures.
Styling errors include poor naming conventions, lack of comments and documentation, and inconsistent indentation.

Provide hints using line numbers in JSON format as such:
Mark one linenumber [x] when giving a hint about one line only.
Mark a range of linenumbers [[a,b]] when giving a hint about a block of code (functions, loops, etc).
Mark a collection of linenumbers [x,y,z] when giving the same hint about multiple lines of code.
{
    "summary": "A summary",
    "hints": {
        "critical": [
            {"lines": [linenumber(s)], "hint": "*Hint*"},
        ],
        "structure": [
            {"lines": [linenumber(s)], "hint": "*Hint*"},
        ],
        "styling": [
            {"lines": [linenumber(s)], "hint": "*Hint*"},
        ]
    }
}
            """},
            {"role": "user", "content": file_content}
        ]

    def sent_LLM_query(self):
        """
        Sends the query to OpenAI API and returns the response. Returns an error in
        JSON format in case the LLM fails.
        """

        query = self.__create_openai_query(self.numbered_file)
        try:
            result = self.client.chat.completions.create(
                model=self.model,
                messages=query,
                top_p=self.top_p,
                frequency_penalty=self.frequency_penalty
                )
            return (1, result.choices[0].message.content)
        except Exception as e:
            return (0, f'{{"Error":"{e}"}}')

    def get_openai_response(self):
        for _ in range(self.max_queries - 1):
            response = self.sent_LLM_query()
            if self.is_valid_json(response[1]):
                return response

        return (0, f'{{"Error": "Query did not produce desired output after {self.max_queries} tries."}}')

    # def write_output(self, content):
    #     """
    #     Writes the content to the specified output file.
    #     """
    #     try:
    #         with open(self.output_file_path, 'w') as file:
    #             file.write(content)
    #         print(f"{self.output_file_path} created successfully.")
    #     except Exception as e:
    #         print(f"Error: {e}")

def get_LLM_response(file_path, api_key):
    """
    Takes a file path and API key to generate an LLM response. Returns a tuple where
    the first element is either '1' (succes) or '0' (failure). The second element
    is a string containing the JSON data in the format specified in the class.
    """
    reviewer = LLMCodeReviewer(file_path, api_key)
    response = reviewer.get_openai_response()
    return response

if __name__ == "__main__":
    INPUT_FILE = "LLM_test_file.c"
    API_KEY = "sk-proj-F7FngqAjYkkNhEM9qSD6T3BlbkFJnK7W7vGUOJQa5V6SXKNg"

    response = get_LLM_response(INPUT_FILE, API_KEY)
    print(response)
