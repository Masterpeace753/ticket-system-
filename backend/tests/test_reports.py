import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_reports_by_status(client: AsyncClient, user_token: str):
    r = await client.get(
        "/api/reports/by-status",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_reports_by_priority(client: AsyncClient, user_token: str):
    r = await client.get(
        "/api/reports/by-priority",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_reports_unauthenticated(client: AsyncClient):
    r = await client.get("/api/reports/by-status")
    assert r.status_code == 403
