
"""
Provider-agnostic LLM interface.

This module provides a fallback when no AI provider is configured.
The system is designed to work without AI using deterministic logic.
"""

from __future__ import annotations

import os
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class LLMResponse:
    text: str
    model: str
    provider: str


class LLMClient(ABC):
    @abstractmethod
    async def complete(
        self,
        system: str,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.4,
    ) -> LLMResponse:
        raise NotImplementedError


class NoAIClient(LLMClient):
    """Fallback client when no AI provider is configured."""

    async def complete(
        self,
        system: str,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.4,
    ) -> LLMResponse:
        # Return a message indicating AI is not available
        return LLMResponse(
            text="AI features are not enabled. The system is running in deterministic mode.",
            model="none",
            provider="none"
        )


_client_singleton: LLMClient | None = None


def get_llm_client() -> LLMClient:
    """
    Returns an LLM client if configured, otherwise returns a NoAIClient fallback.
    The system is designed to work without AI using deterministic logic.
    """
    global _client_singleton
    if _client_singleton is not None:
        return _client_singleton

    # Check if any AI provider is configured
    provider = os.environ.get("LLM_PROVIDER", "").lower()
    
    if provider == "anthropic":
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if api_key and api_key != "sk-ant-..." and api_key != "":
            try:
                from anthropic import AsyncAnthropic
                model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")
                _client_singleton = AnthropicClient(api_key=api_key, model=model)
                return _client_singleton
            except ImportError:
                pass  # Fall back to NoAIClient if package not available
    elif provider == "openai":
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key and api_key != "":
            try:
                from openai import AsyncOpenAI
                model = os.environ.get("OPENAI_MODEL", "gpt-4.1")
                _client_singleton = OpenAIClient(api_key=api_key, model=model)
                return _client_singleton
            except ImportError:
                pass  # Fall back to NoAIClient if package not available

    # Return fallback client if no AI is configured
    _client_singleton = NoAIClient()
    return _client_singleton


class AnthropicClient(LLMClient):
    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6"):
        from anthropic import AsyncAnthropic

        self._client = AsyncAnthropic(api_key=api_key)
        self._model = model

    async def complete(
        self,
        system: str,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.4,
    ) -> LLMResponse:
        resp = await self._client.messages.create(
            model=self._model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(block.text for block in resp.content if block.type == "text")
        return LLMResponse(text=text, model=self._model, provider="anthropic")


class OpenAIClient(LLMClient):
    """Drop-in alternative if you ever want to switch or A/B providers."""

    def __init__(self, api_key: str, model: str = "gpt-4.1"):
        from openai import AsyncOpenAI

        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model

    async def complete(
        self,
        system: str,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.4,
    ) -> LLMResponse:
        resp = await self._client.chat.completions.create(
            model=self._model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        return LLMResponse(
            text=resp.choices[0].message.content or "",
            model=self._model,
            provider="openai",
        )


def has_llm_client() -> bool:
    """Check if a real LLM client is available (not the fallback)."""
    client = get_llm_client()
    return not isinstance(client, NoAIClient)
