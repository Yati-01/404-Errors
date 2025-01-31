import google.generativeai as genai

# Configure the generative model
from dotenv import load_dotenv

# Load environment variables from .env file
# load_dotenv()

# my_api_key = os.getenv("API_KEY")
my_api_key="AIzaSyCqNEgWQrilgTWFy7NKzlHTOQfVRCt-KKI"
genai.configure(api_key=my_api_key)
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

def calculate_accuracyscore(answer, prev_question):
    prompt = f"""
I have a question and an answer provided. Please evaluate the provided answer based on its correctness, accuracy, and language quality. 
Your task is to assign a score out of 100, with the following breakdown:
- Correctness (50 points): Is the answer factually correct and relevant to the question?
- Accuracy (30 points): Does the answer cover the question in a precise and detailed manner?
- Language Quality (20 points): Is the language used in the answer grammatically correct and well-structured?

Finally, provide the total accuracy score as a in number.

Inputs:
- Question: {prev_question}
- Answer: {answer}

Please only return the overall integer score (accuracy) as the response.
"""
    response = model.generate_content(prompt)
    accuracy_score = int(response.text.strip())
    return accuracy_score

def getfeedback(prev_question, answer):
    prompt = f"""
I have an interview question and an answer provided by the interviewee. Evaluate the answer based on its correctness, accuracy, and language quality. Provide both compliments on what was done well and suggestions for improvement. Use the following criteria:

Correctness: Does the answer address the question correctly and contain accurate information?
Accuracy: Does the answer provide sufficient detail and depth, covering all relevant aspects of the question?
Language Quality: Is the answer presented in a clear, structured, and grammatically correct manner?
Please format the response with the following:

Compliments: [Highlight what the answer did well based on the criteria above.]
Suggestions for Improvement: [Provide specific suggestions on how the answer could be improved in terms of correctness, accuracy, or language quality.]
Here are the inputs:

Interview Question (A): {prev_question}
Answer by Interviewee (B): {answer}"""
    response = model.generate_content(prompt)
    feedback = response.text
    return feedback

def getnextquestion(prev_question, answer, Correct, field):
    if Correct:
        prompt = f"""
I have an interview question and a response provided by the interviewee. I need you to:

Evaluate the answer provided by the interviewee and highlight positive aspects based on its relevance, correctness, and language quality in abstract.
Generate a follow-up question that explores the topic in more depth, using the content of the interviewee's answer as a reference. The follow-up question should build on key points mentioned in the response and probe deeper into any interesting topics or details mentioned.
Please format your response as follows:

Compliments: [Provide positive feedback on what the answer did well in short 5- 15 words.]
Follow-up Question: [Create a question that explores the topic further, making it more challenging or detailed based on the given answer.]
Here are the inputs:

Interview Question (A): {prev_question}
Answer by Interviewee (B): {answer}"""
        response = model.generate_content(prompt)
        prev_question = response.text

    else:
        prompt = f"""Generate a single, open-ended technical interview question based on the following field in technology or computer science. The question should be crisp, clear, and relevant for candidates interviewing for positions in this area.
        Field : {field}"""
        response = model.generate_content(prompt)
        prev_question = response.text
    return prev_question