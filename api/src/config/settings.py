from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    crawl4ai_api_key: str = Field(..., env="CRAWL4AI_API_KEY")
    crawl4ai_api_url: str
    crawl4ai_api_version: str
    crawl4ai_api_timeout: int
    crawl4ai_api_max_retries: int
    crawl4ai_api_retry_delay: int
    crawl4ai_api_retry_delay_max: int
