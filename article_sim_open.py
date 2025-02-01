from openai import OpenAI
import os
from dotenv import load_dotenv
import argparse
import numpy as np

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def get_embedding(text, model="text-embedding-ada-002"):
    try:
        response = client.embeddings.create(
            model=model,
            input=text
        )
        return np.array(response.data[0].embedding)
    except Exception as e:
        return f"Error interacting with OpenAI API: {e}"

def main():
    parser = argparse.ArgumentParser(
        description="Compute the cosine similarity between two input strings using OpenAI embeddings."
    )
    parser.add_argument(
        "--text1",
        type=str,
        required=True,
        help="First input string."
    )
    parser.add_argument(
        "--text2",
        type=str,
        required=True,
        help="Second input string."
    )
    args = parser.parse_args()

    embedding1 = get_embedding(args.text1)
    embedding2 = get_embedding(args.text2)

    if isinstance(embedding1, str) or isinstance(embedding2, str):
        print(f"Error in obtaining embeddings: {embedding1} {embedding2}")
    else:
        similarity = cosine_similarity(embedding1, embedding2)
        print(f"\nCosine Similarity between the two inputs: {similarity:.4f}")

if __name__ == '__main__':
    main()