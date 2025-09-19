import psycopg2
from psycopg2 import OperationalError

# Replace these values with your actual DB credentials
DB_USER = "postgres"
DB_PASSWORD = "2055"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "gamo"

def check_postgres_connection():
    try:
        conn = psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )
        print(f"✅ Successfully connected to database '{DB_NAME}' on {DB_HOST}:{DB_PORT}")
        conn.close()
    except OperationalError as e:
        print(f"❌ Could not connect to the database: {e}")

if __name__ == "__main__":
    check_postgres_connection()

