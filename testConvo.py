import google.generativeai as genai

# Configure the generative model
genai.configure(api_key="AIzaSyCo0Qlg7StwWsKLrQ5UG5LTQIWqRTqTduI")
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

prompt="""Suggest a single open-ended technical topic that can be used for a debate. The topic should be thought-provoking, have multiple perspectives, and be relevant to current trends in technology or computer science.
Only return the topic as a concise statement."""
response = model.generate_content(prompt)
topic = response.text
print(topic)

while True:
    print("Now write your response now:\n")
    userinput = input()
    
    if userinput == "exit":
        break
    
    prompt = f"""You are in a debate and need to respond to the following argument presented by your opponent. Analyze the response, find counterpoints, and provide a concise rebuttal. 
Topic (A): {topic}
Argument (B): {userinput}
Please respond with 2-3 lines addressing the key points of the argument."""
    response = model.generate_content(prompt)
    User1resp = response.text
    print(f"User1 response:\n {User1resp}")
    
    prompt = f"""You are in a debate and need to respond to the following argument presented by your opponent. Analyze the response, find counterpoints, and provide a concise rebuttal. 
Topic (A): {topic}
Argument (B): {User1resp}
Please respond with 2-3 lines addressing the key points of the argument."""
    response = model.generate_content(prompt)
    User2resp = response.text
    print(f"User2 response:\n {User2resp}")