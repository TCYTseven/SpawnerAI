import boto3
import json
import os
import dotenv
dotenv.load_dotenv()

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1",
    aws_access_key_id=os.getenv("awsid"),
    aws_secret_access_key=os.getenv("awssecret")
)

def calculate(skillsplr, skillsfriend):
    prompt = f"""You are a professional league of legends player. You are given the skillsets of 2 players who would like to play with each other, and must calculate their synergy.
    The skillsets will be given in the form of a list of 5 numbers, representing their Offense, Tank, Support, Scout, and Hybrid skills.
    A player with a higher number in a skill is better at that skill.
    Player 1: {skillsplr}
    Player 2: {skillsfriend}

    Return a json object in the following format:
    {
        "synergy": <number between 0 and 100>
        "reasoning": <explanation of how you calculated the synergy>
    }
    Do not include any other text or formatting in your response.
    """

    response = bedrock.invoke_model(
        modelId="amazon.nova-micro-v1:0",
        contentType="application/json",
        accept="application/json",
        body=json.dumps({
            "messages": [{
                "role": "user", 
                "content": [{"text": prompt}]
            }],
            "inferenceConfig": {
                "maxTokens": 200,
                "temperature": 0.7
            }
        })
    )

    result = json.loads(response["body"].read())
    return result["output"]["message"]["content"][0]["text"]