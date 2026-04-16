"""
LLM Client — Provider-agnostic interface for all LLM calls.

Supports: Claude (Anthropic), OpenAI, Groq, Ollama (local)
Set LLM_PROVIDER in .env to switch between providers.
Set the corresponding API key.

Usage:
    llm = LLMClient()
    response = await llm.chat(
        system_prompt="You are a security advisor.",
        messages=[{"role": "user", "content": "Assess this incident..."}],
    )
"""
from typing import List, Dict
from config.settings import settings


class LLMClient:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self._client = None
        self._model = None
        self._setup()

    def _setup(self):
        """Initialize the appropriate LLM client based on provider."""
        self._mock = False

        if self.provider == "claude":
            import anthropic
            api_key = settings.CLAUDE_API_KEY
            if not api_key:
                print("WARNING: CLAUDE_API_KEY not set — using mock LLM")
                self._mock = True
                return
            self._client = anthropic.Anthropic(api_key=api_key)
            self._model = settings.CLAUDE_MODEL
            print(f"LLM: Claude ({self._model})")

        elif self.provider == "openai":
            from openai import AsyncOpenAI
            api_key = settings.OPENAI_API_KEY
            if not api_key:
                print("WARNING: OPENAI_API_KEY not set — using mock LLM")
                self._mock = True
                return
            self._client = AsyncOpenAI(api_key=api_key)
            self._model = settings.OPENAI_MODEL
            print(f"LLM: OpenAI ({self._model})")

        elif self.provider == "groq":
            from openai import AsyncOpenAI
            api_key = settings.GROQ_API_KEY
            if not api_key:
                print("WARNING: GROQ_API_KEY not set — using mock LLM")
                self._mock = True
                return
            self._client = AsyncOpenAI(
                api_key=api_key,
                base_url=settings.GROQ_BASE_URL,
            )
            self._model = settings.GROQ_MODEL
            print(f"LLM: Groq ({self._model})")

        elif self.provider == "ollama":
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(
                api_key="ollama",
                base_url=settings.OLLAMA_BASE_URL,
            )
            self._model = settings.OLLAMA_MODEL
            print(f"LLM: Ollama ({self._model})")

        else:
            raise ValueError(
                f"Unknown LLM_PROVIDER: {self.provider}. "
                f"Must be one of: claude, openai, groq, ollama"
            )

    async def chat(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> str:
        """
        Send a chat completion request.

        Args:
            system_prompt: System message (instructions for the LLM)
            messages: List of {"role": "user"|"assistant", "content": str}
            temperature: 0.0 (deterministic) to 1.0 (creative). Default 0.3 for security.
            max_tokens: Maximum response tokens.

        Returns:
            str: The LLM's response text.
        """
        try:
            if self._mock:
                return "[Mock LLM] No API key configured. Set GROQ_API_KEY, CLAUDE_API_KEY, or OPENAI_API_KEY in .env to enable AI responses."
            if self.provider == "claude":
                return await self._chat_claude(system_prompt, messages, temperature, max_tokens)
            else:
                return await self._chat_openai_compatible(system_prompt, messages, temperature, max_tokens)
        except Exception as e:
            print(f"LLM error ({self.provider}): {e}")
            return f"[LLM Error: {str(e)}. Check your API key and network connection.]"

    async def _chat_claude(
        self, system_prompt: str, messages: list, temperature: float, max_tokens: int
    ) -> str:
        """Claude uses a different API format (not OpenAI-compatible)."""
        import asyncio

        def _call():
            response = self._client.messages.create(
                model=self._model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=messages,
            )
            return response.content[0].text

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _call)

    async def _chat_openai_compatible(
        self, system_prompt: str, messages: list, temperature: float, max_tokens: int
    ) -> str:
        """OpenAI, Groq, and Ollama all use this format."""
        full_messages = [{"role": "system", "content": system_prompt}] + messages

        response = await self._client.chat.completions.create(
            model=self._model,
            messages=full_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content
